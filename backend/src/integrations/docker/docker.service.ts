import { Injectable, BadRequestException } from '@nestjs/common';
import { execSync } from 'child_process';

@Injectable()
export class DockerService {
  
  private checkConnection(): boolean {
    try {
      const output = execSync('docker version', { 
        encoding: 'utf8', 
        timeout: 10000, 
        stdio: ['pipe', 'pipe', 'ignore'] 
      });
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
    try {
      const output = execSync('docker version', { 
        encoding: 'utf8', 
        timeout: 10000, 
        stdio: ['pipe', 'pipe', 'pipe'] 
      });
      const serverSection = output.split(/Server:/i)[1] || '';
      const versionMatch = serverSection.match(/Version:\s*([0-9.]+)/i);
      const serverVersion = versionMatch ? versionMatch[1] : 'Unknown';
      const connected = output.includes('Server:');
      
      return {
        connected,
        version: connected ? serverVersion : this.extractClientVersion(output),
        status: connected ? 'running' : 'stopped'
      };
    } catch (err: any) {
      const stdout = err.stdout ? err.stdout.toString() : '';
      const clientVer = this.extractClientVersion(stdout);
      return {
        connected: false,
        version: clientVer ? `Client v${clientVer}` : '',
        status: 'stopped',
        error: 'Docker daemon is not running or unreachable. Please start Docker Desktop or the Docker service.'
      };
    }
  }

  async getStatus() {
    const health = await this.getHealth();
    if (!health.connected) {
      return {
        connected: false,
        version: health.version || 'Unknown',
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
      const output = execSync('docker ps -a --format "{{json .}}"', { 
        encoding: 'utf8', 
        timeout: 15000,
        stdio: ['pipe', 'pipe', 'pipe']
      });
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
      const output = execSync('docker images --format "{{json .}}"', { 
        encoding: 'utf8', 
        timeout: 15000,
        stdio: ['pipe', 'pipe', 'pipe']
      });
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
      const output = execSync('docker network ls --format "{{json .}}"', { 
        encoding: 'utf8', 
        timeout: 15000,
        stdio: ['pipe', 'pipe', 'pipe']
      });
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
      const output = execSync('docker volume ls --format "{{json .}}"', { 
        encoding: 'utf8', 
        timeout: 15000,
        stdio: ['pipe', 'pipe', 'pipe']
      });
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

  async getDaemonLogs() {
    if (!this.checkConnection()) {
      throw new BadRequestException('Cannot connect to Docker daemon. Please verify Docker is running.');
    }
    try {
      const output = execSync('docker events --since 1h --until 0s', { 
        encoding: 'utf8', 
        timeout: 8000,
        stdio: ['pipe', 'pipe', 'pipe']
      });
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
        execSync(`docker rm -f ${containerId}`, { 
          timeout: 15000,
          stdio: ['pipe', 'pipe', 'pipe']
        });
      } else {
        execSync(`docker ${action} ${containerId}`, { 
          timeout: 15000,
          stdio: ['pipe', 'pipe', 'pipe']
        });
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
      const logs = execSync(`docker logs --tail 100 ${containerId}`, { 
        encoding: 'utf8', 
        timeout: 15000,
        stdio: ['pipe', 'pipe', 'pipe']
      });
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
