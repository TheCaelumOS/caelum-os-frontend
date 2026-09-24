import { apiRequest } from './api';

export interface GithubUserProfile {
  id: number;
  login: string;
  name: string | null;
  avatarUrl: string;
  email: string | null;
  bio?: string | null;
  company?: string | null;
  location?: string | null;
  publicRepos?: number;
  followers?: number;
  following?: number;
  htmlUrl?: string;
}

export interface GithubConfigStatus {
  configured: boolean;
  clientId: string | null;
  callbackUrl: string;
  error?: string;
}

export interface GithubConnectionStatus {
  connected: boolean;
  configured?: boolean;
  configError?: string;
  user?: GithubUserProfile;
  error?: string;
}

export interface GithubRepository {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  description: string | null;
  defaultBranch: string;
  htmlUrl: string;
  cloneUrl: string;
  sshUrl: string;
  language: string | null;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  updatedAt: string;
  owner: {
    login: string;
    avatarUrl: string;
  };
  permissions?: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
}

export interface GithubBranch {
  name: string;
  commitSha: string;
  isDefault: boolean;
  protected: boolean;
}

export interface GithubTreeItem {
  name: string;
  path: string;
  type: 'file' | 'dir' | 'submodule';
  size?: number;
  sha: string;
  url?: string;
}

export interface GithubFileContent {
  path: string;
  name: string;
  sha: string;
  size: number;
  encoding: string;
  content: string;
  isBinary: boolean;
  branch: string;
  downloadUrl?: string;
}

export interface GithubCommit {
  sha: string;
  shortSha: string;
  message: string;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  date: string;
  url: string;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
  files?: Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    patch?: string;
  }>;
}

export interface GithubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  author: {
    login: string;
    avatarUrl: string;
  };
  labels: Array<{
    id: number;
    name: string;
    color: string;
    description?: string | null;
  }>;
  assignees: Array<{
    login: string;
    avatarUrl: string;
  }>;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  closedAt?: string | null;
  htmlUrl: string;
}

export interface GithubComment {
  id: number;
  body: string;
  author: {
    login: string;
    avatarUrl: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GithubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  draft: boolean;
  mergeable?: boolean | null;
  merged?: boolean;
  author: {
    login: string;
    avatarUrl: string;
  };
  base: string;
  head: string;
  htmlUrl: string;
  createdAt: string;
  updatedAt: string;
  commitsCount?: number;
  changedFilesCount?: number;
  additions?: number;
  deletions?: number;
}

export interface GithubWorkflow {
  id: number;
  name: string;
  path: string;
  state: string;
  htmlUrl: string;
}

export interface GithubWorkflowRun {
  id: number;
  name: string;
  workflowId: number;
  headBranch: string;
  headSha: string;
  status: string;
  conclusion: string | null;
  createdAt: string;
  updatedAt: string;
  htmlUrl: string;
  runNumber: number;
  event: string;
}

export const githubApi = {
  getConfig: async (): Promise<GithubConfigStatus> => {
    return await apiRequest('/github/config');
  },

  getStatus: async (): Promise<GithubConnectionStatus> => {
    return await apiRequest('/github/status');
  },

  getAuthUrl: async (): Promise<{ url: string; state: string }> => {
    return await apiRequest('/github/auth');
  },

  getUser: async (): Promise<GithubUserProfile> => {
    return await apiRequest('/github/user');
  },

  disconnect: async (): Promise<{ success: boolean; message: string }> => {
    return await apiRequest('/github/connection', { method: 'DELETE' });
  },

  getLocalAccount: async (): Promise<{ available: boolean; username?: string }> => {
    return await apiRequest('/github/local-account');
  },

  connectLocal: async (): Promise<{ success: boolean; token: string; user: GithubUserProfile }> => {
    return await apiRequest('/github/connect-local', { method: 'POST' });
  },

  connectToken: async (token: string): Promise<{ success: boolean; token: string; user: GithubUserProfile }> => {
    return await apiRequest('/github/connect-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
  },

  getRepositories: async (options: {
    page?: number;
    per_page?: number;
    sort?: string;
    direction?: string;
    type?: string;
    q?: string;
  } = {}): Promise<GithubRepository[]> => {
    const params = new URLSearchParams();
    if (options.page) params.set('page', String(options.page));
    if (options.per_page) params.set('per_page', String(options.per_page));
    if (options.sort) params.set('sort', options.sort);
    if (options.direction) params.set('direction', options.direction);
    if (options.type) params.set('type', options.type);
    if (options.q) params.set('q', options.q);

    const qs = params.toString();
    return await apiRequest(`/github/repos${qs ? `?${qs}` : ''}`);
  },

  getRepository: async (owner: string, repo: string): Promise<GithubRepository & { topics: string[]; openIssuesCount: number }> => {
    return await apiRequest(`/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
  },

  getBranches: async (owner: string, repo: string, page = 1, perPage = 30): Promise<GithubBranch[]> => {
    return await apiRequest(`/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/branches?page=${page}&per_page=${perPage}`);
  },

  createBranch: async (owner: string, repo: string, name: string, fromBranch?: string): Promise<GithubBranch> => {
    return await apiRequest(`/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/branches`, {
      method: 'POST',
      body: JSON.stringify({ name, fromBranch }),
    });
  },

  getTree: async (owner: string, repo: string, branch?: string, folderPath?: string): Promise<GithubTreeItem[]> => {
    const params = new URLSearchParams();
    if (branch) params.set('branch', branch);
    if (folderPath) params.set('path', folderPath);
    const qs = params.toString();
    return await apiRequest(`/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/tree${qs ? `?${qs}` : ''}`);
  },

  getFile: async (owner: string, repo: string, filePath: string, branch?: string): Promise<GithubFileContent> => {
    const params = new URLSearchParams({ path: filePath });
    if (branch) params.set('branch', branch);
    return await apiRequest(`/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/file?${params.toString()}`);
  },

  createFile: async (owner: string, repo: string, path: string, content: string, branch?: string, message?: string) => {
    return await apiRequest(`/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/file`, {
      method: 'POST',
      body: JSON.stringify({
        path,
        content,
        branch,
        message: message || `docs: create ${path}`,
      }),
    });
  },

  updateFile: async (owner: string, repo: string, path: string, content: string, sha: string, branch?: string, message?: string) => {
    return await apiRequest(`/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/file`, {
      method: 'PUT',
      body: JSON.stringify({
        path,
        content,
        sha,
        branch,
        message: message || `update: ${path}`,
      }),
    });
  },

  deleteFile: async (owner: string, repo: string, path: string, sha: string, branch?: string, message?: string) => {
    return await apiRequest(`/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/file`, {
      method: 'DELETE',
      body: JSON.stringify({
        path,
        sha,
        branch,
        message: message || `delete: ${path}`,
      }),
    });
  },

  getCommits: async (owner: string, repo: string, branch?: string, pathParam?: string, page = 1, perPage = 30): Promise<GithubCommit[]> => {
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    if (branch) params.set('branch', branch);
    if (pathParam) params.set('path', pathParam);
    return await apiRequest(`/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?${params.toString()}`);
  },

  getCommit: async (owner: string, repo: string, sha: string): Promise<GithubCommit> => {
    return await apiRequest(`/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(sha)}`);
  },

  getIssues: async (owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open', page = 1, perPage = 30, labels?: string, assignee?: string): Promise<GithubIssue[]> => {
    const params = new URLSearchParams({ state, page: String(page), per_page: String(perPage) });
    if (labels) params.set('labels', labels);
    if (assignee) params.set('assignee', assignee);
    return await apiRequest(`/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues?${params.toString()}`);
  },

  createIssue: async (owner: string, repo: string, title: string, body?: string, labels?: string[], assignees?: string[]): Promise<GithubIssue> => {
    return await apiRequest(`/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title, body, labels, assignees }),
    });
  },

  updateIssue: async (owner: string, repo: string, issueNumber: number, data: { title?: string; body?: string; state?: 'open' | 'closed'; labels?: string[]; assignees?: string[] }): Promise<GithubIssue> => {
    return await apiRequest(`/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${issueNumber}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getIssueComments: async (owner: string, repo: string, issueNumber: number): Promise<GithubComment[]> => {
    return await apiRequest(`/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${issueNumber}/comments`);
  },

  createIssueComment: async (owner: string, repo: string, issueNumber: number, body: string): Promise<GithubComment> => {
    return await apiRequest(`/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${issueNumber}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
  },

  getPullRequests: async (owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open', base?: string, head?: string, page = 1, perPage = 30): Promise<GithubPullRequest[]> => {
    const params = new URLSearchParams({ state, page: String(page), per_page: String(perPage) });
    if (base) params.set('base', base);
    if (head) params.set('head', head);
    return await apiRequest(`/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls?${params.toString()}`);
  },

  getPullRequest: async (owner: string, repo: string, pullNumber: number): Promise<GithubPullRequest> => {
    return await apiRequest(`/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${pullNumber}`);
  },

  createPullRequest: async (owner: string, repo: string, title: string, head: string, base: string, body?: string, draft?: boolean): Promise<GithubPullRequest> => {
    return await apiRequest(`/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls`, {
      method: 'POST',
      body: JSON.stringify({ title, head, base, body, draft }),
    });
  },

  getPullRequestReviews: async (owner: string, repo: string, pullNumber: number): Promise<any[]> => {
    return await apiRequest(`/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${pullNumber}/reviews`);
  },

  createPullRequestReview: async (owner: string, repo: string, pullNumber: number, event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT', body?: string): Promise<any> => {
    return await apiRequest(`/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${pullNumber}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ event, body }),
    });
  },

  mergePullRequest: async (owner: string, repo: string, pullNumber: number, mergeMethod: 'merge' | 'squash' | 'rebase' = 'merge', commitTitle?: string, commitMessage?: string) => {
    return await apiRequest(`/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${pullNumber}/merge`, {
      method: 'PUT',
      body: JSON.stringify({ mergeMethod, commitTitle, commitMessage }),
    });
  },

  getWorkflows: async (owner: string, repo: string): Promise<GithubWorkflow[]> => {
    return await apiRequest(`/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/actions/workflows`);
  },

  getWorkflowRuns: async (owner: string, repo: string, workflowId?: string, branch?: string, page = 1, perPage = 20): Promise<GithubWorkflowRun[]> => {
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    if (workflowId) params.set('workflowId', workflowId);
    if (branch) params.set('branch', branch);
    return await apiRequest(`/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/actions/runs?${params.toString()}`);
  },

  getWorkflowRun: async (owner: string, repo: string, runId: number): Promise<GithubWorkflowRun> => {
    return await apiRequest(`/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/actions/runs/${runId}`);
  },

  dispatchWorkflow: async (owner: string, repo: string, workflowId: string, ref: string, inputs?: Record<string, any>) => {
    return await apiRequest(`/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/actions/workflows/${encodeURIComponent(workflowId)}/dispatches`, {
      method: 'POST',
      body: JSON.stringify({ ref, inputs }),
    });
  },
};
