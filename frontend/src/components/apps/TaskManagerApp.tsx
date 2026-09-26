"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { apiRequest } from '../../lib/api';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Layers, 
  Radio, 
  RefreshCw, 
  Search, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ExternalLink, 
  Minus, 
  Maximize2, 
  Terminal as TerminalIcon, 
  ShieldAlert, 
  Zap, 
  Server, 
  Boxes,
  Database,
  Cloud,
  Settings
} from 'lucide-react';
import { 
  TerminalLogo, 
  NautilusLogo, 
  DashboardLogo, 
  AwsLogo, 
  AzureLogo, 
  DockerLogo, 
  KubernetesLogo, 
  TerraformLogo, 
  GithubLogo, 
  VscodeLogo, 
  GrafanaLogo, 
  AiAssistantLogo, 
  FirefoxLogo, 
  SettingsLogo 
} from '../icons/RealBrandLogos';

export interface AppWindow {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  theme?: 'dark' | 'light';
  width?: number;
  height?: number;
}

interface TaskManagerAppProps {
  windows?: AppWindow[];
  topZIndex?: number;
  onFocusWindow?: (id: string) => void;
  onMinimizeWindow?: (id: string) => void;
  onRestoreWindow?: (id: string) => void;
  onCloseWindow?: (id: string) => void;
  onOpenApp?: (appId: string, param?: string) => void;
}

interface SystemMetrics {
  timestamp: string;
  cpu: {
    load: number;
    cores: number;
    speed: number;
    brand: string;
    manufacturer: string;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    percentage: number;
    totalFormatted: string;
    usedFormatted: string;
    freeFormatted: string;
  };
  disk: {
    total: number;
    used: number;
    available: number;
    percentage: number;
    totalFormatted: string;
    usedFormatted: string;
    availableFormatted: string;
  };
  network: {
    rx_sec: number;
    tx_sec: number;
    rxFormatted: string;
    txFormatted: string;
  };
  uptime: {
    seconds: number;
    formatted: string;
  };
}

interface HostProcess {
  pid: number;
  name: string;
  cpu: number;
  mem: number;
  state: string;
  user: string;
}

interface IntegrationStatus {
  name: string;
  category: string;
  status: 'Connected' | 'Disconnected' | 'Unavailable' | 'Operational';
  details?: string;
  logo: React.ComponentType<{ className?: string }>;
}

// Mini Canvas Resource Chart for Performance Tab
function RealtimeCanvasGraph({ 
  data, 
  color, 
  height = 80 
}: { 
  data: number[]; 
  color: string; 
  height?: number 
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 280);
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSpacing = 16;
    for (let x = 0; x < width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Graph Line
    if (data.length > 1) {
      ctx.beginPath();
      const step = width / (data.length - 1);
      ctx.moveTo(0, height - (Math.min(100, Math.max(0, data[0])) / 100) * height * 0.85 - 4);

      for (let i = 1; i < data.length; i++) {
        const x = i * step;
        const y = height - (Math.min(100, Math.max(0, data[i])) / 100) * height * 0.85 - 4;
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Gradient Fill
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, color + '33');
      gradient.addColorStop(1, color + '00');
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }, [data, color, height]);

  return (
    <div className="w-full bg-neutral-950/80 rounded-lg overflow-hidden border border-neutral-800/80">
      <canvas ref={canvasRef} className="w-full block" />
    </div>
  );
}

export default function TaskManagerApp({
  windows = [],
  topZIndex = 10,
  onFocusWindow,
  onMinimizeWindow,
  onRestoreWindow,
  onCloseWindow,
  onOpenApp
}: TaskManagerAppProps) {
  const [activeTab, setActiveTab] = useState<'applications' | 'processes' | 'performance'>('applications');
  const [searchQuery, setSearchQuery] = useState('');

  // Performance Telemetry State
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [metricsUnavailable, setMetricsUnavailable] = useState(false);
  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(30).fill(0));
  const [memHistory, setMemHistory] = useState<number[]>(Array(30).fill(0));
  const [netHistory, setNetHistory] = useState<number[]>(Array(30).fill(0));

  // Host Processes & Services State
  const [hostProcesses, setHostProcesses] = useState<HostProcess[]>([]);
  const [procLoading, setProcLoading] = useState(false);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);

  // Selected Item in Application Table
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // App Logo Resolver
  const getAppLogo = (id: string) => {
    switch (id) {
      case 'terminal': return <TerminalLogo className="w-4 h-4" />;
      case 'nautilus': return <NautilusLogo className="w-4 h-4" />;
      case 'dashboard': return <DashboardLogo className="w-4 h-4" />;
      case 'aws': return <AwsLogo className="w-4 h-4" />;
      case 'azure': return <AzureLogo className="w-4 h-4" />;
      case 'docker': return <DockerLogo className="w-4 h-4" />;
      case 'kubernetes': return <KubernetesLogo className="w-4 h-4" />;
      case 'terraform': return <TerraformLogo className="w-4 h-4" />;
      case 'github': return <GithubLogo className="w-4 h-4" />;
      case 'vscode': return <VscodeLogo className="w-4 h-4" />;
      case 'monitoring':
      case 'grafana': return <GrafanaLogo className="w-4 h-4" />;
      case 'aiassistant': return <AiAssistantLogo className="w-4 h-4" />;
      case 'browser': return <FirefoxLogo className="w-4 h-4" />;
      case 'settings': return <SettingsLogo className="w-4 h-4" />;
      case 'taskmanager': return <Activity className="w-4 h-4 text-emerald-400" />;
      default: return <Layers className="w-4 h-4 text-sky-400" />;
    }
  };

  // 1. Fetch Real Host System Telemetry (/system/metrics)
  const fetchMetrics = async () => {
    try {
      const data: SystemMetrics = await apiRequest('/system/metrics');
      if (data && data.cpu && data.memory) {
        setMetrics(data);
        setMetricsUnavailable(false);
        setCpuHistory(prev => [...prev.slice(1), data.cpu.load]);
        setMemHistory(prev => [...prev.slice(1), data.memory.percentage]);
        const netKb = (data.network?.rx_sec || 0) / 1024;
        setNetHistory(prev => [...prev.slice(1), Math.min(100, netKb)]);
        return;
      }
    } catch {
      // Backend daemon or agent is unreachable
    }
    setMetricsUnavailable(true);
  };

  // 2. Fetch Real Host Processes (/system/processes)
  const fetchProcesses = async () => {
    setProcLoading(true);
    try {
      const data = await apiRequest('/system/processes');
      if (data && Array.isArray(data.list)) {
        setHostProcesses(data.list);
      }
    } catch {
      setHostProcesses([]);
    }
    setProcLoading(false);
  };

  // 3. Check Real Status of Docker, K8s, GitHub, Grafana, AWS, Azure
  const checkIntegrations = async () => {
    const list: IntegrationStatus[] = [];

    // Backend Daemon
    list.push({
      name: 'CaelumOS Core Daemon',
      category: 'System Service',
      status: metricsUnavailable ? 'Unavailable' : 'Operational',
      details: 'Port 4000 (Node.js runtime)',
      logo: Server,
    });

    // Docker
    try {
      const d = await apiRequest('/docker/status');
      list.push({
        name: 'Docker Engine',
        category: 'Container Runtime',
        status: d?.connected ? 'Connected' : 'Unavailable',
        details: d?.connected ? `Version: ${d?.version || 'Active'}` : 'Daemon not detected',
        logo: DockerLogo,
      });
    } catch {
      list.push({
        name: 'Docker Engine',
        category: 'Container Runtime',
        status: 'Unavailable',
        details: 'Daemon offline',
        logo: DockerLogo,
      });
    }

    // Kubernetes
    try {
      const k = await apiRequest('/kubernetes/cluster-info');
      list.push({
        name: 'Kubernetes Cluster',
        category: 'Orchestrator',
        status: k && !k.error ? 'Connected' : 'Unavailable',
        details: k?.clusterName ? `Cluster: ${k.clusterName}` : 'No active context',
        logo: KubernetesLogo,
      });
    } catch {
      list.push({
        name: 'Kubernetes Cluster',
        category: 'Orchestrator',
        status: 'Unavailable',
        details: 'API server unreachable',
        logo: KubernetesLogo,
      });
    }

    // GitHub
    try {
      const gh = await apiRequest('/github/status');
      list.push({
        name: 'GitHub Cloud',
        category: 'VCS Integration',
        status: gh?.connected ? 'Connected' : 'Disconnected',
        details: gh?.connected ? `@${gh?.username || 'user'}` : 'OAuth token needed',
        logo: GithubLogo,
      });
    } catch {
      list.push({
        name: 'GitHub Cloud',
        category: 'VCS Integration',
        status: 'Disconnected',
        details: 'Service offline',
        logo: GithubLogo,
      });
    }

    // Grafana
    try {
      const g = await apiRequest('/grafana/status');
      list.push({
        name: 'Grafana Observability',
        category: 'Monitoring',
        status: g?.connected ? 'Connected' : 'Disconnected',
        details: g?.connected ? 'Telemetry active' : 'Not configured',
        logo: GrafanaLogo,
      });
    } catch {
      list.push({
        name: 'Grafana Observability',
        category: 'Monitoring',
        status: 'Disconnected',
        details: 'Instance offline',
        logo: GrafanaLogo,
      });
    }

    // AWS
    try {
      const aws = await apiRequest('/aws/health');
      list.push({
        name: 'AWS Cloud Console',
        category: 'Cloud Provider',
        status: aws?.connected ? 'Connected' : 'Disconnected',
        details: aws?.connected ? 'STS session active' : 'No credentials stored',
        logo: AwsLogo,
      });
    } catch {
      list.push({
        name: 'AWS Cloud Console',
        category: 'Cloud Provider',
        status: 'Disconnected',
        details: 'Offline',
        logo: AwsLogo,
      });
    }

    // Azure
    try {
      const az = await apiRequest('/azure/health');
      list.push({
        name: 'Azure Cloud Console',
        category: 'Cloud Provider',
        status: az?.connected ? 'Connected' : 'Disconnected',
        details: az?.connected ? 'ARM session active' : 'Subscription unconfigured',
        logo: AzureLogo,
      });
    } catch {
      list.push({
        name: 'Azure Cloud Console',
        category: 'Cloud Provider',
        status: 'Disconnected',
        details: 'Offline',
        logo: AzureLogo,
      });
    }

    setIntegrations(list);
  };

  // Periodic Telemetry Polling (every 2s)
  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(() => {
      fetchMetrics();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Processes and Integrations when switching to Processes tab
  useEffect(() => {
    if (activeTab === 'processes') {
      fetchProcesses();
      checkIntegrations();
    }
  }, [activeTab]);

  // Filter Active Windows
  const openWindows = useMemo(() => {
    return windows.filter(w => w.isOpen);
  }, [windows]);

  const filteredWindows = useMemo(() => {
    if (!searchQuery.trim()) return openWindows;
    const q = searchQuery.toLowerCase();
    return openWindows.filter(w => 
      w.title.toLowerCase().includes(q) || w.id.toLowerCase().includes(q)
    );
  }, [openWindows, searchQuery]);

  // Host Processes filtered
  const filteredProcesses = useMemo(() => {
    if (!searchQuery.trim()) return hostProcesses;
    const q = searchQuery.toLowerCase();
    return hostProcesses.filter(p => 
      p.name.toLowerCase().includes(q) || p.pid.toString().includes(q) || p.user.toLowerCase().includes(q)
    );
  }, [hostProcesses, searchQuery]);

  return (
    <div className="flex-1 flex flex-col bg-[#141414] text-slate-200 font-sans h-full select-none overflow-hidden text-xs">
      
      {/* 1. Header Toolbar with OS Tabs */}
      <div className="h-11 bg-[#1a1a1a] border-b border-neutral-800 px-3 flex items-center justify-between flex-shrink-0 z-10">
        
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'applications'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-neutral-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>Applications</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-700/60 font-mono text-slate-300">
              {openWindows.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('processes')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'processes'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-neutral-800/50'
            }`}
          >
            <Boxes className="w-3.5 h-3.5 text-amber-400" />
            <span>Processes & Services</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-700/60 font-mono text-slate-300">
              {hostProcesses.length > 0 ? hostProcesses.length : 'Live'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('performance')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'performance'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-neutral-800/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Performance</span>
            {metrics && (
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                {metrics.cpu.load}%
              </span>
            )}
          </button>
        </div>

        {/* Right Search Filter & Refresh */}
        <div className="flex items-center space-x-2">
          <div className="relative w-40 sm:w-52">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter processes..."
              className="w-full bg-neutral-900 border border-neutral-700 rounded-md pl-8 pr-2.5 py-1 text-xs outline-none focus:border-sky-500 text-slate-200 placeholder-neutral-500"
            />
          </div>

          <button
            onClick={() => {
              fetchMetrics();
              if (activeTab === 'processes') {
                fetchProcesses();
                checkIntegrations();
              }
            }}
            className="p-1.5 rounded hover:bg-neutral-800 text-slate-400 hover:text-slate-200 cursor-pointer"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Main Content Body */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* ========================================================================= */}
        {/* TAB 1: APPLICATIONS (Real Window Management)                              */}
        {/* ========================================================================= */}
        {activeTab === 'applications' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {filteredWindows.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <Layers className="w-12 h-12 text-neutral-700 mb-3 stroke-1" />
                <span className="font-bold text-sm text-slate-400">No active applications</span>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                  Launch applications from the dock, desktop icons, or application launcher to view and manage them here.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#1a1a1a]/90 backdrop-blur-xs text-[11px] font-mono text-slate-400 uppercase tracking-wider sticky top-0 border-b border-neutral-800 z-10">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Application</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                      <th className="py-2.5 px-3 font-semibold">CPU</th>
                      <th className="py-2.5 px-3 font-semibold">Memory</th>
                      <th className="py-2.5 px-3 font-semibold">Network</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-sans">
                    {filteredWindows.map((win) => {
                      const isFocused = win.zIndex >= topZIndex && !win.isMinimized;
                      const isSelected = selectedAppId === win.id;

                      return (
                        <tr
                          key={win.id}
                          onClick={() => setSelectedAppId(win.id)}
                          className={`hover:bg-neutral-800/40 transition-colors cursor-pointer ${
                            isSelected ? 'bg-sky-950/30 border-l-2 border-l-sky-500' : ''
                          }`}
                        >
                          {/* App Name & Icon */}
                          <td className="py-2.5 px-4">
                            <div className="flex items-center space-x-2.5">
                              <div className="p-1 rounded bg-neutral-900 border border-neutral-800 flex-shrink-0">
                                {getAppLogo(win.id)}
                              </div>
                              <div className="truncate">
                                <span className="font-semibold text-slate-200 block truncate">{win.title}</span>
                                <span className="text-[10px] text-neutral-500 font-mono">id: {win.id}</span>
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-2.5 px-3">
                            {win.isMinimized ? (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold">
                                Minimized
                              </span>
                            ) : isFocused ? (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold flex items-center space-x-1 w-max">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span>Active</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
                                Running
                              </span>
                            )}
                          </td>

                          {/* Real CPU indicator (App Runtime) */}
                          <td className="py-2.5 px-3 font-mono text-neutral-400 text-[11px]">
                            App runtime
                          </td>

                          {/* Real Memory indicator (App Runtime) */}
                          <td className="py-2.5 px-3 font-mono text-neutral-400 text-[11px]">
                            App runtime
                          </td>

                          {/* Network */}
                          <td className="py-2.5 px-3 font-mono text-neutral-400 text-[11px]">
                            Active
                          </td>

                          {/* Actions */}
                          <td className="py-2.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* Focus */}
                              {onFocusWindow && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onFocusWindow(win.id);
                                  }}
                                  className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-sky-400 font-semibold text-[11px] cursor-pointer flex items-center space-x-1"
                                  title="Bring to front"
                                >
                                  <Maximize2 className="w-3 h-3" />
                                  <span>Focus</span>
                                </button>
                              )}

                              {/* Minimize / Restore */}
                              {win.isMinimized ? (
                                onRestoreWindow && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRestoreWindow(win.id);
                                    }}
                                    className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-semibold text-[11px] cursor-pointer"
                                    title="Restore Window"
                                  >
                                    Restore
                                  </button>
                                )
                              ) : (
                                onMinimizeWindow && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onMinimizeWindow(win.id);
                                    }}
                                    className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-slate-300 font-semibold text-[11px] cursor-pointer"
                                    title="Minimize to Dock"
                                  >
                                    Minimize
                                  </button>
                                )
                              )}

                              {/* Close */}
                              {onCloseWindow && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onCloseWindow(win.id);
                                  }}
                                  className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 font-semibold text-[11px] cursor-pointer transition-colors"
                                  title="Close Application Window"
                                >
                                  End Task
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bottom Footer Info */}
            <div className="h-9 bg-[#1a1a1a] border-t border-neutral-800 px-4 flex items-center justify-between text-[11px] font-mono text-slate-400 flex-shrink-0">
              <div className="flex items-center space-x-4">
                <span>Active: <strong className="text-slate-200">{openWindows.length}</strong></span>
                <span>Minimized: <strong className="text-slate-200">{openWindows.filter(w => w.isMinimized).length}</strong></span>
              </div>
              <div>
                {selectedAppId && onCloseWindow && (
                  <button
                    onClick={() => onCloseWindow(selectedAppId)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded cursor-pointer transition-colors"
                  >
                    End Selected Task
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PROCESSES & INTEGRATIONS (Real Backend Processes & Service States) */}
        {/* ========================================================================= */}
        {activeTab === 'processes' && (
          <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-5">
            
            {/* 1. Integration Service Status (Docker, K8s, GitHub, Grafana, AWS, Azure) */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                <Cloud className="w-4 h-4 text-sky-400" />
                <span>Connected CaelumOS Services</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {integrations.map((svc) => {
                  const LogoComp = svc.logo;
                  const isConnected = svc.status === 'Connected' || svc.status === 'Operational';

                  return (
                    <div
                      key={svc.name}
                      className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <div className="p-1.5 rounded-lg bg-neutral-950 border border-neutral-800">
                          <LogoComp className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <span className="font-bold text-xs text-slate-200 block truncate">{svc.name}</span>
                          <span className="text-[10px] text-neutral-400 font-mono block truncate">{svc.details || svc.category}</span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isConnected
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                          : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                      }`}>
                        {svc.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Real Host Process Table */}
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <div className="flex items-center space-x-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span>Host Background Processes</span>
                </div>
                {procLoading && (
                  <span className="text-[10px] text-slate-400 flex items-center space-x-1 font-mono">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Loading...</span>
                  </span>
                )}
              </div>

              {filteredProcesses.length === 0 ? (
                <div className="p-8 text-center bg-neutral-900/60 rounded-xl border border-neutral-800 text-neutral-500">
                  {metricsUnavailable ? 'System process list unavailable' : 'No processes found'}
                </div>
              ) : (
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-neutral-950 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-neutral-800">
                      <tr>
                        <th className="py-2 px-3 font-semibold">PID</th>
                        <th className="py-2 px-3 font-semibold">Process Name</th>
                        <th className="py-2 px-3 font-semibold text-right">CPU %</th>
                        <th className="py-2 px-3 font-semibold text-right">Memory %</th>
                        <th className="py-2 px-3 font-semibold">State</th>
                        <th className="py-2 px-3 font-semibold">User</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/50 text-[11px] font-mono">
                      {filteredProcesses.slice(0, 20).map((proc) => (
                        <tr key={proc.pid} className="hover:bg-neutral-800/30">
                          <td className="py-2 px-3 text-neutral-500">{proc.pid}</td>
                          <td className="py-2 px-3 font-semibold text-slate-200 truncate max-w-[200px]">{proc.name}</td>
                          <td className="py-2 px-3 text-right font-bold text-emerald-400">{proc.cpu.toFixed(1)}%</td>
                          <td className="py-2 px-3 text-right text-slate-300">{proc.mem.toFixed(1)}%</td>
                          <td className="py-2 px-3">
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-neutral-800 text-neutral-300">
                              {proc.state || 'running'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-neutral-500 truncate max-w-[100px]">{proc.user || 'system'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PERFORMANCE (Real Host Hardware Telemetry)                         */}
        {/* ========================================================================= */}
        {activeTab === 'performance' && (
          <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4">
            {metricsUnavailable ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <AlertCircle className="w-12 h-12 text-amber-500 mb-3 stroke-1" />
                <span className="font-bold text-sm text-slate-400">System metrics unavailable</span>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                  Could not connect to the CaelumOS backend agent on port 4000. Start the backend daemon to view live host telemetry.
                </p>
              </div>
            ) : metrics ? (
              <div className="space-y-4">
                
                {/* Top Metrics Row: CPU & Memory */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* CPU Card */}
                  <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Cpu className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold text-sm text-slate-200">CPU Usage</span>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-mono mt-0.5 block truncate max-w-[240px]">
                          {metrics.cpu.brand}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black font-mono text-emerald-400 leading-none">
                          {metrics.cpu.load.toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono block mt-1">
                          {metrics.cpu.cores} Cores @ {metrics.cpu.speed} GHz
                        </span>
                      </div>
                    </div>

                    <RealtimeCanvasGraph data={cpuHistory} color="#10b981" height={70} />
                  </div>

                  {/* Memory Card */}
                  <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Database className="w-4 h-4 text-sky-400" />
                          <span className="font-bold text-sm text-slate-200">Memory (RAM)</span>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-mono mt-0.5 block">
                          {metrics.memory.usedFormatted} of {metrics.memory.totalFormatted} ({metrics.memory.freeFormatted} free)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black font-mono text-sky-400 leading-none">
                          {metrics.memory.percentage.toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono block mt-1">
                          Available: {metrics.memory.freeFormatted}
                        </span>
                      </div>
                    </div>

                    <RealtimeCanvasGraph data={memHistory} color="#0284c7" height={70} />
                  </div>
                </div>

                {/* Bottom Row: Disk & Network & Uptime */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Disk Usage */}
                  <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <HardDrive className="w-4 h-4 text-purple-400" />
                        <span className="font-bold text-xs text-slate-200">Storage Disks</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-purple-400">
                        {metrics.disk.percentage}%
                      </span>
                    </div>

                    <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-neutral-800">
                      <div 
                        className="bg-purple-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, metrics.disk.percentage)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] font-mono text-neutral-400 pt-1">
                      <span>Used: {metrics.disk.usedFormatted}</span>
                      <span>Free: {metrics.disk.availableFormatted}</span>
                    </div>
                  </div>

                  {/* Network Telemetry */}
                  <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Radio className="w-4 h-4 text-pink-400" />
                        <span className="font-bold text-xs text-slate-200">Network I/O</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">Live</span>
                    </div>

                    <div className="space-y-1.5 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Download Rate:</span>
                        <span className="font-bold text-emerald-400">↓ {metrics.network.rxFormatted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Upload Rate:</span>
                        <span className="font-bold text-sky-400">↑ {metrics.network.txFormatted}</span>
                      </div>
                    </div>
                  </div>

                  {/* System Uptime */}
                  <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-xs text-slate-200">System Uptime</span>
                    </div>

                    <div className="font-mono pt-1">
                      <span className="text-xl font-extrabold text-amber-400 leading-none">
                        {metrics.uptime.formatted}
                      </span>
                      <span className="text-[10px] text-neutral-500 block mt-1">
                        Total {metrics.uptime.seconds.toLocaleString()} seconds active
                      </span>
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-neutral-500">
                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                <span>Reading host sensors...</span>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
