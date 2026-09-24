"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  Play,
  Folder,
  FileCode,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Plus,
  RefreshCw,
  LogOut,
  ChevronRight,
  Send,
  MessageSquare,
  Shield,
  Trash2,
  Save,
  Check,
  Search,
  Code2,
  FilePlus,
  ArrowRight,
  Info,
  GitMerge,
  Eye,
  FileText,
} from 'lucide-react';
import {
  githubApi,
  GithubUserProfile,
  GithubRepository,
  GithubBranch,
  GithubTreeItem,
  GithubFileContent,
  GithubCommit,
  GithubIssue,
  GithubPullRequest,
  GithubWorkflow,
  GithubWorkflowRun,
  GithubComment,
} from '../../lib/githubApi';

type Tab = 'code' | 'branches' | 'commits' | 'issues' | 'pulls' | 'actions';

export default function GitApp() {
  // Authentication & Connection State
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  const [connected, setConnected] = useState<boolean>(false);
  const [user, setUser] = useState<GithubUserProfile | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showDisconnectModal, setShowDisconnectModal] = useState<boolean>(false);
  const [showSetupGuide, setShowSetupGuide] = useState<boolean>(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<Tab>('code');

  // Repositories State
  const [repos, setRepos] = useState<GithubRepository[]>([]);
  const [loadingRepos, setLoadingRepos] = useState<boolean>(false);
  const [selectedRepo, setSelectedRepo] = useState<GithubRepository | null>(null);
  const [repoSearch, setRepoSearch] = useState<string>('');

  // Branches State
  const [branches, setBranches] = useState<GithubBranch[]>([]);
  const [activeBranch, setActiveBranch] = useState<string>('main');
  const [showCreateBranchModal, setShowCreateBranchModal] = useState<boolean>(false);
  const [newBranchName, setNewBranchName] = useState<string>('');
  const [creatingBranch, setCreatingBranch] = useState<boolean>(false);

  // Code Explorer State
  const [treeItems, setTreeItems] = useState<GithubTreeItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [loadingTree, setLoadingTree] = useState<boolean>(false);

  // File Viewer & Editor State
  const [activeFile, setActiveFile] = useState<GithubFileContent | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [loadingFile, setLoadingFile] = useState<boolean>(false);
  const [showCommitModal, setShowCommitModal] = useState<boolean>(false);
  const [commitMessage, setCommitMessage] = useState<string>('');
  const [committing, setCommitting] = useState<boolean>(false);
  const [showNewFileModal, setShowNewFileModal] = useState<boolean>(false);
  const [newFilePath, setNewFilePath] = useState<string>('');
  const [newFileContent, setNewFileContent] = useState<string>('');
  const [newFileCommitMsg, setNewFileCommitMsg] = useState<string>('');
  const [showDeleteFileModal, setShowDeleteFileModal] = useState<boolean>(false);
  const [deleteCommitMsg, setDeleteCommitMsg] = useState<string>('');
  const [deletingFile, setDeletingFile] = useState<boolean>(false);

  // Commits State
  const [commits, setCommits] = useState<GithubCommit[]>([]);
  const [loadingCommits, setLoadingCommits] = useState<boolean>(false);
  const [selectedCommit, setSelectedCommit] = useState<GithubCommit | null>(null);

  // Issues State
  const [issues, setIssues] = useState<GithubIssue[]>([]);
  const [loadingIssues, setLoadingIssues] = useState<boolean>(false);
  const [issueFilter, setIssueFilter] = useState<'open' | 'closed' | 'all'>('open');
  const [selectedIssue, setSelectedIssue] = useState<GithubIssue | null>(null);
  const [issueComments, setIssueComments] = useState<GithubComment[]>([]);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);
  const [showNewIssueModal, setShowNewIssueModal] = useState<boolean>(false);
  const [newIssueTitle, setNewIssueTitle] = useState<string>('');
  const [newIssueBody, setNewIssueBody] = useState<string>('');
  const [creatingIssue, setCreatingIssue] = useState<boolean>(false);

  // Pull Requests State
  const [pulls, setPulls] = useState<GithubPullRequest[]>([]);
  const [loadingPulls, setLoadingPulls] = useState<boolean>(false);
  const [pullFilter, setPullFilter] = useState<'open' | 'closed' | 'all'>('open');
  const [selectedPull, setSelectedPull] = useState<GithubPullRequest | null>(null);
  const [showNewPullModal, setShowNewPullModal] = useState<boolean>(false);
  const [newPullTitle, setNewPullTitle] = useState<string>('');
  const [newPullBody, setNewPullBody] = useState<string>('');
  const [newPullHead, setNewPullHead] = useState<string>('');
  const [newPullBase, setNewPullBase] = useState<string>('main');
  const [creatingPull, setCreatingPull] = useState<boolean>(false);
  const [showMergeModal, setShowMergeModal] = useState<boolean>(false);
  const [mergeMethod, setMergeMethod] = useState<'merge' | 'squash' | 'rebase'>('merge');
  const [mergingPull, setMergingPull] = useState<boolean>(false);

  // GitHub Actions State
  const [workflows, setWorkflows] = useState<GithubWorkflow[]>([]);
  const [workflowRuns, setWorkflowRuns] = useState<GithubWorkflowRun[]>([]);
  const [loadingActions, setLoadingActions] = useState<boolean>(false);
  const [showDispatchModal, setShowDispatchModal] = useState<boolean>(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');
  const [dispatchRef, setDispatchRef] = useState<string>('main');
  const [dispatching, setDispatching] = useState<boolean>(false);

  // Feedback Notification Banner
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setActionNotice({ type, message });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const [isConfigured, setIsConfigured] = useState<boolean>(true);
  const [localAccount, setLocalAccount] = useState<{ available: boolean; username?: string } | null>(null);
  const [connectingLocal, setConnectingLocal] = useState<boolean>(false);
  const [showTokenInput, setShowTokenInput] = useState<boolean>(false);
  const [tokenInput, setTokenInput] = useState<string>('');

  // 1. Initial Connection Status Check
  const checkStatus = useCallback(async () => {
    setLoadingStatus(true);
    setAuthError(null);
    try {
      // Check query params in case of OAuth callback redirect
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const incomingToken = urlParams.get('token');
        if (incomingToken) {
          localStorage.setItem('caelum_token', incomingToken);
        }
        if (urlParams.get('connected') === 'true') {
          showNotice('success', 'Successfully connected and authenticated with GitHub!');
          window.history.replaceState({}, document.title, window.location.pathname);
        } else if (urlParams.get('error')) {
          const errDesc = urlParams.get('error_description') || urlParams.get('error');
          showNotice('error', `GitHub authorization failed: ${errDesc}`);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }

      try {
        const local = await githubApi.getLocalAccount();
        setLocalAccount(local);
      } catch {
        setLocalAccount(null);
      }

      const res = await githubApi.getStatus();
      setConnected(res.connected);
      const configured = res.configured !== false;
      setIsConfigured(configured);

      if (!configured && res.configError) {
        setAuthError(res.configError);
        setShowSetupGuide(true);
      }

      if (res.connected && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch (err: any) {
      setConnected(false);
      setUser(null);
      setAuthError(err.message || 'Failed to connect to backend GitHub service');
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // 2. Fetch Repositories when connected
  const loadRepositories = useCallback(async () => {
    if (!connected) return;
    setLoadingRepos(true);
    try {
      const list = await githubApi.getRepositories({ sort: 'updated', per_page: 50 });
      setRepos(list);
      if (list.length > 0 && !selectedRepo) {
        setSelectedRepo(list[0]);
        setActiveBranch(list[0].defaultBranch || 'main');
      }
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to load repositories');
    } finally {
      setLoadingRepos(false);
    }
  }, [connected, selectedRepo]);

  useEffect(() => {
    if (connected) {
      loadRepositories();
    }
  }, [connected, loadRepositories]);

  // 3. Load Branches and Root Tree whenever Selected Repo changes
  const loadBranches = useCallback(async () => {
    if (!selectedRepo) return;
    try {
      const bList = await githubApi.getBranches(selectedRepo.owner.login, selectedRepo.name);
      setBranches(bList);
      if (!bList.some(b => b.name === activeBranch)) {
        setActiveBranch(selectedRepo.defaultBranch || 'main');
      }
    } catch (err: any) {
      console.warn('Failed to load branches:', err);
    }
  }, [selectedRepo, activeBranch]);

  const loadTree = useCallback(async (path = '') => {
    if (!selectedRepo) return;
    setLoadingTree(true);
    try {
      const items = await githubApi.getTree(selectedRepo.owner.login, selectedRepo.name, activeBranch, path);
      // Sort: folders first, then files
      items.sort((a, b) => {
        if (a.type === 'dir' && b.type !== 'dir') return -1;
        if (a.type !== 'dir' && b.type === 'dir') return 1;
        return a.name.localeCompare(b.name);
      });
      setTreeItems(items);
      setCurrentPath(path);
      setActiveFile(null);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to load directory tree');
    } finally {
      setLoadingTree(false);
    }
  }, [selectedRepo, activeBranch]);

  useEffect(() => {
    if (selectedRepo) {
      loadBranches();
      loadTree('');
    }
  }, [selectedRepo, activeBranch, loadBranches, loadTree]);

  // 4. Load Tab-specific Data
  const loadCommits = useCallback(async () => {
    if (!selectedRepo) return;
    setLoadingCommits(true);
    try {
      const list = await githubApi.getCommits(selectedRepo.owner.login, selectedRepo.name, activeBranch);
      setCommits(list);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to load commits');
    } finally {
      setLoadingCommits(false);
    }
  }, [selectedRepo, activeBranch]);

  const loadIssues = useCallback(async () => {
    if (!selectedRepo) return;
    setLoadingIssues(true);
    try {
      const list = await githubApi.getIssues(selectedRepo.owner.login, selectedRepo.name, issueFilter);
      setIssues(list);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to load issues');
    } finally {
      setLoadingIssues(false);
    }
  }, [selectedRepo, issueFilter]);

  const loadPulls = useCallback(async () => {
    if (!selectedRepo) return;
    setLoadingPulls(true);
    try {
      const list = await githubApi.getPullRequests(selectedRepo.owner.login, selectedRepo.name, pullFilter);
      setPulls(list);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to load pull requests');
    } finally {
      setLoadingPulls(false);
    }
  }, [selectedRepo, pullFilter]);

  const loadActions = useCallback(async () => {
    if (!selectedRepo) return;
    setLoadingActions(true);
    try {
      const [wfList, runList] = await Promise.all([
        githubApi.getWorkflows(selectedRepo.owner.login, selectedRepo.name).catch(() => []),
        githubApi.getWorkflowRuns(selectedRepo.owner.login, selectedRepo.name).catch(() => []),
      ]);
      setWorkflows(wfList);
      setWorkflowRuns(runList);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to load GitHub Actions');
    } finally {
      setLoadingActions(false);
    }
  }, [selectedRepo]);

  useEffect(() => {
    if (activeTab === 'commits') loadCommits();
    if (activeTab === 'issues') loadIssues();
    if (activeTab === 'pulls') loadPulls();
    if (activeTab === 'actions') loadActions();
  }, [activeTab, loadCommits, loadIssues, loadPulls, loadActions]);

  // Open File
  const handleOpenFile = async (item: GithubTreeItem) => {
    if (!selectedRepo) return;
    if (item.type === 'dir') {
      loadTree(item.path);
      return;
    }

    setLoadingFile(true);
    try {
      const f = await githubApi.getFile(selectedRepo.owner.login, selectedRepo.name, item.path, activeBranch);
      setActiveFile(f);
      setFileContent(f.content || '');
      setCommitMessage(`update: ${item.name}`);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to load file content');
    } finally {
      setLoadingFile(false);
    }
  };

  // Save / Commit File
  const handleSaveFile = async () => {
    if (!selectedRepo || !activeFile || !commitMessage) return;
    setCommitting(true);
    try {
      await githubApi.updateFile(
        selectedRepo.owner.login,
        selectedRepo.name,
        activeFile.path,
        fileContent,
        activeFile.sha,
        activeBranch,
        commitMessage,
      );
      showNotice('success', `Committed changes to ${activeFile.name} on ${activeBranch}`);
      setShowCommitModal(false);
      // Reload file
      const updated = await githubApi.getFile(selectedRepo.owner.login, selectedRepo.name, activeFile.path, activeBranch);
      setActiveFile(updated);
      setFileContent(updated.content);
    } catch (err: any) {
      showNotice('error', err.message || 'Commit failed');
    } finally {
      setCommitting(false);
    }
  };

  // Create New File
  const handleCreateFile = async () => {
    if (!selectedRepo || !newFilePath || !newFileCommitMsg) return;
    setCommitting(true);
    try {
      await githubApi.createFile(
        selectedRepo.owner.login,
        selectedRepo.name,
        newFilePath,
        newFileContent,
        activeBranch,
        newFileCommitMsg,
      );
      showNotice('success', `Created file ${newFilePath} on ${activeBranch}`);
      setShowNewFileModal(false);
      setNewFilePath('');
      setNewFileContent('');
      setNewFileCommitMsg('');
      loadTree(currentPath);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to create file');
    } finally {
      setCommitting(false);
    }
  };

  // Delete File
  const handleDeleteFile = async () => {
    if (!selectedRepo || !activeFile || !deleteCommitMsg) return;
    setDeletingFile(true);
    try {
      await githubApi.deleteFile(
        selectedRepo.owner.login,
        selectedRepo.name,
        activeFile.path,
        activeFile.sha,
        activeBranch,
        deleteCommitMsg,
      );
      showNotice('success', `Deleted ${activeFile.name}`);
      setShowDeleteFileModal(false);
      setActiveFile(null);
      loadTree(currentPath);
    } catch (err: any) {
      showNotice('error', err.message || 'Delete failed');
    } finally {
      setDeletingFile(false);
    }
  };

  // Create Branch
  const handleCreateBranch = async () => {
    if (!selectedRepo || !newBranchName.trim()) return;
    setCreatingBranch(true);
    try {
      await githubApi.createBranch(selectedRepo.owner.login, selectedRepo.name, newBranchName.trim(), activeBranch);
      showNotice('success', `Created branch ${newBranchName}`);
      setShowCreateBranchModal(false);
      const created = newBranchName.trim();
      setNewBranchName('');
      await loadBranches();
      setActiveBranch(created);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to create branch');
    } finally {
      setCreatingBranch(false);
    }
  };

  // Connect GitHub
  const handleConnect = async () => {
    try {
      const res = await githubApi.getAuthUrl();
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err: any) {
      setAuthError(err.message || 'Backend GITHUB_CLIENT_ID configuration is required.');
      setShowSetupGuide(true);
    }
  };

  const handleConnectLocal = async () => {
    setConnectingLocal(true);
    setAuthError(null);
    try {
      const res = await githubApi.connectLocal();
      if (res.token) {
        localStorage.setItem('caelum_token', res.token);
        setUser(res.user);
        setConnected(true);
        showNotice('success', `Connected successfully as @${res.user.login}!`);
      }
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to connect local account');
    } finally {
      setConnectingLocal(false);
    }
  };

  const handleConnectToken = async () => {
    if (!tokenInput.trim()) return;
    setConnectingLocal(true);
    setAuthError(null);
    try {
      const res = await githubApi.connectToken(tokenInput.trim());
      if (res.token) {
        localStorage.setItem('caelum_token', res.token);
        setUser(res.user);
        setConnected(true);
        setShowTokenInput(false);
        setTokenInput('');
        showNotice('success', `Connected successfully as @${res.user.login}!`);
      }
    } catch (err: any) {
      showNotice('error', err.message || 'Invalid or unauthorized GitHub token');
    } finally {
      setConnectingLocal(false);
    }
  };

  // Disconnect GitHub
  const handleDisconnect = async () => {
    try {
      await githubApi.disconnect();
      setConnected(false);
      setUser(null);
      setSelectedRepo(null);
      setShowDisconnectModal(false);
      showNotice('success', 'Disconnected from GitHub');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('caelum_token');
      }
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to disconnect');
    }
  };

  // =========================================================================
  // VIEW: LOADING SPINNER
  // =========================================================================
  if (loadingStatus) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0c0c0e] text-slate-300 font-sans p-6">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500 mb-3" />
        <span className="text-xs uppercase tracking-widest text-slate-400 font-mono">
          Verifying GitHub Authorization...
        </span>
      </div>
    );
  }

  // =========================================================================
  // VIEW: DISCONNECTED SCREEN
  // =========================================================================
  if (!connected) {
    return (
      <div className="flex-1 flex flex-col bg-[#0c0c0e] text-slate-100 font-sans select-none overflow-y-auto">
        <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-xl mx-auto text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl">
            <svg className="w-12 h-12 fill-white" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Connect GitHub to CaelumOS</h1>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Authorize CaelumOS via GitHub App to inspect repositories, browse and edit code, commit changes, manage pull requests, and trigger CI/CD Actions.
            </p>
          </div>

          {localAccount?.available && (
            <div className="w-full max-w-md bg-neutral-900/80 border border-orange-500/30 rounded-2xl p-4 text-center space-y-3 shadow-xl">
              <div className="flex items-center justify-center space-x-2 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Detected local GitHub account: <strong className="text-orange-400 font-semibold">@{localAccount.username}</strong></span>
              </div>
              <button
                onClick={handleConnectLocal}
                disabled={connectingLocal}
                className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-orange-950/40 cursor-pointer"
              >
                {connectingLocal ? <RefreshCw className="w-4 h-4 animate-spin" /> : <GitBranch className="w-4 h-4" />}
                <span>{connectingLocal ? 'Connecting Local Account...' : `Connect as @${localAccount.username}`}</span>
              </button>
            </div>
          )}

          {showTokenInput && (
            <div className="w-full max-w-md bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 text-left space-y-3">
              <label className="text-[11px] font-semibold text-slate-300 block">Enter GitHub Personal Access Token (PAT):</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="ghp_... or github_pat_..."
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500 font-mono"
                />
                <button
                  onClick={handleConnectToken}
                  disabled={connectingLocal || !tokenInput.trim()}
                  className="py-2 px-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition cursor-pointer"
                >
                  {connectingLocal ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Connect'}
                </button>
              </div>
              <p className="text-[10px] text-slate-500">Provide a GitHub token with repo scopes to connect this session.</p>
            </div>
          )}

          {authError && !localAccount?.available && (
            <div className="w-full bg-red-950/40 border border-red-500/30 rounded-xl p-3.5 text-left flex items-start space-x-3">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <div className="text-xs text-red-200">
                <span className="font-semibold block mb-0.5">Configuration Notice</span>
                {authError}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md justify-center">
            {isConfigured && (
              <button
                onClick={handleConnect}
                className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-orange-950/40 cursor-pointer"
              >
                <span>Authorize with GitHub</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setShowTokenInput(!showTokenInput)}
              className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold rounded-xl text-xs border border-white/10 transition cursor-pointer"
            >
              {showTokenInput ? 'Hide Token Input' : 'Use Token / PAT'}
            </button>
            <button
              onClick={() => setShowSetupGuide(!showSetupGuide)}
              className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold rounded-xl text-xs border border-white/10 transition cursor-pointer"
            >
              Setup Guide
            </button>
          </div>

          {showSetupGuide && (
            <div className="w-full bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 text-left space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <span className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">
                  GitHub App Configuration Guide
                </span>
                <span className="text-[10px] text-orange-400 font-mono">Callback: http://localhost:4000/github/callback</span>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-slate-400">
                <li>Go to GitHub Settings &rarr; Developer Settings &rarr; GitHub Apps &rarr; <strong>New GitHub App</strong>.</li>
                <li>Set <strong>Homepage URL</strong> to <code className="text-orange-300 font-mono">http://localhost:3000</code>.</li>
                <li>Set <strong>Callback URL</strong> to <code className="text-orange-300 font-mono">http://localhost:4000/github/callback</code>.</li>
                <li>Under <strong>Permissions</strong>, grant Read & Write for: <em>Contents, Issues, Pull Requests, Workflows</em>.</li>
                <li>Add to your backend environment: <code className="text-slate-300 font-mono">GITHUB_CLIENT_ID</code> and <code className="text-slate-300 font-mono">GITHUB_CLIENT_SECRET</code>.</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: CONNECTED WORKSPACE
  // =========================================================================
  return (
    <div className="flex-1 flex flex-col bg-[#0c0c0e] text-slate-100 min-h-0 select-text font-sans">
      {/* Top Banner Notice */}
      {actionNotice && (
        <div
          className={`px-4 py-2 text-xs font-medium flex items-center justify-between border-b ${
            actionNotice.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
              : 'bg-red-950/60 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {actionNotice.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{actionNotice.message}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* Primary Navigation & Identity Bar */}
      <div className="h-14 border-b border-neutral-800 bg-[#0f0f12] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          {/* User Avatar & Login */}
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.login} className="w-8 h-8 rounded-full border border-neutral-700 object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-xs text-orange-400">
              GH
            </div>
          )}
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-200">@{user?.login}</span>
              <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.2 rounded-full font-mono">
                Connected
              </span>
            </div>
            {user?.name && <span className="text-[10px] text-slate-400 truncate block max-w-[160px]">{user.name}</span>}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 bg-black/40 p-1 rounded-xl border border-neutral-800">
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'code' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code</span>
          </button>
          <button
            onClick={() => setActiveTab('branches')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'branches' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Branches</span>
          </button>
          <button
            onClick={() => setActiveTab('commits')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'commits' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Commits</span>
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'issues' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Issues</span>
          </button>
          <button
            onClick={() => setActiveTab('pulls')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'pulls' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitPullRequest className="w-3.5 h-3.5" />
            <span>Pull Requests</span>
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'actions' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Actions</span>
          </button>
        </div>

        {/* Global Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              loadRepositories();
              if (selectedRepo) loadTree(currentPath);
            }}
            title="Refresh GitHub Data"
            className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-slate-300 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowDisconnectModal(true)}
            title="Disconnect Account"
            className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/20 text-red-300 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 flex min-h-0">
        {/* ===================================================================
            SIDEBAR: REPO SELECTOR & BRANCH PICKER
        ==================================================================== */}
        <div className="w-72 border-r border-neutral-800 bg-[#0e0e11] flex flex-col shrink-0">
          <div className="p-3 border-b border-neutral-800 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Active Repository
            </span>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Filter repositories..."
                value={repoSearch}
                onChange={e => setRepoSearch(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-2 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loadingRepos && repos.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">Loading repositories...</div>
            ) : repos.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">No repositories found.</div>
            ) : (
              repos
                .filter(r => r.name.toLowerCase().includes(repoSearch.toLowerCase()) || r.fullName.toLowerCase().includes(repoSearch.toLowerCase()))
                .map(repo => (
                  <button
                    key={repo.id}
                    onClick={() => {
                      setSelectedRepo(repo);
                      setActiveBranch(repo.defaultBranch || 'main');
                      setCurrentPath('');
                      setActiveFile(null);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition cursor-pointer flex flex-col space-y-1 ${
                      selectedRepo?.id === repo.id
                        ? 'bg-orange-600/15 border-orange-500/30 text-orange-300'
                        : 'bg-neutral-900/40 border-transparent text-slate-300 hover:bg-neutral-900/90'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate max-w-[180px]">{repo.name}</span>
                      {repo.private && (
                        <span className="text-[9px] bg-neutral-800 text-slate-400 px-1 py-0.5 rounded font-mono">
                          Private
                        </span>
                      )}
                    </div>
                    {repo.description && (
                      <span className="text-[10px] text-slate-500 line-clamp-1">{repo.description}</span>
                    )}
                  </button>
                ))
            )}
          </div>

          {/* Selected Repo Details Footer */}
          {selectedRepo && (
            <div className="p-3 border-t border-neutral-800 bg-[#09090b] space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Branch:</span>
                <select
                  value={activeBranch}
                  onChange={e => setActiveBranch(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 text-slate-200 text-xs rounded px-2 py-0.5 focus:outline-none"
                >
                  {branches.map(b => (
                    <option key={b.name} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowCreateBranchModal(true)}
                  className="text-[10px] text-orange-400 hover:text-orange-300 font-medium flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Branch</span>
                </button>
                <a
                  href={selectedRepo.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center space-x-1"
                >
                  <span>GitHub</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* ===================================================================
            TAB 1: CODE & FILE EXPLORER
        ==================================================================== */}
        {activeTab === 'code' && (
          <div className="flex-1 flex min-h-0">
            {/* File Tree Column */}
            <div className="w-64 border-r border-neutral-800 flex flex-col min-h-0 bg-[#0c0c0e]">
              {/* Breadcrumb Path Bar */}
              <div className="p-2.5 border-b border-neutral-800 bg-[#0f0f12] flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1 overflow-x-auto text-[11px] text-slate-400">
                  <button
                    onClick={() => loadTree('')}
                    className="hover:text-slate-100 font-mono cursor-pointer"
                  >
                    root
                  </button>
                  {currentPath &&
                    currentPath.split('/').map((segment, idx, arr) => (
                      <React.Fragment key={idx}>
                        <span className="text-slate-600">/</span>
                        <button
                          onClick={() => loadTree(arr.slice(0, idx + 1).join('/'))}
                          className="hover:text-slate-100 font-mono cursor-pointer truncate max-w-[70px]"
                        >
                          {segment}
                        </button>
                      </React.Fragment>
                    ))}
                </div>
                <button
                  onClick={() => setShowNewFileModal(true)}
                  title="Create New File"
                  className="p-1 rounded hover:bg-neutral-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                {loadingTree ? (
                  <div className="p-4 text-center text-xs text-slate-500">Loading files...</div>
                ) : treeItems.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">Directory is empty.</div>
                ) : (
                  treeItems.map(item => (
                    <button
                      key={item.sha || item.path}
                      onClick={() => handleOpenFile(item)}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center space-x-2 transition cursor-pointer ${
                        activeFile?.path === item.path
                          ? 'bg-orange-600/20 text-orange-300 font-semibold'
                          : 'text-slate-300 hover:bg-neutral-900'
                      }`}
                    >
                      {item.type === 'dir' ? (
                        <Folder className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                      ) : (
                        <FileCode className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      )}
                      <span className="truncate flex-1 font-mono text-[11px]">{item.name}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* File Viewer / Editor Column */}
            <div className="flex-1 flex flex-col min-h-0 bg-[#09090c]">
              {activeFile ? (
                <>
                  {/* File Header & Actions */}
                  <div className="h-10 border-b border-neutral-800 bg-[#0e0e12] px-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="font-mono text-slate-300 font-semibold">{activeFile.path}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({activeFile.size} bytes)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowDeleteFileModal(true)}
                        className="px-2.5 py-1 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center space-x-1 cursor-pointer transition"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                      <button
                        onClick={() => setShowCommitModal(true)}
                        className="px-3 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer transition shadow"
                      >
                        <Save className="w-3 h-3" />
                        <span>Commit</span>
                      </button>
                    </div>
                  </div>

                  {/* Editor Content Area */}
                  <div className="flex-1 relative min-h-0">
                    {loadingFile ? (
                      <div className="flex items-center justify-center h-full text-slate-500 text-xs font-mono">
                        Loading content...
                      </div>
                    ) : activeFile.isBinary ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2 text-xs">
                        <FileText className="w-8 h-8 text-slate-600" />
                        <span>Binary file cannot be edited in text mode.</span>
                      </div>
                    ) : (
                      <textarea
                        value={fileContent}
                        onChange={e => setFileContent(e.target.value)}
                        className="w-full h-full p-4 bg-transparent text-slate-200 font-mono text-xs resize-none focus:outline-none leading-relaxed"
                        spellCheck={false}
                      />
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <Code2 className="w-10 h-10 text-neutral-700" />
                  <span className="text-xs">Select a file from the repository tree to view or edit.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 2: BRANCHES
        ==================================================================== */}
        {activeTab === 'branches' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-200">Repository Branches</h2>
                <span className="text-xs text-slate-400">Manage Git branches for {selectedRepo?.fullName}</span>
              </div>
              <button
                onClick={() => setShowCreateBranchModal(true)}
                className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Branch</span>
              </button>
            </div>

            <div className="space-y-2">
              {branches.map(b => (
                <div
                  key={b.name}
                  className="p-3.5 rounded-xl border border-neutral-800 bg-[#0f0f13] flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <GitBranch className="w-4 h-4 text-orange-400" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-200 font-mono">{b.name}</span>
                        {b.name === selectedRepo?.defaultBranch && (
                          <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.2 rounded font-mono">
                            default
                          </span>
                        )}
                        {b.protected && (
                          <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.2 rounded font-mono flex items-center space-x-1">
                            <Shield className="w-2.5 h-2.5" />
                            <span>protected</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">SHA: {b.commitSha.substring(0, 7)}</span>
                    </div>
                  </div>
                  {activeBranch !== b.name ? (
                    <button
                      onClick={() => {
                        setActiveBranch(b.name);
                        showNotice('success', `Switched to branch ${b.name}`);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-slate-300 text-xs font-medium cursor-pointer"
                    >
                      Checkout
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 font-medium flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 3: COMMITS HISTORY
        ==================================================================== */}
        {activeTab === 'commits' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-200">Commit History</h2>
                <span className="text-xs text-slate-400">
                  Showing commits on branch <code className="text-orange-400 font-mono">{activeBranch}</code>
                </span>
              </div>
              <button
                onClick={loadCommits}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-slate-300 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {loadingCommits ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading commits...</div>
            ) : commits.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No commits found for branch.</div>
            ) : (
              <div className="space-y-2">
                {commits.map(c => (
                  <div
                    key={c.sha}
                    onClick={async () => {
                      if (!selectedRepo) return;
                      try {
                        const detailed = await githubApi.getCommit(selectedRepo.owner.login, selectedRepo.name, c.sha);
                        setSelectedCommit(detailed);
                      } catch {
                        setSelectedCommit(c);
                      }
                    }}
                    className="p-3.5 rounded-xl border border-neutral-800 bg-[#0f0f13] hover:border-neutral-700 transition cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <GitCommit className="w-4 h-4 text-orange-400 shrink-0" />
                      <div>
                        <span className="text-xs font-semibold text-slate-200 block">{c.message}</span>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-0.5">
                          <span>{c.authorName}</span>
                          <span>&bull;</span>
                          <span>{new Date(c.date).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-slate-400 bg-neutral-800/80 px-2 py-0.5 rounded">
                      {c.shortSha}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB 4: ISSUES
        ==================================================================== */}
        {activeTab === 'issues' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIssueFilter('open')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    issueFilter === 'open' ? 'bg-orange-600 text-white' : 'bg-neutral-800 text-slate-400'
                  }`}
                >
                  Open
                </button>
                <button
                  onClick={() => setIssueFilter('closed')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    issueFilter === 'closed' ? 'bg-orange-600 text-white' : 'bg-neutral-800 text-slate-400'
                  }`}
                >
                  Closed
                </button>
                <button
                  onClick={() => setIssueFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    issueFilter === 'all' ? 'bg-orange-600 text-white' : 'bg-neutral-800 text-slate-400'
                  }`}
                >
                  All
                </button>
              </div>

              <button
                onClick={() => setShowNewIssueModal(true)}
                className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Issue</span>
              </button>
            </div>

            {loadingIssues ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading issues...</div>
            ) : issues.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No {issueFilter} issues found.</div>
            ) : (
              <div className="space-y-2">
                {issues.map(iss => (
                  <div
                    key={iss.id}
                    onClick={async () => {
                      if (!selectedRepo) return;
                      setSelectedIssue(iss);
                      try {
                        const cmts = await githubApi.getIssueComments(selectedRepo.owner.login, selectedRepo.name, iss.number);
                        setIssueComments(cmts);
                      } catch {
                        setIssueComments([]);
                      }
                    }}
                    className="p-3.5 rounded-xl border border-neutral-800 bg-[#0f0f13] hover:border-neutral-700 transition cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-start space-x-3">
                      <AlertCircle className={`w-4 h-4 mt-0.5 ${iss.state === 'open' ? 'text-emerald-400' : 'text-purple-400'}`} />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-200">#{iss.number}</span>
                          <span className="text-xs font-semibold text-slate-300">{iss.title}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-1">
                          <span>Opened by @{iss.author.login}</span>
                          <span>&bull;</span>
                          <span>{new Date(iss.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    {iss.commentsCount > 0 && (
                      <span className="text-xs text-slate-400 flex items-center space-x-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{iss.commentsCount}</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB 5: PULL REQUESTS
        ==================================================================== */}
        {activeTab === 'pulls' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPullFilter('open')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    pullFilter === 'open' ? 'bg-orange-600 text-white' : 'bg-neutral-800 text-slate-400'
                  }`}
                >
                  Open
                </button>
                <button
                  onClick={() => setPullFilter('closed')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    pullFilter === 'closed' ? 'bg-orange-600 text-white' : 'bg-neutral-800 text-slate-400'
                  }`}
                >
                  Closed
                </button>
              </div>

              <button
                onClick={() => {
                  setNewPullHead(activeBranch);
                  setNewPullBase(selectedRepo?.defaultBranch || 'main');
                  setShowNewPullModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Pull Request</span>
              </button>
            </div>

            {loadingPulls ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading pull requests...</div>
            ) : pulls.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No {pullFilter} pull requests found.</div>
            ) : (
              <div className="space-y-2">
                {pulls.map(pr => (
                  <div
                    key={pr.id}
                    onClick={async () => {
                      if (!selectedRepo) return;
                      try {
                        const full = await githubApi.getPullRequest(selectedRepo.owner.login, selectedRepo.name, pr.number);
                        setSelectedPull(full);
                      } catch {
                        setSelectedPull(pr);
                      }
                    }}
                    className="p-3.5 rounded-xl border border-neutral-800 bg-[#0f0f13] hover:border-neutral-700 transition cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-start space-x-3">
                      <GitPullRequest className={`w-4 h-4 mt-0.5 ${pr.state === 'open' ? 'text-emerald-400' : 'text-purple-400'}`} />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-200">#{pr.number}</span>
                          <span className="text-xs font-semibold text-slate-300">{pr.title}</span>
                          {pr.draft && (
                            <span className="text-[9px] bg-neutral-800 text-slate-400 px-1 py-0.2 rounded font-mono">
                              Draft
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-1 font-mono">
                          <span>{pr.base} &larr; {pr.head}</span>
                          <span>&bull;</span>
                          <span>by @{pr.author.login}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB 6: GITHUB ACTIONS
        ==================================================================== */}
        {activeTab === 'actions' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-200">GitHub Actions</h2>
                <span className="text-xs text-slate-400">CI/CD workflows and automated runs</span>
              </div>
              <div className="flex items-center space-x-2">
                {workflows.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedWorkflowId(String(workflows[0].id));
                      setDispatchRef(activeBranch);
                      setShowDispatchModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow transition"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Workflow</span>
                  </button>
                )}
                <button
                  onClick={loadActions}
                  className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-slate-300 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {loadingActions ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading Actions data...</div>
            ) : workflowRuns.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No workflow runs found.</div>
            ) : (
              <div className="space-y-2">
                {workflowRuns.map(run => (
                  <div
                    key={run.id}
                    className="p-3.5 rounded-xl border border-neutral-800 bg-[#0f0f13] flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      {run.conclusion === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : run.conclusion === 'failure' ? (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-400 animate-pulse shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-200">{run.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">#{run.runNumber}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-0.5 font-mono">
                          <span>{run.headBranch}</span>
                          <span>&bull;</span>
                          <span>{run.event}</span>
                          <span>&bull;</span>
                          <span>{new Date(run.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <a
                      href={run.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-slate-300 text-xs font-mono flex items-center space-x-1"
                    >
                      <span>Logs</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* =====================================================================
          MODAL: SAVE / COMMIT FILE
      ====================================================================== */}
      {showCommitModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121217] border border-neutral-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-200">Commit Changes</h3>
            <div className="space-y-2 text-xs">
              <span className="text-slate-400 block font-mono">Target: {activeFile?.path} on branch {activeBranch}</span>
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Commit Message</label>
              <textarea
                value={commitMessage}
                onChange={e => setCommitMessage(e.target.value)}
                rows={3}
                placeholder="Brief summary of changes..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500/50"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCommitModal(false)}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFile}
                disabled={committing || !commitMessage}
                className="px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer disabled:opacity-50"
              >
                {committing && <RefreshCw className="w-3 h-3 animate-spin" />}
                <span>Commit directly</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: CREATE NEW FILE
      ====================================================================== */}
      {showNewFileModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121217] border border-neutral-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-200">Create New File</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">File Path</label>
                <input
                  type="text"
                  placeholder="e.g. src/utils/logger.ts"
                  value={newFilePath}
                  onChange={e => setNewFilePath(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-orange-500/50"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Content</label>
                <textarea
                  value={newFileContent}
                  onChange={e => setNewFileContent(e.target.value)}
                  rows={6}
                  placeholder="File contents..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-orange-500/50"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Commit Message</label>
                <input
                  type="text"
                  placeholder="feat: create new file"
                  value={newFileCommitMsg}
                  onChange={e => setNewFileCommitMsg(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500/50"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNewFileModal(false)}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFile}
                disabled={committing || !newFilePath || !newFileCommitMsg}
                className="px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer disabled:opacity-50"
              >
                {committing && <RefreshCw className="w-3 h-3 animate-spin" />}
                <span>Create & Commit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: DELETE FILE CONFIRMATION
      ====================================================================== */}
      {showDeleteFileModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121217] border border-red-500/30 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-red-300 flex items-center space-x-2">
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Confirm File Deletion</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete <code className="text-orange-400 font-mono">{activeFile?.path}</code> from branch <code className="text-orange-400 font-mono">{activeBranch}</code>? This will create a real Git commit on GitHub.
            </p>
            <div className="space-y-1 text-xs">
              <label className="text-[10px] uppercase font-bold text-slate-500 block">Commit Message</label>
              <input
                type="text"
                placeholder={`chore: delete ${activeFile?.name}`}
                value={deleteCommitMsg}
                onChange={e => setDeleteCommitMsg(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-red-500/50"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteFileModal(false)}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFile}
                disabled={deletingFile || !deleteCommitMsg}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer disabled:opacity-50"
              >
                {deletingFile && <RefreshCw className="w-3 h-3 animate-spin" />}
                <span>Delete File</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: CREATE BRANCH
      ====================================================================== */}
      {showCreateBranchModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121217] border border-neutral-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-200">Create New Branch</h3>
            <div className="space-y-3 text-xs">
              <span className="text-slate-400 block font-mono">Branch from: {activeBranch}</span>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">New Branch Name</label>
                <input
                  type="text"
                  placeholder="feature/example"
                  value={newBranchName}
                  onChange={e => setNewBranchName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-orange-500/50"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCreateBranchModal(false)}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBranch}
                disabled={creatingBranch || !newBranchName.trim()}
                className="px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer disabled:opacity-50"
              >
                {creatingBranch && <RefreshCw className="w-3 h-3 animate-spin" />}
                <span>Create Branch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: NEW PULL REQUEST
      ====================================================================== */}
      {showNewPullModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121217] border border-neutral-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-200">Open Pull Request</h3>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Base Branch</label>
                  <input
                    type="text"
                    value={newPullBase}
                    onChange={e => setNewPullBase(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-orange-500/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Head Branch</label>
                  <input
                    type="text"
                    value={newPullHead}
                    onChange={e => setNewPullHead(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-orange-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Title</label>
                <input
                  type="text"
                  placeholder="PR title..."
                  value={newPullTitle}
                  onChange={e => setNewPullTitle(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500/50"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Description (Optional)</label>
                <textarea
                  value={newPullBody}
                  onChange={e => setNewPullBody(e.target.value)}
                  rows={4}
                  placeholder="Describe your changes..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500/50"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNewPullModal(false)}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!selectedRepo || !newPullTitle || !newPullHead || !newPullBase) return;
                  setCreatingPull(true);
                  try {
                    await githubApi.createPullRequest(
                      selectedRepo.owner.login,
                      selectedRepo.name,
                      newPullTitle,
                      newPullHead,
                      newPullBase,
                      newPullBody,
                    );
                    showNotice('success', 'Created pull request');
                    setShowNewPullModal(false);
                    setNewPullTitle('');
                    setNewPullBody('');
                    loadPulls();
                  } catch (err: any) {
                    showNotice('error', err.message || 'Failed to create PR');
                  } finally {
                    setCreatingPull(false);
                  }
                }}
                disabled={creatingPull || !newPullTitle}
                className="px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer disabled:opacity-50"
              >
                {creatingPull && <RefreshCw className="w-3 h-3 animate-spin" />}
                <span>Create Pull Request</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: NEW ISSUE
      ====================================================================== */}
      {showNewIssueModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121217] border border-neutral-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-200">Open New Issue</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Issue Title</label>
                <input
                  type="text"
                  placeholder="Bug or feature summary..."
                  value={newIssueTitle}
                  onChange={e => setNewIssueTitle(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500/50"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Description (Markdown)</label>
                <textarea
                  value={newIssueBody}
                  onChange={e => setNewIssueBody(e.target.value)}
                  rows={5}
                  placeholder="Details, steps to reproduce, or requirements..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500/50"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNewIssueModal(false)}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!selectedRepo || !newIssueTitle) return;
                  setCreatingIssue(true);
                  try {
                    await githubApi.createIssue(selectedRepo.owner.login, selectedRepo.name, newIssueTitle, newIssueBody);
                    showNotice('success', 'Created new issue');
                    setShowNewIssueModal(false);
                    setNewIssueTitle('');
                    setNewIssueBody('');
                    loadIssues();
                  } catch (err: any) {
                    showNotice('error', err.message || 'Failed to create issue');
                  } finally {
                    setCreatingIssue(false);
                  }
                }}
                disabled={creatingIssue || !newIssueTitle}
                className="px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer disabled:opacity-50"
              >
                {creatingIssue && <RefreshCw className="w-3 h-3 animate-spin" />}
                <span>Submit Issue</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: DISCONNECT CONFIRMATION
      ====================================================================== */}
      {showDisconnectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121217] border border-red-500/30 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-red-300 flex items-center space-x-2">
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Disconnect GitHub?</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will safely remove your stored GitHub authorization credentials and return CaelumOS to the disconnected state.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDisconnectModal(false)}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnect}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
