import { Injectable, NotFoundException, BadRequestException, OnModuleDestroy } from '@nestjs/common';
import { spawn, ChildProcess } from 'child_process';
import { PrismaService } from '../prisma/prisma.service';
import { WebsocketService } from '../websocket/websocket.service';
import { CreateSessionDto } from './dto/terminal.dto';

@Injectable()
export class TerminalService implements OnModuleDestroy {
  private readonly activeProcesses = new Map<string, ChildProcess>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly websocketService: WebsocketService,
  ) {}

  onModuleDestroy() {
    // Kill all active processes on module teardown
    for (const [id, proc] of this.activeProcesses.entries()) {
      proc.kill();
      this.activeProcesses.delete(id);
    }
  }

  async getSessions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User profile could not be located');
    }

    return this.prisma.terminalSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSession(userId: string, dto: CreateSessionDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User profile could not be located');
    }

    // Determine target shell based on platform
    const isWindows = process.platform === 'win32';
    const defaultShell = isWindows ? 'powershell.exe' : 'bash';
    const shellCommand = dto.shell || defaultShell;

    try {
      // Spawn active terminal shell
      const proc = spawn(shellCommand, [], {
        env: process.env,
      });

      const session = await this.prisma.terminalSession.create({
        data: {
          token: proc.pid?.toString() || Math.random().toString(36).substring(7),
          status: 'active',
          active: true,
          userId,
        },
      });

      this.activeProcesses.set(session.id, proc);

      // Listen to stdout and stream output events via websocket
      proc.stdout?.on('data', (data: Buffer) => {
        this.websocketService.broadcast('terminal-output', {
          sessionId: session.id,
          data: data.toString('utf8'),
        });
      });

      // Listen to stderr
      proc.stderr?.on('data', (data: Buffer) => {
        this.websocketService.broadcast('terminal-output', {
          sessionId: session.id,
          data: data.toString('utf8'),
        });
      });

      // Handle process closure
      proc.on('close', async () => {
        this.activeProcesses.delete(session.id);
        try {
          await this.prisma.terminalSession.update({
            where: { id: session.id },
            data: { active: false, status: 'closed' },
          }).catch(() => {});
        } catch {}
        this.websocketService.broadcast('terminal-close', {
          sessionId: session.id,
        });
      });

      return session;
    } catch (e) {
      throw new BadRequestException(`Failed to spawn terminal shell command: ${shellCommand}`);
    }
  }

  async deleteSession(userId: string, sessionId: string) {
    const session = await this.prisma.terminalSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Terminal session not found');
    }

    const proc = this.activeProcesses.get(sessionId);
    if (proc) {
      proc.kill();
      this.activeProcesses.delete(sessionId);
    }

    await this.prisma.terminalSession.delete({
      where: { id: sessionId },
    });

    return { sessionId, success: true };
  }

  writeInput(sessionId: string, data: string) {
    const proc = this.activeProcesses.get(sessionId);
    if (!proc) {
      throw new BadRequestException('Inactive or closed terminal session');
    }
    proc.stdin?.write(data);
  }
}
