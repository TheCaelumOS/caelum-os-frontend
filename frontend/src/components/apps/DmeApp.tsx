import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Layers,
  Terminal,
  Cpu,
  Server,
  GitBranch,
  Play,
  Clock,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Info,
  Wrench,
  Zap,
} from 'lucide-react';
import {
  dmeApi,
  DmeOverviewMetrics,
  DmeEventRecord,
  DmeValidationReport,
  DmeIntegrationStatus,
  DmeRuleItem,
  DmeSeverity,
  DmeEventSource,
} from '../../lib/dmeApi';
import { DmeLogo, DockerLogo, KubernetesLogo, TerraformLogo, JenkinsLogo, GithubLogo } from '../icons/RealBrandLogos';

export const DmeApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'events' | 'validation' | 'integrations' | 'rules' | 'history'
  >('overview');

  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [overview, setOverview] = useState<DmeOverviewMetrics | null>(null);
  const [events, setEvents] = useState<DmeEventRecord[]>([]);
  const [runs, setRuns] = useState<DmeValidationReport[]>([]);
  const [rules, setRules] = useState<DmeRuleItem[]>([]);
  const [integrations, setIntegrations] = useState<DmeIntegrationStatus[]>([]);
  const [latestReport, setLatestReport] = useState<DmeValidationReport | null>(null);

  // Filters
  const [eventSourceFilter, setEventSourceFilter] = useState<string>('all');
  const [eventSeverityFilter, setEventSeverityFilter] = useState<string>('all');
  const [eventSearch, setEventSearch] = useState<string>('');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [expandedViolationIdx, setExpandedViolationIdx] = useState<number | null>(null);
  const [rulesCategoryFilter, setRulesCategoryFilter] = useState<string>('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ovData, evData, runsData, rulesData, integData] = await Promise.all([
        dmeApi.getOverview().catch(() => null),
        dmeApi.getEvents({ limit: 100 }).catch(() => []),
        dmeApi.getRuns().catch(() => []),
        dmeApi.getRules().catch(() => []),
        dmeApi.getIntegrations().catch(() => []),
      ]);

      if (ovData) setOverview(ovData);
      setEvents(evData || []);
      setRuns(runsData || []);
      setRules(rulesData || []);
      setIntegrations(integData || []);

      if (runsData && runsData.length > 0) {
        setLatestReport(runsData[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunValidation = async () => {
    try {
      setValidating(true);
      const report = await dmeApi.runValidation({ triggeredBy: 'manual' });
      setLatestReport(report);
      // Refresh overview and runs
      await fetchData();
      setActiveTab('validation');
    } catch (err: any) {
      console.error('DME validation failed:', err);
    } finally {
      setValidating(false);
    }
  };

  const handleSyncEvents = async () => {
    try {
      setCapturing(true);
      await dmeApi.captureEvents();
      await fetchData();
    } catch (err: any) {
      console.error('DME capture failed:', err);
    } finally {
      setCapturing(false);
    }
  };

  // Filtered Events
  const filteredEvents = events.filter((e) => {
    if (eventSourceFilter !== 'all' && e.source.toLowerCase() !== eventSourceFilter.toLowerCase()) {
      return false;
    }
    if (eventSeverityFilter !== 'all' && e.severity.toLowerCase() !== eventSeverityFilter.toLowerCase()) {
      return false;
    }
    if (eventSearch.trim()) {
      const q = eventSearch.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchMsg = e.message.toLowerCase().includes(q);
      const matchType = e.eventType.toLowerCase().includes(q);
      if (!matchTitle && !matchMsg && !matchType) return false;
    }
    return true;
  });

  // Source Icon Helper
  const renderSourceIcon = (source: DmeEventSource | string, sizeClass = 'w-4 h-4') => {
    switch (source.toLowerCase()) {
      case 'docker':
        return <DockerLogo className={sizeClass} />;
      case 'kubernetes':
        return <KubernetesLogo className={sizeClass} />;
      case 'terraform':
        return <TerraformLogo className={sizeClass} />;
      case 'jenkins':
        return <JenkinsLogo className={sizeClass} />;
      case 'git':
        return <GithubLogo className={sizeClass} />;
      case 'correlation':
        return <Zap className={`${sizeClass} text-amber-400`} />;
      default:
        return <Activity className={`${sizeClass} text-cyan-400`} />;
    }
  };

  // Severity Badge Helper
  const renderSeverityBadge = (severity: DmeSeverity | string) => {
    const s = severity.toLowerCase();
    if (s === 'critical') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
          <AlertTriangle className="w-3 h-3" /> Critical
        </span>
      );
    }
    if (s === 'high') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <AlertTriangle className="w-3 h-3" /> High
        </span>
      );
    }
    if (s === 'medium') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
          Medium
        </span>
      );
    }
    if (s === 'low') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
          Low
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600/30">
        Info
      </span>
    );
  };

  const healthScore = overview?.healthScore ?? (latestReport?.score ?? 100);
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20';
    if (score >= 60) return 'text-amber-400 border-amber-500/40 bg-amber-950/20';
    return 'text-rose-400 border-rose-500/40 bg-rose-950/20';
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-cyan-950/50 border border-cyan-500/30 shadow-lg shadow-cyan-950/40">
            <DmeLogo className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-wide text-white">DevOps Management Engine</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                DME v0.1
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Cross-infrastructure event correlation, real-time audit & deterministic policy engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncEvents}
            disabled={capturing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all disabled:opacity-50"
            title="Scan connected integrations and capture live events"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${capturing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{capturing ? 'Syncing...' : 'Sync Events'}</span>
          </button>

          <button
            onClick={handleRunValidation}
            disabled={validating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-md shadow-cyan-900/30 border border-cyan-400/30 transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${validating ? 'animate-pulse' : ''}`} />
            <span>{validating ? 'Auditing Engine...' : 'Run Engine Audit'}</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-1 px-5 pt-2 bg-slate-900/60 border-b border-slate-800 text-xs font-medium">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          {
            id: 'validation',
            label: 'Validation Engine',
            icon: ShieldCheck,
            badge: latestReport?.violations?.length ? String(latestReport.violations.length) : undefined,
          },
          {
            id: 'events',
            label: 'Live Events',
            icon: Terminal,
            badge: events.length > 0 ? String(events.length) : undefined,
          },
          { id: 'integrations', label: 'Integrations Hub', icon: Layers },
          { id: 'rules', label: 'Rules & Policies', icon: ShieldAlert },
          { id: 'history', label: 'Audit Runs', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-t-md transition-all border-b-2 font-medium ${
                isActive
                  ? 'border-cyan-400 text-cyan-300 bg-slate-800/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {loading && !overview && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
            <p className="text-sm">Initializing CaelumOS DME Engine...</p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Health Score Card */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between shadow-lg backdrop-blur-sm ${getScoreColor(
                  healthScore,
                )}`}
              >
                <div>
                  <span className="text-xs uppercase font-mono tracking-wider opacity-80">Health Compliance</span>
                  <div className="text-3xl font-extrabold mt-1 tracking-tight">
                    {healthScore.toFixed(1)}
                    <span className="text-base font-normal opacity-70"> / 100</span>
                  </div>
                  <div className="text-xs mt-1 font-medium capitalize">
                    Status: {overview?.overallStatus || (healthScore >= 85 ? 'Passed' : 'Attention')}
                  </div>
                </div>
                <div className="w-14 h-14 rounded-full border-4 border-current flex items-center justify-center font-bold text-sm">
                  {Math.round(healthScore)}%
                </div>
              </div>

              {/* Total Events */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span className="uppercase font-mono tracking-wider">Recorded Events</span>
                  <Terminal className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-2">{overview?.totalEvents ?? events.length}</div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <span className="text-rose-400 font-semibold">{overview?.severityCounts.critical || 0} critical</span>
                  <span>•</span>
                  <span className="text-amber-400 font-semibold">{overview?.severityCounts.high || 0} high</span>
                </div>
              </div>

              {/* Active Violations */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span className="uppercase font-mono tracking-wider">Active Policy Violations</span>
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-2">
                  {latestReport?.violations?.length ?? 0}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Across {latestReport?.totalRulesChecked ?? rules.length} evaluated rules
                </div>
              </div>

              {/* Connected Integrations */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span className="uppercase font-mono tracking-wider">Connected Collectors</span>
                  <Layers className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-2">
                  {integrations.filter((i) => i.connected).length} / {integrations.length || 5}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Docker, K8s, Git, Terraform, Jenkins
                </div>
              </div>
            </div>

            {/* Integration Collectors Bar */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                Collector Status
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {integrations.map((integ) => (
                  <div
                    key={integ.source}
                    className="p-3 rounded-lg border border-slate-800/80 bg-slate-950/60 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      {renderSourceIcon(integ.source, 'w-5 h-5')}
                      <span
                        className={`w-2 h-2 rounded-full ${
                          integ.connected ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-slate-600'
                        }`}
                      />
                    </div>
                    <div className="text-xs font-semibold text-slate-200">{integ.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate" title={integ.status}>
                      {integ.connected ? integ.status : 'Offline'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions & Recent Violations Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Violations Preview */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Policy Violations & Remediation
                    </h3>
                    <button
                      onClick={() => setActiveTab('validation')}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      View all ({latestReport?.violations?.length || 0}) <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  {(!latestReport?.violations || latestReport.violations.length === 0) ? (
                    <div className="py-8 text-center text-slate-400">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-300">All checks passed cleanly</p>
                      <p className="text-xs text-slate-500 mt-1">
                        No active security, configuration, or performance violations detected.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {latestReport.violations.slice(0, 3).map((v, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-lg border border-slate-800 bg-slate-950/80 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">{v.title}</span>
                            {renderSeverityBadge(v.severity)}
                          </div>
                          <p className="text-slate-400">{v.summary}</p>
                          {v.remediation && (
                            <div className="mt-1.5 p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-cyan-300 flex items-start gap-1.5">
                              <Wrench className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                              <span>{v.remediation}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Events Preview */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      Recent Infrastructure Events
                    </h3>
                    <button
                      onClick={() => setActiveTab('events')}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      View stream ({events.length}) <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  {events.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <Terminal className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-400">No events captured yet</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Click "Sync Events" above to collect events from active daemons.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {events.slice(0, 4).map((e) => (
                        <div
                          key={e.id}
                          className="p-2.5 rounded-lg border border-slate-800/80 bg-slate-950/70 text-xs flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {renderSourceIcon(e.source)}
                            <div className="truncate">
                              <div className="font-medium text-slate-200 truncate">{e.title}</div>
                              <div className="text-[11px] text-slate-400 truncate">{e.message}</div>
                            </div>
                          </div>
                          <div className="shrink-0 flex items-center gap-2">
                            {renderSeverityBadge(e.severity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: VALIDATION ENGINE AUDIT */}
        {/* ========================================================================= */}
        {activeTab === 'validation' && (
          <div className="space-y-5">
            {/* Audit Status Bar */}
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">Deterministic Policy Audit</h3>
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                    Engine {latestReport?.engineVersion || 'v0.1.0'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {latestReport?.summary ||
                    'Evaluates root privileges, crash loops, replica availability, secrets, and pipeline health.'}
                </p>
                {latestReport?.timestamp && (
                  <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    Last executed: {new Date(latestReport.timestamp).toLocaleString()}
                    {latestReport.durationMs ? ` (${latestReport.durationMs}ms)` : ''}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`px-4 py-2.5 rounded-lg border flex items-center gap-3 ${getScoreColor(
                    latestReport?.score ?? 100,
                  )}`}
                >
                  <span className="text-xs font-mono uppercase tracking-wider font-semibold">Audit Score</span>
                  <span className="text-2xl font-black">{latestReport?.score?.toFixed(1) ?? '100.0'}</span>
                </div>

                <button
                  onClick={handleRunValidation}
                  disabled={validating}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/40 transition-all disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 fill-current ${validating ? 'animate-pulse' : ''}`} />
                  <span>{validating ? 'Evaluating...' : 'Re-run Engine Audit'}</span>
                </button>
              </div>
            </div>

            {/* Violations List */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Identified Violations ({latestReport?.violations?.length || 0})</span>
                <span className="text-slate-500">
                  {latestReport?.passedRules || 0} passed / {latestReport?.totalRulesChecked || rules.length} checked
                </span>
              </h4>

              {(!latestReport?.violations || latestReport.violations.length === 0) ? (
                <div className="p-8 rounded-xl border border-slate-800 bg-slate-900/40 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <h4 className="text-base font-semibold text-slate-200">Zero Violations Found</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    All evaluated Docker, Kubernetes, Git, Terraform, Jenkins, and correlation rules passed.
                  </p>
                </div>
              ) : (
                latestReport.violations.map((violation, idx) => {
                  const isExpanded = expandedViolationIdx === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-all"
                    >
                      <div
                        onClick={() => setExpandedViolationIdx(isExpanded ? null : idx)}
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-850/60 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {violation.ruleCode}
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-slate-200">{violation.title}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{violation.summary}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {renderSeverityBadge(violation.severity)}
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 bg-slate-950/70 space-y-3">
                          {violation.remediation && (
                            <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 flex items-start gap-2">
                              <Wrench className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold text-cyan-300">Actionable Remediation:</span>
                                <p className="mt-0.5 text-slate-300">{violation.remediation}</p>
                              </div>
                            </div>
                          )}

                          {violation.evidence && Object.keys(violation.evidence).length > 0 && (
                            <div>
                              <span className="text-[11px] font-mono text-slate-400 uppercase">
                                Technical Evidence
                              </span>
                              <pre className="mt-1 p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48">
                                {JSON.stringify(violation.evidence, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Recommendations Section */}
            {latestReport?.recommendations && latestReport.recommendations.length > 0 && (
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Engine Remediation Checklist
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {latestReport.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: LIVE EVENT STREAM */}
        {/* ========================================================================= */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            {/* Filter Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900/70">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    placeholder="Search events, messages, types..."
                    className="pl-8 pr-3 py-1.5 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-56"
                  />
                </div>

                {/* Source Filter */}
                <select
                  value={eventSourceFilter}
                  onChange={(e) => setEventSourceFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Sources</option>
                  <option value="docker">Docker</option>
                  <option value="kubernetes">Kubernetes</option>
                  <option value="git">Git</option>
                  <option value="terraform">Terraform</option>
                  <option value="jenkins">Jenkins</option>
                  <option value="correlation">Correlation</option>
                </select>

                {/* Severity Filter */}
                <select
                  value={eventSeverityFilter}
                  onChange={(e) => setEventSeverityFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="info">Info</option>
                </select>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{filteredEvents.length} events matching filter</span>
                <button
                  onClick={handleSyncEvents}
                  disabled={capturing}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                  title="Rescan events"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${capturing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Events Stream Feed */}
            {filteredEvents.length === 0 ? (
              <div className="py-16 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No events match the selected criteria</p>
                <p className="text-xs mt-1">Adjust filters or click "Sync Events" to capture live events.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredEvents.map((evt) => {
                  const isExpanded = expandedEventId === evt.id;
                  return (
                    <div
                      key={evt.id}
                      className="rounded-lg border border-slate-800/80 bg-slate-900/60 overflow-hidden hover:border-slate-700/80 transition-all"
                    >
                      <div
                        onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                        className="p-3 flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {renderSourceIcon(evt.source, 'w-4 h-4')}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-slate-200 truncate">{evt.title}</span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-400">
                                {evt.eventType}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">{evt.message}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[11px] text-slate-500 font-mono">
                            {new Date(evt.timestamp).toLocaleTimeString()}
                          </span>
                          {renderSeverityBadge(evt.severity)}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-3 pt-2 border-t border-slate-800 bg-slate-950/80 space-y-2">
                          <div className="text-xs text-slate-300">
                            <span className="text-slate-400 font-medium">Full Message: </span>
                            {evt.message}
                          </div>
                          {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                            <div>
                              <span className="text-[10px] font-mono text-slate-400 uppercase">Context Metadata</span>
                              <pre className="mt-1 p-2 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                                {JSON.stringify(evt.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: INTEGRATIONS HUB */}
        {/* ========================================================================= */}
        {activeTab === 'integrations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Infrastructure Collectors</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct connectivity to host container engines, cluster orchestrators, Git repositories, and CI/CD pipelines.
                </p>
              </div>
              <button
                onClick={handleSyncEvents}
                disabled={capturing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${capturing ? 'animate-spin' : ''}`} />
                <span>Refresh Collectors</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.map((integ) => (
                <div
                  key={integ.source}
                  className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                        {renderSourceIcon(integ.source, 'w-6 h-6')}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{integ.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              integ.connected ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-rose-500'
                            }`}
                          />
                          <span
                            className={`text-xs font-medium ${
                              integ.connected ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {integ.connected ? 'Active & Connected' : 'Disconnected / Unreachable'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 text-xs space-y-1">
                    <div className="text-slate-400 font-mono text-[11px]">Runtime Status:</div>
                    <div className="text-slate-200 font-medium">{integ.status}</div>
                    {integ.details && <div className="text-slate-400 text-[11px] mt-1">{integ.details}</div>}
                  </div>

                  {!integ.connected && (
                    <div className="p-2.5 rounded bg-amber-950/20 border border-amber-800/30 text-[11px] text-amber-300 flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        {integ.source === 'docker' && 'Please ensure Docker Desktop daemon is started on host.'}
                        {integ.source === 'kubernetes' && 'Verify kubectl context is set in ~/.kube/config.'}
                        {integ.source === 'jenkins' && 'Connect your Jenkins server in the CaelumOS Jenkins app.'}
                        {integ.source === 'terraform' && 'Ensure terraform is installed and present in system PATH.'}
                        {integ.source === 'git' && 'Ensure active working directory is a git repository.'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: RULES & POLICIES */}
        {/* ========================================================================= */}
        {activeTab === 'rules' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Validation Rules Catalog</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Deterministic inspection suites executed during DME audits.
                </p>
              </div>

              {/* Category Filter */}
              <select
                value={rulesCategoryFilter}
                onChange={(e) => setRulesCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Categories ({rules.length})</option>
                <option value="docker">Docker</option>
                <option value="kubernetes">Kubernetes</option>
                <option value="git">Git</option>
                <option value="terraform">Terraform</option>
                <option value="jenkins">Jenkins</option>
                <option value="correlation">Cross-System Correlation</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rules
                .filter((r) => rulesCategoryFilter === 'all' || r.category.toLowerCase() === rulesCategoryFilter.toLowerCase())
                .map((rule) => (
                  <div
                    key={rule.code}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          {renderSourceIcon(rule.category)}
                          <span className="font-mono text-xs font-bold text-cyan-300">{rule.code}</span>
                        </div>
                        {renderSeverityBadge(rule.severity)}
                      </div>
                      <h4 className="text-xs font-semibold text-slate-200">{rule.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">{rule.description}</p>
                    </div>

                    {rule.remediation && (
                      <div className="mt-2 p-2 rounded bg-slate-950 border border-slate-850 text-[11px] text-slate-300 flex items-start gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{rule.remediation}</span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: AUDIT RUNS HISTORY */}
        {/* ========================================================================= */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Validation Audit Runs History</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Historical record of deterministic engine runs and compliance score progression.
              </p>
            </div>

            {runs.length === 0 ? (
              <div className="py-16 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No historical audit runs recorded</p>
                <p className="text-xs mt-1">Execute "Run Engine Audit" to start logging audit history.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {runs.map((r, i) => (
                  <div
                    key={r.id || i}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-semibold text-slate-200">
                          Audit Run #{runs.length - i}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {new Date(r.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{r.summary}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-slate-400 font-mono">Score</div>
                        <div
                          className={`text-lg font-bold ${
                            r.score >= 85 ? 'text-emerald-400' : r.score >= 60 ? 'text-amber-400' : 'text-rose-400'
                          }`}
                        >
                          {r.score.toFixed(1)}
                        </div>
                      </div>
                      {renderSeverityBadge(r.status === 'passed' ? 'low' : r.status === 'warning' ? 'high' : 'critical')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default DmeApp;
