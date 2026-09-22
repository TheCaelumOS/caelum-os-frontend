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

  async executeCommand(command: string, cwd?: string): Promise<{ stdout: string; stderr: string; exitCode: number; command: string }> {
    const isWindows = process.platform === 'win32';
    const trimmed = command.trim();
    const workDir = cwd || process.cwd();

    return new Promise((resolve) => {
      const shellExecutable = isWindows ? 'powershell.exe' : '/bin/bash';
      const shellArgs = isWindows ? ['-NoProfile', '-Command', trimmed] : ['-c', trimmed];

      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const proc = spawn(shellExecutable, shellArgs, {
        cwd: workDir,
        env: { ...process.env, PAGER: 'cat' },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const timer = setTimeout(() => {
        timedOut = true;
        proc.kill();
        resolve({
          stdout,
          stderr: stderr + '\nExecution timed out after 30 seconds.',
          exitCode: 124,
          command: trimmed,
        });
      }, 30000);

      proc.stdout?.on('data', (data: Buffer) => {
        stdout += data.toString('utf8');
      });

      proc.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString('utf8');
      });

      proc.on('error', (err: any) => {
        clearTimeout(timer);
        if (timedOut) return;

        if (trimmed.startsWith('docker') && (err.code === 'ENOENT' || err.message?.includes('not found'))) {
          resolve({
            stdout: '',
            stderr: 'Docker CLI not found.',
            exitCode: 127,
            command: trimmed,
          });
          return;
        }

        resolve({
          stdout: '',
          stderr: err.message || 'Failed to execute command on operating system.',
          exitCode: 1,
          command: trimmed,
        });
      });

      proc.on('close', (code: number | null) => {
        clearTimeout(timer);
        if (timedOut) return;

        const exitCode = code ?? 0;

        // Enhanced Docker daemon error formatting
        if (trimmed.startsWith('docker') && exitCode !== 0) {
          const combinedErr = (stderr || '') + (stdout || '');
          if (
            combinedErr.includes('cannot find the file specified') ||
            combinedErr.includes('connect to the docker API') ||
            combinedErr.includes('Is the docker daemon running') ||
            combinedErr.includes('dockerDesktopLinuxEngine')
          ) {
            stderr = `Docker CLI detected, but Docker Engine is not reachable.\n${stderr}`;
          }
        }

        resolve({
          stdout,
          stderr,
          exitCode,
          command: trimmed,
        });
      });
    });
  }

  async runDockerDiagnostics(): Promise<{
    summary: string;
    ready: boolean;
    results: Record<string, boolean>;
    details: string;
  }> {
    const results: Record<string, boolean> = {
      cli: false,
      engine: false,
      version: false,
      pull: false,
      runtime: false,
      networking: false,
      logs: false,
      lifecycle: false,
    };

    // 1. Docker CLI Check
    const cliCheck = await this.executeCommand('docker --version');
    results.cli = cliCheck.exitCode === 0 && cliCheck.stdout.toLowerCase().includes('docker version');

    // 2. Docker Engine daemon check
    const infoCheck = await this.executeCommand('docker info --format "{{.ServerVersion}}"');
    results.engine = infoCheck.exitCode === 0 && infoCheck.stdout.trim().length > 0;

    // 3. Docker Version check
    const verCheck = await this.executeCommand('docker version --format "{{.Client.Version}} / {{.Server.Version}}"');
    results.version = verCheck.exitCode === 0 && verCheck.stdout.trim().length > 0;

    if (results.engine) {
      // 4. Image Pull / Local Image
      const pullCheck = await this.executeCommand('docker pull hello-world');
      results.pull = pullCheck.exitCode === 0 || pullCheck.stdout.includes('Status: Downloaded') || pullCheck.stdout.includes('up to date');

      // 5. Container Runtime Creation & Startup
      const runCheck = await this.executeCommand('docker run -d --name caelum-diag-test alpine sleep 10');
      results.runtime = runCheck.exitCode === 0;

      if (results.runtime) {
        // 6. Networking
        const netCheck = await this.executeCommand('docker inspect --format "{{.NetworkSettings.IPAddress}}" caelum-diag-test');
        results.networking = netCheck.exitCode === 0;

        // 7. Logs
        const logCheck = await this.executeCommand('docker logs caelum-diag-test');
        results.logs = logCheck.exitCode === 0;

        // 8. Lifecycle stop & rm
        const stopCheck = await this.executeCommand('docker stop caelum-diag-test && docker rm caelum-diag-test');
        results.lifecycle = stopCheck.exitCode === 0;
      }
    }

    const allPassed = Object.values(results).every(Boolean);

    const report = [
      'CAELUMOS DOCKER DIAGNOSTICS',
      '',
      `Docker CLI          ${results.cli ? '✓ PASS' : '✗ FAIL'}`,
      `Docker Engine       ${results.engine ? '✓ PASS' : '✗ FAIL'}`,
      `Docker Version      ${results.version ? '✓ PASS' : '✗ FAIL'}`,
      `Image Pull          ${results.pull ? '✓ PASS' : '✗ FAIL'}`,
      `Container Runtime   ${results.runtime ? '✓ PASS' : '✗ FAIL'}`,
      `Networking          ${results.networking ? '✓ PASS' : '✗ FAIL'}`,
      `Logs                ${results.logs ? '✓ PASS' : '✗ FAIL'}`,
      `Lifecycle           ${results.lifecycle ? '✓ PASS' : '✗ FAIL'}`,
      '',
      `Docker Integration: ${allPassed ? 'READY' : 'DEGRADED (Docker Engine is not running)'}`,
    ].join('\n');

    return {
      summary: allPassed ? 'READY' : 'DEGRADED',
      ready: allPassed,
      results,
      details: report,
    };
  }
}

