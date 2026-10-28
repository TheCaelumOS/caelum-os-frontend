import { apiRequest } from './api';

export type JenkinsConnectionStatus =
  | 'CONNECTED'
  | 'NOT_CONNECTED'
  | 'UNAVAILABLE'
  | 'ERROR'
  | 'CONNECTING';

export type JenkinsBuildResult =
  | 'SUCCESS'
  | 'FAILURE'
  | 'UNSTABLE'
  | 'ABORTED'
  | 'NOT_BUILT'
  | 'BUILDING'
  | 'UNKNOWN';

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

export interface ConnectJenkinsPayload {
  url: string;
  username: string;
  apiToken: string;
  name?: string;
}

export interface TriggerBuildPayload {
  parameters?: Record<string, any>;
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

export const jenkinsApi = {
  getStatus: async (): Promise<JenkinsConnectionStatusResponse> => {
    return apiRequest('/jenkins/status');
  },

  connect: async (payload: ConnectJenkinsPayload): Promise<JenkinsConnectionStatusResponse> => {
    return apiRequest('/jenkins/connect', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  disconnect: async (): Promise<{ disconnected: boolean; message: string }> => {
    return apiRequest('/jenkins/disconnect', {
      method: 'POST',
    });
  },

  autoDetect: async (): Promise<{
    found: boolean;
    url?: string;
    version?: string;
    requiresAuth?: boolean;
    message: string;
  }> => {
    return apiRequest('/jenkins/autodetect', {
      method: 'POST',
    });
  },

  getOverview: async (): Promise<JenkinsOverview> => {
    return apiRequest('/jenkins/overview');
  },

  getJobs: async (folder?: string, query?: string, status?: string): Promise<JenkinsJob[]> => {
    const params = new URLSearchParams();
    if (folder) params.append('folder', folder);
    if (query) params.append('query', query);
    if (status) params.append('status', status);
    const qs = params.toString();
    return apiRequest(`/jenkins/jobs${qs ? `?${qs}` : ''}`);
  },

  getJobDetails: async (
    path: string,
  ): Promise<JenkinsJob & { builds: Array<{ number: number; url: string; result?: string; timestamp?: number; duration?: number; building?: boolean }> }> => {
    return apiRequest(`/jenkins/job?path=${encodeURIComponent(path)}`);
  },

  triggerBuild: async (
    path: string,
    payload?: TriggerBuildPayload,
  ): Promise<{ queued: boolean; queueItemUrl?: string; queueItemId?: number; message: string }> => {
    return apiRequest(`/jenkins/build?path=${encodeURIComponent(path)}`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });
  },

  stopBuild: async (
    path: string,
    buildNumber: number,
  ): Promise<{ stopped: boolean; message: string }> => {
    return apiRequest(`/jenkins/stop?path=${encodeURIComponent(path)}&buildNumber=${buildNumber}`, {
      method: 'POST',
    });
  },

  getBuildDetail: async (
    path: string,
    buildNumber: number,
  ): Promise<JenkinsBuildDetail> => {
    return apiRequest(`/jenkins/build-detail?path=${encodeURIComponent(path)}&buildNumber=${buildNumber}`);
  },

  getConsole: async (
    path: string,
    buildNumber: number,
    startOffset: number = 0,
  ): Promise<JenkinsConsoleOutput> => {
    return apiRequest(
      `/jenkins/console?path=${encodeURIComponent(path)}&buildNumber=${buildNumber}&startOffset=${startOffset}`,
    );
  },

  getTests: async (path: string, buildNumber: number): Promise<any> => {
    return apiRequest(`/jenkins/tests?path=${encodeURIComponent(path)}&buildNumber=${buildNumber}`);
  },

  getQueue: async (): Promise<JenkinsQueueItem[]> => {
    return apiRequest('/jenkins/queue');
  },

  cancelQueueItem: async (id: number): Promise<{ cancelled: boolean; message: string }> => {
    return apiRequest(`/jenkins/queue/${id}/cancel`, {
      method: 'POST',
    });
  },

  getNodes: async (): Promise<JenkinsNode[]> => {
    return apiRequest('/jenkins/nodes');
  },
};
