"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  jenkinsApi,
  JenkinsConnectionStatus,
  JenkinsJob,
  JenkinsBuildDetail,
  JenkinsQueueItem,
  JenkinsNode,
  JenkinsOverview,
} from '../../lib/jenkinsApi';
import { JenkinsLogo } from '../icons/RealBrandLogos';
import {
  Play,
  Square,
  RefreshCw,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Server,
  Folder,
  Layers,
  Terminal,
  Activity,
  Clock,
  Settings,
  Cpu,
  Sliders,
  ChevronRight,
  Filter,
  Check,
  X,
  ArrowRight,
  FileText,
  User,
  GitCommit,
  Tag,
  Download,
  ShieldCheck,
  Trash2,
  FolderPlus,
  PlayCircle,
  Radio,
} from 'lucide-react';

interface JenkinsAppProps {
  initialSubPath?: string;
}

export default function JenkinsApp({ initialSubPath }: JenkinsAppProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'jobs' | 'builds' | 'console' | 'queue' | 'nodes' | 'settings'
  >('overview');

  // Connection & Server state
  const [status, setStatus] = useState<JenkinsConnectionStatus>('NOT_CONNECTED');
  const [serverVersion, setServerVersion] = useState<string>('');
  const [serverUrl, setServerUrl] = useState<string>('');
  const [connectionName, setConnectionName] = useState<string>('Jenkins');
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Data states
  const [overview, setOverview] = useState<JenkinsOverview | null>(null);
  const [jobs, setJobs] = useState<JenkinsJob[]>([]);
  const [queue, setQueue] = useState<JenkinsQueueItem[]>([]);
  const [nodes, setNodes] = useState<JenkinsNode[]>([]);

  // Navigation & Folder hierarchy
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected Job & Builds
  const [selectedJobPath, setSelectedJobPath] = useState<string | null>(null);
  const [selectedJobDetails, setSelectedJobDetails] = useState<any | null>(null);
  const [selectedBuildNumber, setSelectedBuildNumber] = useState<number | null>(null);
  const [selectedBuildDetail, setSelectedBuildDetail] = useState<JenkinsBuildDetail | null>(null);

  // Console output
  const [consoleJobPath, setConsoleJobPath] = useState<string | null>(null);
  const [consoleBuildNumber, setConsoleBuildNumber] = useState<number | null>(null);
  const [consoleText, setConsoleText] = useState<string>('');
  const [consoleOffset, setConsoleOffset] = useState<number>(0);
  const [consoleHasMore, setConsoleHasMore] = useState<boolean>(false);
  const [consoleAutoScroll, setConsoleAutoScroll] = useState<boolean>(true);
  const [consoleAutoRefresh, setConsoleAutoRefresh] = useState<boolean>(false);
  const [consoleFilter, setConsoleFilter] = useState<string>('');
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  // Trigger modal state
  const [triggerJob, setTriggerJob] = useState<JenkinsJob | null>(null);
  const [triggerParameters, setTriggerParameters] = useState<Record<string, any>>({});
  const [isTriggering, setIsTriggering] = useState<boolean>(false);

  // Connection form state
  const [formUrl, setFormUrl] = useState<string>('http://localhost:8080');
  const [formUsername, setFormUsername] = useState<string>('admin');
  const [formToken, setFormToken] = useState<string>('');
  const [formName, setFormName] = useState<string>('Primary Jenkins');
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [savingConnection, setSavingConnection] = useState<boolean>(false);
  const [autoDetecting, setAutoDetecting] = useState<boolean>(false);

  // Auto-refresh interval references
  const autoRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // =========================================================================
  // INITIALIZATION & CONNECTION STATUS PROBE
  // =========================================================================

  const checkStatus = useCallback(async () => {
    try {
      const res = await jenkinsApi.getStatus();
      setStatus(res.status);
      if (res.version) setServerVersion(res.version);
      if (res.url) setServerUrl(res.url);
      if (res.name) setConnectionName(res.name);
      if (res.username) setUsername(res.username);

      if (res.status === 'CONNECTED') {
        loadConnectedData();
      } else {
        setOverview(null);
        setJobs([]);
        setQueue([]);
        setNodes([]);
      }
    } catch (err: any) {
      setStatus('ERROR');
      setErrorMessage(err.message || 'Failed to check Jenkins connection status.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadConnectedData = async () => {
    try {
      const [ovData, jobsData, queueData, nodesData] = await Promise.all([
        jenkinsApi.getOverview().catch(() => null),
        jenkinsApi.getJobs(currentFolder).catch(() => []),
        jenkinsApi.getQueue().catch(() => []),
        jenkinsApi.getNodes().catch(() => []),
      ]);

      if (ovData) {
        setOverview(ovData);
        if (ovData.version) setServerVersion(ovData.version);
      }
      setJobs(jobsData || []);
      setQueue(queueData || []);
      setNodes(nodesData || []);
    } catch (err: any) {
      setErrorMessage(`Failed to refresh Jenkins data: ${err.message}`);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Load jobs when folder changes
  useEffect(() => {
    if (status === 'CONNECTED') {
      jenkinsApi.getJobs(currentFolder).then(setJobs).catch((e) => {
        setErrorMessage(`Failed to load jobs: ${e.message}`);
      });
    }
  }, [currentFolder, status]);

  // Auto-scroll console
  useEffect(() => {
    if (consoleAutoScroll && consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleText, consoleAutoScroll]);

  // Progressive console auto-refresh polling
  useEffect(() => {
    if (!consoleAutoRefresh || !consoleJobPath || !consoleBuildNumber) {
      if (autoRefreshTimerRef.current) clearInterval(autoRefreshTimerRef.current);
      return;
    }

    autoRefreshTimerRef.current = setInterval(async () => {
      try {
        const res = await jenkinsApi.getConsole(consoleJobPath, consoleBuildNumber, consoleOffset);
        if (res.output) {
          setConsoleText((prev) => prev + res.output);
        }
        setConsoleOffset(res.nextOffset);
        setConsoleHasMore(res.hasMore);
        if (!res.hasMore) {
          setConsoleAutoRefresh(false);
        }
      } catch {
        setConsoleAutoRefresh(false);
      }
    }, 2000);

    return () => {
      if (autoRefreshTimerRef.current) clearInterval(autoRefreshTimerRef.current);
    };
  }, [consoleAutoRefresh, consoleJobPath, consoleBuildNumber, consoleOffset]);

  // =========================================================================
  // ACTIONS: CONNECT, DISCONNECT, TEST, AUTODETECT
  // =========================================================================

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    clearMessages();
    try {
      const res = await jenkinsApi.connect({
        url: formUrl,
        username: formUsername,
        apiToken: formToken,
        name: formName,
      });
      setTestResult({
        success: true,
        message: `Successfully reached Jenkins server! Version: ${res.version || 'Active'}`,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Unable to connect with the provided credentials.',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveAndConnect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formUrl || !formUsername || !formToken) {
      setErrorMessage('Please provide URL, Username, and API Token.');
      return;
    }

    setSavingConnection(true);
    clearMessages();
    try {
      const res = await jenkinsApi.connect({
        url: formUrl,
        username: formUsername,
        apiToken: formToken,
        name: formName,
      });
      setStatus('CONNECTED');
      setServerVersion(res.version || '');
      setServerUrl(res.url || formUrl);
      setConnectionName(res.name || formName);
      setUsername(res.username || formUsername);
      setSuccessMessage('Successfully connected to Jenkins server.');
      setActiveTab('overview');
      loadConnectedData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to establish Jenkins connection.');
    } finally {
      setSavingConnection(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect and remove stored Jenkins connection?')) return;
    clearMessages();
    try {
      await jenkinsApi.disconnect();
      setStatus('NOT_CONNECTED');
      setOverview(null);
      setJobs([]);
      setQueue([]);
      setNodes([]);
      setSuccessMessage('Disconnected from Jenkins.');
      setActiveTab('settings');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to disconnect.');
    }
  };

  const handleAutoDetect = async () => {
    setAutoDetecting(true);
    setTestResult(null);
    clearMessages();
    try {
      const res = await jenkinsApi.autoDetect();
      if (res.found && res.url) {
        setFormUrl(res.url);
        setTestResult({
          success: true,
          message: `${res.message}. Please enter your Username and API Token to authenticate.`,
        });
      } else {
        setTestResult({
          success: false,
          message: res.message,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Auto-detection failed.',
      });
    } finally {
      setAutoDetecting(false);
    }
  };

  // =========================================================================
  // ACTIONS: JOBS & BUILDS
  // =========================================================================

  const handleOpenJob = async (job: JenkinsJob) => {
    if (job.type === 'folder') {
      const newPath = currentFolder ? `${currentFolder}/${job.name}` : job.name;
      setCurrentFolder(newPath);
      return;
    }

    const jobPath = currentFolder ? `${currentFolder}/${job.name}` : job.name;
    setSelectedJobPath(jobPath);
    setActiveTab('builds');

    try {
      const details = await jenkinsApi.getJobDetails(jobPath);
      setSelectedJobDetails(details);
      if (details.builds && details.builds.length > 0) {
        handleOpenBuildDetail(jobPath, details.builds[0].number);
      }
    } catch (err: any) {
      setErrorMessage(`Failed to load job details: ${err.message}`);
    }
  };

  const handleOpenBuildDetail = async (jobPath: string, buildNum: number) => {
    setSelectedBuildNumber(buildNum);
    try {
      const detail = await jenkinsApi.getBuildDetail(jobPath, buildNum);
      setSelectedBuildDetail(detail);
    } catch (err: any) {
      setErrorMessage(`Failed to load build #${buildNum} details: ${err.message}`);
    }
  };

  const handleOpenConsole = async (jobPath: string, buildNum: number) => {
    setConsoleJobPath(jobPath);
    setConsoleBuildNumber(buildNum);
    setConsoleText('');
    setConsoleOffset(0);
    setConsoleHasMore(false);
    setActiveTab('console');

    try {
      const res = await jenkinsApi.getConsole(jobPath, buildNum, 0);
      setConsoleText(res.output || '');
      setConsoleOffset(res.nextOffset);
      setConsoleHasMore(res.hasMore);
      setConsoleAutoRefresh(res.hasMore);
    } catch (err: any) {
      setErrorMessage(`Failed to load console output for build #${buildNum}: ${err.message}`);
    }
  };

  const handleStartBuildTrigger = (job: JenkinsJob) => {
    setTriggerJob(job);
    const initialParams: Record<string, any> = {};
    for (const p of job.parameters || []) {
      initialParams[p.name] = p.defaultValue !== undefined ? p.defaultValue : '';
    }
    setTriggerParameters(initialParams);
  };

  const handleExecuteBuild = async () => {
    if (!triggerJob) return;
    const jobPath = currentFolder ? `${currentFolder}/${triggerJob.name}` : triggerJob.name;
    setIsTriggering(true);
    clearMessages();

    try {
      const res = await jenkinsApi.triggerBuild(jobPath, {
        parameters: Object.keys(triggerParameters).length > 0 ? triggerParameters : undefined,
      });

      setSuccessMessage(res.message);
      setTriggerJob(null);

      // Refresh data
      loadConnectedData();
      if (selectedJobPath === jobPath) {
        const details = await jenkinsApi.getJobDetails(jobPath);
        setSelectedJobDetails(details);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to trigger build.');
    } finally {
      setIsTriggering(false);
    }
  };

  const handleStopBuild = async (jobPath: string, buildNum: number) => {
    if (!window.confirm(`Are you sure you want to abort build #${buildNum}?`)) return;
    clearMessages();
    try {
      const res = await jenkinsApi.stopBuild(jobPath, buildNum);
      setSuccessMessage(res.message);
      handleOpenBuildDetail(jobPath, buildNum);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to stop build.');
    }
  };

  const handleCancelQueueItem = async (id: number) => {
    clearMessages();
    try {
      const res = await jenkinsApi.cancelQueueItem(id);
      setSuccessMessage(res.message);
      const q = await jenkinsApi.getQueue();
      setQueue(q);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to cancel queue item.');
    }
  };

  // Folder breadcrumb navigation
  const navigateBreadcrumb = (index: number) => {
    if (index < 0) {
      setCurrentFolder('');
      return;
    }
    const parts = currentFolder.split('/').filter(Boolean);
    const newPath = parts.slice(0, index + 1).join('/');
    setCurrentFolder(newPath);
  };

  // Filtered jobs
  const filteredJobs = jobs.filter((job) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        job.name.toLowerCase().includes(q) ||
        job.fullName.toLowerCase().includes(q) ||
        (job.description && job.description.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'BUILDING' && !job.isBuilding) return false;
      if (statusFilter === 'SUCCESS' && job.status !== 'SUCCESS') return false;
      if (statusFilter === 'FAILURE' && job.status !== 'FAILURE') return false;
      if (statusFilter === 'UNSTABLE' && job.status !== 'UNSTABLE') return false;
      if (statusFilter === 'DISABLED' && job.buildable) return false;
    }
    return true;
  });

  const getStatusBadge = (jobStatus: string, isBuilding: boolean) => {
    if (isBuilding) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse">
          <RefreshCw className="w-3 h-3 animate-spin" />
          BUILDING
        </span>
      );
    }
    switch (jobStatus) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            SUCCESS
          </span>
        );
      case 'FAILURE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
            <AlertCircle className="w-3 h-3" />
            FAILURE
          </span>
        );
      case 'UNSTABLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            UNSTABLE
          </span>
        );
      case 'ABORTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-full bg-zinc-500/20 text-zinc-400 border border-zinc-500/30">
            <Square className="w-3 h-3" />
            ABORTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full bg-zinc-700/40 text-zinc-400 border border-zinc-700/50">
            {jobStatus}
          </span>
        );
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms || ms <= 0) return '0s';
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const formatTimeAgo = (ts?: number) => {
    if (!ts) return 'Never';
    const now = Date.now();
    const diff = now - ts;
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-zinc-200 select-none overflow-hidden font-sans">
      {/* =================================================================== */}
      {/* TOP HEADER BAR */}
      {/* =================================================================== */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-7 h-7 bg-zinc-800 rounded-lg p-0.5 border border-zinc-700/60 shadow-sm">
            <JenkinsLogo className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-wide text-sm">Jenkins</span>
            <span className="text-xs text-zinc-400 font-mono">CI/CD</span>
            {serverVersion && (
              <span className="px-2 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-300 rounded border border-zinc-700">
                v{serverVersion}
              </span>
            )}
          </div>
        </div>

        {/* Status Pill & Actions */}
        <div className="flex items-center gap-2.5">
          {status === 'CONNECTED' ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Connected: {connectionName}</span>
            </div>
          ) : status === 'CONNECTING' ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Connecting...</span>
            </div>
          ) : status === 'UNAVAILABLE' ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Server Unavailable</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
              <span className="w-2 h-2 rounded-full bg-zinc-500" />
              <span>Not Connected</span>
            </div>
          )}

          <button
            onClick={() => {
              checkStatus();
              if (status === 'CONNECTED') loadConnectedData();
            }}
            disabled={loading}
            title="Refresh Jenkins"
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition border border-transparent hover:border-zinc-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            title="Settings & Connection"
            className={`p-1.5 rounded transition border ${
              activeTab === 'settings'
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800 border-transparent hover:border-zinc-700'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Notifications / Error Banner */}
      {errorMessage && (
        <div className="flex items-center justify-between px-4 py-2 bg-red-950/60 border-b border-red-800/80 text-xs text-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center justify-between px-4 py-2 bg-emerald-950/60 border-b border-emerald-800/80 text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* NAVIGATION TABS */}
      {/* =================================================================== */}
      <div className="flex items-center gap-1 px-4 border-b border-zinc-800 bg-[#161b22]/50 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-1.5 px-3 py-2.5 font-medium border-b-2 transition ${
            activeTab === 'overview'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Overview
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex items-center gap-1.5 px-3 py-2.5 font-medium border-b-2 transition ${
            activeTab === 'jobs'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Jobs ({jobs.length})
        </button>

        <button
          onClick={() => setActiveTab('builds')}
          className={`flex items-center gap-1.5 px-3 py-2.5 font-medium border-b-2 transition ${
            activeTab === 'builds'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Builds & History
        </button>

        <button
          onClick={() => setActiveTab('console')}
          className={`flex items-center gap-1.5 px-3 py-2.5 font-medium border-b-2 transition ${
            activeTab === 'console'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          Console Output
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-1.5 px-3 py-2.5 font-medium border-b-2 transition ${
            activeTab === 'queue'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          Queue ({queue.length})
        </button>

        <button
          onClick={() => setActiveTab('nodes')}
          className={`flex items-center gap-1.5 px-3 py-2.5 font-medium border-b-2 transition ${
            activeTab === 'nodes'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          Nodes & Agents ({nodes.length})
        </button>

        <div className="flex-1" />

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-1.5 px-3 py-2.5 font-medium border-b-2 transition ${
            activeTab === 'settings'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Connection
        </button>
      </div>

      {/* =================================================================== */}
      {/* MAIN VIEWPORT CONTENT */}
      {/* =================================================================== */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {/* HONEST DISCONNECTED STATE */}
        {status !== 'CONNECTED' && activeTab !== 'settings' && (
          <div className="flex flex-col items-center justify-center p-12 text-center max-w-lg mx-auto bg-[#161b22]/70 border border-zinc-800 rounded-xl shadow-lg my-8">
            <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center p-2 mb-4 border border-zinc-700 shadow-inner">
              <JenkinsLogo className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {status === 'UNAVAILABLE' ? 'Jenkins Server Is Unavailable' : 'No Jenkins Instance Connected'}
            </h3>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              {status === 'UNAVAILABLE'
                ? `Could not reach ${serverUrl || 'the configured Jenkins instance'}. Verify that the server is online and reachable from CaelumOS.`
                : 'Connect your Jenkins CI/CD instance to browse real pipelines, inspect build artifacts, stream console logs, and trigger builds.'}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('settings')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg shadow transition"
              >
                <Settings className="w-3.5 h-3.5" />
                Configure Connection
              </button>
              <button
                onClick={handleAutoDetect}
                disabled={autoDetecting}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg border border-zinc-700 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${autoDetecting ? 'animate-spin' : ''}`} />
                Auto-Detect Localhost
              </button>
            </div>
          </div>
        )}

        {/* 1. OVERVIEW TAB */}
        {status === 'CONNECTED' && activeTab === 'overview' && overview && (
          <div className="space-y-6">
            {/* Server Meta Banner */}
            <div className="flex flex-wrap items-center justify-between p-4 bg-[#161b22] border border-zinc-800 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-800/80 rounded-lg border border-zinc-700">
                  <Server className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{overview.name}</h4>
                  <p className="text-xs text-zinc-400 font-mono">{overview.url}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                <div>
                  Master: <span className="text-zinc-200 font-semibold">{overview.nodeName}</span>
                </div>
                <div>
                  Version: <span className="text-zinc-200 font-semibold">v{overview.version}</span>
                </div>
                <a
                  href={overview.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-blue-400 hover:underline"
                >
                  <span>Jenkins UI</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 bg-[#161b22] border border-zinc-800/80 rounded-xl">
                <div className="text-xs text-zinc-400 mb-1">Total Jobs</div>
                <div className="text-xl font-bold text-white">{overview.stats.totalJobs}</div>
                <div className="text-[10px] text-zinc-500 mt-1">{overview.stats.enabledJobs} enabled</div>
              </div>

              <div className="p-3 bg-[#161b22] border border-zinc-800/80 rounded-xl">
                <div className="text-xs text-emerald-400 mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Successful
                </div>
                <div className="text-xl font-bold text-emerald-400">{overview.stats.successfulJobs}</div>
                <div className="text-[10px] text-zinc-500 mt-1">Passing jobs</div>
              </div>

              <div className="p-3 bg-[#161b22] border border-zinc-800/80 rounded-xl">
                <div className="text-xs text-red-400 mb-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Failing
                </div>
                <div className="text-xl font-bold text-red-400">{overview.stats.failedJobs}</div>
                <div className="text-[10px] text-zinc-500 mt-1">Need attention</div>
              </div>

              <div className="p-3 bg-[#161b22] border border-zinc-800/80 rounded-xl">
                <div className="text-xs text-blue-400 mb-1 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  Building
                </div>
                <div className="text-xl font-bold text-blue-400">{overview.stats.buildingJobs}</div>
                <div className="text-[10px] text-zinc-500 mt-1">Running now</div>
              </div>

              <div className="p-3 bg-[#161b22] border border-zinc-800/80 rounded-xl">
                <div className="text-xs text-amber-400 mb-1 flex items-center gap-1">
                  <Radio className="w-3 h-3" />
                  In Queue
                </div>
                <div className="text-xl font-bold text-amber-400">{overview.stats.queueLength}</div>
                <div className="text-[10px] text-zinc-500 mt-1">Pending items</div>
              </div>

              <div className="p-3 bg-[#161b22] border border-zinc-800/80 rounded-xl">
                <div className="text-xs text-zinc-400 mb-1 flex items-center gap-1">
                  <Server className="w-3 h-3" />
                  Executors
                </div>
                <div className="text-xl font-bold text-white">
                  {overview.stats.busyExecutors} / {overview.stats.totalExecutors}
                </div>
                <div className="text-[10px] text-zinc-500 mt-1">{overview.stats.onlineNodes} online nodes</div>
              </div>
            </div>

            {/* Recent Activity & Running Builds */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-[#161b22] border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-semibold uppercase text-zinc-400 tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    Recent Build Activity
                  </h4>
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>View all jobs</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {overview.recentBuilds.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-500">
                    No recent builds found on this Jenkins instance.
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-800/60">
                    {overview.recentBuilds.map((rb, idx) => (
                      <div
                        key={idx}
                        className="py-2.5 flex items-center justify-between hover:bg-zinc-800/30 px-2 rounded transition cursor-pointer"
                        onClick={() => {
                          setSelectedJobPath(rb.jobName);
                          handleOpenBuildDetail(rb.jobName, rb.number);
                          setActiveTab('builds');
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="font-mono text-xs text-zinc-300 font-semibold">{rb.jobName}</div>
                          <div className="font-mono text-xs text-zinc-400">#{rb.number}</div>
                          {getStatusBadge(rb.result, rb.building)}
                        </div>

                        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                          <span>{formatDuration(rb.duration)}</span>
                          <span>{formatTimeAgo(rb.timestamp)}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenConsole(rb.jobName, rb.number);
                            }}
                            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-700/60 rounded"
                            title="View Console Output"
                          >
                            <Terminal className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Build Queue preview */}
              <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-4 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold uppercase text-zinc-400 tracking-wider flex items-center gap-2">
                    <Radio className="w-4 h-4 text-amber-400" />
                    Pending Queue ({overview.queue.length})
                  </h4>
                  <button
                    onClick={() => setActiveTab('queue')}
                    className="text-xs text-blue-400 hover:underline"
                  >
                    View All
                  </button>
                </div>

                {overview.queue.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-xs text-zinc-500">
                    <CheckCircle2 className="w-6 h-6 text-zinc-600 mb-2" />
                    <span>Build queue is empty</span>
                    <span className="text-[10px] text-zinc-600 mt-1">All scheduled jobs have been assigned</span>
                  </div>
                ) : (
                  <div className="space-y-2 overflow-y-auto max-h-[300px]">
                    {overview.queue.map((item) => (
                      <div key={item.id} className="p-2.5 bg-zinc-800/40 border border-zinc-800 rounded-lg text-xs">
                        <div className="font-medium text-white mb-1 flex items-center justify-between">
                          <span>{item.jobName}</span>
                          <span className="text-[10px] font-mono text-amber-400">Item #{item.id}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mb-2">{item.why}</p>
                        <div className="flex items-center justify-between text-[10px] text-zinc-500">
                          <span>Waiting {formatTimeAgo(item.inQueueSince)}</span>
                          <button
                            onClick={() => handleCancelQueueItem(item.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. JOBS TAB */}
        {status === 'CONNECTED' && activeTab === 'jobs' && (
          <div className="space-y-4">
            {/* Breadcrumbs for folder navigation */}
            <div className="flex items-center justify-between bg-[#161b22] px-4 py-2 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => navigateBreadcrumb(-1)}
                  className={`font-semibold transition ${
                    !currentFolder ? 'text-blue-400' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Root
                </button>
                {currentFolder
                  .split('/')
                  .filter(Boolean)
                  .map((crumb, idx, arr) => (
                    <React.Fragment key={idx}>
                      <ChevronRight className="w-3 h-3 text-zinc-600" />
                      <button
                        onClick={() => navigateBreadcrumb(idx)}
                        className={`transition ${
                          idx === arr.length - 1 ? 'text-blue-400 font-semibold' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {crumb}
                      </button>
                    </React.Fragment>
                  ))}
              </div>

              {/* Search & Filter */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 bg-zinc-900 border border-zinc-700 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SUCCESS">Success</option>
                  <option value="FAILURE">Failure</option>
                  <option value="BUILDING">Building</option>
                  <option value="UNSTABLE">Unstable</option>
                  <option value="DISABLED">Disabled</option>
                </select>
              </div>
            </div>

            {/* Jobs List */}
            {filteredJobs.length === 0 ? (
              <div className="p-12 text-center text-xs text-zinc-500 bg-[#161b22] border border-zinc-800 rounded-xl">
                <Layers className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <span>No jobs found matching your filter in this directory.</span>
              </div>
            ) : (
              <div className="bg-[#161b22] border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800/80">
                {filteredJobs.map((job) => (
                  <div
                    key={job.name}
                    className="p-3 hover:bg-zinc-800/30 transition flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer"
                    onClick={() => handleOpenJob(job)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {job.type === 'folder' ? (
                          <Folder className="w-5 h-5 text-amber-400" />
                        ) : job.type === 'pipeline' ? (
                          <Layers className="w-5 h-5 text-blue-400" />
                        ) : (
                          <FileText className="w-5 h-5 text-zinc-400" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white hover:text-blue-400 transition">
                            {job.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-zinc-800 text-zinc-400 rounded border border-zinc-700 uppercase">
                            {job.type}
                          </span>
                          {getStatusBadge(job.status, job.isBuilding)}
                        </div>
                        {job.description && (
                          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{job.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 self-end md:self-auto">
                      {job.lastBuild && (
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-300">#{job.lastBuild.number}</span>
                          <span>{formatDuration(job.lastBuild.duration)}</span>
                          <span>{formatTimeAgo(job.lastBuild.timestamp)}</span>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {job.buildable && job.type !== 'folder' && (
                          <button
                            onClick={() => handleStartBuildTrigger(job)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded text-xs transition"
                            title="Trigger Build"
                          >
                            <Play className="w-3 h-3" />
                            <span>Build</span>
                          </button>
                        )}

                        {job.lastBuild && (
                          <button
                            onClick={() => {
                              const jobPath = currentFolder ? `${currentFolder}/${job.name}` : job.name;
                              handleOpenConsole(jobPath, job.lastBuild!.number);
                            }}
                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition"
                            title="View Console Output"
                          >
                            <Terminal className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {job.url && (
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition"
                            title="Open in Jenkins"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. BUILDS & HISTORY TAB */}
        {status === 'CONNECTED' && activeTab === 'builds' && (
          <div className="space-y-4">
            {/* Job selector header */}
            <div className="flex flex-wrap items-center justify-between p-4 bg-[#161b22] border border-zinc-800 rounded-xl gap-3">
              <div>
                <span className="text-xs text-zinc-400">Target Pipeline / Job:</span>
                <div className="text-sm font-semibold text-white font-mono">{selectedJobPath || 'Select a Job'}</div>
              </div>

              {selectedJobPath && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const job = jobs.find((j) => j.name === selectedJobPath?.split('/').pop());
                      if (job) handleStartBuildTrigger(job);
                      else handleExecuteBuild();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Build</span>
                  </button>

                  <button
                    onClick={() => {
                      if (selectedJobPath) {
                        jenkinsApi.getJobDetails(selectedJobPath).then(setSelectedJobDetails);
                      }
                    }}
                    className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 border border-zinc-700 rounded-lg"
                    title="Refresh Job Builds"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Builds Grid: Left list, Right detail */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left: Build history list */}
              <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-3">
                <h5 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 px-1">
                  Build History
                </h5>
                {!selectedJobDetails || !selectedJobDetails.builds || selectedJobDetails.builds.length === 0 ? (
                  <div className="p-8 text-center text-xs text-zinc-500">No build history available for this job.</div>
                ) : (
                  <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                    {selectedJobDetails.builds.map((b: any) => (
                      <div
                        key={b.number}
                        onClick={() => handleOpenBuildDetail(selectedJobPath!, b.number)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between ${
                          selectedBuildNumber === b.number
                            ? 'bg-blue-600/15 border-blue-500/40 text-white'
                            : 'bg-zinc-800/40 border-zinc-800/80 hover:bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold">#{b.number}</span>
                          {getStatusBadge(b.result, b.building)}
                        </div>
                        <div className="text-[11px] font-mono text-zinc-400">
                          {formatDuration(b.duration)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Build Detail & Inspect */}
              <div className="lg:col-span-2 bg-[#161b22] border border-zinc-800 rounded-xl p-4">
                {!selectedBuildDetail ? (
                  <div className="p-12 text-center text-xs text-zinc-500">
                    Select a build from the left panel to inspect artifacts, causes, commits, and logs.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <div className="flex items-center gap-3">
                        <h4 className="text-base font-semibold text-white">
                          Build #{selectedBuildDetail.number}
                        </h4>
                        {getStatusBadge(selectedBuildDetail.result || 'UNKNOWN', selectedBuildDetail.building)}
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedBuildDetail.building && (
                          <button
                            onClick={() => handleStopBuild(selectedJobPath!, selectedBuildDetail.number)}
                            className="flex items-center gap-1.5 px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded text-xs transition"
                          >
                            <Square className="w-3 h-3" />
                            <span>Abort</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenConsole(selectedJobPath!, selectedBuildDetail.number)}
                          className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs transition"
                        >
                          <Terminal className="w-3 h-3" />
                          <span>Console</span>
                        </button>
                      </div>
                    </div>

                    {/* Metadata chips */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                        <span className="text-zinc-500 block text-[10px]">Duration</span>
                        <span className="text-zinc-200 font-mono font-semibold">
                          {formatDuration(selectedBuildDetail.duration)}
                        </span>
                      </div>
                      <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                        <span className="text-zinc-500 block text-[10px]">Started</span>
                        <span className="text-zinc-200 font-mono font-semibold">
                          {formatTimeAgo(selectedBuildDetail.timestamp)}
                        </span>
                      </div>
                      <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                        <span className="text-zinc-500 block text-[10px]">Built On Node</span>
                        <span className="text-zinc-200 font-mono font-semibold">
                          {selectedBuildDetail.builtOn || 'master'}
                        </span>
                      </div>
                      <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                        <span className="text-zinc-500 block text-[10px]">Queue ID</span>
                        <span className="text-zinc-200 font-mono font-semibold">
                          #{selectedBuildDetail.queueId || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Causes */}
                    {selectedBuildDetail.causes && selectedBuildDetail.causes.length > 0 && (
                      <div className="text-xs">
                        <span className="text-zinc-400 font-medium block mb-1.5 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-blue-400" />
                          Trigger Cause:
                        </span>
                        <div className="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-zinc-300 font-mono text-[11px]">
                          {selectedBuildDetail.causes.map((c, i) => (
                            <div key={i}>{c.shortDescription}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SCM Commit */}
                    {selectedBuildDetail.commitInfo && (
                      <div className="text-xs">
                        <span className="text-zinc-400 font-medium block mb-1.5 flex items-center gap-1">
                          <GitCommit className="w-3.5 h-3.5 text-emerald-400" />
                          Commit Information:
                        </span>
                        <div className="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-zinc-300 space-y-1">
                          {selectedBuildDetail.commitInfo.commitId && (
                            <div className="font-mono text-[11px] text-blue-400">
                              commit {selectedBuildDetail.commitInfo.commitId.slice(0, 8)}
                            </div>
                          )}
                          <div className="text-white">{selectedBuildDetail.commitInfo.message}</div>
                          <div className="text-[10px] text-zinc-500">
                            By {selectedBuildDetail.commitInfo.author || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Test Summary */}
                    {selectedBuildDetail.testSummary && (
                      <div className="text-xs">
                        <span className="text-zinc-400 font-medium block mb-1.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Test Report Summary:
                        </span>
                        <div className="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs font-mono">
                            <span className="text-zinc-400">Total: {selectedBuildDetail.testSummary.totalCount}</span>
                            <span className="text-emerald-400">Passed: {selectedBuildDetail.testSummary.passCount}</span>
                            <span className="text-red-400">Failed: {selectedBuildDetail.testSummary.failCount}</span>
                            <span className="text-amber-400">Skipped: {selectedBuildDetail.testSummary.skipCount}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Artifacts */}
                    {selectedBuildDetail.artifacts && selectedBuildDetail.artifacts.length > 0 && (
                      <div className="text-xs">
                        <span className="text-zinc-400 font-medium block mb-1.5 flex items-center gap-1">
                          <Download className="w-3.5 h-3.5 text-amber-400" />
                          Build Artifacts ({selectedBuildDetail.artifacts.length}):
                        </span>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {selectedBuildDetail.artifacts.map((art, idx) => (
                            <div
                              key={idx}
                              className="p-2 bg-zinc-900/80 border border-zinc-800 rounded flex items-center justify-between text-[11px] font-mono"
                            >
                              <span className="text-zinc-300">{art.fileName}</span>
                              <span className="text-zinc-500">{art.displayPath}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. CONSOLE OUTPUT TAB */}
        {status === 'CONNECTED' && activeTab === 'console' && (
          <div className="flex flex-col h-[calc(100vh-210px)] bg-[#161b22] border border-zinc-800 rounded-xl overflow-hidden">
            {/* Console Toolbar */}
            <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono text-zinc-300 font-semibold">
                  {consoleJobPath || 'Job'} #{consoleBuildNumber || '0'}
                </span>
                {consoleHasMore && (
                  <span className="flex items-center gap-1 text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 animate-pulse">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    Streaming Output
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Search in log */}
                <div className="relative">
                  <Search className="w-3 h-3 text-zinc-500 absolute left-2 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={consoleFilter}
                    onChange={(e) => setConsoleFilter(e.target.value)}
                    className="w-40 bg-zinc-800 border border-zinc-700 rounded pl-7 pr-2 py-0.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Auto Scroll toggle */}
                <button
                  onClick={() => setConsoleAutoScroll(!consoleAutoScroll)}
                  className={`px-2 py-1 rounded text-xs font-mono transition border ${
                    consoleAutoScroll
                      ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  Auto-Scroll: {consoleAutoScroll ? 'ON' : 'OFF'}
                </button>

                {/* Auto Refresh toggle */}
                <button
                  onClick={() => setConsoleAutoRefresh(!consoleAutoRefresh)}
                  className={`px-2 py-1 rounded text-xs font-mono transition border ${
                    consoleAutoRefresh
                      ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  Live Poll: {consoleAutoRefresh ? 'ON' : 'OFF'}
                </button>

                <button
                  onClick={() => {
                    if (consoleJobPath && consoleBuildNumber) {
                      handleOpenConsole(consoleJobPath, consoleBuildNumber);
                    }
                  }}
                  className="p-1 text-zinc-400 hover:text-white bg-zinc-800 border border-zinc-700 rounded"
                  title="Reload complete console log"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 bg-black p-4 font-mono text-xs overflow-y-auto text-zinc-300 leading-relaxed custom-scrollbar">
              {!consoleText ? (
                <div className="py-12 text-center text-zinc-600">
                  No console output loaded. Select a build and click Console.
                </div>
              ) : (
                <pre className="whitespace-pre-wrap break-all font-mono">
                  {consoleFilter
                    ? consoleText
                        .split('\n')
                        .filter((line) => line.toLowerCase().includes(consoleFilter.toLowerCase()))
                        .join('\n')
                    : consoleText}
                </pre>
              )}
              <div ref={consoleBottomRef} />
            </div>
          </div>
        )}

        {/* 5. QUEUE TAB */}
        {status === 'CONNECTED' && activeTab === 'queue' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#161b22] border border-zinc-800 rounded-xl">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-semibold text-white">Pending Build Queue</h4>
                <span className="text-xs font-mono text-zinc-400">({queue.length} items)</span>
              </div>
              <button
                onClick={() => jenkinsApi.getQueue().then(setQueue)}
                className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 border border-zinc-700 rounded-lg text-xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Queue</span>
              </button>
            </div>

            {queue.length === 0 ? (
              <div className="p-12 text-center text-xs text-zinc-500 bg-[#161b22] border border-zinc-800 rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mx-auto mb-2" />
                <span>Jenkins build queue is currently clear. No pending items.</span>
              </div>
            ) : (
              <div className="bg-[#161b22] border border-zinc-800 rounded-xl divide-y divide-zinc-800 overflow-hidden">
                {queue.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white text-sm">{item.jobName}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-zinc-800 text-amber-400 rounded border border-zinc-700">
                          Queue #{item.id}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">{item.why}</p>
                      <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                        Queued since {new Date(item.inQueueSince).toLocaleTimeString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCancelQueueItem(item.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. NODES & AGENTS TAB */}
        {status === 'CONNECTED' && activeTab === 'nodes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#161b22] border border-zinc-800 rounded-xl">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-400" />
                <h4 className="text-sm font-semibold text-white">Nodes & Build Agents</h4>
                <span className="text-xs font-mono text-zinc-400">({nodes.length} nodes)</span>
              </div>
              <button
                onClick={() => jenkinsApi.getNodes().then(setNodes)}
                className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 border border-zinc-700 rounded-lg text-xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Nodes</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nodes.map((node, idx) => (
                <div key={idx} className="p-4 bg-[#161b22] border border-zinc-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-blue-400" />
                      <span className="font-semibold text-white text-sm">{node.displayName}</span>
                    </div>
                    {node.offline ? (
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full">
                        OFFLINE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                        ONLINE
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 bg-zinc-900 rounded border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px]">Executors</span>
                      <span className="text-white font-bold">{node.numExecutors}</span>
                    </div>
                    <div className="p-2 bg-zinc-900 rounded border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px]">Status</span>
                      <span className={node.idle ? 'text-zinc-300' : 'text-blue-400 font-bold'}>
                        {node.idle ? 'Idle' : 'Busy'}
                      </span>
                    </div>
                  </div>

                  {node.offlineCause && (
                    <div className="p-2 bg-red-950/40 border border-red-800/60 rounded text-[11px] text-red-300">
                      Reason: {node.offlineCause}
                    </div>
                  )}

                  {node.assignedLabels && node.assignedLabels.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {node.assignedLabels.map((lbl, lIdx) => (
                        <span
                          key={lIdx}
                          className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-400 rounded border border-zinc-700"
                        >
                          {lbl}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. SETTINGS / CONNECTION TAB */}
        {activeTab === 'settings' && (
          <div className="max-w-xl mx-auto space-y-6 py-4">
            <div className="bg-[#161b22] border border-zinc-800 rounded-xl p-6 shadow-xl space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
                <div className="w-10 h-10 bg-zinc-800 rounded-xl p-1.5 border border-zinc-700 flex items-center justify-center">
                  <JenkinsLogo className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Jenkins Connection Settings</h4>
                  <p className="text-xs text-zinc-400">Configure your Jenkins CI/CD controller credentials</p>
                </div>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                    testResult.success
                      ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                      : 'bg-red-950/60 border-red-800 text-red-200'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              <form onSubmit={handleSaveAndConnect} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Jenkins Server URL <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="http://localhost:8080 or https://jenkins.company.com"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Must start with http:// or https://. Trailing slashes are automatically handled.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Username <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="admin"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    API Token <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="11xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={formToken}
                    onChange={(e) => setFormToken(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 block leading-relaxed">
                    Generate this token in Jenkins under: <br />
                    <span className="text-blue-400 font-mono">User Profile &gt; Configure &gt; API Token &gt; Add new Token</span>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Connection Label (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Production CI or Local Butler"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between pt-4 border-t border-zinc-800 gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={testingConnection || !formUrl || !formUsername || !formToken}
                      className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 transition disabled:opacity-50"
                    >
                      {testingConnection ? 'Testing...' : 'Test Connection'}
                    </button>

                    <button
                      type="button"
                      onClick={handleAutoDetect}
                      disabled={autoDetecting}
                      className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs border border-zinc-700 transition disabled:opacity-50"
                    >
                      {autoDetecting ? 'Detecting...' : 'Auto-Detect Local'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {status === 'CONNECTED' && (
                      <button
                        type="button"
                        onClick={handleDisconnect}
                        className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium transition"
                      >
                        Disconnect
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={savingConnection}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium shadow transition disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {savingConnection ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save & Connect</span>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* TRIGGER PARAMETERIZED BUILD MODAL */}
      {/* =================================================================== */}
      {triggerJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#161b22] border border-zinc-700 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-semibold text-white">Trigger Build: {triggerJob.name}</h4>
              </div>
              <button
                onClick={() => setTriggerJob(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {triggerJob.parameters && triggerJob.parameters.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                <p className="text-xs text-zinc-400">This job requires build parameters:</p>
                {triggerJob.parameters.map((param) => (
                  <div key={param.name}>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      {param.name} {param.description && <span className="text-[10px] text-zinc-500">({param.description})</span>}
                    </label>
                    {param.choices ? (
                      <select
                        value={triggerParameters[param.name] || ''}
                        onChange={(e) =>
                          setTriggerParameters({ ...triggerParameters, [param.name]: e.target.value })
                        }
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        {param.choices.map((c, i) => (
                          <option key={i} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    ) : param.type.includes('Boolean') ? (
                      <input
                        type="checkbox"
                        checked={Boolean(triggerParameters[param.name])}
                        onChange={(e) =>
                          setTriggerParameters({ ...triggerParameters, [param.name]: e.target.checked })
                        }
                        className="rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-0"
                      />
                    ) : (
                      <input
                        type="text"
                        value={triggerParameters[param.name] ?? ''}
                        onChange={(e) =>
                          setTriggerParameters({ ...triggerParameters, [param.name]: e.target.value })
                        }
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-300">
                Trigger a new build for <span className="font-semibold text-white">{triggerJob.name}</span> immediately?
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setTriggerJob(null)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBuild}
                disabled={isTriggering}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
              >
                {isTriggering ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Queuing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Confirm Build</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
