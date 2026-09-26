import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { TerminalService } from '../../terminal/terminal.service';

@Injectable()
export class DockerService {
  private readonly logger = new Logger(DockerService.name);

  constructor(private readonly terminalService: TerminalService) {}

  private extractClientVersion(rawOutput: string): string {
    try {
      const clientMatch = rawOutput.match(/Client:\s*[\r\n]+(?:\s*Cloud integration:[^\r\n]+[\r\n]+)?\s*Version:\s*([0-9.]+)/i);
      if (clientMatch) return clientMatch[1];
      const generalMatch = rawOutput.match(/Version:\s*([0-9.]+)/i);
      return generalMatch ? generalMatch[1] : '';
    } catch {
      return '';
    }
  }

  /**
   * Health and connectivity probe through the shared CaelumOS runtime shell.
   * Eliminates brittle pipe checks and connects directly to the real Docker daemon.
   */
  async getHealth() {
    try {
      const res = await this.terminalService.executeCommand('docker version');
      const connected = res.exitCode === 0 && res.stdout.includes('Server:');

      if (!connected) {
        const clientVer = this.extractClientVersion(res.stdout);
        return {
          connected: false,
          version: clientVer ? `Client v${clientVer}` : '',
          context: '',
          engine: '',
          status: 'unavailable',
          error: res.stderr ? res.stderr.trim() : 'Docker daemon is not running or unreachable. Please start Docker Desktop or the Docker service.',
        };
      }

      let version = '29.8.0';
      const engineVersionMatch = res.stdout.match(/Server:[\s\S]*?Engine:[\s\S]*?Version:\s*([0-9.]+)/i);
      if (engineVersionMatch) {
        version = engineVersionMatch[1];
      } else {
        const clientVersionMatch = res.stdout.match(/Client:[\s\S]*?Version:\s*([0-9.]+)/i);
        if (clientVersionMatch) {
          version = clientVersionMatch[1];
        }
      }

      let context = 'desktop-linux';
      const ctxMatch = res.stdout.match(/Context:\s*([^\r\n]+)/i);
      if (ctxMatch && ctxMatch[1]?.trim()) {
        context = ctxMatch[1].trim();
      }

      const engine = res.stdout.includes('Docker Desktop') ? 'Docker Desktop' : 'Docker Engine';

      return {
        connected: true,
        version,
        context,
        engine,
        status: 'healthy',
      };
    } catch (err: any) {
      this.logger.warn(`Docker health check probe error: ${err.message}`);
      return {
        connected: false,
        version: '',
        context: '',
        engine: '',
        status: 'unavailable',
        error: err.message || 'Docker daemon is not running or unreachable.',
      };
    }
  }

  async getStatus() {
    const health = await this.getHealth();
    if (!health.connected) {
      return {
        connected: false,
        version: health.version || 'Unknown',
        status: 'unavailable',
        context: health.context || '',
        engine: health.engine || '',
        containers: [],
        images: [],
        volumes: [],
        error: health.error,
      };
    }

    let containers: any[] = [];
    let images: any[] = [];
    let volumes: any[] = [];

    try {
      [containers, images, volumes] = await Promise.all([
        this.listContainers().catch(() => []),
        this.listImages().catch(() => []),
        this.listVolumes().catch(() => []),
      ]);
    } catch {
      // Graceful fallback if a subquery fails
    }

    return {
      connected: true,
      version: health.version || 'Unknown',
      status: health.status,
      context: health.context,
      engine: health.engine,
      containers,
      images,
      volumes,
    };
  }

  async listContainers() {
    const res = await this.terminalService.executeCommand('docker ps -a --format "{{json .}}"');
    if (res.exitCode !== 0) {
      throw new BadRequestException(`Failed to list Docker containers: ${res.stderr || res.stdout}`);
    }

    if (!res.stdout || !res.stdout.trim()) return [];

    return res.stdout
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        try {
          const item = JSON.parse(line);
          return {
            id: item.ID || '',
            name: item.Names || item.ID || 'unnamed',
            image: item.Image || 'unknown',
            status: item.Status || '',
            state: (item.State || (item.Status?.toLowerCase().startsWith('up') ? 'running' : 'exited')).toLowerCase(),
            ports: item.Ports || '',
            created: item.CreatedAt || item.RunningFor || '',
          };
        } catch {
          return null;
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  async listImages() {
    const res = await this.terminalService.executeCommand('docker images --format "{{json .}}"');
    if (res.exitCode !== 0) {
      throw new BadRequestException(`Failed to list Docker images: ${res.stderr || res.stdout}`);
    }

    if (!res.stdout || !res.stdout.trim()) return [];

    return res.stdout
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        try {
          const item = JSON.parse(line);
          return {
            repository: item.Repository || '<none>',
            tag: item.Tag || '<none>',
            size: item.Size || '0B',
            id: item.ID || '',
            created: item.CreatedAt || item.CreatedSince || '',
          };
        } catch {
          return null;
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  async listNetworks() {
    const res = await this.terminalService.executeCommand('docker network ls --format "{{json .}}"');
    if (res.exitCode !== 0) {
      throw new BadRequestException(`Failed to list Docker networks: ${res.stderr || res.stdout}`);
    }

    if (!res.stdout || !res.stdout.trim()) return [];

    return res.stdout
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        try {
          const item = JSON.parse(line);
          return {
            id: item.ID || '',
            name: item.Name || '',
            driver: item.Driver || '',
            scope: item.Scope || '',
          };
        } catch {
          return null;
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  async listVolumes() {
    const res = await this.terminalService.executeCommand('docker volume ls --format "{{json .}}"');
    if (res.exitCode !== 0) {
      throw new BadRequestException(`Failed to list Docker volumes: ${res.stderr || res.stdout}`);
    }

    if (!res.stdout || !res.stdout.trim()) return [];

    return res.stdout
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        try {
          const item = JSON.parse(line);
          return {
            name: item.Name || '',
            driver: item.Driver || 'local',
            scope: item.Scope || 'local',
          };
        } catch {
          return null;
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  async listCompose() {
    try {
      const res = await this.terminalService.executeCommand('docker compose ls --format json');
      if (res.exitCode !== 0 || !res.stdout.trim()) return [];
      const parsed = JSON.parse(res.stdout.trim());
      if (Array.isArray(parsed)) return parsed;
      return [parsed];
    } catch {
      return [];
    }
  }

  async getDaemonLogs() {
    try {
      const res = await this.terminalService.executeCommand('docker events --since 1h --until 0s');
      if (res.exitCode === 0 && res.stdout.trim()) {
        return res.stdout.trim();
      }
      return 'No recent Docker events recorded in the last 60 minutes.';
    } catch {
      return 'No recent Docker events recorded in the last 60 minutes.';
    }
  }

  async controlContainer(containerId: string, action: 'start' | 'stop' | 'restart' | 'remove') {
    const containerIdRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!containerIdRegex.test(containerId)) {
      throw new BadRequestException('Invalid container ID or name format.');
    }

    const allowedActions = ['start', 'stop', 'restart', 'remove'];
    if (!allowedActions.includes(action)) {
      throw new BadRequestException('Invalid container control action.');
    }

    const cmd = action === 'remove' ? `docker rm -f ${containerId}` : `docker ${action} ${containerId}`;
    const res = await this.terminalService.executeCommand(cmd);

    if (res.exitCode !== 0) {
      const errMsg = (res.stderr || res.stdout || 'Action failed.').trim();
      throw new BadRequestException(`Failed to ${action} container '${containerId}': ${errMsg}`);
    }

    return { containerId, action, success: true };
  }

  async getContainerLogs(containerId: string) {
    const containerIdRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!containerIdRegex.test(containerId)) {
      throw new BadRequestException('Invalid container ID or name format.');
    }

    const res = await this.terminalService.executeCommand(`docker logs --tail 100 ${containerId}`);
    const combined = (res.stdout + '\n' + res.stderr).trim();

    if (res.exitCode !== 0 && combined.includes('No such container')) {
      throw new BadRequestException(`Container '${containerId}' no longer exists.`);
    }

    return { containerId, logs: combined || 'No logs recorded for this container.' };
  }

  /**
   * Fetch real container resource metrics and CPU/memory stats
   */
  async getContainerStats(): Promise<Record<string, any>> {
    try {
      const res = await this.terminalService.executeCommand('docker stats --no-stream --format "{{json .}}"');
      if (res.exitCode !== 0 || !res.stdout.trim()) return {};

      const statsMap: Record<string, any> = {};
      const lines = res.stdout.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        try {
          const item = JSON.parse(line);
          const cpuNum = parseFloat((item.CPUPerc || '').replace('%', '')) || 0;
          const memNum = parseFloat((item.MemPerc || '').replace('%', '')) || 0;
          const id = (item.ID || item.Container || '').substring(0, 12);
          const name = item.Name || '';
          const statData = {
            cpuPerc: cpuNum,
            memPerc: memNum,
            memUsage: item.MemUsage,
            netIO: item.NetIO,
            blockIO: item.BlockIO,
            pids: parseInt(item.PIDs, 10) || 0,
          };
          if (id) statsMap[id] = statData;
          if (name) statsMap[name] = statData;
        } catch {}
      }
      return statsMap;
    } catch {
      return {};
    }
  }

  /**
   * Fetch chronological structured Docker daemon events
   */
  async getRealEvents(since = '24h'): Promise<any[]> {
    try {
      const res = await this.terminalService.executeCommand(`docker events --since ${since} --until 0s --format "{{json .}}"`);
      if (res.exitCode !== 0 || !res.stdout.trim()) return [];

      return res.stdout
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
    } catch {
      return [];
    }
  }
}
