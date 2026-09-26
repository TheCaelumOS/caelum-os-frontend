"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { apiRequest } from '../../lib/api';
import {
  Network,
  Activity,
  Layers,
  Search,
  RefreshCw,
  Server,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Cpu,
  HardDrive,
  Radio,
  Sliders,
  Terminal as TerminalIcon,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Copy,
  Check,
  ArrowRight,
  Info,
  GitBranch,
  X
} from 'lucide-react';
import {
  DockerLogo,
  KubernetesLogo,
  AwsLogo,
  AzureLogo,
  GithubLogo,
  GrafanaLogo,
  TerminalLogo
} from '../icons/RealBrandLogos';

export interface InfrastructureResource {
  id: string;
  provider: 'docker' | 'kubernetes' | 'github' | 'grafana' | 'aws' | 'azure' | 'host';
  type: string;
  name: string;
  displayName: string;
  status: 'healthy' | 'running' | 'warning' | 'error' | 'stopped' | 'unknown' | 'pending';
  rawStatus: string;
  region?: string;
  namespace?: string;
  parentId?: string;
  sourceApp: string;
  sourceId: string;
  metadata: Record<string, any>;
  metrics?: {
    cpu?: number;
    memory?: number;
    memoryBytes?: number;
    networkRx?: number;
    networkTx?: number;
    uptime?: number;
  };
  lastUpdated: string;
}

export interface InfrastructureRelationship {
  id: string;
  source: string;
  target: string;
  type: 'CONTAINS' | 'DEPENDS_ON' | 'ROUTES_TO' | 'DEPLOYED_FROM' | 'MONITORED_BY' | 'HOSTED_ON' | 'BELONGS_TO';
  label: string;
  bidirectional?: boolean;
}

export interface InfrastructureOverview {
  providers: Array<{
    provider: string;
    name: string;
    connected: boolean;
    status: 'connected' | 'disconnected' | 'error' | 'unconfigured';
    version?: string;
    context?: string;
    error?: string;
    resourceCount: number;
    lastChecked: string;
  }>;
  totalResources: number;
  healthyCount: number;
  warningCount: number;
  errorCount: number;
  stoppedCount: number;
  activeIssuesCount: number;
  lastDiscovery: string;
  hostSystem: {
    hostname: string;
    platform: string;
    arch: string;
    cpuCores: number;
    memoryTotal: number;
    memoryUsed: number;
    cpuLoad: number;
  };
}

export interface InfrastructureIssue {
  id: string;
  resourceId: string;
  resourceName: string;
  resourceType: string;
  provider: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  evidence: {
    rawStatus?: string;
    exitCode?: number;
    events?: Array<{ type: string; reason: string; message: string; timestamp: string }>;
    logsSnippet?: string[];
    affectedDependencies?: string[];
  };
  recommendedAction?: string;
  deepLinkApp: string;
}

export interface ResourceDiagnostics {
  resource: InfrastructureResource;
  health: {
    status: string;
    summary: string;
  };
  evidence: {
    statusDetails: string;
    events: any[];
    logsSnippet: string[];
    dependencies: InfrastructureResource[];
    dependents: InfrastructureResource[];
  };
  suggestedSteps: string[];
  nativeApp: string;
}

export interface InfrastructureTimelineEvent {
  id: string;
  timestamp: string;
  provider: string;
  resourceId: string;
  resourceName: string;
  resourceType: string;
  type: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  message: string;
  details?: Record<string, any>;
}

interface InfrastructureIntelligenceAppProps {
  onOpenApp?: (appId: string) => void;
}

export default function InfrastructureIntelligenceApp({ onOpenApp }: InfrastructureIntelligenceAppProps) {
  // Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'topology' | 'resources' | 'issues' | 'timeline'>('overview');

  // Core Data State
  const [overview, setOverview] = useState<InfrastructureOverview | null>(null);
  const [resources, setResources] = useState<InfrastructureResource[]>([]);
  const [edges, setEdges] = useState<InfrastructureRelationship[]>([]);
  const [issues, setIssues] = useState<InfrastructureIssue[]>([]);
  const [timeline, setTimeline] = useState<InfrastructureTimelineEvent[]>([]);

  // UI / Filter State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProviderFilter, setSelectedProviderFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('');

  // Selected Resource / Diagnostics Modal
  const [selectedResource, setSelectedResource] = useState<InfrastructureResource | null>(null);
  const [diagnostics, setDiagnostics] = useState<ResourceDiagnostics | null>(null);
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagModalOpen, setDiagModalOpen] = useState(false);
  const [copiedLog, setCopiedLog] = useState(false);

  // Graph Viewport State
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // 1. Initial Load & Fetch
  const loadAllData = async (force = false) => {
    try {
      if (force) setRefreshing(true);
      else setLoading(true);

      const [ovRes, topRes, issRes, timRes] = await Promise.allSettled([
        apiRequest('/infrastructure/overview'),
        apiRequest('/infrastructure/topology'),
        apiRequest('/infrastructure/issues'),
        apiRequest('/infrastructure/timeline'),
      ]);

      if (ovRes.status === 'fulfilled' && ovRes.value) {
        setOverview(ovRes.value);
      }
      if (topRes.status === 'fulfilled' && topRes.value) {
        setResources(topRes.value.nodes || []);
        setEdges(topRes.value.edges || []);
      }
      if (issRes.status === 'fulfilled' && Array.isArray(issRes.value)) {
        setIssues(issRes.value);
      }
      if (timRes.status === 'fulfilled' && Array.isArray(timRes.value)) {
        setTimeline(timRes.value);
      }

      setLastRefreshedAt(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to load infrastructure data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // 2. Fetch Diagnostics for a Resource
  const fetchDiagnostics = async (res: InfrastructureResource) => {
    setSelectedResource(res);
    setDiagModalOpen(true);
    setDiagLoading(true);
    try {
      const data = await apiRequest(`/infrastructure/diagnose/${encodeURIComponent(res.id)}`);
      setDiagnostics(data);
    } catch (err) {
      console.error('Failed to run diagnostics', err);
      setDiagnostics(null);
    } finally {
      setDiagLoading(false);
    }
  };

  // Provider Icon Helper
  const getProviderIcon = (provider: string, className = "w-4 h-4") => {
    switch (provider.toLowerCase()) {
      case 'docker': return <DockerLogo className={className} />;
      case 'kubernetes': return <KubernetesLogo className={className} />;
      case 'github': return <GithubLogo className={className} />;
      case 'grafana': return <GrafanaLogo className={className} />;
      case 'aws': return <AwsLogo className={className} />;
      case 'azure': return <AzureLogo className={className} />;
      case 'host': return <Server className={`${className} text-emerald-400`} />;
      default: return <Server className={className} />;
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'running':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {status}
          </span>
        );
      case 'warning':
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {status}
          </span>
        );
      case 'error':
      case 'failed':
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            {status}
          </span>
        );
    }
  };

  // Filtered Resources
  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      const matchProvider = selectedProviderFilter === 'all' || r.provider === selectedProviderFilter;
      const matchStatus =
        selectedStatusFilter === 'all' ||
        (selectedStatusFilter === 'unhealthy' && (r.status === 'warning' || r.status === 'error')) ||
        (selectedStatusFilter === 'running' && (r.status === 'running' || r.status === 'healthy'));
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.displayName.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.provider.toLowerCase().includes(q) ||
        (r.namespace && r.namespace.toLowerCase().includes(q));
      return matchProvider && matchStatus && matchSearch;
    });
  }, [resources, selectedProviderFilter, selectedStatusFilter, searchQuery]);

  // Node Position Calculator for Interactive Topology
  const graphNodes = useMemo(() => {
    // Determine layout columns by provider or layer
    const providerOrder = ['host', 'docker', 'kubernetes', 'azure', 'aws', 'github', 'grafana'];
    const nodesByCol: Record<string, InfrastructureResource[]> = {};
    for (const p of providerOrder) nodesByCol[p] = [];

    filteredResources.forEach(r => {
      if (nodesByCol[r.provider]) {
        nodesByCol[r.provider].push(r);
      } else {
        nodesByCol['host'].push(r);
      }
    });

    const calculated: Array<{
      resource: InfrastructureResource;
      x: number;
      y: number;
    }> = [];

    let colIndex = 0;
    const colSpacing = 280;
    const rowSpacing = 110;

    providerOrder.forEach(p => {
      const colItems = nodesByCol[p] || [];
      if (colItems.length > 0) {
        colItems.forEach((res, rowIdx) => {
          calculated.push({
            resource: res,
            x: 80 + colIndex * colSpacing,
            y: 80 + rowIdx * rowSpacing,
          });
        });
        colIndex++;
      }
    });

    return calculated;
  }, [filteredResources]);

  // Topology Edge Coordinate Mapping
  const graphEdges = useMemo(() => {
    const nodeCoords = new Map<string, { x: number; y: number }>();
    graphNodes.forEach(gn => nodeCoords.set(gn.resource.id, { x: gn.x, y: gn.y }));

    return edges
      .filter(e => nodeCoords.has(e.source) && nodeCoords.has(e.target))
      .map(e => {
        const s = nodeCoords.get(e.source)!;
        const t = nodeCoords.get(e.target)!;
        return {
          ...e,
          x1: s.x + 110,
          y1: s.y + 40,
          x2: t.x + 110,
          y2: t.y + 40,
        };
      });
  }, [edges, graphNodes]);

  // Handle Graph Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  // Deep Link Opener
  const handleDeepLink = (appId: string) => {
    if (onOpenApp) {
      onOpenApp(appId.toLowerCase());
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] text-slate-200 select-none overflow-hidden font-sans">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-wide text-white">Infrastructure Intelligence</h1>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Live Mesh
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {overview?.totalResources ?? 0} discovered resources across {overview?.providers.filter(p => p.connected).length ?? 0} active providers
            </p>
          </div>
        </div>

        {/* Global Controls & Search */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search resources, pods, IPs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 pl-8 pr-3 py-1 text-xs bg-slate-900 border border-slate-700/70 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <button
            onClick={() => loadAllData(true)}
            disabled={refreshing}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors ${
              refreshing ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            title="Refresh infrastructure discovery"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
            <span>{refreshing ? 'Discovering...' : 'Refresh'}</span>
          </button>

          {lastRefreshedAt && (
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Updated: {lastRefreshedAt}
            </span>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between px-4 bg-[#11161d] border-b border-slate-800/80 shrink-0 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-white bg-slate-800/30'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('topology')}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'topology'
                ? 'border-indigo-500 text-white bg-slate-800/30'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Topology Graph</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-400">
              {resources.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'resources'
                ? 'border-indigo-500 text-white bg-slate-800/30'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Inventory</span>
          </button>

          <button
            onClick={() => setActiveTab('issues')}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'issues'
                ? 'border-indigo-500 text-white bg-slate-800/30'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${issues.length > 0 ? 'text-amber-400' : ''}`} />
            <span>Issues & Warnings</span>
            {issues.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                {issues.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'timeline'
                ? 'border-indigo-500 text-white bg-slate-800/30'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Event Timeline</span>
          </button>
        </div>

        {/* Quick Deep Link Launchers */}
        <div className="flex items-center gap-1.5 py-1">
          <span className="text-[11px] text-slate-500 mr-1 hidden md:inline">Open App:</span>
          <button
            onClick={() => handleDeepLink('kubernetes')}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Open Kubernetes Orchestrator"
          >
            <KubernetesLogo className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeepLink('docker')}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Open Docker Containerizer"
          >
            <DockerLogo className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeepLink('azure')}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Open Azure Cloud Console"
          >
            <AzureLogo className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeepLink('aws')}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Open AWS Console"
          >
            <AwsLogo className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeepLink('github')}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Open GitHub"
          >
            <GithubLogo className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeepLink('grafana')}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Open Grafana Observability"
          >
            <GrafanaLogo className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeepLink('terminal')}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Open CaelumOS Terminal"
          >
            <TerminalLogo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Tab Body */}
      <div className="flex-1 overflow-auto bg-[#0d1117]">
        {loading && !overview ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
            <span className="text-sm font-medium">Scanning multi-provider infrastructure mesh...</span>
            <span className="text-xs text-slate-500">Connecting to Docker, Kubernetes, Azure, AWS, and Host telemetry</span>
          </div>
        ) : (
          <>
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="p-5 space-y-5 max-w-7xl mx-auto">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
                  <div className="p-3.5 rounded-xl bg-[#161b22] border border-slate-800/80">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-xs">Total Resources</span>
                      <Layers className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="text-2xl font-bold text-white tracking-tight">
                      {overview?.totalResources ?? resources.length}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">Discovered across all systems</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#161b22] border border-slate-800/80">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-xs">Healthy / Active</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold text-emerald-400 tracking-tight">
                      {overview?.healthyCount ?? resources.filter(r => r.status === 'healthy' || r.status === 'running').length}
                    </div>
                    <div className="text-[11px] text-emerald-500/80 mt-1">Normal operational state</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#161b22] border border-slate-800/80">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-xs">Warnings</span>
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-2xl font-bold text-amber-400 tracking-tight">
                      {overview?.warningCount ?? resources.filter(r => r.status === 'warning').length}
                    </div>
                    <div className="text-[11px] text-amber-500/80 mt-1">Needs inspection</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#161b22] border border-slate-800/80">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-xs">Critical Errors</span>
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    </div>
                    <div className="text-2xl font-bold text-rose-400 tracking-tight">
                      {overview?.errorCount ?? resources.filter(r => r.status === 'error').length}
                    </div>
                    <div className="text-[11px] text-rose-500/80 mt-1">Requires immediate action</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#161b22] border border-slate-800/80 col-span-2 md:col-span-1">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="text-xs">Active Issues</span>
                      <ShieldAlert className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="text-2xl font-bold text-white tracking-tight">
                      {issues.length}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">Detected problems</div>
                  </div>
                </div>

                {/* Host Telemetry Banner */}
                {overview?.hostSystem && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-[#161b22] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <Server className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-semibold text-white">Host Machine: {overview.hostSystem.hostname}</h2>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                            Operational
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {overview.hostSystem.platform} ({overview.hostSystem.arch}) • {overview.hostSystem.cpuCores} Cores Available
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1 gap-2">
                          <span>CPU Load</span>
                          <span className="font-mono text-white">{overview.hostSystem.cpuLoad}%</span>
                        </div>
                        <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, overview.hostSystem.cpuLoad)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1 gap-2">
                          <span>Memory</span>
                          <span className="font-mono text-white">
                            {(overview.hostSystem.memoryUsed / (1024 ** 3)).toFixed(1)} / {(overview.hostSystem.memoryTotal / (1024 ** 3)).toFixed(1)} GB
                          </span>
                        </div>
                        <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, (overview.hostSystem.memoryUsed / (overview.hostSystem.memoryTotal || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeepLink('taskmanager')}
                        className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors shrink-0"
                      >
                        Task Manager
                      </button>
                    </div>
                  </div>
                )}

                {/* Connected Providers Grid */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Connected Infrastructure Providers
                    </h2>
                    <span className="text-xs text-slate-500">100% Real-time integration telemetry</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {overview?.providers.map((p) => {
                      const isConnected = p.connected;
                      return (
                        <div
                          key={p.provider}
                          className="p-4 rounded-xl bg-[#161b22] border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2.5">
                                {getProviderIcon(p.provider, "w-5 h-5")}
                                <span className="font-semibold text-sm text-white">{p.name}</span>
                              </div>
                              {isConnected ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Connected
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                                  {p.status === 'unconfigured' ? 'Not Configured' : 'Disconnected'}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px]">
                              {isConnected
                                ? `${p.resourceCount} active resources registered. ${p.version ? `Runtime: ${p.version}` : ''}`
                                : p.error || 'Integration is offline or credentials not configured.'}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                            <span className="text-slate-500">
                              {p.resourceCount > 0 ? `${p.resourceCount} items` : 'No resources'}
                            </span>
                            <button
                              onClick={() => handleDeepLink(p.provider)}
                              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                            >
                              <span>Manage in App</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Active Issues Banner or Healthy State */}
                {issues.length > 0 ? (
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Active Infrastructure Issues Detected ({issues.length})</span>
                      </div>
                      <button
                        onClick={() => setActiveTab('issues')}
                        className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        View all issues <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {issues.slice(0, 3).map((iss) => (
                        <div
                          key={iss.id}
                          className="p-3 rounded-lg bg-slate-900/60 border border-amber-500/10 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            {getProviderIcon(iss.provider, "w-4 h-4")}
                            <div>
                              <div className="font-semibold text-white">{iss.title}</div>
                              <div className="text-slate-400 text-[11px]">{iss.description}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const r = resources.find(x => x.id === iss.resourceId);
                              if (r) fetchDiagnostics(r);
                            }}
                            className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-medium border border-amber-500/20 transition-colors shrink-0"
                          >
                            Diagnose
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">All Discovered Systems Healthy</div>
                        <div className="text-xs text-slate-400">
                          Zero crash loops, dead containers, or degraded node conditions detected in active infrastructure.
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('topology')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                    >
                      View Topology Graph
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: TOPOLOGY GRAPH */}
            {activeTab === 'topology' && (
              <div className="relative w-full h-full flex flex-col bg-[#0b0e14] overflow-hidden">
                {/* Graph Controls Toolbar */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-[#161b22]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 shadow-xl">
                  {/* Provider Filter */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Filter className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Filter:</span>
                    <select
                      value={selectedProviderFilter}
                      onChange={(e) => setSelectedProviderFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded px-2 py-0.5 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="all">All Providers ({resources.length})</option>
                      <option value="host">Host Machine</option>
                      <option value="docker">Docker</option>
                      <option value="kubernetes">Kubernetes</option>
                      <option value="azure">Azure</option>
                      <option value="aws">AWS</option>
                      <option value="github">GitHub</option>
                      <option value="grafana">Grafana</option>
                    </select>
                  </div>

                  <div className="h-4 w-px bg-slate-700 mx-1" />

                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 2.5))}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-mono text-slate-400 w-9 text-center">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.4))}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setZoomLevel(1);
                        setPanOffset({ x: 0, y: 0 });
                      }}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      title="Reset Viewport"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Edge Count Badge */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-2 bg-[#161b22]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400 shadow-xl">
                  <span>Nodes: <strong className="text-white">{graphNodes.length}</strong></span>
                  <span className="text-slate-600">•</span>
                  <span>Relationships: <strong className="text-indigo-400">{graphEdges.length}</strong></span>
                </div>

                {/* Interactive SVG Canvas */}
                <div
                  className="flex-1 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                >
                  <svg
                    className="w-full h-full min-w-[2000px] min-h-[1400px]"
                    style={{
                      transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                      transformOrigin: '0 0',
                      transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                    }}
                  >
                    {/* Arrow Marker Definitions */}
                    <defs>
                      <marker
                        id="arrow"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
                      </marker>
                    </defs>

                    {/* Background Grid Pattern */}
                    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1" fill="#1e293b" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Graph Edges */}
                    {graphEdges.map((edge) => (
                      <g key={edge.id} className="transition-opacity hover:opacity-100">
                        <path
                          d={`M ${edge.x1} ${edge.y1} C ${(edge.x1 + edge.x2) / 2} ${edge.y1}, ${(edge.x1 + edge.x2) / 2} ${edge.y2}, ${edge.x2} ${edge.y2}`}
                          fill="none"
                          stroke="#4338ca"
                          strokeWidth="1.5"
                          strokeDasharray={edge.type === 'DEPLOYED_FROM' ? '4 3' : 'none'}
                          markerEnd="url(#arrow)"
                          className="opacity-70 hover:opacity-100 transition-all hover:stroke-indigo-400"
                        />
                        <text
                          x={(edge.x1 + edge.x2) / 2}
                          y={(edge.y1 + edge.y2) / 2 - 6}
                          fill="#94a3b8"
                          fontSize="9"
                          fontFamily="monospace"
                          textAnchor="middle"
                          className="bg-slate-900 px-1 rounded pointer-events-none select-none"
                        >
                          {edge.label}
                        </text>
                      </g>
                    ))}

                    {/* Graph Nodes */}
                    {graphNodes.map(({ resource: r, x, y }) => {
                      const isSelected = selectedResource?.id === r.id;
                      return (
                        <g
                          key={r.id}
                          transform={`translate(${x}, ${y})`}
                          className="cursor-pointer group"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedResource(r);
                          }}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            fetchDiagnostics(r);
                          }}
                        >
                          {/* Card Container */}
                          <rect
                            width="220"
                            height="76"
                            rx="10"
                            fill="#161b22"
                            stroke={isSelected ? '#6366f1' : '#334155'}
                            strokeWidth={isSelected ? '2' : '1'}
                            className="group-hover:stroke-indigo-400 transition-colors drop-shadow-md"
                          />

                          {/* Status Color Strip */}
                          <rect
                            x="0"
                            y="0"
                            width="4"
                            height="76"
                            rx="2"
                            fill={
                              r.status === 'healthy' || r.status === 'running'
                                ? '#10b981'
                                : r.status === 'warning'
                                ? '#f59e0b'
                                : r.status === 'error'
                                ? '#f43f5e'
                                : '#64748b'
                            }
                          />

                          {/* Node Header (Provider & Type) */}
                          <foreignObject x="12" y="8" width="196" height="60">
                            <div className="flex flex-col justify-between h-full pointer-events-none">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  {getProviderIcon(r.provider, "w-3.5 h-3.5")}
                                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                                    {r.type.replace(/_/g, ' ')}
                                  </span>
                                </div>
                                <span className={`w-2 h-2 rounded-full ${
                                  r.status === 'healthy' || r.status === 'running'
                                    ? 'bg-emerald-400 animate-pulse'
                                    : r.status === 'warning'
                                    ? 'bg-amber-400'
                                    : r.status === 'error'
                                    ? 'bg-rose-400'
                                    : 'bg-slate-500'
                                }`} />
                              </div>

                              <div className="font-semibold text-xs text-white truncate" title={r.displayName}>
                                {r.displayName}
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <span className="truncate max-w-[120px]">
                                  {r.namespace || r.region || r.rawStatus}
                                </span>
                                <span className="font-mono text-indigo-400 group-hover:underline">
                                  Inspect →
                                </span>
                              </div>
                            </div>
                          </foreignObject>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Node Details Overlay Panel (When selected) */}
                {selectedResource && (
                  <div className="absolute bottom-4 right-4 z-20 w-80 bg-[#161b22]/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-4 shadow-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getProviderIcon(selectedResource.provider, "w-4 h-4")}
                        <span className="font-semibold text-sm text-white truncate max-w-[190px]">
                          {selectedResource.displayName}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedResource(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Type</span>
                        <span className="font-mono text-slate-300">{selectedResource.type}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Status</span>
                        {getStatusBadge(selectedResource.status)}
                      </div>
                      {selectedResource.namespace && (
                        <div>
                          <span className="text-slate-500 block text-[10px]">Namespace</span>
                          <span className="font-mono text-slate-300">{selectedResource.namespace}</span>
                        </div>
                      )}
                      {selectedResource.region && (
                        <div>
                          <span className="text-slate-500 block text-[10px]">Region</span>
                          <span className="font-mono text-slate-300">{selectedResource.region}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => fetchDiagnostics(selectedResource)}
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs text-center transition-colors shadow-sm"
                      >
                        Why is this broken?
                      </button>
                      <button
                        onClick={() => handleDeepLink(selectedResource.sourceApp)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                        title={`Open in ${selectedResource.sourceApp}`}
                      >
                        Launch
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: INVENTORY TABLE */}
            {activeTab === 'resources' && (
              <div className="p-5 max-w-7xl mx-auto space-y-4">
                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[#161b22] p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Provider:</span>
                    <select
                      value={selectedProviderFilter}
                      onChange={(e) => setSelectedProviderFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2.5 py-1 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="all">All Providers</option>
                      <option value="host">Host Machine</option>
                      <option value="docker">Docker</option>
                      <option value="kubernetes">Kubernetes</option>
                      <option value="azure">Azure</option>
                      <option value="aws">AWS</option>
                      <option value="github">GitHub</option>
                      <option value="grafana">Grafana</option>
                    </select>

                    <span className="text-slate-400 ml-2">Status:</span>
                    <select
                      value={selectedStatusFilter}
                      onChange={(e) => setSelectedStatusFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2.5 py-1 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value="running">Running / Healthy</option>
                      <option value="unhealthy">Warnings & Errors</option>
                    </select>
                  </div>

                  <span className="text-xs text-slate-400">
                    Showing <strong>{filteredResources.length}</strong> of {resources.length} resources
                  </span>
                </div>

                {/* Table */}
                <div className="rounded-xl border border-slate-800 bg-[#161b22] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                        <tr>
                          <th className="py-2.5 px-4">Resource</th>
                          <th className="py-2.5 px-4">Provider</th>
                          <th className="py-2.5 px-4">Type</th>
                          <th className="py-2.5 px-4">Scope / Location</th>
                          <th className="py-2.5 px-4">Status</th>
                          <th className="py-2.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredResources.map((res) => (
                          <tr
                            key={res.id}
                            className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                            onClick={() => setSelectedResource(res)}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                {getProviderIcon(res.provider, "w-4 h-4")}
                                <div>
                                  <div className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                                    {res.displayName}
                                  </div>
                                  <div className="text-[11px] font-mono text-slate-500 truncate max-w-xs">
                                    {res.id}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4 font-medium text-slate-300 capitalize">
                              {res.provider}
                            </td>

                            <td className="py-3 px-4 font-mono text-slate-400">
                              {res.type}
                            </td>

                            <td className="py-3 px-4 text-slate-400">
                              {res.namespace ? `ns: ${res.namespace}` : res.region ? res.region : 'global'}
                            </td>

                            <td className="py-3 px-4">
                              {getStatusBadge(res.status)}
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    fetchDiagnostics(res);
                                  }}
                                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
                                >
                                  Diagnose
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeepLink(res.sourceApp);
                                  }}
                                  className="px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[11px] font-medium border border-indigo-500/20 transition-colors"
                                >
                                  Open
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ISSUES & WARNINGS */}
            {activeTab === 'issues' && (
              <div className="p-5 max-w-5xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-white">Active Infrastructure Issues</h2>
                    <p className="text-xs text-slate-400">
                      Unhealthy pods, exited containers, failing deployments, or alerting conditions
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {issues.length} detected
                  </span>
                </div>

                {issues.length === 0 ? (
                  <div className="p-8 rounded-xl bg-[#161b22] border border-slate-800 text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                    <h3 className="text-sm font-semibold text-white">No active issues detected</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      All container workloads, nodes, and cluster pods are currently in nominal operational states.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {issues.map((iss) => (
                      <div
                        key={iss.id}
                        className="p-4 rounded-xl bg-[#161b22] border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg mt-0.5 ${
                              iss.severity === 'critical'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-sm text-white">{iss.title}</h3>
                                <span className={`px-2 py-0.2 rounded text-[10px] uppercase font-mono tracking-wider ${
                                  iss.severity === 'critical'
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : 'bg-amber-500/20 text-amber-300'
                                }`}>
                                  {iss.severity}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 mt-1">{iss.description}</p>
                              {iss.recommendedAction && (
                                <p className="text-xs text-indigo-400 mt-1.5 font-medium">
                                  Recommendation: {iss.recommendedAction}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                const r = resources.find(x => x.id === iss.resourceId);
                                if (r) fetchDiagnostics(r);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-sm"
                            >
                              Why is this broken?
                            </button>
                            <button
                              onClick={() => handleDeepLink(iss.deepLinkApp)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-colors"
                            >
                              Open in {iss.deepLinkApp}
                            </button>
                          </div>
                        </div>

                        {iss.evidence?.events && iss.evidence.events.length > 0 && (
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                            {iss.evidence.events.map((ev, i) => (
                              <div key={i} className="truncate">
                                [{ev.type}] {ev.reason}: {ev.message}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: TIMELINE */}
            {activeTab === 'timeline' && (
              <div className="p-5 max-w-4xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-white">Infrastructure Event Timeline</h2>
                    <p className="text-xs text-slate-400">
                      Chronological stream of real cluster events, container state changes, and alerts
                    </p>
                  </div>
                  <span className="text-xs text-slate-500">Live events feed</span>
                </div>

                {timeline.length === 0 ? (
                  <div className="p-8 rounded-xl bg-[#161b22] border border-slate-800 text-center text-slate-400 text-xs">
                    No recent state transition events recorded.
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                    {timeline.map((ev) => (
                      <div key={ev.id} className="relative group">
                        {/* Dot on line */}
                        <div className={`absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[#0d1117] ${
                          ev.severity === 'warning' || ev.severity === 'critical'
                            ? 'bg-amber-400'
                            : ev.severity === 'success'
                            ? 'bg-emerald-400'
                            : 'bg-indigo-400'
                        }`} />

                        <div className="p-3.5 rounded-xl bg-[#161b22] border border-slate-800 group-hover:border-slate-700 transition-colors">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <div className="flex items-center gap-2">
                              {getProviderIcon(ev.provider, "w-3.5 h-3.5")}
                              <span className="font-semibold text-white capitalize">{ev.provider}</span>
                              <span className="text-slate-500">•</span>
                              <span className="font-mono text-slate-400">{ev.resourceName}</span>
                            </div>
                            <span className="text-[11px] font-mono text-slate-500">
                              {new Date(ev.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 font-mono mt-1">{ev.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* DIAGNOSTICS MODAL: "WHY IS THIS BROKEN?" */}
      {diagModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-[#161b22] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">
                    Deep Diagnostics: {selectedResource?.displayName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Factual root-cause evidence from live cluster logs, exit codes, and dependency telemetry
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDiagModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {diagLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                  <RefreshCw className="w-7 h-7 animate-spin text-indigo-400" />
                  <span className="text-sm font-medium">Running deep infrastructure probe...</span>
                  <span className="text-xs text-slate-500">Querying live logs, conditions, and dependency graph</span>
                </div>
              ) : diagnostics ? (
                <>
                  {/* Status Banner */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block mb-0.5">Health State</span>
                      <div className="text-sm font-semibold text-white">{diagnostics.health.summary}</div>
                    </div>
                    {getStatusBadge(diagnostics.health.status)}
                  </div>

                  {/* Remediation Steps */}
                  {diagnostics.suggestedSteps.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                        Suggested Remediation Steps
                      </h4>
                      <div className="space-y-1.5">
                        {diagnostics.suggestedSteps.map((step, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-indigo-950/20 border border-indigo-500/20 text-xs text-slate-300 flex items-start gap-2"
                          >
                            <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Live Logs Snippet */}
                  {diagnostics.evidence.logsSnippet.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
                          Recent Output Logs
                        </h4>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(diagnostics.evidence.logsSnippet.join('\n'));
                            setCopiedLog(true);
                            setTimeout(() => setCopiedLog(false), 2000);
                          }}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
                        >
                          {copiedLog ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedLog ? 'Copied' : 'Copy Logs'}</span>
                        </button>
                      </div>

                      <div className="p-3 rounded-xl bg-black border border-slate-800 font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto space-y-0.5">
                        {diagnostics.evidence.logsSnippet.map((line, i) => (
                          <div key={i} className="whitespace-pre-wrap">{line}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dependencies & Dependents */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                      <span className="text-xs font-semibold text-slate-400 block mb-2">
                        Upstream Dependencies ({diagnostics.evidence.dependencies.length})
                      </span>
                      {diagnostics.evidence.dependencies.length === 0 ? (
                        <span className="text-xs text-slate-500">None detected</span>
                      ) : (
                        <div className="space-y-1">
                          {diagnostics.evidence.dependencies.map(d => (
                            <div key={d.id} className="text-xs text-slate-300 flex items-center gap-1.5">
                              {getProviderIcon(d.provider, "w-3 h-3")}
                              <span className="font-mono text-[11px]">{d.displayName}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                      <span className="text-xs font-semibold text-slate-400 block mb-2">
                        Downstream Dependents ({diagnostics.evidence.dependents.length})
                      </span>
                      {diagnostics.evidence.dependents.length === 0 ? (
                        <span className="text-xs text-slate-500">None detected</span>
                      ) : (
                        <div className="space-y-1">
                          {diagnostics.evidence.dependents.map(d => (
                            <div key={d.id} className="text-xs text-slate-300 flex items-center gap-1.5">
                              {getProviderIcon(d.provider, "w-3 h-3")}
                              <span className="font-mono text-[11px]">{d.displayName}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Could not retrieve diagnostic telemetry for this resource.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Resource ID: <code className="text-slate-400">{selectedResource?.id}</code>
              </span>
              <div className="flex items-center gap-2">
                {selectedResource?.sourceApp && (
                  <button
                    onClick={() => {
                      setDiagModalOpen(false);
                      handleDeepLink(selectedResource.sourceApp);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors"
                  >
                    Open in {selectedResource.sourceApp}
                  </button>
                )}
                <button
                  onClick={() => setDiagModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
