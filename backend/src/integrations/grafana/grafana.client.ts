import { Logger, HttpException, HttpStatus } from '@nestjs/common';
import {
  AuthType,
  GrafanaHealthResponse,
  GrafanaDashboardSummary,
  GrafanaDashboardDetail,
  GrafanaFolder,
  GrafanaDataSource,
  GrafanaAlertRule,
  GrafanaContactPoint,
  GrafanaQueryResult,
} from './grafana.types';
import { GRAFANA_REQUEST_TIMEOUT_MS, GRAFANA_USER_AGENT } from './grafana.constants';

export class GrafanaClient {
  private readonly logger = new Logger(GrafanaClient.name);
  private readonly baseUrl: string;
  private readonly authHeader: string | null;

  constructor(
    url: string,
    private readonly authType: AuthType,
    token?: string,
    username?: string,
    password?: string,
  ) {
    this.baseUrl = url.replace(/\/+$/, '');

    if (authType === 'token' && token) {
      this.authHeader = `Bearer ${token.trim()}`;
    } else if (authType === 'basic' && username && password) {
      const credentials = Buffer.from(`${username}:${password}`).toString('base64');
      this.authHeader = `Basic ${credentials}`;
    } else {
      this.authHeader = null;
    }
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  private async request<T = any>(
    path: string,
    options: {
      method?: string;
      body?: any;
      queryParams?: Record<string, string | number | boolean | undefined>;
      timeoutMs?: number;
    } = {},
  ): Promise<T> {
    const { method = 'GET', body, queryParams, timeoutMs = GRAFANA_REQUEST_TIMEOUT_MS } = options;

    let targetUrl = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    if (queryParams) {
      const sp = new URLSearchParams();
      for (const [k, v] of Object.entries(queryParams)) {
        if (v !== undefined && v !== null && v !== '') {
          sp.append(k, String(v));
        }
      }
      const qs = sp.toString();
      if (qs) {
        targetUrl += `${targetUrl.includes('?') ? '&' : '?'}${qs}`;
      }
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': GRAFANA_USER_AGENT,
    };

    if (this.authHeader) {
      headers['Authorization'] = this.authHeader;
    }

    let payload: string | undefined;
    if (body !== undefined && body !== null) {
      headers['Content-Type'] = 'application/json';
      payload = typeof body === 'string' ? body : JSON.stringify(body);
    }

    try {
      const res = await fetch(targetUrl, {
        method,
        headers,
        body: payload,
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (res.status === 204) {
        return null as unknown as T;
      }

      const contentType = res.headers.get('content-type') || '';
      let data: any = null;
      if (contentType.includes('application/json')) {
        data = await res.json().catch(() => null);
      } else {
        const text = await res.text().catch(() => '');
        data = { message: text };
      }

      if (!res.ok) {
        const safeError = data?.message || data?.error || `Grafana API error (${res.status} ${res.statusText})`;
        throw new HttpException(safeError, res.status);
      }

      return data as T;
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err;
      }
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        throw new HttpException('Grafana request timed out. Please verify your server address and network connectivity.', HttpStatus.GATEWAY_TIMEOUT);
      }
      // Sanitize internal network or TLS errors
      const sanitized = err.message || 'Failed to connect to Grafana server.';
      this.logger.warn(`Grafana request to ${path} failed: ${sanitized}`);
      throw new HttpException(`Unable to reach Grafana: ${sanitized}`, HttpStatus.BAD_GATEWAY);
    }
  }

  // =========================================================================
  // HEALTH & CONNECTION
  // =========================================================================

  async getHealth(): Promise<GrafanaHealthResponse> {
    return this.request<GrafanaHealthResponse>('/api/health');
  }

  async getOrg(): Promise<{ id: number; name: string }> {
    return this.request<{ id: number; name: string }>('/api/org');
  }

  async testConnection(): Promise<{ healthy: boolean; version?: string; commit?: string; orgName?: string; orgId?: number }> {
    const health = await this.getHealth();
    let org: { id: number; name: string } | null = null;
    try {
      org = await this.getOrg();
    } catch {
      // Org query may require authentication, health doesn't
    }

    return {
      healthy: health?.database === 'ok' || !!health?.version,
      version: health?.version,
      commit: health?.commit,
      orgName: org?.name,
      orgId: org?.id,
    };
  }

  // =========================================================================
  // DASHBOARDS
  // =========================================================================

  async searchDashboards(
    query?: string,
    tag?: string,
    starred?: boolean,
    folderIds?: number[],
    limit = 100,
  ): Promise<GrafanaDashboardSummary[]> {
    const params: Record<string, any> = {
      type: 'dash-db',
      limit,
    };
    if (query) params.query = query;
    if (tag) params.tag = tag;
    if (starred !== undefined) params.starred = starred;
    if (folderIds && folderIds.length > 0) params.folderIds = folderIds.join(',');

    const results = await this.request<any[]>('/api/search', { queryParams: params });
    return (Array.isArray(results) ? results : []).map(d => ({
      id: d.id,
      uid: d.uid,
      title: d.title || 'Untitled Dashboard',
      uri: d.uri || '',
      url: d.url || `/d/${d.uid}`,
      slug: d.slug,
      type: d.type || 'dash-db',
      tags: Array.isArray(d.tags) ? d.tags : [],
      isStarred: Boolean(d.isStarred),
      folderId: d.folderId,
      folderUid: d.folderUid,
      folderTitle: d.folderTitle,
      folderUrl: d.folderUrl,
      sortMeta: d.sortMeta,
    }));
  }

  async getDashboardByUid(uid: string): Promise<GrafanaDashboardDetail> {
    return this.request<GrafanaDashboardDetail>(`/api/dashboards/uid/${encodeURIComponent(uid)}`);
  }

  async createOrUpdateDashboard(
    dashboard: Record<string, any>,
    folderUid?: string,
    message?: string,
    overwrite = true,
  ): Promise<{ status: string; uid: string; url: string; version: number }> {
    const body: Record<string, any> = {
      dashboard,
      overwrite,
    };
    if (folderUid) body.folderUid = folderUid;
    if (message) body.message = message;

    return this.request('/api/dashboards/db', {
      method: 'POST',
      body,
    });
  }

  async deleteDashboard(uid: string): Promise<{ title: string; message: string }> {
    return this.request(`/api/dashboards/uid/${encodeURIComponent(uid)}`, {
      method: 'DELETE',
    });
  }

  async starDashboard(uid: string, star: boolean): Promise<boolean> {
    try {
      await this.request(`/api/user/stars/dashboard/uid/${encodeURIComponent(uid)}`, {
        method: star ? 'POST' : 'DELETE',
      });
      return true;
    } catch {
      return false;
    }
  }

  // =========================================================================
  // FOLDERS
  // =========================================================================

  async getFolders(limit = 100): Promise<GrafanaFolder[]> {
    try {
      const folders = await this.request<any[]>('/api/folders', {
        queryParams: { limit },
      });
      return (Array.isArray(folders) ? folders : []).map(f => ({
        id: f.id,
        uid: f.uid,
        title: f.title || 'General',
        url: f.url,
        hasAcl: f.hasAcl,
        canSave: f.canSave,
        canEdit: f.canEdit,
        canAdmin: f.canAdmin,
        created: f.created,
        updated: f.updated,
      }));
    } catch {
      // Fallback to /api/search?type=dash-folder
      const searchFolders = await this.request<any[]>('/api/search', {
        queryParams: { type: 'dash-folder', limit },
      }).catch(() => []);
      return (Array.isArray(searchFolders) ? searchFolders : []).map(f => ({
        id: f.id,
        uid: f.uid,
        title: f.title || 'General',
        url: f.url,
      }));
    }
  }

  // =========================================================================
  // DATA SOURCES
  // =========================================================================

  async getDataSources(): Promise<GrafanaDataSource[]> {
    const list = await this.request<any[]>('/api/datasources');
    return (Array.isArray(list) ? list : []).map(ds => ({
      id: ds.id,
      uid: ds.uid || String(ds.id),
      orgId: ds.orgId,
      name: ds.name,
      type: ds.type,
      typeName: ds.typeName || ds.type,
      access: ds.access,
      url: ds.url || '',
      user: ds.user,
      database: ds.database,
      basicAuth: ds.basicAuth,
      isDefault: Boolean(ds.isDefault),
      readOnly: Boolean(ds.readOnly),
      jsonData: ds.jsonData || {},
    }));
  }

  async getDataSourceHealth(uidOrId: string | number): Promise<{ status: 'OK' | 'ERROR' | 'UNKNOWN'; message?: string }> {
    try {
      const endpoint = typeof uidOrId === 'string'
        ? `/api/datasources/uid/${encodeURIComponent(uidOrId)}/health`
        : `/api/datasources/${uidOrId}/health`;
      const res = await this.request<{ status?: string; message?: string }>(endpoint);
      return {
        status: (res.status?.toUpperCase() === 'OK' ? 'OK' : 'ERROR'),
        message: res.message || (res.status === 'OK' ? 'Data source is working' : 'Data source returned an error'),
      };
    } catch (err: any) {
      return {
        status: 'ERROR',
        message: err.message || 'Health check failed',
      };
    }
  }

  // =========================================================================
  // ALERTS & NOTIFICATIONS
  // =========================================================================

  async getAlertRules(): Promise<GrafanaAlertRule[]> {
    // Attempt modern Grafana Alerting API (v1 provisioning or ruler)
    try {
      const groups = await this.request<Record<string, any[]>>('/api/v1/provisioning/alert-rules');
      if (Array.isArray(groups)) {
        return groups.map(r => ({
          id: r.id || r.uid,
          uid: r.uid,
          title: r.title || r.name || 'Alert Rule',
          ruleGroup: r.ruleGroup || 'default',
          folderUid: r.folderUID || r.folderUid,
          state: r.noDataState || 'Normal',
          labels: r.labels || {},
          annotations: r.annotations || {},
          for: r.for,
          updated: r.updated,
        }));
      }
    } catch {
      // Fallback: try Prometheus alerting proxy
    }

    try {
      const prometheusRules = await this.request<any>('/api/prometheus/grafana/api/v1/rules');
      const groups = prometheusRules?.data?.groups || [];
      const rules: GrafanaAlertRule[] = [];
      for (const g of groups) {
        for (const r of (g.rules || [])) {
          rules.push({
            name: r.name,
            title: r.name,
            ruleGroup: g.name,
            folderTitle: g.folder,
            state: r.state === 'firing' ? 'Firing' : r.state === 'pending' ? 'Pending' : 'Normal',
            health: r.health,
            labels: r.labels || {},
            annotations: r.annotations || {},
            lastEvaluation: r.lastEvaluation,
            currentValue: r.evaluationDuration ? `${r.evaluationDuration}s` : undefined,
          } as any);
        }
      }
      return rules;
    } catch {
      // Legacy Grafana alerts
      try {
        const legacy = await this.request<any[]>('/api/alerts');
        return (Array.isArray(legacy) ? legacy : []).map(a => ({
          id: String(a.id),
          title: a.name,
          ruleGroup: 'Legacy Alerts',
          state: a.state === 'alerting' ? 'Firing' : a.state === 'pending' ? 'Pending' : a.state === 'ok' ? 'Normal' : a.state || 'Normal',
          labels: a.evalData || {},
          annotations: {},
          lastEvaluation: a.newStateDate,
        }));
      } catch {
        return [];
      }
    }
  }

  async getContactPoints(): Promise<GrafanaContactPoint[]> {
    try {
      const points = await this.request<any[]>('/api/v1/provisioning/contact-points');
      return (Array.isArray(points) ? points : []).map(p => ({
        uid: p.uid,
        name: p.name,
        type: p.type,
        isDefault: p.isDefault,
        // Scrub sensitive auth tokens/webhooks before returning
        settings: p.settings ? {
          url: p.settings.url ? p.settings.url.replace(/\/\/.*@/, '//***@') : undefined,
          addresses: p.settings.addresses,
          recipient: p.settings.recipient,
        } : {},
      }));
    } catch {
      return [];
    }
  }

  // =========================================================================
  // METRICS & LOGS QUERYING (/api/ds/query)
  // =========================================================================

  async queryDataSources(
    queries: any[],
    from = 'now-1h',
    to = 'now',
  ): Promise<GrafanaQueryResult> {
    const body = {
      from,
      to,
      queries,
    };
    return this.request<GrafanaQueryResult>('/api/ds/query', {
      method: 'POST',
      body,
    });
  }

  async queryPrometheusInstant(dsUid: string, expr: string): Promise<number | null> {
    try {
      const result = await this.queryDataSources([
        {
          refId: 'A',
          datasource: { uid: dsUid, type: 'prometheus' },
          expr,
          instant: true,
          range: false,
        },
      ]);
      const frame = result?.results?.A?.frames?.[0];
      if (frame && frame.data && Array.isArray(frame.data.values) && frame.data.values.length > 1) {
        const valArr = frame.data.values[1];
        if (Array.isArray(valArr) && valArr.length > 0) {
          const val = Number(valArr[valArr.length - 1]);
          return isNaN(val) ? null : Number(val.toFixed(2));
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  async queryPrometheusRange(
    dsUid: string,
    expr: string,
    from = 'now-1h',
    to = 'now',
    step = 15,
  ): Promise<Array<{ time: number; value: number }>> {
    try {
      const result = await this.queryDataSources([
        {
          refId: 'A',
          datasource: { uid: dsUid, type: 'prometheus' },
          expr,
          instant: false,
          range: true,
          step: `${step}s`,
        },
      ], from, to);

      const frame = result?.results?.A?.frames?.[0];
      if (frame && frame.data && Array.isArray(frame.data.values) && frame.data.values.length >= 2) {
        const timeArr = frame.data.values[0] || [];
        const valArr = frame.data.values[1] || [];
        const points: Array<{ time: number; value: number }> = [];
        for (let i = 0; i < timeArr.length; i++) {
          const t = Number(timeArr[i]);
          const v = Number(valArr[i]);
          if (!isNaN(t) && !isNaN(v)) {
            points.push({ time: t, value: Number(v.toFixed(2)) });
          }
        }
        return points;
      }
      return [];
    } catch {
      return [];
    }
  }

  async queryLokiRange(
    dsUid: string,
    logql: string,
    from = 'now-1h',
    to = 'now',
    limit = 50,
  ): Promise<Array<{ timestamp: string; level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'; message: string; labels: Record<string, string> }>> {
    try {
      const result = await this.queryDataSources([
        {
          refId: 'A',
          datasource: { uid: dsUid, type: 'loki' },
          expr: logql,
          maxLines: limit,
        },
      ], from, to);

      const frame = result?.results?.A?.frames?.[0];
      if (frame && frame.data && Array.isArray(frame.data.values)) {
        const timeArr = frame.data.values[0] || [];
        const lineArr = frame.data.values[1] || [];
        const labelsArr = frame.data.values[2] || [];
        const logs: Array<{ timestamp: string; level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'; message: string; labels: Record<string, string> }> = [];

        for (let i = 0; i < lineArr.length; i++) {
          const rawLine = String(lineArr[i] || '');
          const t = timeArr[i] ? new Date(Number(timeArr[i]) / 1000000).toISOString() : new Date().toISOString();
          let level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' = 'INFO';
          const lower = rawLine.toLowerCase();
          if (lower.includes('err') || lower.includes('fatal') || lower.includes('crit')) level = 'ERROR';
          else if (lower.includes('warn')) level = 'WARN';
          else if (lower.includes('debug') || lower.includes('trace')) level = 'DEBUG';

          logs.push({
            timestamp: t,
            level,
            message: rawLine,
            labels: typeof labelsArr[i] === 'object' && labelsArr[i] ? labelsArr[i] : {},
          });
        }
        return logs;
      }
      return [];
    } catch {
      return [];
    }
  }
}
