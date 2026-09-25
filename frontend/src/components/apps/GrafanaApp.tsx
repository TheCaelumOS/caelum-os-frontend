"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Activity,
  Flame,
  Search,
  RefreshCw,
  Clock,
  Layers,
  Folder,
  Database,
  Bell,
  Terminal,
  BarChart3,
  Settings,
  Plus,
  Trash2,
  Star,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Server,
  Cpu,
  HardDrive,
  Network,
  Box,
  ChevronRight,
  ChevronDown,
  Info,
  Sliders,
  X,
  Play,
  Share2,
  FileCode,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  grafanaApi,
  GrafanaConnectionStatus,
  GrafanaStatusResponse,
  GrafanaDashboardSummary,
  GrafanaDashboardDetail,
  GrafanaFolder,
  GrafanaDataSource,
  GrafanaAlertRule,
  GrafanaContactPoint,
  CaelumObservabilityOverview,
  ConnectGrafanaPayload,
} from '../../lib/grafanaApi';
import { GrafanaLogo } from '../icons/RealBrandLogos';

const TIME_RANGES = [
  { label: 'Last 5m', value: 'now-5m' },
  { label: 'Last 15m', value: 'now-15m' },
  { label: 'Last 30m', value: 'now-30m' },
  { label: 'Last 1h', value: 'now-1h' },
  { label: 'Last 6h', value: 'now-6h' },
  { label: 'Last 12h', value: 'now-12h' },
  { label: 'Last 24h', value: 'now-24h' },
  { label: 'Last 7d', value: 'now-7d' },
];

const REFRESH_INTERVALS = [
  { label: 'Off', value: 0 },
  { label: '5s', value: 5000 },
  { label: '10s', value: 10000 },
  { label: '30s', value: 30000 },
  { label: '1m', value: 60000 },
  { label: '5m', value: 300000 },
];

// Canvas sparkline chart component for native metrics
function MetricCanvasChart({
  data,
  color = '#f97316',
  height = 70,
  min,
  max,
}: {
  data: number[];
  color?: string;
  height?: number;
  min?: number;
  max?: number;
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

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 0.8;
    for (let y = 0; y < height; y += 18) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (data.length < 2) return;

    const effectiveMin = min !== undefined ? min : Math.min(...data);
    const effectiveMax = max !== undefined ? max : Math.max(...data);
    const range = effectiveMax - effectiveMin || 1;

    ctx.beginPath();
    const step = width / (data.length - 1);
    const getY = (val: number) => height - ((val - effectiveMin) / range) * (height - 12) - 6;

    ctx.moveTo(0, getY(data[0]));
    for (let i = 1; i < data.length; i++) {
      ctx.lineTo(i * step, getY(data[i]));
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Area gradient fill
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, color + '33');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fill();
  }, [data, color, height, min, max]);

  return <canvas ref={canvasRef} className="w-full block" />;
}

export default function GrafanaApp() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'overview' | 'dashboards' | 'folders' | 'datasources' | 'alerts' | 'logs' | 'metrics' | 'settings'>('overview');

  // Connection & Server Status
  const [status, setStatus] = useState<GrafanaStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Time Range & Auto Refresh
  const [timeRange, setTimeRange] = useState<string>('now-1h');
  const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 30s default

  // Observability Overview
  const [overview, setOverview] = useState<CaelumObservabilityOverview | null>(null);
  const [loadingOverview, setLoadingOverview] = useState<boolean>(false);

  // Dashboards
  const [dashboards, setDashboards] = useState<GrafanaDashboardSummary[]>([]);
  const [dashboardSearch, setDashboardSearch] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [loadingDashboards, setLoadingDashboards] = useState<boolean>(false);
  const [selectedDashboard, setSelectedDashboard] = useState<GrafanaDashboardDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Folders
  const [folders, setFolders] = useState<GrafanaFolder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState<boolean>(false);

  // Data Sources
  const [dataSources, setDataSources] = useState<GrafanaDataSource[]>([]);
  const [loadingDataSources, setLoadingDataSources] = useState<boolean>(false);
  const [testingDsId, setTestingDsId] = useState<string | null>(null);
  const [dsHealthMap, setDsHealthMap] = useState<Record<string, { status: string; message?: string }>>({});

  // Alerts & Contact Points
  const [alerts, setAlerts] = useState<GrafanaAlertRule[]>([]);
  const [contactPoints, setContactPoints] = useState<GrafanaContactPoint[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState<boolean>(false);
  const [alertFilter, setAlertFilter] = useState<string>('all');

  // Logs (Loki)
  const [logQuery, setLogQuery] = useState<string>('{job=~".+"}');
  const [logs, setLogs] = useState<Array<{ timestamp: string; level: string; message: string; labels: Record<string, string> }>>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);
  const [logFilterLevel, setLogFilterLevel] = useState<string>('all');

  // Metrics (Prometheus)
  const [metricQuery, setMetricQuery] = useState<string>('100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)');
  const [metricResultPoints, setMetricResultPoints] = useState<Array<{ time: number; value: number }>>([]);
  const [queryingMetric, setQueryingMetric] = useState<boolean>(false);
  const [metricError, setMetricError] = useState<string | null>(null);

  // Connection Setup Form
  const [connectForm, setConnectForm] = useState<ConnectGrafanaPayload>({
    url: 'http://localhost:3000',
    authType: 'token',
    token: '',
    username: 'admin',
    password: '',
  });
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [autoDetecting, setAutoDetecting] = useState<boolean>(false);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);

  // =========================================================================
  // INITIAL DATA FETCH & AUTO DETECT
  // =========================================================================

  const fetchStatus = useCallback(async () => {
    try {
      const data = await grafanaApi.getStatus();
      setStatus(data);
      return data;
    } catch {
      setStatus({ status: 'NOT_CONNECTED' });
      return null;
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  const fetchOverview = useCallback(async () => {
    setLoadingOverview(true);
    try {
      const data = await grafanaApi.getOverview();
      setOverview(data);
    } catch {
      setOverview(null);
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  const fetchDashboards = useCallback(async () => {
    setLoadingDashboards(true);
    try {
      const list = await grafanaApi.getDashboards(dashboardSearch, selectedTag);
      setDashboards(Array.isArray(list) ? list : []);
    } catch {
      setDashboards([]);
    } finally {
      setLoadingDashboards(false);
    }
  }, [dashboardSearch, selectedTag]);

  const fetchFolders = useCallback(async () => {
    setLoadingFolders(true);
    try {
      const list = await grafanaApi.getFolders();
      setFolders(Array.isArray(list) ? list : []);
    } catch {
      setFolders([]);
    } finally {
      setLoadingFolders(false);
    }
  }, []);

  const fetchDataSources = useCallback(async () => {
    setLoadingDataSources(true);
    try {
      const list = await grafanaApi.getDataSources();
      setDataSources(Array.isArray(list) ? list : []);
    } catch {
      setDataSources([]);
    } finally {
      setLoadingDataSources(false);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    setLoadingAlerts(true);
    try {
      const [al, cp] = await Promise.allSettled([
        grafanaApi.getAlerts(),
        grafanaApi.getContactPoints(),
      ]);
      setAlerts(al.status === 'fulfilled' && Array.isArray(al.value) ? al.value : []);
      setContactPoints(cp.status === 'fulfilled' && Array.isArray(cp.value) ? cp.value : []);
    } catch {
      setAlerts([]);
      setContactPoints([]);
    } finally {
      setLoadingAlerts(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    const s = await fetchStatus();
    if (s && s.status === 'CONNECTED') {
      await Promise.allSettled([
        fetchOverview(),
        fetchDashboards(),
        fetchFolders(),
        fetchDataSources(),
        fetchAlerts(),
      ]);
    }
    setRefreshing(false);
  }, [fetchStatus, fetchOverview, fetchDashboards, fetchFolders, fetchDataSources, fetchAlerts]);

  useEffect(() => {
    fetchStatus().then((s) => {
      if (s && s.status === 'CONNECTED') {
        fetchOverview();
      }
    });
  }, [fetchStatus, fetchOverview]);

  // Tab change triggers
  useEffect(() => {
    if (status?.status !== 'CONNECTED') return;
    if (activeTab === 'overview') fetchOverview();
    else if (activeTab === 'dashboards') fetchDashboards();
    else if (activeTab === 'folders') fetchFolders();
    else if (activeTab === 'datasources') fetchDataSources();
    else if (activeTab === 'alerts') fetchAlerts();
  }, [activeTab, status?.status, fetchOverview, fetchDashboards, fetchFolders, fetchDataSources, fetchAlerts]);

  // Auto-refresh interval timer
  useEffect(() => {
    if (refreshInterval <= 0 || status?.status !== 'CONNECTED') return;
    const timer = setInterval(() => {
      if (activeTab === 'overview') fetchOverview();
      else if (activeTab === 'alerts') fetchAlerts();
      else if (activeTab === 'dashboards' && !selectedDashboard) fetchDashboards();
    }, refreshInterval);
    return () => clearInterval(timer);
  }, [refreshInterval, status?.status, activeTab, selectedDashboard, fetchOverview, fetchAlerts, fetchDashboards]);

  // =========================================================================
  // ACTIONS
  // =========================================================================

  const handleConnect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setConnecting(true);
    setConnectError(null);
    try {
      const res = await grafanaApi.connect(connectForm);
      setStatus(res);
      setActiveTab('overview');
      await refreshAll();
    } catch (err: any) {
      setConnectError(err.message || 'Failed to connect to Grafana. Please verify your credentials and URL.');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect this Grafana instance?')) return;
    try {
      await grafanaApi.disconnect();
      setStatus({ status: 'NOT_CONNECTED' });
      setSelectedDashboard(null);
      setOverview(null);
      setDashboards([]);
      setFolders([]);
      setDataSources([]);
      setAlerts([]);
    } catch (err: any) {
      alert(`Disconnect failed: ${err.message || err}`);
    }
  };

  const handleAutoDetect = async () => {
    setAutoDetecting(true);
    setConnectError(null);
    try {
      const res = await grafanaApi.autoDetect();
      setStatus(res);
      if (res.status === 'CONNECTED') {
        setActiveTab('overview');
        await refreshAll();
      } else {
        setConnectError(res.error || 'No local Grafana detected on ports 3000, 3001, 3002, 8080.');
      }
    } catch (err: any) {
      setConnectError(err.message || 'Auto-detect scan failed.');
    } finally {
      setAutoDetecting(false);
    }
  };

  const handleOpenDashboard = async (uid: string) => {
    setLoadingDetail(true);
    try {
      const detail = await grafanaApi.getDashboard(uid);
      setSelectedDashboard(detail);
    } catch (err: any) {
      alert(`Failed to load dashboard: ${err.message || err}`);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleToggleStar = async (uid: string, currentStarred: boolean) => {
    try {
      await grafanaApi.starDashboard(uid, !currentStarred);
      setDashboards(prev =>
        prev.map(d => (d.uid === uid ? { ...d, isStarred: !currentStarred } : d))
      );
      if (selectedDashboard && selectedDashboard.dashboard.uid === uid) {
        setSelectedDashboard({
          ...selectedDashboard,
          meta: { ...selectedDashboard.meta, isStarred: !currentStarred },
        });
      }
    } catch {
      // Star toggle defensive catch
    }
  };

  const handleDeleteDashboard = async (uid: string, title: string) => {
    if (!confirm(`Delete dashboard "${title}" from Grafana? This cannot be undone.`)) return;
    try {
      await grafanaApi.deleteDashboard(uid);
      setSelectedDashboard(null);
      await fetchDashboards();
    } catch (err: any) {
      alert(`Delete failed: ${err.message || err}`);
    }
  };

  const handleTestDataSource = async (id: string | number) => {
    setTestingDsId(String(id));
    try {
      const health = await grafanaApi.getDataSourceHealth(id);
      setDsHealthMap(prev => ({ ...prev, [String(id)]: health }));
    } catch (err: any) {
      setDsHealthMap(prev => ({
        ...prev,
        [String(id)]: { status: 'ERROR', message: err.message || 'Health check error' },
      }));
    } finally {
      setTestingDsId(null);
    }
  };

  const handleRunMetricQuery = async (queryToRun?: string) => {
    const expr = queryToRun || metricQuery;
    if (!expr) return;
    setQueryingMetric(true);
    setMetricError(null);

    const promDs = dataSources.find(ds => ds.type === 'prometheus');
    if (!promDs) {
      setMetricError('No Prometheus data source configured in this Grafana instance.');
      setQueryingMetric(false);
      return;
    }

    try {
      const res = await grafanaApi.query({
        queries: [
          {
            refId: 'A',
            datasource: { uid: promDs.uid, type: 'prometheus' },
            expr,
            range: true,
          },
        ],
        from: timeRange,
        to: 'now',
      });

      const frame = res?.results?.A?.frames?.[0];
      if (frame && frame.data && Array.isArray(frame.data.values) && frame.data.values.length >= 2) {
        const timeArr = frame.data.values[0] || [];
        const valArr = frame.data.values[1] || [];
        const points: Array<{ time: number; value: number }> = [];
        for (let i = 0; i < timeArr.length; i++) {
          const t = Number(timeArr[i]);
          const v = Number(valArr[i]);
          if (!isNaN(t) && !isNaN(v)) {
            points.push({ time: t, value: Number(v.toFixed(2)) });
          }
        }
        setMetricResultPoints(points);
        if (points.length === 0) {
          setMetricError('Query executed successfully, but returned zero series/points.');
        }
      } else {
        setMetricResultPoints([]);
        setMetricError('No metric data points returned for this query and time interval.');
      }
    } catch (err: any) {
      setMetricError(err.message || 'PromQL execution failed.');
      setMetricResultPoints([]);
    } finally {
      setQueryingMetric(false);
    }
  };

  const isConnected = status?.status === 'CONNECTED';

  return (
    <div className="h-full flex flex-col bg-[#0b0c10] text-slate-200 select-none overflow-hidden font-sans">
      {/* =====================================================================
          TOP HEADER & STATUS TOOLBAR
      ====================================================================== */}
      <div className="h-12 border-b border-neutral-800 bg-[#12131a] px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <GrafanaLogo className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold tracking-tight text-white">Grafana Observability</span>
              {/* Connection Status Badge */}
              <span
                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                  isConnected
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : status?.status === 'UNAVAILABLE'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : status?.status === 'ERROR'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-neutral-800 text-slate-400 border border-neutral-700'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isConnected
                      ? 'bg-emerald-400 animate-pulse'
                      : status?.status === 'UNAVAILABLE'
                      ? 'bg-amber-400'
                      : status?.status === 'ERROR'
                      ? 'bg-red-400'
                      : 'bg-slate-500'
                  }`}
                />
                <span>
                  {isConnected
                    ? `Connected ${status?.version ? `(v${status.version})` : ''}`
                    : status?.status === 'UNAVAILABLE'
                    ? 'Unavailable'
                    : status?.status === 'ERROR'
                    ? 'Error'
                    : 'Not Connected'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Global Controls: Time Range & Refresh */}
        <div className="flex items-center space-x-2.5">
          {isConnected && (
            <>
              {/* Time Range Selector */}
              <div className="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-slate-300">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-transparent outline-none cursor-pointer text-slate-200"
                >
                  {TIME_RANGES.map(tr => (
                    <option key={tr.value} value={tr.value} className="bg-neutral-900 text-slate-200">
                      {tr.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Refresh Interval Selector */}
              <div className="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-slate-300">
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="bg-transparent outline-none cursor-pointer text-slate-200"
                  title="Auto Refresh Rate"
                >
                  {REFRESH_INTERVALS.map(ri => (
                    <option key={ri.value} value={ri.value} className="bg-neutral-900 text-slate-200">
                      {ri.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Refresh Button */}
              <button
                type="button"
                onClick={() => refreshAll()}
                disabled={refreshing}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-slate-300 hover:text-white cursor-pointer transition-colors"
                title="Refresh All Grafana Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-orange-400' : ''}`} />
              </button>
            </>
          )}

          {/* Diagnostics Modal Toggle */}
          <button
            type="button"
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
            title="Grafana Connection Diagnostics"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* =====================================================================
          MAIN LAYOUT: NAVIGATION TABS + CONTENT
      ====================================================================== */}
      <div className="flex-1 flex min-h-0">
        {/* Left Navigation Bar */}
        <div className="w-52 bg-[#0d0e14] border-r border-neutral-850 p-2.5 space-y-1 flex flex-col justify-between flex-shrink-0">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => { setActiveTab('overview'); setSelectedDashboard(null); }}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  : 'text-slate-400 hover:bg-neutral-850 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('dashboards'); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboards'
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  : 'text-slate-400 hover:bg-neutral-850 hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <BarChart3 className="w-4 h-4" />
                <span>Dashboards</span>
              </div>
              {dashboards.length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-slate-400">
                  {dashboards.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('folders'); setSelectedDashboard(null); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'folders'
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  : 'text-slate-400 hover:bg-neutral-850 hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Folder className="w-4 h-4" />
                <span>Folders</span>
              </div>
              {folders.length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-slate-400">
                  {folders.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('datasources'); setSelectedDashboard(null); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'datasources'
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  : 'text-slate-400 hover:bg-neutral-850 hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Database className="w-4 h-4" />
                <span>Data Sources</span>
              </div>
              {dataSources.length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-slate-400">
                  {dataSources.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('alerts'); setSelectedDashboard(null); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'alerts'
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  : 'text-slate-400 hover:bg-neutral-850 hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Bell className="w-4 h-4" />
                <span>Alerts</span>
              </div>
              {alerts.length > 0 && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  alerts.some(a => a.state?.toLowerCase() === 'firing')
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-neutral-800 text-slate-400'
                }`}>
                  {alerts.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('logs'); setSelectedDashboard(null); }}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  : 'text-slate-400 hover:bg-neutral-850 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Logs (Loki)</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('metrics'); setSelectedDashboard(null); }}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'metrics'
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  : 'text-slate-400 hover:bg-neutral-850 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Metrics (PromQL)</span>
            </button>
          </div>

          <div className="pt-2 border-t border-neutral-850 space-y-1">
            <button
              type="button"
              onClick={() => { setActiveTab('settings'); setSelectedDashboard(null); }}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  : 'text-slate-400 hover:bg-neutral-850 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Content Pane */}
        <div className="flex-1 overflow-y-auto bg-[#0b0c10] p-5">
          {/* =================================================================
              NOT CONNECTED / SETUP VIEW
          ================================================================== */}
          {!isConnected && activeTab !== 'settings' ? (
            <div className="h-full flex items-center justify-center p-6">
              <div className="max-w-md w-full p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-center space-y-5 shadow-2xl">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mx-auto">
                  <GrafanaLogo className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">Connect Grafana</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Connect CaelumOS to your local or remote Grafana instance to view live dashboards, data sources, Prometheus metrics, Loki logs, and alerts.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={handleAutoDetect}
                    disabled={autoDetecting}
                    className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-orange-950/40"
                  >
                    <Zap className="w-4 h-4" />
                    <span>{autoDetecting ? 'Auto-Detecting Local Grafana...' : 'Auto-Detect Local Grafana'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-slate-200 text-xs font-semibold transition-all cursor-pointer border border-neutral-700"
                  >
                    Configure Custom / Remote URL
                  </button>
                </div>

                {connectError && (
                  <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/20 text-red-400 text-xs text-left flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{connectError}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* =============================================================
                  TAB 1: OBSERVABILITY OVERVIEW
              ============================================================== */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Observability Header Strip */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-extrabold text-white tracking-tight flex items-center space-x-2">
                        <span>CaelumOS Observability</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Real-time telemetry aggregated from your configured Grafana data sources.
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-slate-400">
                        Data Sources: {status?.dataSourcesCount ?? 0} &bull; Dashboards: {status?.dashboardsCount ?? 0}
                      </span>
                    </div>
                  </div>

                  {/* 4 Primary Observability Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 1. Host System Telemetry */}
                    <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                          <Cpu className="w-4 h-4 text-orange-400" />
                          <span>System Host</span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          overview?.system.available
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-neutral-800 text-slate-400'
                        }`}>
                          {overview?.system.available ? 'Prometheus Live' : 'Data unavailable'}
                        </span>
                      </div>

                      <div className="space-y-2 pt-1 font-mono text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">CPU Usage</span>
                          <span className="text-white font-bold">
                            {overview?.system.cpuPercent !== null ? `${overview?.system.cpuPercent}%` : 'Unavailable'}
                          </span>
                        </div>
                        <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-orange-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(overview?.system.cpuPercent || 0, 100)}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center pt-1">
                          <span className="text-slate-400">RAM Allocation</span>
                          <span className="text-white font-bold">
                            {overview?.system.memoryPercent !== null ? `${overview?.system.memoryPercent}%` : 'Unavailable'}
                          </span>
                        </div>
                        <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(overview?.system.memoryPercent || 0, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* 2. Container Observability */}
                    <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                          <Box className="w-4 h-4 text-sky-400" />
                          <span>Docker Telemetry</span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          overview?.docker.available
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-neutral-800 text-slate-400'
                        }`}>
                          {overview?.docker.available ? 'cAdvisor Live' : 'Data unavailable'}
                        </span>
                      </div>

                      <div className="space-y-2 pt-1 font-mono text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Monitored Containers:</span>
                          <span className="text-white font-bold">
                            {overview?.docker.containersCount !== null ? overview?.docker.containersCount : 'Unavailable'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Container CPU Load:</span>
                          <span className="text-white font-bold">
                            {overview?.docker.cpuUsagePercent !== null ? `${overview?.docker.cpuUsagePercent}%` : 'Unavailable'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Container RAM:</span>
                          <span className="text-white font-bold">
                            {overview?.docker.memoryUsageMB !== null ? `${overview?.docker.memoryUsageMB} MB` : 'Unavailable'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 3. Kubernetes Observability */}
                    <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                          <Layers className="w-4 h-4 text-indigo-400" />
                          <span>Kubernetes Metrics</span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          overview?.kubernetes.available
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-neutral-800 text-slate-400'
                        }`}>
                          {overview?.kubernetes.available ? 'K8s Exporter Live' : 'Data unavailable'}
                        </span>
                      </div>

                      <div className="space-y-2 pt-1 font-mono text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Cluster Nodes:</span>
                          <span className="text-white font-bold">
                            {overview?.kubernetes.nodesCount !== null ? overview?.kubernetes.nodesCount : 'Unavailable'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Cluster Pods:</span>
                          <span className="text-white font-bold">
                            {overview?.kubernetes.podsCount !== null ? overview?.kubernetes.podsCount : 'Unavailable'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">1h Pod Restarts:</span>
                          <span className={`font-bold ${
                            overview?.kubernetes.podRestarts && overview.kubernetes.podRestarts > 0
                              ? 'text-amber-400'
                              : 'text-white'
                          }`}>
                            {overview?.kubernetes.podRestarts !== null ? overview?.kubernetes.podRestarts : 'Unavailable'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 4. Active Alerts */}
                    <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                          <Bell className="w-4 h-4 text-red-400" />
                          <span>Alerting Rules</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {alerts.length} Rules
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                        <div className="p-2 rounded-xl bg-red-950/30 border border-red-500/20">
                          <span className="text-base font-extrabold text-red-400 block">{overview?.alerts.firingCount ?? 0}</span>
                          <span className="text-[9px] text-slate-400 uppercase">Firing</span>
                        </div>
                        <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-500/20">
                          <span className="text-base font-extrabold text-amber-400 block">{overview?.alerts.pendingCount ?? 0}</span>
                          <span className="text-[9px] text-slate-400 uppercase">Pending</span>
                        </div>
                        <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/20">
                          <span className="text-base font-extrabold text-emerald-400 block">{overview?.alerts.normalCount ?? 0}</span>
                          <span className="text-[9px] text-slate-400 uppercase">Normal</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Dashboards & Logs Stream */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Starred / Pinned Dashboards */}
                    <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-850">
                        <span className="text-xs font-bold text-slate-200">Dashboards Quick Access</span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('dashboards')}
                          className="text-xs text-orange-400 hover:text-orange-300 font-semibold cursor-pointer"
                        >
                          View all &rarr;
                        </button>
                      </div>

                      {dashboards.length === 0 ? (
                        <div className="text-xs text-slate-500 py-6 text-center">
                          No dashboards retrieved from this Grafana instance.
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {dashboards.slice(0, 5).map(db => (
                            <div
                              key={db.uid}
                              onClick={() => { setActiveTab('dashboards'); handleOpenDashboard(db.uid); }}
                              className="p-2.5 rounded-xl bg-neutral-900/60 hover:bg-neutral-850 border border-neutral-800/80 flex items-center justify-between cursor-pointer transition-colors"
                            >
                              <div className="flex items-center space-x-2.5 truncate">
                                <BarChart3 className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                                <span className="text-xs font-medium text-slate-200 truncate">{db.title}</span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-neutral-800 flex-shrink-0">
                                {db.folderTitle || 'General'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Loki Log Stream Preview */}
                    <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-850">
                        <div className="flex items-center space-x-2">
                          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-xs font-bold text-slate-200">Loki Logs Preview</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {overview?.dataSources.loki ? 'Connected' : 'Loki unavailable'}
                        </span>
                      </div>

                      {!overview?.dataSources.loki ? (
                        <div className="text-xs text-slate-500 py-6 text-center">
                          Loki data source is not configured in Grafana.
                        </div>
                      ) : overview.logs.recentLogs.length === 0 ? (
                        <div className="text-xs text-slate-500 py-6 text-center">
                          No recent logs recorded in the selected time range.
                        </div>
                      ) : (
                        <div className="space-y-1 font-mono text-[10px] max-h-48 overflow-y-auto">
                          {overview.logs.recentLogs.slice(0, 6).map((log, idx) => (
                            <div key={idx} className="p-1.5 rounded bg-black/40 border border-neutral-900 flex items-start space-x-2">
                              <span className={`px-1 rounded uppercase font-bold text-[8px] flex-shrink-0 ${
                                log.level === 'ERROR' ? 'bg-red-500/20 text-red-400' :
                                log.level === 'WARN' ? 'bg-amber-500/20 text-amber-400' : 'bg-neutral-800 text-slate-400'
                              }`}>
                                {log.level}
                              </span>
                              <span className="text-slate-300 truncate">{log.message}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* =============================================================
                  TAB 2: DASHBOARDS EXPLORER & NATIVE VIEWER
              ============================================================== */}
              {activeTab === 'dashboards' && (
                <div className="h-full flex flex-col space-y-4">
                  {selectedDashboard ? (
                    /* Native Dashboard Detail & Panel Grid */
                    <div className="space-y-4">
                      {/* Dashboard Detail Top Bar */}
                      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => setSelectedDashboard(null)}
                            className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-colors"
                          >
                            &larr; Back to Dashboards
                          </button>
                          <div>
                            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                              <span>{selectedDashboard.dashboard.title}</span>
                              <button
                                type="button"
                                onClick={() => handleToggleStar(selectedDashboard.dashboard.uid, Boolean(selectedDashboard.meta.isStarred))}
                                className="text-slate-400 hover:text-amber-400 cursor-pointer"
                              >
                                <Star className={`w-3.5 h-3.5 ${selectedDashboard.meta.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                              </button>
                            </h2>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Folder: {selectedDashboard.meta.folderTitle || 'General'} &bull; UID: {selectedDashboard.dashboard.uid}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteDashboard(selectedDashboard.dashboard.uid, selectedDashboard.dashboard.title)}
                            className="p-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/50 border border-red-500/20 text-red-400 cursor-pointer"
                            title="Delete Dashboard"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Dashboard Panels Grid */}
                      {(!selectedDashboard.dashboard.panels || selectedDashboard.dashboard.panels.length === 0) ? (
                        <div className="p-12 text-center text-slate-500 text-xs font-mono">
                          This dashboard does not contain any visual panels yet.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {selectedDashboard.dashboard.panels.map((panel, pIdx) => (
                            <div
                              key={panel.id || pIdx}
                              className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-3 flex flex-col justify-between"
                            >
                              <div className="flex items-center justify-between pb-2 border-b border-neutral-850">
                                <span className="text-xs font-bold text-slate-200 truncate">{panel.title || `Panel ${pIdx + 1}`}</span>
                                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-slate-400">
                                  {panel.type || 'timeseries'}
                                </span>
                              </div>

                              {/* Panel Visualization Preview */}
                              <div className="h-32 flex items-center justify-center bg-black/40 rounded-xl border border-neutral-900 overflow-hidden p-2">
                                {panel.type === 'stat' || panel.type === 'singlestat' ? (
                                  <div className="text-center">
                                    <span className="text-2xl font-extrabold font-mono text-orange-400">
                                      {panel.options?.reduceOptions?.calcs?.[0] || 'Live'}
                                    </span>
                                    <span className="text-[10px] text-slate-500 block font-mono">SingleStat Metric</span>
                                  </div>
                                ) : panel.type === 'gauge' ? (
                                  <div className="text-center space-y-1">
                                    <div className="w-16 h-8 rounded-t-full border-4 border-orange-500 border-b-0 mx-auto" />
                                    <span className="text-xs font-mono text-slate-300 font-bold">Gauge</span>
                                  </div>
                                ) : (
                                  <MetricCanvasChart
                                    data={[12, 18, 15, 24, 22, 35, 30, 42, 38, 48, 45, 52, 50, 61, 58]}
                                    color="#f97316"
                                    height={100}
                                  />
                                )}
                              </div>

                              {/* Panel Targets / Queries preview */}
                              {panel.targets && panel.targets.length > 0 && (
                                <div className="text-[10px] font-mono text-slate-500 truncate">
                                  <span>Query: </span>
                                  <span className="text-slate-400">{panel.targets[0].expr || panel.targets[0].query || 'metrics'}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Dashboards List */
                    <div className="space-y-4">
                      {/* Search & Filter Toolbar */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="relative flex-1 max-w-md">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                          <input
                            type="text"
                            placeholder="Search dashboards by name..."
                            value={dashboardSearch}
                            onChange={(e) => setDashboardSearch(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') fetchDashboards(); }}
                            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-orange-500"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => fetchDashboards()}
                          className="px-3 py-1.5 rounded-xl bg-neutral-850 hover:bg-neutral-800 text-xs font-semibold text-slate-300 flex items-center space-x-1.5 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Search</span>
                        </button>
                      </div>

                      {/* Dashboards Grid */}
                      {loadingDashboards ? (
                        <div className="p-12 text-center text-slate-500 text-xs font-mono space-x-2 flex items-center justify-center">
                          <RefreshCw className="w-4 h-4 animate-spin text-orange-400" />
                          <span>Loading dashboards from Grafana...</span>
                        </div>
                      ) : dashboards.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 text-xs font-mono">
                          No dashboards matched your query.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {dashboards.map(db => (
                            <div
                              key={db.uid}
                              onClick={() => handleOpenDashboard(db.uid)}
                              className="p-4 rounded-2xl bg-neutral-900/60 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-start justify-between">
                                  <h4 className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                                    {db.title}
                                  </h4>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleStar(db.uid, db.isStarred);
                                    }}
                                    className="text-slate-500 hover:text-amber-400 cursor-pointer"
                                  >
                                    <Star className={`w-3.5 h-3.5 ${db.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                                  </button>
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono block">
                                  Folder: {db.folderTitle || 'General'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-neutral-850 text-[10px] font-mono">
                                <span className="text-slate-500">UID: {db.uid}</span>
                                <span className="text-orange-400 group-hover:translate-x-0.5 transition-transform">
                                  Open &rarr;
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* =============================================================
                  TAB 3: FOLDERS
              ============================================================== */}
              {activeTab === 'folders' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Grafana Folders</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Organize and navigate dashboards hierarchically.</p>
                    </div>
                  </div>

                  {folders.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 text-xs font-mono">
                      No custom folders registered in this Grafana instance. All dashboards reside in the General folder.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {folders.map(f => (
                        <div
                          key={f.uid}
                          className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2"
                        >
                          <div className="flex items-center space-x-2.5">
                            <Folder className="w-4 h-4 text-orange-400" />
                            <h4 className="text-xs font-bold text-white">{f.title}</h4>
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 space-y-1 pt-1">
                            <div>UID: {f.uid}</div>
                            {f.created && <div>Created: {new Date(f.created).toLocaleDateString()}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* =============================================================
                  TAB 4: DATA SOURCES
              ============================================================== */}
              {activeTab === 'datasources' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Configured Data Sources</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Real data source connections registered in Grafana.</p>
                    </div>
                  </div>

                  {dataSources.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 text-xs font-mono">
                      No data sources discovered in this Grafana instance.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dataSources.map(ds => {
                        const health = dsHealthMap[ds.uid] || dsHealthMap[String(ds.id)];
                        const isTesting = testingDsId === ds.uid || testingDsId === String(ds.id);
                        return (
                          <div
                            key={ds.uid || ds.id}
                            className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3 flex flex-col justify-between"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Database className="w-4 h-4 text-orange-400" />
                                  <h4 className="text-xs font-bold text-white">{ds.name}</h4>
                                </div>
                                {ds.isDefault && (
                                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold">
                                    Default
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400 space-y-0.5">
                                <div>Type: <span className="text-slate-200 uppercase font-bold">{ds.type}</span></div>
                                <div>URL: <span className="text-slate-300">{ds.url || 'Internal proxy'}</span></div>
                                <div>Access: {ds.access}</div>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-neutral-850 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => handleTestDataSource(ds.uid || ds.id)}
                                disabled={isTesting}
                                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-[10px] font-semibold text-slate-300 cursor-pointer transition-colors"
                              >
                                {isTesting ? 'Testing...' : 'Test Connection'}
                              </button>

                              {health && (
                                <span className={`text-[10px] font-mono font-bold ${
                                  health.status === 'OK' ? 'text-emerald-400' : 'text-red-400'
                                }`}>
                                  {health.status === 'OK' ? '✓ Working' : '✕ Error'}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* =============================================================
                  TAB 5: ALERTS & CONTACT POINTS
              ============================================================== */}
              {activeTab === 'alerts' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Alerting Rules</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Active alert definitions and real-time evaluation states.</p>
                    </div>

                    {/* Filter buttons */}
                    <div className="flex items-center space-x-1.5 text-[11px] font-mono">
                      {['all', 'firing', 'pending', 'normal'].map(f => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setAlertFilter(f)}
                          className={`px-2.5 py-1 rounded-lg uppercase cursor-pointer ${
                            alertFilter === f
                              ? 'bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30'
                              : 'bg-neutral-850 text-slate-400 hover:text-white'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {alerts.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 text-xs font-mono">
                      No alerting rules registered in this Grafana instance.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {alerts
                        .filter(a => {
                          if (alertFilter === 'all') return true;
                          return (a.state || '').toLowerCase().includes(alertFilter);
                        })
                        .map((alert, aIdx) => {
                          const stateLower = (alert.state || '').toLowerCase();
                          const isFiring = stateLower.includes('firing') || stateLower.includes('alert');
                          const isPending = stateLower.includes('pending');
                          return (
                            <div
                              key={alert.uid || alert.id || aIdx}
                              className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <Bell className={`w-3.5 h-3.5 ${
                                    isFiring ? 'text-red-400' : isPending ? 'text-amber-400' : 'text-emerald-400'
                                  }`} />
                                  <h4 className="text-xs font-bold text-white">{alert.title}</h4>
                                  <span className="text-[10px] text-slate-500 font-mono">Group: {alert.ruleGroup}</span>
                                </div>
                                {alert.annotations && alert.annotations.description && (
                                  <p className="text-[11px] text-slate-400">{alert.annotations.description}</p>
                                )}
                              </div>

                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase ${
                                isFiring
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                                  : isPending
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              }`}>
                                {alert.state || 'Normal'}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {/* Contact Points Section */}
                  {contactPoints.length > 0 && (
                    <div className="pt-4 border-t border-neutral-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Contact Points</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {contactPoints.map((cp, cIdx) => (
                          <div key={cp.uid || cIdx} className="p-3 rounded-xl bg-neutral-900/40 border border-neutral-850 space-y-1">
                            <span className="text-xs font-bold text-white block">{cp.name}</span>
                            <span className="text-[10px] font-mono text-slate-400 uppercase">{cp.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* =============================================================
                  TAB 6: LOGS (LOKI)
              ============================================================== */}
              {activeTab === 'logs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Loki Log Explorer</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Stream and query application & infrastructure logs.</p>
                    </div>
                  </div>

                  {/* LogQL Query Bar */}
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Terminal className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                      <input
                        type="text"
                        value={logQuery}
                        onChange={(e) => setLogQuery(e.target.value)}
                        placeholder='LogQL query, e.g. {job="docker"} |= "error"'
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-slate-200 placeholder-slate-500 outline-none focus:border-orange-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => fetchOverview()}
                      className="px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold cursor-pointer"
                    >
                      Run Query
                    </button>
                  </div>

                  {/* Logs Viewer */}
                  {overview?.logs.recentLogs && overview.logs.recentLogs.length > 0 ? (
                    <div className="p-3 bg-black/60 rounded-2xl border border-neutral-850 font-mono text-[10px] space-y-1.5 max-h-[500px] overflow-y-auto leading-relaxed select-all">
                      {overview.logs.recentLogs.map((l, idx) => (
                        <div key={idx} className="flex items-start space-x-2 hover:bg-white/5 p-1 rounded">
                          <span className="text-slate-500 flex-shrink-0">{new Date(l.timestamp).toLocaleTimeString()}</span>
                          <span className={`px-1 rounded uppercase font-bold text-[8px] flex-shrink-0 ${
                            l.level === 'ERROR' ? 'bg-red-500/20 text-red-400' :
                            l.level === 'WARN' ? 'bg-amber-500/20 text-amber-400' : 'bg-neutral-800 text-slate-400'
                          }`}>
                            {l.level}
                          </span>
                          <span className="text-slate-300 break-all">{l.message}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-slate-500 text-xs font-mono">
                      {overview?.dataSources.loki
                        ? 'No logs returned for the selected query and timeframe.'
                        : 'Loki data source is not configured in this Grafana instance.'}
                    </div>
                  )}
                </div>
              )}

              {/* =============================================================
                  TAB 7: METRICS (PROMQL)
              ============================================================== */}
              {activeTab === 'metrics' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Prometheus Metric Explorer</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Direct PromQL execution through Grafana proxy architecture.</p>
                    </div>
                  </div>

                  {/* Quick Preset Queries */}
                  <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => {
                        const q = '100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)';
                        setMetricQuery(q);
                        handleRunMetricQuery(q);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-neutral-850 hover:bg-neutral-800 text-slate-300 cursor-pointer"
                    >
                      Host CPU Usage %
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const q = '((node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes) * 100';
                        setMetricQuery(q);
                        handleRunMetricQuery(q);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-neutral-850 hover:bg-neutral-800 text-slate-300 cursor-pointer"
                    >
                      Host Memory Usage %
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const q = 'sum(rate(container_cpu_usage_seconds_total{container!=""}[5m])) * 100';
                        setMetricQuery(q);
                        handleRunMetricQuery(q);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-neutral-850 hover:bg-neutral-800 text-slate-300 cursor-pointer"
                    >
                      Container CPU Total
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const q = 'count(kube_pod_info)';
                        setMetricQuery(q);
                        handleRunMetricQuery(q);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-neutral-850 hover:bg-neutral-800 text-slate-300 cursor-pointer"
                    >
                      K8s Pod Count
                    </button>
                  </div>

                  {/* Query Input Bar */}
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Sliders className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                      <input
                        type="text"
                        value={metricQuery}
                        onChange={(e) => setMetricQuery(e.target.value)}
                        placeholder="PromQL query expression..."
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-slate-200 outline-none focus:border-orange-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRunMetricQuery()}
                      disabled={queryingMetric}
                      className="px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold cursor-pointer"
                    >
                      {queryingMetric ? 'Executing...' : 'Execute PromQL'}
                    </button>
                  </div>

                  {metricError && (
                    <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{metricError}</span>
                    </div>
                  )}

                  {/* Render Chart if points returned */}
                  {metricResultPoints.length > 0 && (
                    <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-300 font-bold">Query Result Series</span>
                        <span className="text-slate-500">{metricResultPoints.length} points</span>
                      </div>
                      <div className="h-44 bg-black/50 rounded-xl p-2 border border-neutral-850">
                        <MetricCanvasChart
                          data={metricResultPoints.map(p => p.value)}
                          color="#f97316"
                          height={160}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* =============================================================
                  TAB 8: SETTINGS & CONNECTION MANAGER
              ============================================================== */}
              {activeTab === 'settings' && (
                <div className="max-w-xl mx-auto space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Grafana Instance Settings</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Manage your connection, authentication, and endpoint credentials.</p>
                  </div>

                  {/* Active Connection Information */}
                  {isConnected && (
                    <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">Active Connection</span>
                        <span className="text-emerald-400 font-bold uppercase text-[10px]">Connected</span>
                      </div>
                      <div className="space-y-1 text-slate-400 text-[11px] pt-1 border-t border-neutral-850">
                        <div>Server URL: <span className="text-slate-200">{status?.url}</span></div>
                        <div>Grafana Version: <span className="text-slate-200">{status?.version || 'Unknown'}</span></div>
                        <div>Build Commit: <span className="text-slate-200">{status?.build || 'N/A'}</span></div>
                        <div>Organization: <span className="text-slate-200">{status?.orgName || 'Main Org'}</span></div>
                        <div>Location: <span className="text-slate-200">{status?.isLocal ? 'Local Machine' : 'Remote Server'}</span></div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleDisconnect}
                          className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-400 text-xs font-semibold cursor-pointer"
                        >
                          Disconnect Instance
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Connect / Update Connection Form */}
                  <form onSubmit={handleConnect} className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      {isConnected ? 'Switch Grafana Connection' : 'New Grafana Connection'}
                    </h4>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-300">Grafana Base URL</label>
                      <input
                        type="text"
                        required
                        value={connectForm.url}
                        onChange={(e) => setConnectForm({ ...connectForm, url: e.target.value })}
                        placeholder="http://localhost:3000 or https://grafana.example.com"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-slate-200 outline-none focus:border-orange-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-300">Authentication Method</label>
                      <select
                        value={connectForm.authType}
                        onChange={(e) => setConnectForm({ ...connectForm, authType: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-slate-200 outline-none focus:border-orange-500"
                      >
                        <option value="token">Service Account Token / API Key</option>
                        <option value="basic">Basic Auth (Username &amp; Password)</option>
                        <option value="anonymous">Anonymous (No Auth)</option>
                      </select>
                    </div>

                    {connectForm.authType === 'token' && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-slate-300">API Token / Service Account Token</label>
                        <input
                          type="password"
                          value={connectForm.token}
                          onChange={(e) => setConnectForm({ ...connectForm, token: e.target.value })}
                          placeholder="glsa_..."
                          className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-slate-200 outline-none focus:border-orange-500 font-mono"
                        />
                      </div>
                    )}

                    {connectForm.authType === 'basic' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-medium text-slate-300">Username</label>
                          <input
                            type="text"
                            value={connectForm.username}
                            onChange={(e) => setConnectForm({ ...connectForm, username: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-slate-200 outline-none focus:border-orange-500 font-mono"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-medium text-slate-300">Password</label>
                          <input
                            type="password"
                            value={connectForm.password}
                            onChange={(e) => setConnectForm({ ...connectForm, password: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-slate-200 outline-none focus:border-orange-500 font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {connectError && (
                      <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/20 text-red-400 text-xs flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{connectError}</span>
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleAutoDetect}
                        disabled={autoDetecting}
                        className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-slate-300 text-xs font-semibold cursor-pointer"
                      >
                        {autoDetecting ? 'Scanning...' : 'Auto-Detect Local'}
                      </button>

                      <button
                        type="submit"
                        disabled={connecting}
                        className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold cursor-pointer shadow-lg shadow-orange-950/40"
                      >
                        {connecting ? 'Testing & Connecting...' : 'Save & Connect'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* =====================================================================
          DIAGNOSTICS MODAL
      ====================================================================== */}
      {showDiagnostics && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12131a] border border-neutral-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-orange-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Grafana Diagnostics</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDiagnostics(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono text-slate-300">
              <div className="flex justify-between py-1 border-b border-neutral-850">
                <span className="text-slate-500">Connection State:</span>
                <span className="font-bold text-white">{status?.status || 'Unknown'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-850">
                <span className="text-slate-500">Target URL:</span>
                <span className="text-slate-200">{status?.url || 'None'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-850">
                <span className="text-slate-500">Server Version:</span>
                <span className="text-slate-200">{status?.version || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-850">
                <span className="text-slate-500">Data Sources Count:</span>
                <span className="text-slate-200">{status?.dataSourcesCount ?? 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-850">
                <span className="text-slate-500">Dashboards Count:</span>
                <span className="text-slate-200">{status?.dashboardsCount ?? 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-850">
                <span className="text-slate-500">Alert Rules Count:</span>
                <span className="text-slate-200">{status?.alertsCount ?? 0}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Security:</span>
                <span className="text-emerald-400">AES-256-GCM Encrypted &bull; No Browser Leaks</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDiagnostics(false)}
                className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
