"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiRequest } from '../../lib/api';
import { checkLocalConnectorHealth } from '../../lib/localConnector';
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
  X
} from 'lucide-react';

interface Container {
  id: string;
  name: string;
  image: string;
  status: string;
  state: 'running' | 'exited' | 'paused' | 'created' | string;
  ports: string;
  created: string;
  cpu?: string;
  memory?: string;
  memPerc?: string;
  netIO?: string;
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
  | 'unavailable' 
  | 'runtime_offline';

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

  // Native Connection State
  const [connectionState, setConnectionState] = useState<DockerConnectionState>('checking');
  const [engineStatus, setEngineStatus] = useState<{ connected: boolean; version?: string; engine?: string; error?: string } | null>(null);

  // References to track active requests and prevent stale async overwrites
  const selectedIdRef = useRef<string>('');
  const activeRequestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Tabs mapping
  const [activeTab, setActiveTab] = useState<string>(initialSubPath || 'containers');
  const activeTabRef = useRef<string>(activeTab);
  activeTabRef.current = activeTab;

  const connectionStateRef = useRef<DockerConnectionState>(connectionState);
  connectionStateRef.current = connectionState;

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

  const fetchComposeProjects = async () => {
    try {
      const data = await apiRequest('/docker/compose');
      setComposeProjects(Array.isArray(data) ? data : []);
    } catch {
      setComposeProjects([]);
    }
  };

  const fetchContainers = async (silent = false) => {
    if (!silent) setLoading(true);
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
      if (!silent) setError(e.message || 'Failed to list containers.');
    } finally {
      if (!silent) setLoading(false);
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

  const fetchLiveTabContent = async (tab: string) => {
    if (connectionStateRef.current !== 'connected') return;

    if (tab === 'containers') await fetchContainers();
    else if (tab === 'images') await fetchImages();
    else if (tab === 'networks') await fetchNetworks();
    else if (tab === 'volumes') await fetchVolumes();
    else if (tab === 'compose') await fetchComposeProjects();
    else if (tab === 'logs') await fetchDaemonLogs();
  };

  const fetchAllOverviewData = async () => {
    try {
      const [cRes, iRes, nRes, vRes, compRes] = await Promise.allSettled([
        apiRequest('/docker/containers'),
        apiRequest('/docker/images'),
        apiRequest('/docker/networks'),
        apiRequest('/docker/volumes'),
        apiRequest('/docker/compose'),
      ]);

      if (cRes.status === 'fulfilled' && Array.isArray(cRes.value)) {
        const list: Container[] = cRes.value;
        setContainers(list);
        if (list.length > 0) {
          const currentSelected = selectedIdRef.current;
          const exists = list.some(c => c.id === currentSelected);
          if (!currentSelected || !exists) {
            const firstId = list[0].id;
            setSelectedId(firstId);
            selectedIdRef.current = firstId;
            fetchLogsForContainer(firstId);
          }
        }
      }
      if (iRes.status === 'fulfilled' && Array.isArray(iRes.value)) {
        setImages(iRes.value);
      }
      if (nRes.status === 'fulfilled' && Array.isArray(nRes.value)) {
        setNetworks(nRes.value);
      }
      if (vRes.status === 'fulfilled' && Array.isArray(vRes.value)) {
        setVolumes(vRes.value);
      }
      if (compRes.status === 'fulfilled' && Array.isArray(compRes.value)) {
        setComposeProjects(compRes.value);
      }
    } catch (e) {
      console.warn('Failed to load Docker overview data:', e);
    }
  };

  /**
   * Native Docker Engine status check & background detection.
   * Probes http://127.0.0.1:48721/health directly on user's machine.
   * If running, retrieves the user's real local Docker containers and status.
   * If stopped, remains in a calm native state and auto-detects when Docker Desktop opens.
   */
  const checkStatus = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }

    // 1. Probe the Local Runtime on 127.0.0.1:48721
    const health = await checkLocalConnectorHealth();
    if (!health) {
      setConnectionState('runtime_offline');
      setEngineStatus({
        connected: false,
        error: 'Local CaelumOS Runtime is offline.'
      });
      setContainers([]);
      setImages([]);
      setNetworks([]);
      setVolumes([]);
      setComposeProjects([]);
      setDaemonLogs('');
      setLogs('');
      setSelectedId('');
      selectedIdRef.current = '';
      if (!silent) setLoading(false);
      return;
    }

    // 2. Runtime is active! Query local Docker daemon health
    try {
      const data = await apiRequest('/docker/health');
      if (data && (data.connected || data.status === 'healthy' || data.status === 'running')) {
        const wasConnected = connectionStateRef.current === 'connected';
        setConnectionState('connected');
        setEngineStatus(data);
        setError(null);

        if (!wasConnected) {
          await fetchAllOverviewData();
        } else {
          // If on containers tab, update containers silently
          if (activeTabRef.current === 'containers') {
            await fetchContainers(true);
          }
        }
      } else {
        setConnectionState('unavailable');
        setEngineStatus({
          connected: false,
          version: data?.version || health.dockerVersion || '',
          error: data?.error || 'Docker Engine is not running.'
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
      setConnectionState('unavailable');
      setEngineStatus({ 
        connected: false, 
        error: err?.message || 'Docker Engine is not running.' 
      });
      setContainers([]);
      setImages([]);
      setNetworks([]);
      setVolumes([]);
      setComposeProjects([]);
      setDaemonLogs('');
      setLogs('');
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

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
  const fetchLogsForContainer = useCallback(async (id: string, silent = false) => {
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
    if (!silent) {
      setLogsLoading(true);
      setLogsError(null);
    }

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
        if (!silent) {
          setLogsError(e.message || 'Failed to fetch container logs.');
          setLogsLoading(false);
        }
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

    if (connectionState === 'runtime_offline') {
      setDiagResult([
        'CAELUMOS DOCKER DIAGNOSTICS',
        '---------------------------',
        'Local Runtime:     OFFLINE (127.0.0.1:48721)',
        'Docker Daemon:     UNAVAILABLE',
        '',
        'Status: RUNTIME SERVICE NOT DETECTED',
        'Start the local CaelumOS background service to enable native infrastructure integration.'
      ].join('\n'));
      setDiagRunning(false);
      return;
    }

    if (connectionState === 'unavailable') {
      setDiagResult([
        'CAELUMOS DOCKER DIAGNOSTICS',
        '---------------------------',
        'Local Runtime:     ONLINE (127.0.0.1:48721)',
        'Docker Engine:     OFFLINE / NOT RUNNING',
        `Error:             ${engineStatus?.error || 'Docker daemon is stopped.'}`,
        '',
        'Status: DOCKER NOT RUNNING',
        'Start Docker Desktop to connect automatically.'
      ].join('\n'));
      setDiagRunning(false);
      return;
    }

    try {
      const res = await apiRequest('/docker/health');
      setDiagResult([
        'CAELUMOS DOCKER DIAGNOSTICS',
        '---------------------------',
        'Local Runtime:     ONLINE (127.0.0.1:48721)',
        `Docker Engine:     ${res?.connected ? 'CONNECTED (HEALTHY)' : 'UNAVAILABLE'}`,
        `Engine Version:    ${res?.version || 'Unknown'}`,
        `Engine Type:       ${res?.engine || 'Docker Desktop'}`,
        `Context:           ${res?.context || 'default'}`,
        `Containers:        ${containers.length} total (${containers.filter(c => c.state === 'running').length} running)`,
        `Images:            ${images.length}`,
        `Networks:          ${networks.length}`,
        `Volumes:           ${volumes.length}`,
        '',
        'Status: OPERATIONAL',
        'Real-time communication with local Docker daemon active.'
      ].join('\n'));
    } catch (e: any) {
      setDiagResult([
        'CAELUMOS DOCKER DIAGNOSTICS',
        '---------------------------',
        `Error: ${e.message || 'Diagnostic query failed.'}`
      ].join('\n'));
    } finally {
      setDiagRunning(false);
    }
  };

  // Initial check on mount
  useEffect(() => {
    checkStatus(false);
  }, [checkStatus]);

  // Background auto-detect loop (checks silently every 4 seconds)
  // If Docker Desktop starts up, it immediately connects without user interaction.
  useEffect(() => {
    const timer = setInterval(() => {
      checkStatus(true);
    }, 4000);

    return () => clearInterval(timer);
  }, [checkStatus]);

  // Switch tabs
  useEffect(() => {
    if (connectionState === 'connected') {
      fetchLiveTabContent(activeTab);
    }
  }, [activeTab, connectionState]);

  useEffect(() => {
    if (selectedId && activeTab === 'containers' && connectionState === 'connected') {
      fetchLogsForContainer(selectedId);

      const target = containers.find(c => c.id === selectedId);
      if (target?.state === 'running') {
        const streamTimer = setInterval(() => {
          if (selectedIdRef.current === selectedId && activeTabRef.current === 'containers') {
            fetchLogsForContainer(selectedId, true);
          }
        }, 3000);
        return () => clearInterval(streamTimer);
      }
    }
  }, [selectedId, activeTab, connectionState, containers, fetchLogsForContainer]);

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

  return (
    <div className="flex-grow flex bg-[#0c0c0e] text-slate-100 min-h-0 select-text font-sans h-full">
      {/* Side Navigation Bar */}
      <div className="w-64 bg-[#0f0f12] border-r border-neutral-850 p-3 space-y-4 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-2">
          {/* Header Brand */}
          <div className="flex items-center space-x-2.5 px-3 py-2 border-b border-neutral-850 mb-1">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Database className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="font-extrabold text-xs text-slate-200 block truncate">Docker Engine</span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  connectionState === 'connected' 
                    ? 'bg-emerald-500 animate-pulse' 
                    : connectionState === 'unavailable' 
                      ? 'bg-amber-400' 
                      : connectionState === 'checking'
                        ? 'bg-sky-400 animate-pulse'
                        : 'bg-neutral-500'
                }`} />
                <span className={`text-[9px] uppercase font-mono font-semibold truncate ${
                  connectionState === 'connected' 
                    ? 'text-emerald-400' 
                    : connectionState === 'unavailable' 
                      ? 'text-amber-400' 
                      : connectionState === 'checking'
                        ? 'text-sky-400'
                        : 'text-neutral-400'
                }`}>
                  {connectionState === 'connected' 
                    ? `● Connected (${engineStatus?.version ? `v${engineStatus.version}` : 'Live'})` 
                    : connectionState === 'unavailable' 
                      ? '● Not Available' 
                      : connectionState === 'checking'
                        ? '○ Connecting...'
                        : '● Runtime Offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="space-y-1">
            {tabs.map(t => {
              const Icon = t.icon;
              const count = t.id === 'containers' ? containers.length
                          : t.id === 'images' ? images.length
                          : t.id === 'networks' ? networks.length
                          : t.id === 'volumes' ? volumes.length
                          : t.id === 'compose' ? composeProjects.length
                          : null;
              const isSelected = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => selectTab(t.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20 shadow-xs' 
                      : 'hover:bg-neutral-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.name}</span>
                  </div>
                  {connectionState === 'connected' && count !== null && count > 0 && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                      isSelected 
                        ? 'bg-sky-500/25 text-sky-300 font-bold' 
                        : 'bg-neutral-800 text-slate-400'
                    }`}>
                      {count}
                    </span>
                  )}
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
            onClick={() => checkStatus(false)}
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

        {/* CONDITION 1: RUNTIME OFFLINE */}
        {connectionState === 'runtime_offline' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none min-h-0">
            <div className="max-w-md w-full flex flex-col items-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 shadow-inner">
                <Server className="w-7 h-7 text-neutral-500" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-slate-200 font-sans">CaelumOS Runtime Offline</h3>
                <p className="text-xs text-slate-400 font-sans max-w-sm leading-relaxed">
                  The local system runtime is offline. Start the CaelumOS background service to connect to your local infrastructure.
                </p>
              </div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                <span>Monitoring local runtime...</span>
              </div>
            </div>
          </div>
        ) : connectionState === 'unavailable' ? (
          /* CONDITION 2: DOCKER NOT RUNNING */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none min-h-0">
            <div className="max-w-md w-full flex flex-col items-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 shadow-inner">
                <Database className="w-7 h-7 text-neutral-500" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-slate-200 font-sans">Docker Engine Not Available</h3>
                <p className="text-xs text-slate-400 font-sans max-w-sm leading-relaxed">
                  Docker Engine was not detected on this machine. Start Docker Desktop to connect automatically.
                </p>
              </div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 animate-ping" />
                <span>Waiting for Docker daemon...</span>
              </div>
            </div>
          </div>
        ) : connectionState === 'checking' && containers.length === 0 ? (
          /* CONDITION 3: INITIAL CHECKING */
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-mono space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
            <span>Connecting to Docker Engine...</span>
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
                              <span className={c.cpu && c.cpu !== '-' ? 'text-emerald-400 font-semibold' : ''}>
                                {c.cpu && c.cpu !== '-' ? `CPU ${c.cpu}` : `ID: ${c.id.substring(0, 8)}`}
                              </span>
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
                            ID: <span className="text-sky-400 font-bold">{selectedContainer.id.substring(0, 12)}</span> &bull; {selectedContainer.image}
                            {selectedContainer.cpu && selectedContainer.cpu !== '-' && (
                              <> &bull; <span className="text-emerald-400 font-semibold">CPU: {selectedContainer.cpu}</span> &bull; <span className="text-sky-400 font-semibold">RAM: {selectedContainer.memory}</span></>
                            )}
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
