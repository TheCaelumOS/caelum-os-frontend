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

export interface GithubConnectionStatus {
  connected: boolean;
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

export interface GithubRelease {
  id: number;
  tagName: string;
  name: string | null;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  createdAt: string;
  publishedAt: string | null;
  htmlUrl: string;
}

export interface GithubTag {
  name: string;
  commitSha: string;
}
