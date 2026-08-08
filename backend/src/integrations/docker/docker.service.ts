import { Injectable, BadRequestException } from '@nestjs/common';
import { execSync } from 'child_process';

@Injectable()
export class DockerService {
  
  private checkConnection() {
    try {
      execSync('docker info', { stdio: 'ignore', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  async getStatus() {
    const connected = this.checkConnection();
    if (!connected) {
      return { connected: false, version: 'Unknown', error: 'Docker Engine is not running or unreachable.' };
    }
    try {
      const versionOutput = execSync('docker version --format "{{.Server.Version}}"', { encoding: 'utf8', timeout: 2000 });
      return {
        connected: true,
        version: versionOutput.trim(),
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
      const output = execSync('docker ps -a --format "{{json .}}"', { encoding: 'utf8', timeout: 3000 });
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
      const output = execSync('docker images --format "{{json .}}"', { encoding: 'utf8', timeout: 3000 });
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
      const output = execSync('docker network ls --format "{{json .}}"', { encoding: 'utf8', timeout: 3000 });
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
      const output = execSync('docker volume ls --format "{{json .}}"', { encoding: 'utf8', timeout: 3000 });
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
      const output = execSync('docker events --since 60m --until 1s', { encoding: 'utf8', timeout: 3000 });
      return output.trim() || 'No recent Docker events recorded in the last 60 minutes.';
    } catch (err: any) {
      throw new BadRequestException(`Failed to fetch Docker daemon logs: ${err.message}`);
    }
  }

  async controlContainer(containerId: string, action: 'start' | 'stop' | 'restart' | 'remove') {
    if (!this.checkConnection()) {
      throw new BadRequestException('Cannot connect to Docker daemon. Please verify Docker is running.');
    }
    try {
      if (action === 'remove') {
        execSync(`docker rm -f ${containerId}`, { timeout: 5000 });
      } else {
        execSync(`docker ${action} ${containerId}`, { timeout: 5000 });
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
    try {
      const logs = execSync(`docker logs --tail 100 ${containerId}`, { encoding: 'utf8', timeout: 3000 });
      return { containerId, logs };
    } catch (err: any) {
      throw new BadRequestException(`Failed to get logs for container ${containerId}: ${err.message}`);
    }
  }
}
