'use client';

import React, { useState } from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X, 
  ExternalLink, 
  Server, 
  Layers, 
  Terminal, 
  GitBranch, 
  Cloud, 
  ShieldCheck, 
  Laptop
} from 'lucide-react';
import { RuntimeSystemInfo, checkCaelumRuntimeStatus } from '../lib/caelumRuntime';

interface CaelumRuntimePanelProps {
  isOpen: boolean;
  onClose: () => void;
  runtimeInfo: RuntimeSystemInfo | null;
  onRefresh: () => Promise<void>;
  loading?: boolean;
}

export default function CaelumRuntimePanel({
  isOpen,
  onClose,
  runtimeInfo,
  onRefresh,
  loading = false,
}: CaelumRuntimePanelProps) {
  const [refreshing, setRefreshing] = useState(false);

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const isRunning = !!runtimeInfo;
  const infra = runtimeInfo?.infrastructure;

  const renderStatusPill = (status: string, label?: string) => {
    switch (status) {
      case 'connected':
      case 'ready':
      case 'authenticated':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>● {label || (status === 'authenticated' ? 'Authenticated' : status === 'ready' ? 'Ready' : 'Connected')}</span>
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 font-mono text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>○ Offline</span>
          </span>
        );
      case 'not_configured':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 font-mono text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>○ Not Configured</span>
          </span>
        );
      case 'not_authenticated':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-slate-400 font-mono text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span>○ Not Authenticated</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-neutral-800/80 border border-neutral-700/60 text-slate-400 font-mono text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span>○ Not Installed</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#0e0e11] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden font-sans text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-neutral-800 bg-[#121216]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Cpu className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white tracking-tight">CaelumOS Runtime Manager</h2>
              <span className="text-[10px] font-mono text-slate-400">Operating System Infrastructure Daemon</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Runtime Status Banner */}
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block mb-1">
                CAELUMOS RUNTIME
              </span>
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-xs font-bold text-white font-mono">
                  {isRunning ? `Running (v${runtimeInfo?.runtime.version || '1.0.0'})` : 'Disconnected (Web Sandbox)'}
                </span>
                {isRunning && (
                  <span className="text-[10px] font-mono text-slate-400 bg-neutral-800 px-2 py-0.5 rounded">
                    127.0.0.1:48721
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-slate-300 hover:text-white transition-colors border border-neutral-700/80 cursor-pointer"
              title="Refresh Infrastructure Diagnostics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing || loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Infrastructure Tool Matrix */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block px-1">
              LOCAL INFRASTRUCTURE
            </span>

            <div className="divide-y divide-neutral-850 rounded-xl bg-neutral-900/50 border border-neutral-800 overflow-hidden">
              
              {/* Docker */}
              <div className="p-3 sm:px-4 flex items-center justify-between hover:bg-neutral-850/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Docker</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {infra?.docker?.version || (infra?.docker?.installed ? 'Installed' : 'Docker CLI')}
                    </span>
                  </div>
                </div>
                <div>
                  {renderStatusPill(infra?.docker?.status || 'not_installed')}
                </div>
              </div>

              {/* Kubernetes */}
              <div className="p-3 sm:px-4 flex items-center justify-between hover:bg-neutral-850/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Kubernetes</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {infra?.kubernetes?.context ? `Context: ${infra.kubernetes.context}` : (infra?.kubernetes?.version || 'kubectl')}
                    </span>
                  </div>
                </div>
                <div>
                  {renderStatusPill(infra?.kubernetes?.status || 'not_installed')}
                </div>
              </div>

              {/* Git */}
              <div className="p-3 sm:px-4 flex items-center justify-between hover:bg-neutral-850/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Git</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {infra?.git?.userName ? `${infra.git.userName}` : (infra?.git?.version || 'Git CLI')}
                    </span>
                  </div>
                </div>
                <div>
                  {renderStatusPill(infra?.git?.status || 'not_installed')}
                </div>
              </div>

              {/* Terraform */}
              <div className="p-3 sm:px-4 flex items-center justify-between hover:bg-neutral-850/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Terraform</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {infra?.terraform?.version || 'Terraform CLI'}
                    </span>
                  </div>
                </div>
                <div>
                  {renderStatusPill(infra?.terraform?.status || 'not_installed')}
                </div>
              </div>

              {/* AWS */}
              <div className="p-3 sm:px-4 flex items-center justify-between hover:bg-neutral-850/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">AWS CLI</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {infra?.aws?.account ? `Account: ${infra.aws.account}` : 'AWS CLI'}
                    </span>
                  </div>
                </div>
                <div>
                  {renderStatusPill(infra?.aws?.status || 'not_installed')}
                </div>
              </div>

              {/* Azure */}
              <div className="p-3 sm:px-4 flex items-center justify-between hover:bg-neutral-850/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Azure CLI</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {infra?.azure?.user ? `${infra.azure.user}` : 'Azure CLI'}
                    </span>
                  </div>
                </div>
                <div>
                  {renderStatusPill(infra?.azure?.status || 'not_installed')}
                </div>
              </div>

            </div>
          </div>

          {/* Privacy & Architecture Guarantee */}
          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-300/90 leading-relaxed font-sans flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-purple-200 block text-[11px]">Strict Localhost Isolation</span>
              <p className="text-[11px] text-purple-300/80">
                All infrastructure commands run locally on this machine via loopback (<code className="text-purple-200">127.0.0.1</code>). Zero credentials, kubeconfigs, or Docker sockets are ever transmitted to the cloud.
              </p>
            </div>
          </div>

          {!isRunning && (
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/25 text-amber-300 text-xs flex items-center justify-between">
              <span>Running CaelumOS from remote browser?</span>
              <a
                href="/download"
                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-lg font-bold text-[11px] transition"
              >
                Get Runtime
              </a>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-[#121216] flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[10px]">CaelumOS Desktop Environment</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-white text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
