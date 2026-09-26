export type InfrastructureProvider =
  | 'docker'
  | 'kubernetes'
  | 'github'
  | 'grafana'
  | 'aws'
  | 'azure'
  | 'host';

export type ResourceHealthStatus =
  | 'healthy'
  | 'running'
  | 'warning'
  | 'error'
  | 'stopped'
  | 'unknown'
  | 'pending';

export type RelationshipType =
  | 'CONTAINS'
  | 'DEPENDS_ON'
  | 'ROUTES_TO'
  | 'DEPLOYED_FROM'
  | 'MONITORED_BY'
  | 'HOSTED_ON'
  | 'BELONGS_TO';

export interface InfrastructureResource {
  id: string;
  provider: InfrastructureProvider;
  type: string;
  name: string;
  displayName: string;
  status: ResourceHealthStatus;
  rawStatus: string;
  region?: string;
  namespace?: string;
  parentId?: string;
  sourceApp: 'docker' | 'kubernetes' | 'github' | 'grafana' | 'aws' | 'azure' | 'task_manager' | 'terminal';
  sourceId: string;
  metadata: Record<string, any>;
  metrics?: {
    cpu?: number;
    memory?: number;
    memoryBytes?: number;
    networkRx?: number;
    networkTx?: number;
    uptime?: number;
  };
  lastUpdated: string;
}

export interface InfrastructureRelationship {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  label: string;
  bidirectional?: boolean;
}

export interface InfrastructureTopology {
  nodes: InfrastructureResource[];
  edges: InfrastructureRelationship[];
  summary: {
    totalNodes: number;
    totalEdges: number;
    providers: Record<string, number>;
  };
}

export interface ProviderConnectionStatus {
  provider: InfrastructureProvider;
  name: string;
  connected: boolean;
  status: 'connected' | 'disconnected' | 'error' | 'unconfigured';
  version?: string;
  context?: string;
  error?: string;
  resourceCount: number;
  lastChecked: string;
}

export interface InfrastructureOverview {
  providers: ProviderConnectionStatus[];
  totalResources: number;
  healthyCount: number;
  warningCount: number;
  errorCount: number;
  stoppedCount: number;
  activeIssuesCount: number;
  lastDiscovery: string;
  hostSystem: {
    hostname: string;
    platform: string;
    arch: string;
    cpuCores: number;
    memoryTotal: number;
    memoryUsed: number;
    cpuLoad: number;
  };
}

export interface InfrastructureIssue {
  id: string;
  resourceId: string;
  resourceName: string;
  resourceType: string;
  provider: InfrastructureProvider;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  evidence: {
    rawStatus?: string;
    exitCode?: number;
    events?: Array<{ type: string; reason: string; message: string; timestamp: string }>;
    logsSnippet?: string[];
    affectedDependencies?: string[];
  };
  recommendedAction?: string;
  deepLinkApp: string;
}

export interface ResourceDiagnostics {
  resource: InfrastructureResource;
  health: {
    status: ResourceHealthStatus;
    summary: string;
  };
  evidence: {
    statusDetails: string;
    events: any[];
    logsSnippet: string[];
    dependencies: InfrastructureResource[];
    dependents: InfrastructureResource[];
  };
  suggestedSteps: string[];
  nativeApp: string;
}

export interface InfrastructureTimelineEvent {
  id: string;
  timestamp: string;
  provider: InfrastructureProvider;
  resourceId: string;
  resourceName: string;
  resourceType: string;
  type: 'state_change' | 'alert' | 'error' | 'deployment' | 'commit' | 'workflow' | 'k8s_event';
  severity: 'info' | 'warning' | 'critical' | 'success';
  message: string;
  details?: Record<string, any>;
}
