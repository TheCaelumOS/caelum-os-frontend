import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {
  StoredJenkinsConnection,
  JenkinsConnectionStatusResponse,
  JenkinsOverview,
  JenkinsJob,
  JenkinsBuildDetail,
  JenkinsConsoleOutput,
  JenkinsQueueItem,
  JenkinsNode,
} from './jenkins.types';
import {
  JenkinsConnectionStatus,
  JENKINS_LOCAL_PROBE_PORTS,
  JENKINS_REQUEST_TIMEOUT_MS,
} from './jenkins.constants';
import { encryptJenkinsSecret, decryptJenkinsSecret } from './utils/jenkins-crypto.util';
import { JenkinsClient } from './jenkins.client';
import { ConnectJenkinsDto } from './dto/connect-jenkins.dto';
import { TriggerBuildDto } from './dto/trigger-build.dto';

@Injectable()
export class JenkinsService {
  private readonly logger = new Logger(JenkinsService.name);
  private readonly storePath: string;

  constructor() {
    const dataDir = path.resolve(process.cwd(), '.caelum_data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (e) {
        this.logger.warn(`Could not create data directory at ${dataDir}: ${e}`);
      }
    }
    this.storePath = path.resolve(dataDir, 'jenkins_connections.json');
    if (!fs.existsSync(this.storePath)) {
      try {
        fs.writeFileSync(this.storePath, JSON.stringify({}, null, 2), 'utf8');
      } catch (e) {
        this.logger.warn(`Could not initialize storage file: ${e}`);
      }
    }
  }

  // =========================================================================
  // STORAGE & ENCRYPTION HELPERS
  // =========================================================================

  private readStore(): Record<string, StoredJenkinsConnection> {
    try {
      if (fs.existsSync(this.storePath)) {
        const raw = fs.readFileSync(this.storePath, 'utf8');
        return JSON.parse(raw);
      }
    } catch (e) {
      this.logger.error(`Failed to read Jenkins store: ${e}`);
    }
    return {};
  }

  private writeStore(data: Record<string, StoredJenkinsConnection>): void {
    try {
      fs.writeFileSync(this.storePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      this.logger.error(`Failed to write Jenkins store: ${e}`);
    }
  }

  private getStoredConnection(userId: string): StoredJenkinsConnection | null {
    if (!userId) return null;
    const store = this.readStore();
    return store[userId] || null;
  }

  private saveStoredConnection(userId: string, conn: StoredJenkinsConnection): void {
    const store = this.readStore();
    store[userId] = conn;
    this.writeStore(store);
  }

  private removeStoredConnection(userId: string): void {
    const store = this.readStore();
    if (store[userId]) {
      delete store[userId];
      this.writeStore(store);
    }
  }

  private getClient(userId: string): JenkinsClient {
    const conn = this.getStoredConnection(userId);
    if (!conn) {
      throw new NotFoundException(
        'Jenkins is not connected. Please connect your Jenkins server in the Jenkins app settings.',
      );
    }

    let token = '';
    try {
      token = decryptJenkinsSecret(conn.apiTokenEncrypted);
    } catch (e) {
      this.logger.error(`Failed to decrypt Jenkins credentials for user ${userId}: ${e}`);
      throw new UnauthorizedException('Saved Jenkins credentials could not be decrypted. Please reconnect.');
    }

    return new JenkinsClient(conn.url, conn.username, token);
  }

  // =========================================================================
  // CONNECTION MANAGEMENT
  // =========================================================================

  public async connect(
    userId: string,
    dto: ConnectJenkinsDto,
  ): Promise<JenkinsConnectionStatusResponse> {
    const url = dto.url.trim().replace(/\/+$/, '');
    const client = new JenkinsClient(url, dto.username, dto.apiToken);

    // Test connection against live Jenkins
    let testResult: { healthy: boolean; version: string; numExecutors?: number };
    try {
      testResult = await client.testConnection();
    } catch (err: any) {
      const msg = err.message || 'Failed to connect to Jenkins server.';
      throw new BadRequestException(`Could not connect to Jenkins at ${url}: ${msg}`);
    }

    const encryptedToken = encryptJenkinsSecret(dto.apiToken.trim());
    const connectionName = dto.name?.trim() || 'Jenkins Server';

    const conn: StoredJenkinsConnection = {
      userId,
      url,
      username: dto.username.trim(),
      apiTokenEncrypted: encryptedToken,
      name: connectionName,
      serverVersion: testResult.version,
      connectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveStoredConnection(userId, conn);

    return {
      status: JenkinsConnectionStatus.CONNECTED,
      url: conn.url,
      name: conn.name,
      username: conn.username,
      version: testResult.version,
      hasToken: true,
      lastChecked: new Date().toISOString(),
    };
  }

  public async disconnect(userId: string): Promise<{ disconnected: boolean; message: string }> {
    this.removeStoredConnection(userId);
    return {
      disconnected: true,
      message: 'Jenkins connection removed successfully.',
    };
  }

  public async getStatus(userId: string): Promise<JenkinsConnectionStatusResponse> {
    const conn = this.getStoredConnection(userId);
    if (!conn) {
      return {
        status: JenkinsConnectionStatus.NOT_CONNECTED,
      };
    }

    try {
      const client = this.getClient(userId);
      const test = await client.testConnection();

      // Update cached version if available
      if (test.version && test.version !== conn.serverVersion) {
        conn.serverVersion = test.version;
        conn.updatedAt = new Date().toISOString();
        this.saveStoredConnection(userId, conn);
      }

      return {
        status: JenkinsConnectionStatus.CONNECTED,
        url: conn.url,
        name: conn.name,
        username: conn.username,
        version: test.version || conn.serverVersion,
        hasToken: true,
        lastChecked: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        status: JenkinsConnectionStatus.UNAVAILABLE,
        url: conn.url,
        name: conn.name,
        username: conn.username,
        version: conn.serverVersion,
        hasToken: true,
        lastChecked: new Date().toISOString(),
        error: err.message || 'Unable to reach Jenkins server.',
      };
    }
  }

  public async autoDetectLocal(userId: string): Promise<{
    found: boolean;
    url?: string;
    version?: string;
    requiresAuth?: boolean;
    message: string;
  }> {
    for (const port of JENKINS_LOCAL_PROBE_PORTS) {
      const testUrl = `http://localhost:${port}`;
      try {
        const res = await fetch(`${testUrl}/api/json`, {
          method: 'GET',
          signal: AbortSignal.timeout(1500),
        });

        const jenkinsHeader = res.headers.get('x-jenkins');
        if (jenkinsHeader || res.status === 401 || res.status === 403 || res.status === 200) {
          return {
            found: true,
            url: testUrl,
            version: jenkinsHeader || 'Unknown',
            requiresAuth: res.status === 401 || res.status === 403,
            message: `Detected local Jenkins server on port ${port}`,
          };
        }
      } catch {
        // Continue probing next port
      }
    }

    return {
      found: false,
      message: 'No active local Jenkins server detected on standard ports (8080, 8081, 8443, 9090).',
    };
  }

  // =========================================================================
  // OVERVIEW & METRICS
  // =========================================================================

  public async getOverview(userId: string): Promise<JenkinsOverview> {
    const conn = this.getStoredConnection(userId);
    if (!conn) {
      throw new NotFoundException('Jenkins is not connected.');
    }
    const client = this.getClient(userId);
    return client.getOverview(conn.name);
  }

  // =========================================================================
  // JOBS
  // =========================================================================

  public async getJobs(
    userId: string,
    folderPath?: string,
    query?: string,
    status?: string,
  ): Promise<JenkinsJob[]> {
    const client = this.getClient(userId);
    let jobs = await client.getJobs(folderPath);

    if (query) {
      const q = query.toLowerCase();
      jobs = jobs.filter(
        (j) =>
          j.name.toLowerCase().includes(q) ||
          j.fullName.toLowerCase().includes(q) ||
          (j.description && j.description.toLowerCase().includes(q)),
      );
    }

    if (status) {
      const s = status.toUpperCase();
      jobs = jobs.filter((j) => j.status === s);
    }

    return jobs;
  }

  public async getJobDetails(userId: string, jobPath: string): Promise<any> {
    const client = this.getClient(userId);
    return client.getJobDetails(jobPath);
  }

  // =========================================================================
  // BUILDS & QUEUE
  // =========================================================================

  public async triggerBuild(
    userId: string,
    jobPath: string,
    dto: TriggerBuildDto,
  ): Promise<{
    queued: boolean;
    queueItemUrl?: string;
    queueItemId?: number;
    message: string;
  }> {
    const client = this.getClient(userId);
    return client.triggerBuild(jobPath, dto.parameters);
  }

  public async stopBuild(
    userId: string,
    jobPath: string,
    buildNumber: number,
  ): Promise<{ stopped: boolean; message: string }> {
    const client = this.getClient(userId);
    return client.stopBuild(jobPath, buildNumber);
  }

  public async getBuild(
    userId: string,
    jobPath: string,
    buildNumber: number,
  ): Promise<JenkinsBuildDetail> {
    const client = this.getClient(userId);
    return client.getBuild(jobPath, buildNumber);
  }

  public async getConsoleOutput(
    userId: string,
    jobPath: string,
    buildNumber: number,
    startOffset: number = 0,
  ): Promise<JenkinsConsoleOutput> {
    const client = this.getClient(userId);
    return client.getConsoleOutput(jobPath, buildNumber, startOffset);
  }

  public async getTestReport(
    userId: string,
    jobPath: string,
    buildNumber: number,
  ): Promise<any> {
    const client = this.getClient(userId);
    return client.getTestReport(jobPath, buildNumber);
  }

  public async getQueue(userId: string): Promise<JenkinsQueueItem[]> {
    const client = this.getClient(userId);
    return client.getQueue();
  }

  public async cancelQueueItem(
    userId: string,
    id: number,
  ): Promise<{ cancelled: boolean; message: string }> {
    const client = this.getClient(userId);
    return client.cancelQueueItem(id);
  }

  // =========================================================================
  // NODES / AGENTS
  // =========================================================================

  public async getNodes(userId: string): Promise<JenkinsNode[]> {
    const client = this.getClient(userId);
    return client.getNodes();
  }
}
