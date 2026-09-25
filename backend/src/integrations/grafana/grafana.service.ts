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
  AuthType,
  GrafanaConnectionConfig,
  StoredGrafanaConnection,
  GrafanaStatusResponse,
  GrafanaDashboardSummary,
  GrafanaDashboardDetail,
  GrafanaFolder,
  GrafanaDataSource,
  GrafanaAlertRule,
  GrafanaContactPoint,
  GrafanaQueryResult,
  CaelumObservabilityOverview,
} from './grafana.types';
import {
  GrafanaConnectionStatus,
  GRAFANA_LOCAL_PROBE_PORTS,
  OBSERVABILITY_METRIC_QUERIES,
} from './grafana.constants';
import { encryptGrafanaSecret, decryptGrafanaSecret } from './utils/grafana-crypto.util';
import { GrafanaClient } from './grafana.client';
import { ConnectGrafanaDto } from './dto/connect-grafana.dto';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { QueryGrafanaDto } from './dto/query-grafana.dto';

@Injectable()
export class GrafanaService {
  private readonly logger = new Logger(GrafanaService.name);
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
    this.storePath = path.resolve(dataDir, 'grafana_connections.json');
    if (!fs.existsSync(this.storePath)) {
      try {
        fs.writeFileSync(this.storePath, JSON.stringify({}, null, 2), 'utf8');
      } catch (e) {
        this.logger.warn(`Could not initialize storage file: ${e}`);
      }
    }
  }

  // =========================================================================
  // MULTI-USER STORAGE & ISOLATION
  // =========================================================================

  private readStore(): Record<string, StoredGrafanaConnection> {
    try {
      if (fs.existsSync(this.storePath)) {
        const raw = fs.readFileSync(this.storePath, 'utf8');
        return JSON.parse(raw);
      }
    } catch (e) {
      this.logger.error(`Failed to read Grafana store: ${e}`);
    }
    return {};
  }

  private writeStore(data: Record<string, StoredGrafanaConnection>): void {
    try {
      fs.writeFileSync(this.storePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      this.logger.error(`Failed to write Grafana store: ${e}`);
    }
  }

  private getStoredConnection(userId: string): StoredGrafanaConnection | null {
    if (!userId) return null;
    const store = this.readStore();
    return store[userId] || null;
  }

  private saveStoredConnection(userId: string, conn: StoredGrafanaConnection): void {
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

  private getClient(userId: string): GrafanaClient {
    const conn = this.getStoredConnection(userId);
    if (!conn) {
      throw new UnauthorizedException('Grafana is not connected. Please connect a Grafana instance first.');
    }

    let token: string | undefined;
    let password: string | undefined;

    if (conn.tokenEncrypted) {
      try {
        token = decryptGrafanaSecret(conn.tokenEncrypted);
      } catch {
        this.logger.error('Failed to decrypt Grafana token');
      }
    }

    if (conn.passwordEncrypted) {
      try {
        password = decryptGrafanaSecret(conn.passwordEncrypted);
      } catch {
        this.logger.error('Failed to decrypt Grafana password');
      }
    }

    return new GrafanaClient(conn.url, conn.authType, token, conn.username, password);
  }

  // =========================================================================
  // CONNECTION MANAGEMENT
  // =========================================================================

  async connect(userId: string, dto: ConnectGrafanaDto): Promise<GrafanaStatusResponse> {
    const cleanUrl = dto.url.replace(/\/+$/, '');
    const client = new GrafanaClient(cleanUrl, dto.authType, dto.token, dto.username, dto.password);

    // Test connection before persisting
    const testResult = await client.testConnection().catch((err) => {
      throw new BadRequestException(`Failed to connect to Grafana at ${cleanUrl}: ${err.message || err}`);
    });

    if (!testResult.healthy) {
      throw new BadRequestException(`Grafana server at ${cleanUrl} responded but health check failed.`);
    }

    const isLocal = cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1');

    const stored: StoredGrafanaConnection = {
      userId,
      url: cleanUrl,
      authType: dto.authType,
      tokenEncrypted: dto.token ? encryptGrafanaSecret(dto.token) : undefined,
      username: dto.username,
      passwordEncrypted: dto.password ? encryptGrafanaSecret(dto.password) : undefined,
      isLocal,
      connectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveStoredConnection(userId, stored);

    return this.getStatus(userId);
  }

  async disconnect(userId: string): Promise<{ success: boolean; message: string }> {
    this.removeStoredConnection(userId);
    return { success: true, message: 'Grafana instance disconnected successfully.' };
  }

  async autoDetectLocal(userId: string): Promise<GrafanaStatusResponse> {
    for (const port of GRAFANA_LOCAL_PROBE_PORTS) {
      const candidates = [`http://localhost:${port}`, `http://127.0.0.1:${port}`];
      for (const url of candidates) {
        try {
          const client = new GrafanaClient(url, 'anonymous');
          const test = await client.testConnection();
          if (test.healthy) {
            // Found active local Grafana instance
            const stored: StoredGrafanaConnection = {
              userId,
              url,
              authType: 'anonymous',
              isLocal: true,
              connectedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            this.saveStoredConnection(userId, stored);
            return this.getStatus(userId);
          }
        } catch {
          // Continue scanning next port
        }
      }
    }

    return {
      status: GrafanaConnectionStatus.NOT_CONNECTED,
      error: 'No local Grafana instance detected on standard ports (3000-3003, 8080).',
    };
  }

  async getStatus(userId: string): Promise<GrafanaStatusResponse> {
    const conn = this.getStoredConnection(userId);
    if (!conn) {
      return {
        status: GrafanaConnectionStatus.NOT_CONNECTED,
      };
    }

    try {
      const client = this.getClient(userId);
      const test = await client.testConnection();

      // Gather counts
      let dataSourcesCount = 0;
      let dashboardsCount = 0;
      let alertsCount = 0;

      try {
        const [ds, db, al] = await Promise.allSettled([
          client.getDataSources(),
          client.searchDashboards(undefined, undefined, undefined, undefined, 500),
          client.getAlertRules(),
        ]);
        if (ds.status === 'fulfilled') dataSourcesCount = ds.value.length;
        if (db.status === 'fulfilled') dashboardsCount = db.value.length;
        if (al.status === 'fulfilled') alertsCount = al.value.length;
      } catch {
        // Defensive stats gathering
      }

      return {
        status: test.healthy ? GrafanaConnectionStatus.CONNECTED : GrafanaConnectionStatus.ERROR,
        url: conn.url,
        version: test.version,
        build: test.commit,
        orgName: test.orgName,
        orgId: test.orgId,
        isLocal: conn.isLocal,
        dataSourcesCount,
        dashboardsCount,
        alertsCount,
        lastChecked: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        status: GrafanaConnectionStatus.UNAVAILABLE,
        url: conn.url,
        isLocal: conn.isLocal,
        error: err.message || 'Grafana server is currently unreachable.',
        lastChecked: new Date().toISOString(),
      };
    }
  }

  async getHealth(userId: string) {
    const client = this.getClient(userId);
    return client.getHealth();
  }

  // =========================================================================
  // DASHBOARDS
  // =========================================================================

  async getDashboards(
    userId: string,
    query?: string,
    tag?: string,
    starred?: boolean,
    folderIds?: number[],
  ): Promise<GrafanaDashboardSummary[]> {
    const client = this.getClient(userId);
    return client.searchDashboards(query, tag, starred, folderIds);
  }

  async getDashboard(userId: string, uid: string): Promise<GrafanaDashboardDetail> {
    const client = this.getClient(userId);
    return client.getDashboardByUid(uid);
  }

  async createDashboard(userId: string, dto: CreateDashboardDto) {
    const client = this.getClient(userId);
    return client.createOrUpdateDashboard(dto.dashboard, dto.folderUid, dto.message, dto.overwrite);
  }

  async deleteDashboard(userId: string, uid: string) {
    const client = this.getClient(userId);
    return client.deleteDashboard(uid);
  }

  async starDashboard(userId: string, uid: string, star: boolean) {
    const client = this.getClient(userId);
    return client.starDashboard(uid, star);
  }

  // =========================================================================
  // FOLDERS
  // =========================================================================

  async getFolders(userId: string): Promise<GrafanaFolder[]> {
    const client = this.getClient(userId);
    return client.getFolders();
  }

  // =========================================================================
  // DATA SOURCES
  // =========================================================================

  async getDataSources(userId: string): Promise<GrafanaDataSource[]> {
    const client = this.getClient(userId);
    return client.getDataSources();
  }

  async getDataSourceHealth(userId: string, uidOrId: string | number) {
    const client = this.getClient(userId);
    return client.getDataSourceHealth(uidOrId);
  }

  // =========================================================================
  // ALERTS & CONTACT POINTS
  // =========================================================================

  async getAlerts(userId: string): Promise<GrafanaAlertRule[]> {
    const client = this.getClient(userId);
    return client.getAlertRules();
  }

  async getContactPoints(userId: string): Promise<GrafanaContactPoint[]> {
    const client = this.getClient(userId);
    return client.getContactPoints();
  }

  // =========================================================================
  // QUERY PROXY
  // =========================================================================

  async query(userId: string, dto: QueryGrafanaDto): Promise<GrafanaQueryResult> {
    const client = this.getClient(userId);
    return client.queryDataSources(dto.queries, dto.from, dto.to);
  }

  // =========================================================================
  // OBSERVABILITY OVERVIEW (AGGREGATED REAL METRICS)
  // =========================================================================

  async getOverview(userId: string): Promise<CaelumObservabilityOverview> {
    const conn = this.getStoredConnection(userId);
    if (!conn) {
      return {
        connected: false,
        status: GrafanaConnectionStatus.NOT_CONNECTED,
        system: { cpuPercent: null, memoryPercent: null, diskPercent: null, networkReceiveRate: null, networkTransmitRate: null, available: false },
        docker: { containersCount: null, cpuUsagePercent: null, memoryUsageMB: null, available: false },
        kubernetes: { nodesCount: null, podsCount: null, podRestarts: null, available: false },
        alerts: { firingCount: 0, pendingCount: 0, normalCount: 0, noDataCount: 0, available: false },
        logs: { errorCount: null, warnCount: null, recentLogs: [], available: false },
        dataSources: { prometheus: false, loki: false, allCount: 0, types: [] },
      };
    }

    try {
      const client = this.getClient(userId);
      const [dataSourcesRes, alertsRes] = await Promise.allSettled([
        client.getDataSources(),
        client.getAlertRules(),
      ]);

      const dataSources = dataSourcesRes.status === 'fulfilled' ? dataSourcesRes.value : [];
      const alerts = alertsRes.status === 'fulfilled' ? alertsRes.value : [];

      const prometheusDs = dataSources.find(ds => ds.type === 'prometheus');
      const lokiDs = dataSources.find(ds => ds.type === 'loki');
      const allTypes = Array.from(new Set(dataSources.map(ds => ds.type)));

      // Alert counts
      let firingCount = 0;
      let pendingCount = 0;
      let normalCount = 0;
      let noDataCount = 0;

      for (const a of alerts) {
        const s = (a.state || '').toLowerCase();
        if (s.includes('firing') || s.includes('alert')) firingCount++;
        else if (s.includes('pending')) pendingCount++;
        else if (s.includes('nodata') || s.includes('no_data')) noDataCount++;
        else normalCount++;
      }

      // Query Prometheus metrics if Prometheus data source is configured
      let cpuPercent: number | null = null;
      let memoryPercent: number | null = null;
      let diskPercent: number | null = null;
      let netRecv: number | null = null;
      let netTrans: number | null = null;
      let containerCount: number | null = null;
      let containerCpu: number | null = null;
      let containerMemBytes: number | null = null;
      let k8sNodes: number | null = null;
      let k8sPods: number | null = null;
      let k8sRestarts: number | null = null;

      if (prometheusDs) {
        const [cpu, mem, disk, rx, tx, cCount, cCpu, cMem, kNodes, kPods, kRest] = await Promise.allSettled([
          client.queryPrometheusInstant(prometheusDs.uid, OBSERVABILITY_METRIC_QUERIES.CPU_USAGE),
          client.queryPrometheusInstant(prometheusDs.uid, OBSERVABILITY_METRIC_QUERIES.MEMORY_USAGE),
          client.queryPrometheusInstant(prometheusDs.uid, OBSERVABILITY_METRIC_QUERIES.DISK_USAGE),
          client.queryPrometheusInstant(prometheusDs.uid, OBSERVABILITY_METRIC_QUERIES.NETWORK_RECEIVE),
          client.queryPrometheusInstant(prometheusDs.uid, OBSERVABILITY_METRIC_QUERIES.NETWORK_TRANSMIT),
          client.queryPrometheusInstant(prometheusDs.uid, OBSERVABILITY_METRIC_QUERIES.CONTAINER_COUNT),
          client.queryPrometheusInstant(prometheusDs.uid, OBSERVABILITY_METRIC_QUERIES.CONTAINER_CPU),
          client.queryPrometheusInstant(prometheusDs.uid, OBSERVABILITY_METRIC_QUERIES.CONTAINER_MEMORY),
          client.queryPrometheusInstant(prometheusDs.uid, OBSERVABILITY_METRIC_QUERIES.K8S_NODES),
          client.queryPrometheusInstant(prometheusDs.uid, OBSERVABILITY_METRIC_QUERIES.K8S_PODS),
          client.queryPrometheusInstant(prometheusDs.uid, OBSERVABILITY_METRIC_QUERIES.K8S_POD_RESTARTS),
        ]);

        if (cpu.status === 'fulfilled') cpuPercent = cpu.value;
        if (mem.status === 'fulfilled') memoryPercent = mem.value;
        if (disk.status === 'fulfilled') diskPercent = disk.value;
        if (rx.status === 'fulfilled') netRecv = rx.value;
        if (tx.status === 'fulfilled') netTrans = tx.value;
        if (cCount.status === 'fulfilled') containerCount = cCount.value;
        if (cCpu.status === 'fulfilled') containerCpu = cCpu.value;
        if (cMem.status === 'fulfilled') containerMemBytes = cMem.value;
        if (kNodes.status === 'fulfilled') k8sNodes = kNodes.value;
        if (kPods.status === 'fulfilled') k8sPods = kPods.value;
        if (kRest.status === 'fulfilled') k8sRestarts = kRest.value;
      }

      // Query Loki logs if Loki data source is configured
      let recentLogs: any[] = [];
      let errorCount: number | null = null;
      let warnCount: number | null = null;

      if (lokiDs) {
        try {
          const logs = await client.queryLokiRange(lokiDs.uid, '{job=~".+"}', 'now-1h', 'now', 30);
          recentLogs = logs;
          errorCount = logs.filter(l => l.level === 'ERROR').length;
          warnCount = logs.filter(l => l.level === 'WARN').length;
        } catch {
          // Loki query defensive fallback
        }
      }

      return {
        connected: true,
        status: GrafanaConnectionStatus.CONNECTED,
        url: conn.url,
        system: {
          cpuPercent,
          memoryPercent,
          diskPercent,
          networkReceiveRate: netRecv !== null ? `${(netRecv / 1024).toFixed(1)} KB/s` : null,
          networkTransmitRate: netTrans !== null ? `${(netTrans / 1024).toFixed(1)} KB/s` : null,
          available: cpuPercent !== null || memoryPercent !== null,
        },
        docker: {
          containersCount: containerCount,
          cpuUsagePercent: containerCpu,
          memoryUsageMB: containerMemBytes !== null ? Math.round(containerMemBytes / (1024 * 1024)) : null,
          available: containerCount !== null,
        },
        kubernetes: {
          nodesCount: k8sNodes,
          podsCount: k8sPods,
          podRestarts: k8sRestarts,
          available: k8sNodes !== null || k8sPods !== null,
        },
        alerts: {
          firingCount,
          pendingCount,
          normalCount,
          noDataCount,
          available: alerts.length > 0,
        },
        logs: {
          errorCount,
          warnCount,
          recentLogs,
          available: recentLogs.length > 0,
        },
        dataSources: {
          prometheus: !!prometheusDs,
          prometheusUid: prometheusDs?.uid,
          loki: !!lokiDs,
          lokiUid: lokiDs?.uid,
          allCount: dataSources.length,
          types: allTypes,
        },
      };
    } catch {
      return {
        connected: false,
        status: GrafanaConnectionStatus.UNAVAILABLE,
        url: conn.url,
        system: { cpuPercent: null, memoryPercent: null, diskPercent: null, networkReceiveRate: null, networkTransmitRate: null, available: false },
        docker: { containersCount: null, cpuUsagePercent: null, memoryUsageMB: null, available: false },
        kubernetes: { nodesCount: null, podsCount: null, podRestarts: null, available: false },
        alerts: { firingCount: 0, pendingCount: 0, normalCount: 0, noDataCount: 0, available: false },
        logs: { errorCount: null, warnCount: null, recentLogs: [], available: false },
        dataSources: { prometheus: false, loki: false, allCount: 0, types: [] },
      };
    }
  }
}
