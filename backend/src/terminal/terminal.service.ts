import { Injectable, NotFoundException, BadRequestException, OnModuleDestroy } from '@nestjs/common';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { WebsocketService } from '../websocket/websocket.service';
import { CreateSessionDto } from './dto/terminal.dto';

@Injectable()
export class TerminalService implements OnModuleDestroy {
  private readonly activeProcesses = new Map<string, ChildProcess>();
  private readonly sessionCwds = new Map<string, string>();

  private getBashExecutable(): string {
    if (process.platform !== 'win32') {
      return '/bin/bash';
    }
    const candidates = [
      'C:\\Program Files\\Git\\bin\\bash.exe',
      'C:\\Program Files\\Git\\usr\\bin\\bash.exe',
      'C:\\Program Files (x86)\\Git\\bin\\bash.exe',
      'bash.exe',
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) return p;
    }
    return 'bash.exe';
  }

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
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user && userId !== 'mock-dev-id' && userId !== 'dev-user-id') {
        throw new NotFoundException('User profile could not be located');
      }
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err;
      // Database offline, local developer fallback mode active
    }

    // Determine target shell based on platform
    const isWindows = process.platform === 'win32';
    const defaultShell = isWindows ? 'powershell.exe' : 'bash';
    const shellCommand = dto?.shell || defaultShell;

    try {
      // Spawn active terminal shell
      const proc = spawn(shellCommand, [], {
        env: process.env,
      });

      let session: any = null;
      try {
        session = await this.prisma.terminalSession.create({
          data: {
            token: proc.pid?.toString() || Math.random().toString(36).substring(7),
            status: 'active',
            active: true,
            userId,
          },
        });
      } catch {
        // In-memory fallback session when database is offline
        session = {
          id: `session-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          token: proc.pid?.toString() || 'dev-session',
          status: 'active',
          active: true,
          userId,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }

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
    let session: any = null;
    try {
      session = await this.prisma.terminalSession.findFirst({
        where: { id: sessionId, userId },
      });
    } catch {}

    const proc = this.activeProcesses.get(sessionId);
    if (proc) {
      proc.kill();
      this.activeProcesses.delete(sessionId);
    }

    try {
      if (session) {
        await this.prisma.terminalSession.delete({
          where: { id: sessionId },
        });
      }
    } catch {}

    return { sessionId, success: true };
  }

  writeInput(sessionId: string, data: string) {
    const proc = this.activeProcesses.get(sessionId);
    if (!proc) {
      throw new BadRequestException('Inactive or closed terminal session');
    }
    proc.stdin?.write(data);
  }

  async executeCommand(
    command: string, 
    cwd?: string, 
    sessionId?: string
  ): Promise<{ stdout: string; stderr: string; exitCode: number; command: string; cwd: string }> {
    const trimmed = command.trim();
    const bashExecutable = this.getBashExecutable();
    
    // Resolve session working directory (defaults to /home/caelum)
    const resolvedSessionId = sessionId || 'default';
    const currentCwd = this.sessionCwds.get(resolvedSessionId) || cwd || '/home/caelum';

    // Ensure sandbox home and etc directories exist
    const repoRoot = path.resolve(__dirname, '../../../..');
    const homeDir = path.join(repoRoot, 'sandbox', 'home', 'caelum');
    const etcDir = path.join(repoRoot, 'etc');
    try {
      if (!fs.existsSync(homeDir)) {
        fs.mkdirSync(homeDir, { recursive: true });
      }
      if (!fs.existsSync(etcDir)) {
        fs.mkdirSync(etcDir, { recursive: true });
      }
      const osReleaseFile = path.join(etcDir, 'os-release');
      if (!fs.existsSync(osReleaseFile)) {
        fs.writeFileSync(
          osReleaseFile,
          'NAME="CaelumOS"\nVERSION="2.1 (Pioneering Developer OS)"\nID=caelum\nID_LIKE="ubuntu debian"\nPRETTY_NAME="CaelumOS Hybrid Linux 2.1 (Ubuntu-core base)"\nVERSION_ID="2.1"\nHOME_URL="https://caelum.me/"\n',
        );
      }
    } catch {}

    const unixHomeDir = homeDir.replace(/\\/g, '/');
    const unixEtcRelease = path.join(etcDir, 'os-release').replace(/\\/g, '/');

    const wrapperScript = `
mount "${unixHomeDir}/.." /home 2>/dev/null || true
mkdir -p /home/caelum 2>/dev/null || true

whoami() { echo "caelum"; }
id() { echo "uid=1000(caelum) gid=1000(caelum) groups=1000(caelum),4(adm),24(cdrom),27(sudo),122(docker)"; }
uname() {
  if [ "$1" = "-a" ]; then
    echo "Linux caelum-os 6.2.0-26-generic #26~22.04.1-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux"
  elif [ "$1" = "-r" ]; then
    echo "6.2.0-26-generic"
  elif [ "$1" = "-s" ]; then
    echo "Linux"
  elif [ "$1" = "-m" ]; then
    echo "x86_64"
  elif [ -z "$1" ]; then
    echo "Linux"
  else
    command uname "$@"
  fi
}
systemctl() {
  if [ "$1" = "status" ] && [ "$2" = "docker" ]; then
    if docker info >/dev/null 2>&1; then
      echo "● docker.service - Docker Application Container Engine"
      echo "     Loaded: loaded (/lib/systemd/system/docker.service; enabled; vendor preset: enabled)"
      echo "     Active: active (running)"
      echo "    Process: $(docker info --format '{{.ServerVersion}}' 2>/dev/null) engine runtime"
      return 0
    else
      echo "● docker.service - Docker Application Container Engine"
      echo "     Loaded: loaded (/lib/systemd/system/docker.service; enabled; vendor preset: enabled)"
      echo "     Active: inactive (dead)"
      return 3
    fi
  fi
  echo "systemctl: unit $2.service could not be found."
  return 4
}
cat() {
  for arg in "$@"; do
    if [ "$arg" = "/etc/os-release" ] && [ ! -f /etc/os-release ]; then
      command cat "${unixEtcRelease}" 2>/dev/null || echo 'PRETTY_NAME="CaelumOS Hybrid Linux 2.1 (Ubuntu-core base)"'
      return $?
    fi
  done
  command cat "$@"
}

cd "${currentCwd}" 2>/dev/null || cd /home/caelum 2>/dev/null || cd / 2>/dev/null
{
${trimmed}
}
__CAELUM_EXIT=$?
echo "___CAELUM_CWD_MARKER___"
pwd -P
exit $__CAELUM_EXIT
`;

    return new Promise((resolve) => {
      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const userHome = process.env.USERPROFILE || process.env.HOME || '';
      const defaultKubeConfig = userHome ? path.join(userHome, '.kube', 'config') : '';
      const kubeConfigEnv = process.env.KUBECONFIG || (fs.existsSync(defaultKubeConfig) ? defaultKubeConfig : undefined);

      const proc = spawn(bashExecutable, ['-c', wrapperScript], {
        env: {
          ...process.env,
          USER: 'caelum',
          LOGNAME: 'caelum',
          USERNAME: 'caelum',
          PAGER: 'cat',
          ...(kubeConfigEnv ? { KUBECONFIG: kubeConfigEnv } : {}),
        },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      proc.stdin?.end();

      const timer = setTimeout(() => {
        timedOut = true;
        proc.kill();
        resolve({
          stdout,
          stderr: stderr + '\nExecution timed out after 60 seconds.',
          exitCode: 124,
          command: trimmed,
          cwd: currentCwd,
        });
      }, 60000);

      proc.stdout?.on('data', (data: Buffer) => {
        stdout += data.toString('utf8');
      });

      proc.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString('utf8');
      });

      proc.on('error', (err: any) => {
        clearTimeout(timer);
        if (timedOut) return;

        resolve({
          stdout: '',
          stderr: err.message || 'Failed to execute command in CaelumOS shell.',
          exitCode: 1,
          command: trimmed,
          cwd: currentCwd,
        });
      });

      proc.on('close', (code: number | null) => {
        clearTimeout(timer);
        if (timedOut) return;

        let exitCode = code ?? 0;
        let finalStdout = stdout;
        let newCwd = currentCwd;

        if (stdout.includes('___CAELUM_CWD_MARKER___')) {
          const parts = stdout.split('___CAELUM_CWD_MARKER___');
          finalStdout = parts[0];
          const lines = parts[1]?.trim().split(/\r?\n/) || [];
          const detectedCwd = lines[0]?.trim();
          if (detectedCwd) {
            newCwd = detectedCwd;
            this.sessionCwds.set(resolvedSessionId, newCwd);
          }
        }

        // Clean up stderr if mount produced expected warning
        if (stderr.includes('mount: warning - /home does not exist')) {
          stderr = stderr.replace(/mount: warning - \/home does not exist\.?\r?\n?/g, '').trimStart();
        }

        // Enhanced Docker daemon error formatting
        if (trimmed.startsWith('docker') && exitCode !== 0) {
          const combinedErr = (stderr || '') + (finalStdout || '');
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
          stdout: finalStdout,
          stderr,
          exitCode,
          command: trimmed,
          cwd: newCwd,
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
        // 6. Networking check
        const netCheck = await this.executeCommand('docker network ls');
        results.networking = netCheck.exitCode === 0;

        // 7. Container Logs check
        const logCheck = await this.executeCommand('docker logs caelum-diag-test');
        results.logs = logCheck.exitCode === 0;

        // 8. Lifecycle stop & remove check
        await this.executeCommand('docker stop caelum-diag-test');
        const rmCheck = await this.executeCommand('docker rm -f caelum-diag-test');
        results.lifecycle = rmCheck.exitCode === 0;
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

