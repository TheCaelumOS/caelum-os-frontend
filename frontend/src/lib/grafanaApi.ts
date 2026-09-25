import { apiRequest } from './api';

export type GrafanaConnectionStatus = 
  | 'CONNECTED' 
  | 'NOT_CONNECTED' 
  | 'UNAVAILABLE' 
  | 'ERROR' 
  | 'CONNECTING';

export type AuthType = 'token' | 'basic' | 'anonymous';

export interface GrafanaStatusResponse {
  status: GrafanaConnectionStatus;
  url?: string;
  version?: string;
  build?: string;
  orgName?: string;
  orgId?: number;
  isLocal?: boolean;
  dataSourcesCount?: number;
  dashboardsCount?: number;
  alertsCount?: number;
  lastChecked?: string;
  error?: string;
}

export interface GrafanaHealthResponse {
  commit: string;
  database: string;
  version: string;
}

export interface GrafanaDashboardSummary {
  id: number;
  uid: string;
  title: string;
  uri: string;
  url: string;
  slug?: string;
  type: string;
  tags: string[];
  isStarred: boolean;
  folderId?: number;
  folderUid?: string;
  folderTitle?: string;
  folderUrl?: string;
  sortMeta?: number;
}

export interface GrafanaPanel {
  id: number;
  title: string;
  type: string;
  description?: string;
  gridPos?: { h: number; w: number; x: number; y: number };
  targets?: Array<{
    refId: string;
    expr?: string;
    query?: string;
    legendFormat?: string;
    datasource?: { uid?: string; type?: string };
    [key: string]: any;
  }>;
  fieldConfig?: {
    defaults?: {
      unit?: string;
      color?: { mode: string };
      min?: number;
      max?: number;
      decimals?: number;
    };
  };
  options?: Record<string, any>;
  [key: string]: any;
}

export interface GrafanaDashboardDetail {
  dashboard: {
    id?: number;
    uid: string;
    title: string;
    description?: string;
    tags?: string[];
    style?: string;
    timezone?: string;
    editable?: boolean;
    panels?: GrafanaPanel[];
    templating?: { list?: any[] };
    time?: { from: string; to: string };
    refresh?: string;
    schemaVersion?: number;
    version?: number;
    [key: string]: any;
  };
  meta: {
    isStarred?: boolean;
    canSave?: boolean;
    canEdit?: boolean;
    canAdmin?: boolean;
    url?: string;
    folderId?: number;
    folderUid?: string;
    folderTitle?: string;
    folderUrl?: string;
    created?: string;
    updated?: string;
    updatedBy?: string;
    version?: number;
  };
}

export interface GrafanaFolder {
  id: number;
  uid: string;
  title: string;
  url?: string;
  hasAcl?: boolean;
  canSave?: boolean;
  canEdit?: boolean;
  canAdmin?: boolean;
  created?: string;
  updated?: string;
  dashboardsCount?: number;
}

export interface GrafanaDataSource {
  id: number;
  uid: string;
  orgId?: number;
  name: string;
  type: string;
  typeName?: string;
  access: string;
  url: string;
  user?: string;
  database?: string;
  basicAuth?: boolean;
  isDefault: boolean;
  readOnly?: boolean;
  jsonData?: Record<string, any>;
  health?: {
    status: 'OK' | 'ERROR' | 'UNKNOWN';
    message?: string;
  };
}

export interface GrafanaAlertRule {
  id?: string;
  uid?: string;
  title: string;
  ruleGroup: string;
  folderUid?: string;
  folderTitle?: string;
  state: 'Firing' | 'Pending' | 'Normal' | 'NoData' | 'Error' | string;
  health?: string;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  for?: string;
  lastEvaluation?: string;
  currentValue?: string;
  updated?: string;
}

export interface GrafanaContactPoint {
  uid?: string;
  name: string;
  type: string;
  isDefault?: boolean;
  settings?: Record<string, any>;
}

export interface GrafanaQueryTarget {
  refId: string;
  datasource?: { type?: string; uid?: string };
  expr?: string;
  query?: string;
  instant?: boolean;
  range?: boolean;
  legendFormat?: string;
  [key: string]: any;
}

export interface GrafanaQueryResult {
  results: Record<string, {
    refId?: string;
    status?: number;
    frames?: any[];
    series?: Array<{
      name?: string;
      points: Array<[number, number]>;
      tags?: Record<string, string>;
    }>;
    error?: string;
  }>;
}

export interface CaelumObservabilityOverview {
  connected: boolean;
  status: GrafanaConnectionStatus;
  version?: string;
  url?: string;
  system: {
    cpuPercent: number | null;
    memoryPercent: number | null;
    diskPercent: number | null;
    networkReceiveRate: string | null;
    networkTransmitRate: string | null;
    available: boolean;
  };
  docker: {
    containersCount: number | null;
    cpuUsagePercent: number | null;
    memoryUsageMB: number | null;
    available: boolean;
  };
  kubernetes: {
    nodesCount: number | null;
    podsCount: number | null;
    podRestarts: number | null;
    available: boolean;
  };
  alerts: {
    firingCount: number;
    pendingCount: number;
    normalCount: number;
    noDataCount: number;
    available: boolean;
  };
  logs: {
    errorCount: number | null;
    warnCount: number | null;
    recentLogs: Array<{
      timestamp: string;
      level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
      message: string;
      labels: Record<string, string>;
    }>;
    available: boolean;
  };
  dataSources: {
    prometheus: boolean;
    prometheusUid?: string;
    loki: boolean;
    lokiUid?: string;
    allCount: number;
    types: string[];
  };
}

export interface ConnectGrafanaPayload {
  url: string;
  authType: AuthType;
  token?: string;
  username?: string;
  password?: string;
}

export interface CreateDashboardPayload {
  dashboard: Record<string, any>;
  folderUid?: string;
  message?: string;
  overwrite?: boolean;
}

export interface QueryGrafanaPayload {
  queries: GrafanaQueryTarget[];
  from?: string;
  to?: string;
}

export const grafanaApi = {
  getStatus: async (): Promise<GrafanaStatusResponse> => {
    return apiRequest('/grafana/status');
  },

  getHealth: async (): Promise<GrafanaHealthResponse> => {
    return apiRequest('/grafana/health');
  },

  connect: async (payload: ConnectGrafanaPayload): Promise<GrafanaStatusResponse> => {
    return apiRequest('/grafana/connect', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  disconnect: async (): Promise<{ success: boolean; message: string }> => {
    return apiRequest('/grafana/disconnect', {
      method: 'POST',
    });
  },

  autoDetect: async (): Promise<GrafanaStatusResponse> => {
    return apiRequest('/grafana/autodetect', {
      method: 'POST',
    });
  },

  getOverview: async (): Promise<CaelumObservabilityOverview> => {
    return apiRequest('/grafana/overview');
  },

  getDashboards: async (query?: string, tag?: string, starred?: boolean): Promise<GrafanaDashboardSummary[]> => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (tag) params.append('tag', tag);
    if (starred !== undefined) params.append('starred', String(starred));
    const qs = params.toString();
    return apiRequest(`/grafana/dashboards${qs ? `?${qs}` : ''}`);
  },

  getDashboard: async (uid: string): Promise<GrafanaDashboardDetail> => {
    return apiRequest(`/grafana/dashboards/${encodeURIComponent(uid)}`);
  },

  createDashboard: async (payload: CreateDashboardPayload): Promise<any> => {
    return apiRequest('/grafana/dashboards', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteDashboard: async (uid: string): Promise<{ title: string; message: string }> => {
    return apiRequest(`/grafana/dashboards/${encodeURIComponent(uid)}`, {
      method: 'DELETE',
    });
  },

  starDashboard: async (uid: string, star: boolean): Promise<boolean> => {
    return apiRequest(`/grafana/dashboards/${encodeURIComponent(uid)}/star`, {
      method: star ? 'POST' : 'DELETE',
    });
  },

  getFolders: async (): Promise<GrafanaFolder[]> => {
    return apiRequest('/grafana/folders');
  },

  getDataSources: async (): Promise<GrafanaDataSource[]> => {
    return apiRequest('/grafana/datasources');
  },

  getDataSourceHealth: async (id: string | number): Promise<{ status: 'OK' | 'ERROR' | 'UNKNOWN'; message?: string }> => {
    return apiRequest(`/grafana/datasources/${encodeURIComponent(String(id))}/health`);
  },

  getAlerts: async (): Promise<GrafanaAlertRule[]> => {
    return apiRequest('/grafana/alerts');
  },

  getContactPoints: async (): Promise<GrafanaContactPoint[]> => {
    return apiRequest('/grafana/contact-points');
  },

  query: async (payload: QueryGrafanaPayload): Promise<GrafanaQueryResult> => {
    return apiRequest('/grafana/query', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
