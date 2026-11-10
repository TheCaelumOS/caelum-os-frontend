import { apiRequest } from './api';

export type DmeSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type DmeEventSource = 'docker' | 'kubernetes' | 'git' | 'terraform' | 'jenkins' | 'system' | 'correlation';
export type DmeValidationStatus = 'passed' | 'warning' | 'failed';

export interface DmeEventRecord {
  id: string;
  source: DmeEventSource;
  eventType: string;
  severity: DmeSeverity;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  timestamp: string;
  userId?: string | null;
}

export interface DmeRuleResult {
  code: string;
  name: string;
  category: string;
  severity: DmeSeverity;
  status: DmeValidationStatus;
  message: string;
  remediation?: string | null;
  details?: Record<string, any>;
}

export interface DmeViolation {
  ruleCode: string;
  title: string;
  severity: DmeSeverity;
  status: DmeValidationStatus;
  summary: string;
  remediation?: string | null;
  evidence?: Record<string, any>;
}

export interface DmeValidationReport {
  id?: string;
  engineVersion: string;
  timestamp: string;
  status: DmeValidationStatus;
  score: number;
  summary: string;
  totalRulesChecked: number;
  passedRules: number;
  warningRules: number;
  failedRules: number;
  ruleResults: DmeRuleResult[];
  violations: DmeViolation[];
  recommendations: string[];
  durationMs?: number;
  triggeredBy?: string;
}

export interface DmeIntegrationStatus {
  name: string;
  source: DmeEventSource;
  connected: boolean;
  status: string;
  itemCount?: number;
  details?: string;
  lastSync?: string;
}

export interface DmeOverviewMetrics {
  healthScore: number;
  overallStatus: DmeValidationStatus;
  totalEvents: number;
  severityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  sourceCounts: Record<string, number>;
  activeViolationsCount: number;
  connectedIntegrationsCount: number;
  totalIntegrationsCount: number;
  lastValidationRun?: {
    id: string;
    timestamp: string;
    score: number;
    status: DmeValidationStatus;
    summary: string;
  } | null;
  integrations: DmeIntegrationStatus[];
}

export interface DmeRuleItem {
  code: string;
  category: string;
  name: string;
  severity: string;
  description: string;
  remediation?: string;
}

export const dmeApi = {
  getOverview: async (): Promise<DmeOverviewMetrics> => {
    return apiRequest('/dme/overview');
  },

  getEvents: async (params?: {
    source?: string;
    severity?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<DmeEventRecord[]> => {
    const qs = new URLSearchParams();
    if (params?.source) qs.append('source', params.source);
    if (params?.severity) qs.append('severity', params.severity);
    if (params?.search) qs.append('search', params.search);
    if (params?.limit) qs.append('limit', String(params.limit));
    if (params?.offset) qs.append('offset', String(params.offset));
    const query = qs.toString();
    return apiRequest(`/dme/events${query ? `?${query}` : ''}`);
  },

  recordEvent: async (data: {
    source: string;
    eventType: string;
    severity: string;
    title: string;
    message: string;
    metadata?: Record<string, any>;
  }): Promise<DmeEventRecord> => {
    return apiRequest('/dme/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  captureEvents: async (): Promise<{ capturedEventsCount: number }> => {
    return apiRequest('/dme/events/capture', {
      method: 'POST',
    });
  },

  runValidation: async (params?: {
    triggeredBy?: string;
    targets?: string[];
  }): Promise<DmeValidationReport> => {
    return apiRequest('/dme/validate', {
      method: 'POST',
      body: JSON.stringify(params || { triggeredBy: 'manual' }),
    });
  },

  getRuns: async (): Promise<DmeValidationReport[]> => {
    return apiRequest('/dme/runs');
  },

  getRules: async (): Promise<DmeRuleItem[]> => {
    return apiRequest('/dme/rules');
  },

  getIntegrations: async (): Promise<DmeIntegrationStatus[]> => {
    return apiRequest('/dme/integrations');
  },
};
