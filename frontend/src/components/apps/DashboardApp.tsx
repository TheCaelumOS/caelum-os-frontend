"use client";

import React, { useState, useEffect } from 'react';
import { getSocket } from '../../lib/api';
import { Cloud, Cpu, Database, Network, HardDrive, RefreshCw, Layers, ShieldCheck, Heart } from 'lucide-react';

interface SummaryData {
  aws: string;
  azure: string;
  docker: string;
  k8s: string;
  cpu: number;
  ram: number;
  storage: number;
  network: string;
  health: string;
}

export default function DashboardApp() {
  const [data, setData] = useState<SummaryData>({
    aws: ' us-east-1 | 2 EC2 Instances | 4 S3 Buckets | 1 RDS Db',
    azure: ' Pay-As-You-Go | 1 VM | 2 Storage Accounts | 5 RGs',
    docker: ' 3 Containers Active | 8 Images | 3 Volumes',
    k8s: ' k8s-caelum-cluster-1 | 3 Pods running | 1 Deploy',
    cpu: 12.4,
    ram: 42.1,
    storage: 35.0,
    network: '2.4 MB/s',
    health: '100% Operational'
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let socket: any = null;
    try {
      socket = getSocket();
      socket.on('system-stats', (stats: any) => {
        // Dynamically feed live CPU/RAM metrics from telemetry gateway
        const cpuLoad = stats.cpu?.load ?? 12.4;
        const memLoad = stats.memory ? (stats.memory.active / stats.memory.total) * 100 : 42.1;
        
        let netRate = 0;
        if (stats.network && stats.network.length > 0) {
          netRate = (stats.network[0].rx_sec + stats.network[0].tx_sec) / (1024 * 1024); // MB/s
        }

        setData(prev => ({
          ...prev,
          cpu: parseFloat(cpuLoad.toFixed(1)),
          ram: parseFloat(memLoad.toFixed(1)),
          network: `${netRate.toFixed(1)} MB/s`
        }));
      });
    } catch (e) {
      console.warn('Dashboard socket listener connection skipped.', e);
    }

    return () => {
      if (socket) {
        socket.off('system-stats');
      }
    };
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8f9fa] text-slate-800 p-6 space-y-6 select-text font-sans">
      {/* Hero bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-800">CaelumOS Deploy Center</h2>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Aggregate status metrics and cluster health metrics</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors shadow-sm cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Summaries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* AWS Summary Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 text-orange-600">
            <div className="w-10 h-10 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center">
              <Cloud className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-800 block">AWS Summary</span>
              <span className="text-[9px] text-green-500 font-bold uppercase block font-mono">Sync Active</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-mono leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            {data.aws}
          </p>
        </div>

        {/* Azure Summary Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 text-blue-600">
            <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
              <Cloud className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-800 block">Azure Summary</span>
              <span className="text-[9px] text-blue-500 font-bold uppercase block font-mono">Connected</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-mono leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            {data.azure}
          </p>
        </div>

        {/* Docker Summary Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 text-cyan-600">
            <div className="w-10 h-10 bg-cyan-50 border border-cyan-100 rounded-xl flex items-center justify-center">
              <Database className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-800 block">Docker Summary</span>
              <span className="text-[9px] text-cyan-500 font-bold uppercase block font-mono">Daemon Online</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-mono leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            {data.docker}
          </p>
        </div>

        {/* Kubernetes Summary Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 text-indigo-600">
            <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center">
              <Layers className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-800 block">Kubernetes Summary</span>
              <span className="text-[9px] text-indigo-500 font-bold uppercase block font-mono">Kubeconfig Loaded</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-mono leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            {data.k8s}
          </p>
        </div>

        {/* CPU Uptime Progress */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Cpu className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-extrabold text-slate-800">CPU Uptime Load</span>
            </div>
            <span className="text-xs font-extrabold font-mono text-emerald-500">{data.cpu}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${data.cpu}%` }} />
          </div>
        </div>

        {/* RAM Memory Gauge */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Database className="w-5 h-5 text-purple-500" />
              <span className="text-xs font-extrabold text-slate-800">Memory Allocation</span>
            </div>
            <span className="text-xs font-extrabold font-mono text-purple-500">{data.ram}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: `${data.ram}%` }} />
          </div>
        </div>

        {/* Storage Volume Gauge */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <HardDrive className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-extrabold text-slate-800">Storage Volume</span>
            </div>
            <span className="text-xs font-extrabold font-mono text-amber-500">{data.storage}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: `${data.storage}%` }} />
          </div>
        </div>

        {/* Network Bandwidth Gauge */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3.5">
          <div className="flex items-center space-x-2.5 text-cyan-600">
            <div className="w-10 h-10 bg-cyan-50 border border-cyan-100 rounded-xl flex items-center justify-center">
              <Network className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Network Bandwidth</span>
              <span className="text-xs font-extrabold text-slate-700 font-mono mt-0.5 block">{data.network}</span>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3.5">
          <div className="flex items-center space-x-3 text-red-500">
            <div className="w-10 h-10 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center">
              <Heart className="w-5.5 h-5.5 fill-current" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-800 block">System Health</span>
              <span className="text-[10px] text-emerald-500 font-extrabold uppercase block font-mono mt-0.5">{data.health}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
