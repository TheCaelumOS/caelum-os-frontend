import { Injectable, BadRequestException } from '@nestjs/common';
import { execSync } from 'child_process';

@Injectable()
export class DockerService {
  
  private checkConnection(): boolean {
    try {
      const output = execSync('docker version', { encoding: 'utf8', timeout: 15000, stdio: ['pipe', 'pipe', 'ignore'] });
      return output.includes('Server:');
    } catch {
      return false;
    }
  }

  async getHealth() {
    try {
      const output = execSync('docker version', { encoding: 'utf8', timeout: 15000, stdio: ['pipe', 'pipe', 'ignore'] });
      const serverSection = output.split(/Server:/i)[1] || '';
      const versionMatch = serverSection.match(/Version:\s*([0-9.]+)/i);
      const version = versionMatch ? versionMatch[1] : 'Unknown';
      const connected = output.includes('Server:');
      return {
        connected,
        version: connected ? version : '',
        status: connected ? 'running' : 'stopped'
      };
    } catch (err: any) {
      return {
        connected: false,
        version: '',
        status: 'stopped',
        error: err.message
      };
    }
  }

  async getStatus() {
    try {
      const output = execSync('docker version', { encoding: 'utf8', timeout: 15000, stdio: ['pipe', 'pipe', 'ignore'] });
      const serverSection = output.split(/Server:/i)[1] || '';
      const versionMatch = serverSection.match(/Version:\s*([0-9.]+)/i);
      const version = versionMatch ? versionMatch[1] : 'Unknown';
      const connected = output.includes('Server:');
      return {
        connected,
        version: connected ? version : 'Unknown',
      };
    } catch (err: any) {
      return { connected: false, version: 'Unknown', error: err.message };
    }
  }

  async listContainers() {
    if (!this.checkConnection()) {
      throw new BadRequestException('Cannot connect to Docker daemon. Please verify Docker is running.');
    }
    try {
      const output = execSync('docker ps -a --format "{{json .}}"', { encoding: 'utf8', timeout: 15000 });
      if (!output.trim()) return [];
      return output.trim().split('\n').map(line => {
        const item = JSON.parse(line);
        return {
          id: item.ID,
          name: item.Names,
          image: item.Image,
          status: item.Status,
          state: item.State || (item.Status.startsWith('Up') ? 'running' : 'exited'),
          ports: item.Ports,
          created: item.CreatedAt,
        };
      });
    } catch (err: any) {
      throw new BadRequestException(`Failed to list Docker containers: ${err.message}`);
    }
  }

  async listImages() {
    if (!this.checkConnection()) {
      throw new BadRequestException('Cannot connect to Docker daemon. Please verify Docker is running.');
    }
    try {
      const output = execSync('docker images --format "{{json .}}"', { encoding: 'utf8', timeout: 15000 });
      if (!output.trim()) return [];
      return output.trim().split('\n').map(line => {
        const item = JSON.parse(line);
        return {
          repository: item.Repository,
          tag: item.Tag,
          size: item.Size,
          id: item.ID,
          created: item.CreatedAt,
        };
      });
    } catch (err: any) {
      throw new BadRequestException(`Failed to list Docker images: ${err.message}`);
    }
  }

  async listNetworks() {
    if (!this.checkConnection()) {
      throw new BadRequestException('Cannot connect to Docker daemon. Please verify Docker is running.');
    }
    try {
      const output = execSync('docker network ls --format "{{json .}}"', { encoding: 'utf8', timeout: 15000 });
      if (!output.trim()) return [];
      return output.trim().split('\n').map(line => {
        const item = JSON.parse(line);
        return {
          id: item.ID,
          name: item.Name,
          driver: item.Driver,
          scope: item.Scope,
        };
      });
    } catch (err: any) {
      throw new BadRequestException(`Failed to list Docker networks: ${err.message}`);
    }
  }

  async listVolumes() {
    if (!this.checkConnection()) {
      throw new BadRequestException('Cannot connect to Docker daemon. Please verify Docker is running.');
    }
    try {
      const output = execSync('docker volume ls --format "{{json .}}"', { encoding: 'utf8', timeout: 15000 });
      if (!output.trim()) return [];
      return output.trim().split('\n').map(line => {
        const item = JSON.parse(line);
        return {
          name: item.Name,
          driver: item.Driver,
          scope: item.Scope || 'local',
        };
      });
    } catch (err: any) {
      throw new BadRequestException(`Failed to list Docker volumes: ${err.message}`);
    }
  }

  async getDaemonLogs() {
    if (!this.checkConnection()) {
      throw new BadRequestException('Cannot connect to Docker daemon. Please verify Docker is running.');
    }
    try {
      const output = execSync('docker events --since 60m --until 1s', { encoding: 'utf8', timeout: 15000 });
      return output.trim() || 'No recent Docker events recorded in the last 60 minutes.';
    } catch (err: any) {
      throw new BadRequestException(`Failed to fetch Docker daemon logs: ${err.message}`);
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
        execSync(`docker rm -f ${containerId}`, { timeout: 15000 });
      } else {
        execSync(`docker ${action} ${containerId}`, { timeout: 15000 });
      }
      return { containerId, action, success: true };
    } catch (err: any) {
      throw new BadRequestException(`Failed to execute action '${action}' on container ${containerId}: ${err.message}`);
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
      const logs = execSync(`docker logs --tail 100 ${containerId} 2>&1`, { encoding: 'utf8', timeout: 15000 });
      return { containerId, logs };
    } catch (err: any) {
      const errMsg = err.message || '';
      if (errMsg.includes('No such container') || (err.stderr && err.stderr.toString().includes('No such container'))) {
        throw new BadRequestException(`Container '${containerId}' no longer exists.`);
      }
      throw new BadRequestException(`Failed to get logs for container ${containerId}: ${err.message}`);
    }
  }
}
