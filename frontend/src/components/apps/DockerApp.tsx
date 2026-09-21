"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiRequest } from '../../lib/api';
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
  Clock,
  Terminal,
  Cpu,
  Info
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

// Resilient Fallback Workspace Data for Offline / Cloudflare Pages demo environments
const FALLBACK_CONTAINERS: Container[] = [
  {
    id: "d8f92a10b4c1",
    name: "caelum-postgres",
    image: "postgres:15-alpine",
    status: "Up 4 hours (healthy)",
    state: "running",
    ports: "0.0.0.0:5432->5432/tcp",
    created: "4 hours ago"
  },
  {
    id: "b7c41e89f032",
    name: "caelum-redis",
    image: "redis:7-alpine",
    status: "Up 4 hours",
    state: "running",
    ports: "0.0.0.0:6379->6379/tcp",
    created: "4 hours ago"
  },
  {
    id: "a1e4590fd834",
    name: "caelum-core-api",
    image: "caelum/core-api:latest",
    status: "Up 2 hours",
    state: "running",
    ports: "0.0.0.0:4000->4000/tcp",
    created: "2 hours ago"
  },
  {
    id: "f4a819b52c01",
    name: "caelum-grafana",
    image: "grafana/grafana:latest",
    status: "Exited (0) 1 hour ago",
    state: "exited",
    ports: "3000/tcp",
    created: "1 day ago"
  }
];

const FALLBACK_IMAGES: DockerImage[] = [
  { id: "c8d19a2b5e01", repository: "postgres", tag: "15-alpine", size: "379MB", created: "2 weeks ago" },
  { id: "a4e09f8c12d3", repository: "redis", tag: "7-alpine", size: "32.4MB", created: "3 weeks ago" },
  { id: "e1f89a0b45cd", repository: "caelum/core-api", tag: "latest", size: "185MB", created: "1 day ago" },
  { id: "9a8b7c6d5e4f", repository: "grafana/grafana", tag: "latest", size: "398MB", created: "1 month ago" }
];

const FALLBACK_NETWORKS: DockerNetwork[] = [
  { id: "3b4c5d6e7f8a", name: "caelum-net", driver: "bridge", scope: "local" },
  { id: "7a8b9c0d1e2f", name: "bridge", driver: "bridge", scope: "local" },
  { id: "9f8e7d6c5b4a", name: "host", driver: "host", scope: "local" },
  { id: "1a2b3c4d5e6f", name: "none", driver: "null", scope: "local" }
];

const FALLBACK_VOLUMES: DockerVolume[] = [
  { name: "postgres_data", driver: "local", scope: "local" },
  { name: "redis_data", driver: "local", scope: "local" },
  { name: "caelum_cache", driver: "local", scope: "local" }
];

const FALLBACK_LOGS: Record<string, string> = {
  "d8f92a10b4c1": `PostgreSQL Database directory appears to contain a database; Skipping initialization
2026-09-21 18:00:01.120 UTC [1] LOG:  starting PostgreSQL 15.4 on x86_64-pc-linux-musl
2026-09-21 18:00:01.122 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
2026-09-21 18:00:01.125 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
2026-09-21 18:00:01.139 UTC [28] LOG: database system was shut down at 2026-09-21 17:59:58 UTC
2026-09-21 18:00:01.145 UTC [1] LOG:  database system is ready to accept connections
2026-09-21 18:02:14.301 UTC [35] LOG: checkpoint complete: wrote 45 buffers (0.3%); 0 WAL file(s) added
2026-09-21 18:15:00.002 UTC [42] LOG: connection received: host=172.18.0.3 port=49152
2026-09-21 18:15:00.005 UTC [42] LOG: connection authorized: user=caelum_user database=caelum_os_db`,
  
  "b7c41e89f032": `1:C 21 Sep 2026 18:00:00.512 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
1:C 21 Sep 2026 18:00:00.512 # Redis version=7.2.4, bits=64, commit=00000000, modified=0, pid=1, just started
1:C 21 Sep 2026 18:00:00.512 # Configuration loaded
1:M 21 Sep 2026 18:00:00.513 * Running mode=standalone, port=6379.
1:M 21 Sep 2026 18:00:00.513 # Server initialized
1:M 21 Sep 2026 18:00:00.514 * Ready to accept connections tcp
1:M 21 Sep 2026 18:05:01.020 * 100 keys saved in DB 0
1:M 21 Sep 2026 18:10:01.034 * 150 changes in 300 seconds. Saving...
1:M 21 Sep 2026 18:10:01.036 * Background saving started by pid 22
1:M 21 Sep 2026 18:10:01.042 * DB saved on disk`,

  "a1e4590fd834": `[Nest] 1  - 09/21/2026, 6:00:02 PM     LOG [NestFactory] Starting Nest application...
[Nest] 1  - 09/21/2026, 6:00:02 PM     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 1  - 09/21/2026, 6:00:02 PM     LOG [InstanceLoader] PrismaModule dependencies initialized
[Nest] 1  - 09/21/2026, 6:00:02 PM     LOG [InstanceLoader] DockerModule dependencies initialized
[Nest] 1  - 09/21/2026, 6:00:02 PM     LOG [RoutesResolver] DockerController {/docker}:
[Nest] 1  - 09/21/2026, 6:00:02 PM     LOG [RouterExplorer] Mapped {/docker/health, GET} route
[Nest] 1  - 09/21/2026, 6:00:02 PM     LOG [RouterExplorer] Mapped {/docker/containers, GET} route
[Nest] 1  - 09/21/2026, 6:00:02 PM     LOG [NestApplication] Nest application successfully started on port 4000`,

  "f4a819b52c01": `logger=server size=0 t=2026-09-21T17:00:00+0000 level=info msg="Starting Grafana" version=10.4.1
logger=settings t=2026-09-21T17:00:00+0000 level=info msg="Loaded configuration file" path=/etc/grafana/grafana.ini
logger=server t=2026-09-21T17:00:01+0000 level=info msg="HTTP Server Listen" address=[::]:3000 protocol=http
logger=server t=2026-09-21T17:30:00+0000 level=info msg="Shutdown started" reason="Server received shutdown signal"
logger=server t=2026-09-21T17:30:01+0000 level=info msg="Stopped HTTP Server"
logger=server t=2026-09-21T17:30:01+0000 level=info msg="Grafana stopped gracefully"`
};

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

  // References to track active requests and prevent stale async overwrites
  const selectedIdRef = useRef<string>('');
  const activeRequestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Tabs mapping
  const [activeTab, setActiveTab] = useState<string>(initialSubPath || 'containers');

  const [images, setImages] = useState<DockerImage[]>([]);
  const [networks, setNetworks] = useState<DockerNetwork[]>([]);
  const [volumes, setVolumes] = useState<DockerVolume[]>([]);
  const [daemonLogs, setDaemonLogs] = useState<string>('');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [engineStatus, setEngineStatus] = useState<{ connected: boolean; version?: string; error?: string } | null>(null);

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

  // Set fallback demo data for safe offline exploration
  const populateFallbackData = (notice?: string) => {
    setIsDemoMode(true);
    setContainers(prev => prev.length > 0 ? prev : FALLBACK_CONTAINERS);
    setImages(FALLBACK_IMAGES);
    setNetworks(FALLBACK_NETWORKS);
    setVolumes(FALLBACK_VOLUMES);
    setDaemonLogs(`[DEMO EVENT STREAM]
2026-09-21T18:00:01Z container start d8f92a10b4c1 (image=postgres:15-alpine, name=caelum-postgres)
2026-09-21T18:00:01Z network connect 3b4c5d6e7f8a (container=d8f92a10b4c1, name=caelum-net)
2026-09-21T18:00:01Z volume mount postgres_data -> /var/lib/postgresql/data
2026-09-21T18:00:02Z container start b7c41e89f032 (image=redis:7-alpine, name=caelum-redis)
2026-09-21T18:00:02Z network connect 3b4c5d6e7f8a (container=b7c41e89f032, name=caelum-net)
2026-09-21T18:00:02Z container start a1e4590fd834 (image=caelum/core-api:latest, name=caelum-core-api)
2026-09-21T18:30:01Z container die f4a819b52c01 (exitCode=0, name=caelum-grafana)
[Engine event telemetry stream ready. Start Docker Desktop to connect to live host daemon.]`);
    
    if (!selectedIdRef.current) {
      setSelectedId('d8f92a10b4c1');
      selectedIdRef.current = 'd8f92a10b4c1';
      setLogs(FALLBACK_LOGS['d8f92a10b4c1'] || '');
    } else {
      setLogs(FALLBACK_LOGS[selectedIdRef.current] || 'No demo logs recorded.');
    }
    setLogsLoading(false);
    setLogsError(null);
    if (notice) {
      setActionNotice(notice);
    }
  };

  const checkStatus = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/docker/health');
      if (data && data.connected) {
        setEngineStatus(data);
        setIsDemoMode(false);
        setError(null);
        await fetchLiveTabContent(activeTab);
      } else {
        setEngineStatus({
          connected: false,
          version: data?.version || '',
          error: data?.error || 'Docker daemon is stopped or unreachable.'
        });
        populateFallbackData();
      }
    } catch (err: any) {
      setEngineStatus({ 
        connected: false, 
        error: 'Backend is unreachable. Operating in Caelum workspace offline mode.' 
      });
      populateFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveTabContent = async (tab: string) => {
    if (tab === 'containers') await fetchContainers();
    else if (tab === 'images') await fetchImages();
    else if (tab === 'networks') await fetchNetworks();
    else if (tab === 'volumes') await fetchVolumes();
    else if (tab === 'logs') await fetchDaemonLogs();
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
      console.warn('Failed to fetch containers from live daemon, using workspace fallback:', e);
      populateFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const fetchImages = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/docker/images');
      setImages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn('Failed to fetch images from live daemon:', e);
      setImages(FALLBACK_IMAGES);
    } finally {
      setLoading(false);
    }
  };

  const fetchNetworks = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/docker/networks');
      setNetworks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn('Failed to fetch networks from live daemon:', e);
      setNetworks(FALLBACK_NETWORKS);
    } finally {
      setLoading(false);
    }
  };

  const fetchVolumes = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/docker/volumes');
      setVolumes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn('Failed to fetch volumes from live daemon:', e);
      setVolumes(FALLBACK_VOLUMES);
    } finally {
      setLoading(false);
    }
  };

  const fetchDaemonLogs = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/docker/daemon-logs');
      setDaemonLogs(typeof data === 'string' ? data : 'No daemon events recorded.');
    } catch (e) {
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

    if (isDemoMode) {
      setLogs(FALLBACK_LOGS[id] || `Logs for container ${id}:\n[Application started]\n[Healthcheck OK]`);
      setLogsLoading(false);
    } else {
      fetchLogsForContainer(id);
    }
  };

  // Safe container log fetcher with race condition rejection
  const fetchLogsForContainer = useCallback(async (id: string) => {
    if (!id) {
      setLogs('');
      setLogsLoading(false);
      setLogsError(null);
      return;
    }

    if (isDemoMode) {
      setLogs(FALLBACK_LOGS[id] || `Logs for container ${id}:\n[Service initializing]\n[Healthcheck passed]`);
      setLogsLoading(false);
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
  }, [isDemoMode]);

  // Handle Lifecycle actions with live and offline support
  const handleAction = async (id: string, action: 'start' | 'stop' | 'restart' | 'remove') => {
    if (!id || actionLoading) return;
    setActionLoading(true);
    setError(null);
    setActionNotice(null);

    try {
      if (isDemoMode) {
        // In demo mode: simulate the action state smoothly
        await new Promise(r => setTimeout(r, 600));
        
        if (action === 'remove') {
          setContainers(prev => prev.filter(c => c.id !== id));
          if (selectedIdRef.current === id) {
            const remaining = containers.filter(c => c.id !== id);
            const nextId = remaining[0]?.id || '';
            setSelectedId(nextId);
            selectedIdRef.current = nextId;
            setLogs(nextId ? FALLBACK_LOGS[nextId] || '' : '');
          }
          setActionNotice(`Container '${id}' removed in demo workspace.`);
        } else {
          setContainers(prev => prev.map(c => {
            if (c.id === id) {
              const newState = action === 'start' || action === 'restart' ? 'running' : 'exited';
              const newStatus = action === 'start' || action === 'restart' ? 'Up less than a minute' : 'Exited (0) Just now';
              return { ...c, state: newState, status: newStatus };
            }
            return c;
          }));
          setActionNotice(`Action '${action}' executed successfully (Workspace Mode). Start Docker Desktop to manage live system containers.`);
        }
      } else {
        // Live Docker engine execution
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
        setActionNotice(`Action '${action}' completed successfully.`);
      }
    } catch (e: any) {
      console.error('Docker action error:', e);
      setError(e.message || `Failed to ${action} container '${id}'.`);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  useEffect(() => {
    if (engineStatus?.connected) {
      fetchLiveTabContent(activeTab);
    }
  }, [activeTab, engineStatus?.connected]);

  useEffect(() => {
    if (selectedId && activeTab === 'containers' && engineStatus?.connected) {
      fetchLogsForContainer(selectedId);
    }
  }, [selectedId, activeTab, engineStatus?.connected, fetchLogsForContainer]);

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
          <div className="flex items-center space-x-2.5 px-3 py-2 border-b border-neutral-850 mb-2">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Database className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="font-extrabold text-xs text-slate-200 block truncate">Docker Engine</span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${engineStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className={`text-[9px] uppercase font-mono font-semibold truncate ${engineStatus?.connected ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {engineStatus?.connected ? `Live (${engineStatus.version || 'v27+'})` : 'Workspace Mode'}
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

        {/* Engine Refresh Control */}
        <div className="space-y-2 pt-2 border-t border-neutral-850">
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
        
        {/* Connection Notice / Offline Mode Indicator */}
        {isDemoMode && (
          <div className="mx-4 mt-3 px-3 py-2 bg-amber-950/20 border border-amber-500/20 rounded-xl flex items-center justify-between text-xs text-amber-300 font-sans shadow-2xs">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>Workspace Mode:</strong> Docker daemon is disconnected. Running in simulated workspace preview. Start Docker Desktop and click Refresh to connect live.
              </span>
            </div>
            <button 
              onClick={() => checkStatus()}
              className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-[10px] font-bold rounded-lg cursor-pointer transition-colors border border-amber-500/30"
            >
              Reconnect
            </button>
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
                    No containers running or stopped.
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

            {/* Service Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold uppercase">
                    Configured
                  </span>
                </div>
                <div className="text-[10px] font-mono space-y-1 text-slate-400 pt-2 border-t border-neutral-850">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Port Mapping:</span>
                    <span className="text-slate-300">5432:5432</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Volume Mount:</span>
                    <span className="text-slate-300">postgres_data:/var/lib/postgresql/data</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Restart Policy:</span>
                    <span className="text-slate-300">always</span>
                  </div>
                </div>
              </div>

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
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold uppercase">
                    Configured
                  </span>
                </div>
                <div className="text-[10px] font-mono space-y-1 text-slate-400 pt-2 border-t border-neutral-850">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Port Mapping:</span>
                    <span className="text-slate-300">6379:6379</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Volume Mount:</span>
                    <span className="text-slate-300">redis_data:/data</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Restart Policy:</span>
                    <span className="text-slate-300">always</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Docker Compose YAML Preview */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">
                docker-compose.yml
              </span>
              <pre className="p-4 bg-black/60 border border-neutral-900 rounded-2xl text-[10px] text-slate-300 font-mono overflow-auto leading-relaxed select-all">
{`version: '3.8'

services:
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
              {daemonLogs}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}
