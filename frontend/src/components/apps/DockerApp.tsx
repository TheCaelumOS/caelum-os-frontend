"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiRequest } from '../../lib/api';
import { getDockerEnvironment } from '../../lib/dockerEnvironment';
import { DockerLogo } from '../icons/RealBrandLogos';
import { 
  Play, 
  Square, 
  RotateCw, 
  Trash2, 
  Database, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  Server, 
  HardDrive, 
  Network, 
  FileText, 
  X,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Laptop
} from 'lucide-react';

interface Container {
  id: string;
  name: string;
  image: string;
  status: string;
  state: 'running' | 'exited' | 'paused' | 'created' | string;
  ports: string;
  created: string;
}

interface DockerImage {
  id: string;
  repository: string;
  tag: string;
  size: string;
  created: string;
}

interface DockerNetwork {
  id: string;
  name: string;
  driver: string;
  scope: string;
}

interface DockerVolume {
  name: string;
  driver: string;
  scope?: string;
}

interface DockerAppProps {
  initialSubPath?: string;
  onPathChange?: (subpath: string) => void;
}

export type DockerConnectionState = 
  | 'checking' 
  | 'connected' 
  | 'disconnected' 
  | 'local_engine_required';

export default function DockerApp({ initialSubPath = '', onPathChange }: DockerAppProps) {
  const [containers, setContainers] = useState<Container[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [logs, setLogs] = useState<string>('');
  const [logsLoading, setLogsLoading] = useState<boolean>(false);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Connection and Environment State
  const [connectionState, setConnectionState] = useState<DockerConnectionState>('checking');
  const [engineStatus, setEngineStatus] = useState<{ connected: boolean; version?: string; error?: string } | null>(null);

  // References to track active requests and prevent stale async overwrites
  const selectedIdRef = useRef<string>('');
  const activeRequestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Tabs mapping
  const [activeTab, setActiveTab] = useState<string>(initialSubPath || 'containers');

  const [images, setImages] = useState<DockerImage[]>([]);
  const [networks, setNetworks] = useState<DockerNetwork[]>([]);
  const [volumes, setVolumes] = useState<DockerVolume[]>([]);
  const [composeProjects, setComposeProjects] = useState<any[]>([]);
  const [daemonLogs, setDaemonLogs] = useState<string>('');

  // Diagnostics modal/notice
  const [diagRunning, setDiagRunning] = useState<boolean>(false);
  const [diagResult, setDiagResult] = useState<string | null>(null);

  // Keep selectedIdRef in sync with state
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const tabs = [
    { id: 'containers', name: 'Containers', icon: Server },
    { id: 'images', name: 'Images', icon: Layers },
    { id: 'networks', name: 'Networks', icon: Network },
    { id: 'volumes', name: 'Volumes', icon: HardDrive },
    { id: 'compose', name: 'Docker Compose', icon: Database },
    { id: 'logs', name: 'Daemon Logs', icon: FileText },
  ];

  /**
   * Environment-aware engine status check.
   * If running in production (hosted domain e.g. caleum.me) without a remote agent:
   * Transitions immediately to 'local_engine_required' with zero network attempts to localhost.
   * If running in local development:
   * Connects to the local backend on port 4000 to query the real host Docker Engine.
   */
  const checkStatus = async () => {
    setLoading(true);
    setError(null);
    setDiagResult(null);

    const env = getDockerEnvironment();

    // 1. Production hosted environment check
    if (!env.isLocalAccessAllowed && !env.isRemoteBackendConfigured) {
      setConnectionState('local_engine_required');
      setEngineStatus({
        connected: false,
        error: 'Local Docker access is unavailable from the hosted website.'
      });
      // Ensure zero local or mock data is populated
      setContainers([]);
      setImages([]);
      setNetworks([]);
      setVolumes([]);
      setComposeProjects([]);
      setDaemonLogs('');
      setLogs('');
      setSelectedId('');
      selectedIdRef.current = '';
      setLoading(false);
      return;
    }

    // 2. Local development: connect to real host Docker Engine
    try {
      setConnectionState('checking');
      const data = await apiRequest('/docker/health');
      if (data && (data.connected || data.status === 'healthy' || data.status === 'running')) {
        setConnectionState('connected');
        setEngineStatus(data);
        setError(null);
        await fetchLiveTabContent(activeTab);
      } else {
        setConnectionState('disconnected');
        setEngineStatus({
          connected: false,
          version: data?.version || '',
          error: data?.error || 'Docker daemon is stopped or unreachable.'
        });
        setContainers([]);
        setImages([]);
        setNetworks([]);
        setVolumes([]);
        setComposeProjects([]);
        setDaemonLogs('');
        setLogs('');
      }
    } catch (err: any) {
      setConnectionState('disconnected');
      setEngineStatus({ 
        connected: false, 
        error: err?.message || 'Local CaelumOS runtime is not connected or Docker Desktop is stopped.' 
      });
      setContainers([]);
      setImages([]);
      setNetworks([]);
      setVolumes([]);
      setComposeProjects([]);
      setDaemonLogs('');
      setLogs('');
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveTabContent = async (tab: string) => {
    if (connectionState === 'local_engine_required') return;

    if (tab === 'containers') await fetchContainers();
    else if (tab === 'images') await fetchImages();
    else if (tab === 'networks') await fetchNetworks();
    else if (tab === 'volumes') await fetchVolumes();
    else if (tab === 'compose') await fetchComposeProjects();
    else if (tab === 'logs') await fetchDaemonLogs();
  };

  const fetchComposeProjects = async () => {
    try {
      const data = await apiRequest('/docker/compose');
      setComposeProjects(Array.isArray(data) ? data : []);
    } catch {
      setComposeProjects([]);
    }
  };

  const fetchContainers = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/docker/containers');
      const containerList: Container[] = Array.isArray(data) ? data : [];
      setContainers(containerList);

      if (containerList.length > 0) {
        const currentSelected = selectedIdRef.current;
        const exists = containerList.some(c => c.id === currentSelected);
        if (!currentSelected || !exists) {
          const firstId = containerList[0].id;
          setSelectedId(firstId);
          selectedIdRef.current = firstId;
          await fetchLogsForContainer(firstId);
        }
      } else {
        setSelectedId('');
        selectedIdRef.current = '';
        setLogs('');
        setLogsLoading(false);
      }
    } catch (e: any) {
      console.warn('Failed to fetch containers from live daemon:', e);
      setContainers([]);
      setError(e.message || 'Failed to list containers.');
    } finally {
      setLoading(false);
    }
  };

  const fetchImages = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/docker/images');
      setImages(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.warn('Failed to fetch images from live daemon:', e);
      setImages([]);
      setError(e.message || 'Failed to list images.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNetworks = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/docker/networks');
      setNetworks(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.warn('Failed to fetch networks from live daemon:', e);
      setNetworks([]);
      setError(e.message || 'Failed to list networks.');
    } finally {
      setLoading(false);
    }
  };

  const fetchVolumes = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/docker/volumes');
      setVolumes(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.warn('Failed to fetch volumes from live daemon:', e);
      setVolumes([]);
      setError(e.message || 'Failed to list volumes.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDaemonLogs = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/docker/daemon-logs');
      setDaemonLogs(typeof data === 'string' ? data : 'No daemon events recorded.');
    } catch (e: any) {
      console.warn('Failed to fetch daemon logs from live daemon:', e);
      setDaemonLogs('No live daemon event stream available.');
    } finally {
      setLoading(false);
    }
  };

  // Immediate selection change with log update
  const handleSelectContainer = (id: string) => {
    if (id === selectedId) return;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    activeRequestIdRef.current += 1;
    setSelectedId(id);
    selectedIdRef.current = id;
    setLogs('');
    setLogsError(null);

    fetchLogsForContainer(id);
  };

  // Safe container log fetcher with race condition rejection
  const fetchLogsForContainer = useCallback(async (id: string) => {
    if (!id) {
      setLogs('');
      setLogsLoading(false);
      setLogsError(null);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const requestId = ++activeRequestIdRef.current;
    setLogsLoading(true);
    setLogsError(null);

    try {
      const data = await apiRequest(`/docker/container/${id}/logs?t=${Date.now()}`, {
        signal: controller.signal,
      });

      if (requestId === activeRequestIdRef.current && id === selectedIdRef.current) {
        if (data && data.containerId && data.containerId !== id) {
          return;
        }
        setLogs(typeof data?.logs === 'string' ? data.logs : '');
        setLogsLoading(false);
        setLogsError(null);
      }
    } catch (e: any) {
      if (controller.signal.aborted || e.name === 'AbortError') {
        return;
      }
      if (requestId === activeRequestIdRef.current && id === selectedIdRef.current) {
        setLogsError(e.message || 'Failed to fetch container logs.');
        setLogsLoading(false);
      }
    }
  }, []);

  // Handle Lifecycle actions with live engine support
  const handleAction = async (id: string, action: 'start' | 'stop' | 'restart' | 'remove') => {
    if (!id || actionLoading || connectionState !== 'connected') return;
    setActionLoading(true);
    setError(null);
    setActionNotice(null);

    try {
      await apiRequest(`/docker/container/${id}/action`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });

      if (action === 'remove') {
        if (selectedIdRef.current === id) {
          setSelectedId('');
          selectedIdRef.current = '';
          setLogs('');
        }
      }
      await fetchContainers();
      if (action !== 'remove' && selectedIdRef.current === id) {
        await fetchLogsForContainer(id);
      }
      setActionNotice(`Action '${action}' completed successfully on container ${id.substring(0, 12)}.`);
    } catch (e: any) {
      console.error('Docker action error:', e);
      setError(e.message || `Failed to ${action} container '${id}'.`);
    } finally {
      setActionLoading(false);
    }
  };

  // Run Docker Diagnostics
  const runDiagnostics = async () => {
    setDiagRunning(true);
    setDiagResult(null);

    if (connectionState === 'local_engine_required') {
      setDiagResult([
        'CAELUMOS DOCKER DIAGNOSTICS',
        '---------------------------',
        'Environment:       Production Hosted (caleum.me)',
        'Local Engine:      UNAVAILABLE (Cloudflare Pages frontend)',
        'Remote Agent:      NOT CONFIGURED',
        '',
        'Status: LOCAL ENGINE REQUIRED',
        'To run live Docker diagnostics, launch CaelumOS in your local environment.'
      ].join('\n'));
      setDiagRunning(false);
      return;
    }

    try {
      const res = await apiRequest('/terminal/diagnostics/docker');
      if (res?.details) {
        setDiagResult(res.details);
      } else {
        throw new Error('No diagnostic data returned.');
      }
    } catch (e: any) {
      setDiagResult([
        'CAELUMOS DOCKER DIAGNOSTICS',
        '---------------------------',
        `Error: ${e.message || 'Backend connection failed.'}`,
        'Verify that CaelumOS backend service is running on port 4000.'
      ].join('\n'));
    } finally {
      setDiagRunning(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  useEffect(() => {
    if (connectionState === 'connected') {
      fetchLiveTabContent(activeTab);
    }
  }, [activeTab, connectionState]);

  useEffect(() => {
    if (selectedId && activeTab === 'containers' && connectionState === 'connected') {
      fetchLogsForContainer(selectedId);
    }
  }, [selectedId, activeTab, connectionState, fetchLogsForContainer]);

  useEffect(() => {
    if (initialSubPath && initialSubPath !== activeTab) {
      setActiveTab(initialSubPath);
    }
  }, [initialSubPath]);

  const selectTab = (tabId: string) => {
    setActiveTab(tabId);
    if (onPathChange) {
      onPathChange(tabId);
    }
  };

  const selectedContainer = containers.find(item => item.id === selectedId);

  // Render the Professional "LOCAL ENGINE REQUIRED" view for hosted production
  const renderLocalEngineRequired = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 text-center select-text min-h-0 overflow-y-auto">
      <div className="max-w-md w-full bg-[#0f0f12] border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
          <Database className="w-7 h-7" />
        </div>
        
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>LOCAL ENGINE REQUIRED</span>
          </div>
          <h3 className="text-base font-extrabold text-slate-100 font-sans">Docker Engine</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            CaelumOS Docker integration is available when running the local CaelumOS environment.
          </p>
        </div>

        <div className="bg-black/40 border border-neutral-850 rounded-xl p-4 text-left space-y-2.5">
          <span className="text-[11px] font-bold text-slate-300 font-mono block">
            Connect the local CaelumOS runtime to access:
          </span>
          <ul className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
            <li className="flex items-center space-x-2">
              <span className="text-sky-400 font-bold">•</span>
              <span>Containers</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-sky-400 font-bold">•</span>
              <span>Images</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-sky-400 font-bold">•</span>
              <span>Networks</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-sky-400 font-bold">•</span>
              <span>Volumes</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-sky-400 font-bold">•</span>
              <span>Compose</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-sky-400 font-bold">•</span>
              <span>Container logs</span>
            </li>
            <li className="col-span-2 flex items-center space-x-2">
              <span className="text-sky-400 font-bold">•</span>
              <span>Docker diagnostics</span>
            </li>
          </ul>
        </div>

        <div className="pt-1 flex flex-col sm:flex-row gap-2.5 justify-center">
          <a
            href="/download"
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors shadow-xs group"
          >
            <span>Get CaelumOS Runtime</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <button
            onClick={() => checkStatus()}
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-slate-300 hover:text-white text-xs font-semibold transition-colors border border-neutral-700 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check Host</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-500 font-mono">
          Hosted website on caleum.me does not have direct access to local host daemons.
        </p>
      </div>
    </div>
  );

  // Render Disconnected State when in local development but daemon is stopped
  const renderDisconnectedState = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 text-center select-text min-h-0 overflow-y-auto">
      <div className="max-w-md w-full bg-[#0f0f12] border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
            Connection Unavailable
          </span>
          <h3 className="text-base font-bold text-slate-100 font-sans mt-2">Docker Engine Offline</h3>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Local CaelumOS runtime is connected, but the Docker Engine daemon is stopped or unreachable.
          </p>
        </div>

        <div className="p-3.5 bg-black/40 rounded-xl border border-neutral-850 text-left text-[11px] font-mono text-slate-400 space-y-1.5">
          <p className="text-slate-300 font-semibold">Troubleshooting Steps:</p>
          <p>1. Start Docker Desktop on Windows/Linux host.</p>
          <p>2. Verify daemon responds with <code className="text-sky-400">docker ps</code> in terminal.</p>
          <p>3. Click "Refresh Engine" below to reconnect.</p>
        </div>

        <button
          onClick={() => checkStatus()}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Reconnecting...' : 'Refresh Engine'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-grow flex bg-[#0c0c0e] text-slate-100 min-h-0 select-text font-sans h-full">
      {/* Side Navigation Bar */}
      <div className="w-64 bg-[#0f0f12] border-r border-neutral-850 p-3 space-y-4 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-2">
          {/* Header Brand */}
          <div className="flex items-center space-x-2.5 px-3 py-2 border-b border-neutral-850 mb-2">
            <div className="p-1 rounded-lg bg-sky-500/10 border border-sky-500/20">
              <DockerLogo className="w-5 h-5" />
            </div>
            <div className="truncate">
              <span className="font-extrabold text-xs text-slate-200 block truncate">Docker Engine</span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  connectionState === 'connected' 
                    ? 'bg-emerald-500 animate-pulse' 
                    : connectionState === 'local_engine_required' 
                      ? 'bg-amber-400' 
                      : 'bg-rose-500'
                }`} />
                <span className={`text-[9px] uppercase font-mono font-semibold truncate ${
                  connectionState === 'connected' 
                    ? 'text-emerald-400' 
                    : connectionState === 'local_engine_required' 
                      ? 'text-amber-400' 
                      : 'text-rose-400'
                }`}>
                  {connectionState === 'connected' 
                    ? `Live (${engineStatus?.version || 'v29.6+'})` 
                    : connectionState === 'local_engine_required' 
                      ? 'Local Engine Required' 
                      : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="space-y-1">
            {tabs.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => selectTab(t.id)}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === t.id 
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20 shadow-xs' 
                      : 'hover:bg-neutral-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Engine Controls: Diagnostics & Refresh */}
        <div className="space-y-2 pt-2 border-t border-neutral-850">
          <button
            onClick={runDiagnostics}
            disabled={diagRunning}
            className="w-full py-1.5 px-3 border border-neutral-800 hover:border-neutral-700 bg-neutral-900/40 hover:bg-neutral-850 transition-colors text-slate-400 hover:text-slate-200 text-[11px] font-medium rounded-xl flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <span>{diagRunning ? 'Running Checks...' : 'Diagnostics'}</span>
          </button>
          <button
            onClick={() => checkStatus()}
            disabled={loading}
            className="w-full py-2 px-3 border border-neutral-800 hover:border-neutral-700 bg-neutral-900/50 hover:bg-neutral-850 transition-colors text-slate-300 hover:text-white text-xs font-medium rounded-xl flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : 'text-slate-400'}`} />
            <span>{loading ? 'Checking Engine...' : 'Refresh Engine'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#0c0c0e]">
        
        {/* Diagnostics Output View */}
        {diagResult && (
          <div className="mx-4 mt-3 p-3 bg-black/60 border border-neutral-800 rounded-xl relative text-xs font-mono leading-relaxed shadow-md">
            <button 
              onClick={() => setDiagResult(null)}
              className="absolute top-2 right-2 p-1 hover:bg-neutral-800 rounded text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <pre className="whitespace-pre-wrap text-slate-300 text-[10.5px] font-mono select-all">
              {diagResult}
            </pre>
          </div>
        )}

        {/* Dismissible Error Notification */}
        {error && (
          <div className="mx-4 mt-2 px-3 py-2 bg-red-950/30 border border-red-500/30 rounded-xl flex items-center justify-between text-xs text-red-300 font-sans shadow-xs">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="font-mono text-[11px]">{error}</span>
            </div>
            <button 
              onClick={() => setError(null)}
              className="p-1 hover:bg-red-900/40 rounded text-red-400 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Action Success / Feedback Notice */}
        {actionNotice && (
          <div className="mx-4 mt-2 px-3 py-1.5 bg-sky-950/30 border border-sky-500/25 rounded-xl flex items-center justify-between text-xs text-sky-300 font-sans shadow-xs">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button 
              onClick={() => setActionNotice(null)}
              className="p-1 hover:bg-sky-900/40 rounded text-sky-400 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* CONDITION 1: LOCAL ENGINE REQUIRED (Hosted Production Domain) */}
        {connectionState === 'local_engine_required' ? (
          renderLocalEngineRequired()
        ) : connectionState === 'disconnected' ? (
          /* CONDITION 2: DISCONNECTED (Local Development with Stopped Daemon) */
          renderDisconnectedState()
        ) : connectionState === 'checking' && containers.length === 0 ? (
          /* CONDITION 3: CHECKING STATE */
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-mono space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
            <span>Connecting to CaelumOS Docker Engine...</span>
          </div>
        ) : (
          /* CONDITION 4: CONNECTED TO REAL ENGINE */
          <>
            {/* TAB 1: CONTAINERS */}
            {activeTab === 'containers' && (
              <div className="flex-1 flex min-h-0">
                {/* Containers List */}
                <div className="w-80 border-r border-neutral-850 flex flex-col min-h-0">
                  <div className="p-3 border-b border-neutral-850 flex items-center justify-between bg-[#0f0f12]/50">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">
                      Containers ({containers.length})
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {containers.filter(c => c.state === 'running').length} running
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                    {containers.length === 0 ? (
                      <div className="text-xs text-slate-500 font-medium p-6 text-center">
                        No containers running or stopped on host.
                      </div>
                    ) : (
                      containers.map(c => {
                        const isRunning = c.state === 'running';
                        const isSelected = selectedId === c.id;
                        return (
                          <div
                            key={c.id}
                            onClick={() => handleSelectContainer(c.id)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                              isSelected 
                                ? 'bg-sky-500/15 border-sky-500 shadow-xs ring-1 ring-sky-500/30' 
                                : 'bg-neutral-900/40 border-neutral-850 hover:border-neutral-700 hover:bg-neutral-900/70'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs truncate max-w-[150px] text-slate-200">{c.name}</span>
                              <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                                isRunning ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-800 text-slate-400 border border-neutral-700'
                              }`}>
                                {c.state}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-1 truncate">{c.image}</div>
                            <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono mt-1">
                              <span>{c.ports || 'No ports bound'}</span>
                              <span>ID: {c.id.substring(0, 8)}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Selected Container logs / controls */}
                <div className="flex-1 flex flex-col min-h-0">
                  {selectedContainer ? (
                    <>
                      {/* Container Action Toolbar */}
                      <div className="p-3.5 border-b border-neutral-850 bg-[#0f0f12] flex items-center justify-between flex-shrink-0">
                        <div className="truncate flex-1 min-w-0 mr-3">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-xs font-bold text-slate-200 truncate">{selectedContainer.name}</h3>
                            <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                              selectedContainer.state === 'running' 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-neutral-800 text-slate-400 border border-neutral-700'
                            }`}>
                              {selectedContainer.state}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 truncate block mt-0.5">
                            ID: <span className="text-sky-400 font-bold">{selectedContainer.id}</span> &bull; {selectedContainer.image} &bull; {selectedContainer.status}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1.5 flex-shrink-0">
                          <button
                            onClick={() => fetchLogsForContainer(selectedId)}
                            disabled={logsLoading}
                            className="p-1.5 rounded-lg bg-neutral-800/60 hover:bg-neutral-850 border border-neutral-700 text-slate-300 disabled:opacity-40 cursor-pointer"
                            title="Refresh Logs"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${logsLoading ? 'animate-spin text-sky-400' : ''}`} />
                          </button>
                          <button
                            onClick={() => handleAction(selectedId, 'start')}
                            disabled={selectedContainer.state === 'running' || actionLoading}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 disabled:opacity-30 cursor-pointer"
                            title="Start Container"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <button
                            onClick={() => handleAction(selectedId, 'stop')}
                            disabled={selectedContainer.state !== 'running' || actionLoading}
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 disabled:opacity-30 cursor-pointer"
                            title="Stop Container"
                          >
                            <Square className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <button
                            onClick={() => handleAction(selectedId, 'restart')}
                            disabled={actionLoading}
                            className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/25 border border-sky-500/30 text-sky-400 cursor-pointer"
                            title="Restart Container"
                          >
                            <RotateCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                          </button>
                          <button
                            onClick={() => handleAction(selectedId, 'remove')}
                            disabled={actionLoading}
                            className="p-1.5 rounded-lg bg-red-600/10 hover:bg-red-600/25 border border-red-500/30 text-red-400 cursor-pointer"
                            title="Remove Container"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Logs Viewer */}
                      <div className="flex-1 flex flex-col min-h-0 bg-[#08080a] p-3 font-mono text-xs">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-900 text-slate-400 text-[10px]">
                          <span className="font-semibold uppercase tracking-wider">Container Output / Logs</span>
                          <span className="text-slate-500">Tail: last 100 entries</span>
                        </div>
                        <pre className="flex-grow overflow-auto text-[10px] leading-relaxed text-slate-300 p-2.5 bg-black/50 rounded-xl border border-neutral-900 whitespace-pre-wrap select-all font-mono">
                          {logsLoading ? (
                            <span className="text-sky-400 flex items-center gap-2">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin inline mr-1" />
                              Loading logs for container {selectedId}...
                            </span>
                          ) : logsError ? (
                            <span className="text-red-400">
                              Error loading logs: {logsError}
                            </span>
                          ) : logs && logs.trim().length > 0 ? (
                            logs
                          ) : (
                            <span className="text-slate-500 italic">No logs recorded for this container.</span>
                          )}
                        </pre>
                      </div>
                    </>
                  ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-slate-500 text-xs font-medium space-y-2 p-6">
                      <Server className="w-8 h-8 text-neutral-700" />
                      <span>Select a container from the list to view specifications and live logs.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: IMAGES */}
            {activeTab === 'images' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Local Images ({images.length})</h4>
                    <p className="text-[11px] text-slate-500">OCI-compliant container images available in local Docker cache</p>
                  </div>
                </div>

                {images.length === 0 ? (
                  <div className="text-xs text-slate-500 font-medium p-8 bg-neutral-900/20 border border-neutral-850 rounded-2xl text-center">
                    No local Docker images found.
                  </div>
                ) : (
                  <div className="bg-neutral-900/30 border border-neutral-850 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-neutral-850 bg-neutral-900/60 text-slate-400 text-[10px] uppercase font-bold">
                          <th className="p-3">Repository</th>
                          <th className="p-3">Tag</th>
                          <th className="p-3">Image ID</th>
                          <th className="p-3">Created</th>
                          <th className="p-3 text-right">Size</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-850/60 text-slate-300">
                        {images.map(img => (
                          <tr key={img.id} className="hover:bg-neutral-900/40 transition-colors">
                            <td className="p-3 font-bold text-slate-200 flex items-center space-x-2">
                              <Layers className="w-3.5 h-3.5 text-sky-400" />
                              <span>{img.repository}</span>
                            </td>
                            <td className="p-3">
                              <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-slate-300 text-[10px] border border-neutral-700">
                                {img.tag}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500">{img.id.substring(0, 12)}</td>
                            <td className="p-3 text-slate-400">{img.created}</td>
                            <td className="p-3 text-right text-sky-400 font-bold">{img.size}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: NETWORKS */}
            {activeTab === 'networks' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Docker Networks ({networks.length})</h4>
                    <p className="text-[11px] text-slate-500">Bridge, host, and overlay networks configured for inter-container communication</p>
                  </div>
                </div>

                {networks.length === 0 ? (
                  <div className="text-xs text-slate-500 font-medium p-8 bg-neutral-900/20 border border-neutral-850 rounded-2xl text-center">
                    No Docker networks found.
                  </div>
                ) : (
                  <div className="bg-neutral-900/30 border border-neutral-850 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-neutral-850 bg-neutral-900/60 text-slate-400 text-[10px] uppercase font-bold">
                          <th className="p-3">Name</th>
                          <th className="p-3">Network ID</th>
                          <th className="p-3">Driver</th>
                          <th className="p-3">Scope</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-850/60 text-slate-300">
                        {networks.map(net => (
                          <tr key={net.id} className="hover:bg-neutral-900/40 transition-colors">
                            <td className="p-3 font-bold text-slate-200 flex items-center space-x-2">
                              <Network className="w-3.5 h-3.5 text-sky-400" />
                              <span>{net.name}</span>
                            </td>
                            <td className="p-3 text-slate-500">{net.id.substring(0, 12)}</td>
                            <td className="p-3">
                              <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-sky-300 text-[10px] border border-neutral-700">
                                {net.driver}
                              </span>
                            </td>
                            <td className="p-3 text-slate-400">{net.scope}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: VOLUMES */}
            {activeTab === 'volumes' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Storage Volumes ({volumes.length})</h4>
                    <p className="text-[11px] text-slate-500">Persistent disk storage volumes managed by Docker</p>
                  </div>
                </div>

                {volumes.length === 0 ? (
                  <div className="text-xs text-slate-500 font-medium p-8 bg-neutral-900/20 border border-neutral-850 rounded-2xl text-center">
                    No storage volumes found.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {volumes.map((vol, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-850 hover:border-neutral-750 transition-all space-y-2">
                        <div className="flex items-center space-x-2">
                          <HardDrive className="w-4 h-4 text-sky-400" />
                          <h5 className="font-bold text-xs text-slate-200 font-mono truncate">{vol.name}</h5>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-neutral-850">
                          <span>Driver: {vol.driver}</span>
                          <span>Scope: {vol.scope || 'local'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: DOCKER COMPOSE */}
            {activeTab === 'compose' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Caelum Docker Compose</h4>
                    <p className="text-[11px] text-slate-500">Multi-container configuration for Caelum database and cache backends</p>
                  </div>
                </div>

                {/* Active Compose Projects */}
                {composeProjects.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Running Compose Stacks ({composeProjects.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {composeProjects.map((p, idx) => (
                        <div key={p.Name || idx} className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-200 block">{p.Name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{p.ConfigFiles || 'compose.yaml'}</span>
                          </div>
                          <span className="text-emerald-400 font-mono text-[9px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase">
                            {p.Status || 'running'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Service Status Cards based on real containers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Postgres Service */}
                  {(() => {
                    const pgContainer = containers.find(c => c.name.includes('postgres'));
                    const isRunning = pgContainer?.state === 'running';
                    return (
                      <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-850 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              <Database className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-slate-200">postgres</h5>
                              <span className="text-[10px] font-mono text-slate-400">image: postgres:15-alpine</span>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                            isRunning 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-neutral-800 text-slate-400 border border-neutral-700'
                          }`}>
                            {isRunning ? 'Running' : 'Stopped'}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono space-y-1 text-slate-400 pt-2 border-t border-neutral-850">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Port Mapping:</span>
                            <span className="text-slate-300">5432:5432</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Container ID:</span>
                            <span className="text-slate-300 font-mono">{pgContainer ? pgContainer.id.substring(0, 12) : 'Not started'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Redis Service */}
                  {(() => {
                    const redisContainer = containers.find(c => c.name.includes('redis'));
                    const isRunning = redisContainer?.state === 'running';
                    return (
                      <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-850 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                              <Server className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-slate-200">redis</h5>
                              <span className="text-[10px] font-mono text-slate-400">image: redis:7-alpine</span>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                            isRunning 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-neutral-800 text-slate-400 border border-neutral-700'
                          }`}>
                            {isRunning ? 'Running' : 'Stopped'}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono space-y-1 text-slate-400 pt-2 border-t border-neutral-850">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Port Mapping:</span>
                            <span className="text-slate-300">6379:6379</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Container ID:</span>
                            <span className="text-slate-300 font-mono">{redisContainer ? redisContainer.id.substring(0, 12) : 'Not started'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Docker Compose YAML Template */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">
                    backend/docker-compose.yml
                  </span>
                  <pre className="p-4 bg-black/60 border border-neutral-900 rounded-2xl text-[10px] text-slate-300 font-mono overflow-auto leading-relaxed select-all">
{`services:
  postgres:
    image: postgres:15-alpine
    container_name: caelum-postgres
    restart: always
    environment:
      POSTGRES_USER: caelum_user
      POSTGRES_PASSWORD: caelum_secure_pass_2026
      POSTGRES_DB: caelum_os_db
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: caelum-redis
    restart: always
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:`}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 6: DAEMON LOGS */}
            {activeTab === 'logs' && (
              <div className="flex-1 flex flex-col min-h-0 p-4 font-mono text-[10px] leading-relaxed bg-[#08080a]">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-900">
                  <span className="text-slate-300 uppercase font-bold tracking-wider">
                    Docker Daemon Event Stream
                  </span>
                  <button
                    onClick={() => fetchDaemonLogs()}
                    className="px-2 py-1 rounded bg-neutral-800 text-slate-300 hover:text-white flex items-center space-x-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Refresh Events</span>
                  </button>
                </div>
                <pre className="flex-1 overflow-auto whitespace-pre-wrap select-all text-slate-300 p-3 bg-black/50 rounded-xl border border-neutral-900 leading-relaxed font-mono">
                  {daemonLogs || 'No daemon events recorded.'}
                </pre>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
