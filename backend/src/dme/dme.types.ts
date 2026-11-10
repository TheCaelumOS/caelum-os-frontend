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
  timestamp: string | Date;
  userId?: string | null;
  createdAt?: string | Date;
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
  integrations: Array<{
    name: string;
    source: DmeEventSource;
    connected: boolean;
    status: string;
    lastSync?: string;
    itemCount?: number;
    details?: string;
  }>;
}

export interface InfrastructureSnapshot {
  docker: {
    connected: boolean;
    containers: any[];
    images: any[];
    summary?: any;
  };
  kubernetes: {
    connected: boolean;
    pods: any[];
    events: any[];
    deployments: any[];
    summary?: any;
  };
  git: {
    connected: boolean;
    branch?: string;
    commits: any[];
    status: any;
  };
  terraform: {
    connected: boolean;
    status: string;
    plan?: any;
    backendType?: string;
    stateLockingEnabled?: boolean;
  };
  jenkins: {
    connected: boolean;
    jobs: any[];
    queue: any[];
    nodes: any[];
    overview?: any;
  };
  events: DmeEventRecord[];
}
