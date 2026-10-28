import { JenkinsConnectionStatus, JenkinsBuildResult } from './jenkins.constants';

export interface JenkinsConnectionConfig {
  url: string;
  username: string;
  apiToken: string;
  name?: string;
}

export interface StoredJenkinsConnection {
  userId: string;
  url: string;
  username: string;
  apiTokenEncrypted: string;
  name: string;
  connectedAt: string;
  updatedAt: string;
  serverVersion?: string;
}

export interface JenkinsConnectionStatusResponse {
  status: JenkinsConnectionStatus;
  url?: string;
  name?: string;
  username?: string;
  version?: string;
  nodeCount?: number;
  jobCount?: number;
  queueCount?: number;
  hasToken?: boolean;
  lastChecked?: string;
  error?: string;
}

export interface JenkinsCrumbResponse {
  crumb: string;
  crumbRequestField: string;
}

export interface JenkinsParameterDefinition {
  name: string;
  type: string;
  description?: string;
  defaultValue?: any;
  choices?: string[];
}

export interface JenkinsJob {
  name: string;
  fullName: string;
  url: string;
  color?: string;
  status: JenkinsBuildResult;
  isBuilding: boolean;
  buildable: boolean;
  inQueue: boolean;
  type: 'freestyle' | 'pipeline' | 'multibranch' | 'folder' | 'organization' | 'matrix' | 'maven' | 'other';
  rawClass?: string;
  description?: string;
  lastBuild?: {
    number: number;
    url: string;
    timestamp: number;
    duration: number;
    result?: string;
    building?: boolean;
  } | null;
  lastSuccessfulBuild?: {
    number: number;
    url: string;
    timestamp: number;
  } | null;
  lastFailedBuild?: {
    number: number;
    url: string;
    timestamp: number;
  } | null;
  parameters: JenkinsParameterDefinition[];
  subJobsCount?: number;
}

export interface JenkinsBuildCause {
  shortDescription: string;
  userName?: string;
  userId?: string;
}

export interface JenkinsBuildArtifact {
  displayPath: string;
  fileName: string;
  relativePath: string;
  size?: number;
}

export interface JenkinsTestSummary {
  totalCount: number;
  failCount: number;
  skipCount: number;
  passCount: number;
  duration?: number;
}

export interface JenkinsBuildDetail {
  number: number;
  url: string;
  displayName: string;
  fullDisplayName: string;
  building: boolean;
  result: JenkinsBuildResult | null;
  duration: number;
  estimatedDuration: number;
  timestamp: number;
  queueId?: number;
  builtOn?: string;
  causes: JenkinsBuildCause[];
  commitInfo?: {
    commitId?: string;
    message?: string;
    author?: string;
    timestamp?: number;
  };
  parameters?: Array<{ name: string; value: any }>;
  artifacts: JenkinsBuildArtifact[];
  testSummary?: JenkinsTestSummary | null;
}

export interface JenkinsConsoleOutput {
  output: string;
  startOffset: number;
  nextOffset: number;
  hasMore: boolean;
  building: boolean;
}

export interface JenkinsQueueItem {
  id: number;
  why: string;
  blocked: boolean;
  buildable: boolean;
  stuck: boolean;
  inQueueSince: number;
  jobName: string;
  jobUrl: string;
  executable?: {
    number: number;
    url: string;
  } | null;
  params?: string;
}

export interface JenkinsNode {
  displayName: string;
  offline: boolean;
  temporarilyOffline: boolean;
  offlineCause: string | null;
  numExecutors: number;
  idle: boolean;
  executors: Array<{
    currentExecutable?: {
      number: number;
      url: string;
    };
  }>;
  assignedLabels: string[];
  description?: string;
}

export interface JenkinsOverview {
  connected: boolean;
  status: JenkinsConnectionStatus;
  url: string;
  name: string;
  version: string;
  nodeName: string;
  nodeDescription?: string;
  quietingDown: boolean;
  stats: {
    totalJobs: number;
    enabledJobs: number;
    disabledJobs: number;
    successfulJobs: number;
    failedJobs: number;
    buildingJobs: number;
    queueLength: number;
    totalNodes: number;
    onlineNodes: number;
    offlineNodes: number;
    totalExecutors: number;
    busyExecutors: number;
  };
  recentBuilds: Array<{
    jobName: string;
    number: number;
    result: string;
    timestamp: number;
    duration: number;
    url: string;
    building: boolean;
  }>;
  queue: JenkinsQueueItem[];
  nodes: JenkinsNode[];
}
