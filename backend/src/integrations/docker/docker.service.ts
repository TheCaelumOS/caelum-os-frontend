import { Injectable, BadRequestException } from '@nestjs/common';
import { execFileSync } from 'child_process';
import * as fs from 'fs';

@Injectable()
export class DockerService {
  
  /**
   * Resiliently locate the docker executable on Windows or Linux
   */
  private getDockerBinary(): string {
    const candidates = [
      'C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe',
      'C:\\Users\\karth\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe',
      'docker.exe',
      'docker',
    ];
    for (const c of candidates) {
      if (c.includes('\\') && fs.existsSync(c)) {
        return c;
      }
    }
    return 'docker';
  }

  /**
   * Helper to run Docker CLI commands safely with array arguments
   */
  private runDocker(args: string[], timeoutMs = 15000): string {
    const bin = this.getDockerBinary();
    return execFileSync(bin, args, {
      encoding: 'utf8',
      timeout: timeoutMs,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  }

  private checkConnection(): boolean {
    if (process.platform === 'win32' && !fs.existsSync('\\\\.\\pipe\\docker_engine')) {
      return false;
    }
    try {
      const output = this.runDocker(['version'], 5000);
      return output.includes('Server:');
    } catch {
      return false;
    }
  }

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

  async getHealth() {
    if (process.platform === 'win32' && !fs.existsSync('\\\\.\\pipe\\docker_engine')) {
      return {
        connected: false,
        version: '',
        context: '',
        engine: '',
        status: 'unavailable',
        error: 'Docker daemon is not running or unreachable. Please start Docker Desktop or the Docker service.',
      };
    }
    try {
      const output = this.runDocker(['version'], 5000);
      const connected = output.includes('Server:');
      
      let version = '29.8.0';
      const engineVersionMatch = output.match(/Server:[\s\S]*?Engine:[\s\S]*?Version:\s*([0-9.]+)/i);
      if (engineVersionMatch) {
        version = engineVersionMatch[1];
      } else {
        const clientVersionMatch = output.match(/Client:[\s\S]*?Version:\s*([0-9.]+)/i);
        if (clientVersionMatch) {
          version = clientVersionMatch[1];
        }
      }

      let context = 'desktop-linux';
      try {
        const ctxOut = this.runDocker(['context', 'show'], 5000).trim();
        if (ctxOut) context = ctxOut;
      } catch {}

      const engine = output.includes('Docker Desktop') ? 'Docker Desktop' : 'Docker Engine';

      if (connected) {
        return {
          connected: true,
          version,
          context,
          engine,
          status: 'healthy',
        };
      } else {
        return {
          connected: false,
          version,
          context,
          engine,
          status: 'unavailable',
          error: 'Docker daemon is not running or unreachable. Please start Docker Desktop or the Docker service.',
        };
      }
    } catch (err: any) {
      const stdout = err.stdout ? err.stdout.toString() : '';
      const clientVer = this.extractClientVersion(stdout);
      return {
        connected: false,
        version: clientVer ? `Client v${clientVer}` : '',
        context: '',
        engine: '',
        status: 'unavailable',
        error: 'Docker daemon is not running or unreachable. Please start Docker Desktop or the Docker service.',
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
      // fallback gracefully if one list call fails
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
    if (!this.checkConnection()) {
      throw new BadRequestException('Cannot connect to Docker daemon. Please verify Docker is running.');
    }
    try {
      const output = this.runDocker(['ps', '-a', '--format', '{{json .}}'], 15000);
      if (!output || !output.trim()) return [];

      return output
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
              created: item.CreatedAt || '',
            };
          } catch {
            return null;
          }
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
    } catch (err: any) {
      throw new BadRequestException(`Failed to list Docker containers: ${err.message}`);
    }
  }

  async listImages() {
    if (!this.checkConnection()) {
      throw new BadRequestException('Cannot connect to Docker daemon. Please verify Docker is running.');
    }
    try {
      const output = this.runDocker(['images', '--format', '{{json .}}'], 15000);
      if (!output || !output.trim()) return [];

      return output
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
              created: item.CreatedAt || '',
            };
          } catch {
            return null;
          }
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
    } catch (err: any) {
      throw new BadRequestException(`Failed to list Docker images: ${err.message}`);
    }
  }

  async listNetworks() {
    if (!this.checkConnection()) {
      throw new BadRequestException('Cannot connect to Docker daemon. Please verify Docker is running.');
    }
    try {
      const output = this.runDocker(['network', 'ls', '--format', '{{json .}}'], 15000);
      if (!output || !output.trim()) return [];

      return output
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
    } catch (err: any) {
      throw new BadRequestException(`Failed to list Docker networks: ${err.message}`);
    }
  }

  async listVolumes() {
    if (!this.checkConnection()) {
      throw new BadRequestException('Cannot connect to Docker daemon. Please verify Docker is running.');
    }
    try {
      const output = this.runDocker(['volume', 'ls', '--format', '{{json .}}'], 15000);
      if (!output || !output.trim()) return [];

      return output
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
    } catch (err: any) {
      throw new BadRequestException(`Failed to list Docker volumes: ${err.message}`);
    }
  }

  async listCompose() {
    if (!this.checkConnection()) {
      return [];
    }
    try {
      const output = this.runDocker(['compose', 'ls', '--format', 'json'], 15000);
      if (!output || !output.trim()) return [];
      try {
        const parsed = JSON.parse(output.trim());
        if (Array.isArray(parsed)) return parsed;
        return [parsed];
      } catch {
        return [];
      }
    } catch {
      return [];
    }
  }

  async getDaemonLogs() {
    if (!this.checkConnection()) {
      throw new BadRequestException('Cannot connect to Docker daemon. Please verify Docker is running.');
    }
    try {
      const output = this.runDocker(['events', '--since', '1h', '--until', '0s'], 8000);
      return output.trim() || 'No recent Docker events recorded in the last 60 minutes.';
    } catch {
      return 'No recent Docker events recorded in the last 60 minutes.';
    }
  }

  async controlContainer(containerId: string, action: 'start' | 'stop' | 'restart' | 'remove') {
    if (!this.checkConnection()) {
      throw new BadRequestException('Cannot connect to Docker daemon. Please verify Docker is running.');
    }
    
    // Strict input validation
    const containerIdRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!containerIdRegex.test(containerId)) {
      throw new BadRequestException('Invalid container ID or name format.');
    }

    const allowedActions = ['start', 'stop', 'restart', 'remove'];
    if (!allowedActions.includes(action)) {
      throw new BadRequestException('Invalid container control action.');
    }

    try {
      if (action === 'remove') {
        this.runDocker(['rm', '-f', containerId], 15000);
      } else {
        this.runDocker([action, containerId], 15000);
      }
      return { containerId, action, success: true };
    } catch (err: any) {
      const errMsg = (err.stderr ? err.stderr.toString() : err.message) || 'Action failed.';
      throw new BadRequestException(`Failed to ${action} container '${containerId}': ${errMsg.trim()}`);
    }
  }

  async getContainerLogs(containerId: string) {
    if (!this.checkConnection()) {
      throw new BadRequestException('Cannot connect to Docker daemon. Please verify Docker is running.');
    }

    // Strict input validation
    const containerIdRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!containerIdRegex.test(containerId)) {
      throw new BadRequestException('Invalid container ID or name format.');
    }

    try {
      const logs = this.runDocker(['logs', '--tail', '100', containerId], 15000);
      return { containerId, logs: logs.trim() || 'No logs recorded for this container.' };
    } catch (err: any) {
      const stderr = err.stderr ? err.stderr.toString() : '';
      const stdout = err.stdout ? err.stdout.toString() : '';
      const combined = (stdout + '\n' + stderr).trim();
      if (combined.includes('No such container')) {
        throw new BadRequestException(`Container '${containerId}' no longer exists.`);
      }
      if (combined) {
        return { containerId, logs: combined };
      }
      throw new BadRequestException(`Failed to get logs for container ${containerId}: ${err.message}`);
    }
  }
}
