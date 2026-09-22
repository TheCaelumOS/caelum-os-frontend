"use client";

import React, { useState, useEffect } from 'react';
import { apiRequest, getSocket } from '../../lib/api';
import { getDockerEnvironment } from '../../lib/dockerEnvironment';
import { Cloud, Cpu, Database, Network, HardDrive, RefreshCw, Layers, ShieldCheck, Heart } from 'lucide-react';

interface SummaryData {
  aws: string;
  awsBadge: string;
  azure: string;
  azureBadge: string;
  docker: string;
  dockerBadge: string;
  k8s: string;
  k8sBadge: string;
  cpu: number | null;
  ram: number | null;
  storage: number | null;
  network: string;
  health: string;
}

const isValidNum = (v: any): v is number => typeof v === 'number' && Number.isFinite(v) && !Number.isNaN(v);

export default function DashboardApp() {
  const [data, setData] = useState<SummaryData>(() => {
    const env = getDockerEnvironment();
    return {
      aws: 'Checking AWS status...',
      awsBadge: 'Checking',
      azure: 'Checking Azure status...',
      azureBadge: 'Checking',
      docker: env.isLocalAccessAllowed 
        ? 'Checking local Docker Engine...' 
        : 'Local CaelumOS runtime required to view host container metrics.',
      dockerBadge: env.isLocalAccessAllowed ? 'Checking Engine' : 'Local Engine Required',
      k8s: env.isLocalAccessAllowed
        ? 'Checking active Kubernetes cluster...'
        : 'Local CaelumOS runtime required to view cluster metrics.',
      k8sBadge: env.isLocalAccessAllowed ? 'Checking Cluster' : 'Local Cluster Required',
      cpu: null,
      ram: null,
      storage: null,
      network: 'Checking...',
      health: 'Operational'
    };
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let socket: any = null;
    try {
      socket = getSocket();
      socket.on('system-stats', (stats: any) => {
        if (!stats) return;

        let cpuLoad: number | null = null;
        if (stats.cpu && isValidNum(stats.cpu.load)) {
          cpuLoad = parseFloat(stats.cpu.load.toFixed(1));
        }

        let memLoad: number | null = null;
        if (stats.memory) {
          if (isValidNum(stats.memory.percentage)) {
            memLoad = parseFloat(stats.memory.percentage.toFixed(1));
          } else if (isValidNum(stats.memory.used) && isValidNum(stats.memory.total) && stats.memory.total > 0) {
            memLoad = parseFloat(((stats.memory.used / stats.memory.total) * 100).toFixed(1));
          } else if (isValidNum(stats.memory.active) && isValidNum(stats.memory.total) && stats.memory.total > 0) {
            memLoad = parseFloat(((stats.memory.active / stats.memory.total) * 100).toFixed(1));
          }
        }
        
        let netDisplay = '0.0 MB/s';
        if (Array.isArray(stats.network) && stats.network.length > 0) {
          let totalBytesSec = 0;
          let hasValidMetric = false;
          for (const iface of stats.network) {
            const rx = iface.rx ?? iface.rx_sec;
            const tx = iface.tx ?? iface.tx_sec;
            if (isValidNum(rx) && isValidNum(tx)) {
              totalBytesSec += Math.max(0, rx) + Math.max(0, tx);
              hasValidMetric = true;
            }
          }
          if (hasValidMetric) {
            const mbSec = totalBytesSec / (1024 * 1024);
            netDisplay = `${mbSec.toFixed(1)} MB/s`;
          } else {
            netDisplay = 'N/A';
          }
        } else {
          netDisplay = 'N/A';
        }

        setData(prev => ({
          ...prev,
          ...(cpuLoad !== null && { cpu: cpuLoad }),
          ...(memLoad !== null && { ram: memLoad }),
          network: netDisplay,
        }));
      });
    } catch (e) {
      console.warn('Dashboard socket listener connection skipped.', e);
    }

    fetchAwsStatus();
    fetchAzureStatus();
    fetchDockerStatus();
    fetchKubernetesStatus();
    fetchSystemMetrics();

    return () => {
      if (socket) {
        socket.off('system-stats');
      }
    };
  }, []);

  const fetchAwsStatus = async () => {
    try {
      const res = await apiRequest('/aws/health');
      if (res && res.connected) {
        const region = res.region || 'us-east-1';
        const account = res.accountId ? `Account: ${res.accountId}` : 'Connected';
        setData(prev => ({
          ...prev,
          aws: ` Region: ${region} | ${account}`,
          awsBadge: 'Connected'
        }));
      } else {
        setData(prev => ({
          ...prev,
          aws: 'Unavailable (No AWS account configured)',
          awsBadge: 'Unavailable'
        }));
      }
    } catch {
      setData(prev => ({
        ...prev,
        aws: 'Unavailable',
        awsBadge: 'Unavailable'
      }));
    }
  };

  const fetchAzureStatus = async () => {
    try {
      const res = await apiRequest('/azure/health');
      if (res && res.connected) {
        const subName = res.subscriptionName || 'Azure Subscription';
        const vms = res.virtualMachines ?? 0;
        const sa = res.storageAccounts ?? 0;
        const rgs = res.resourceGroups ?? 0;
        setData(prev => ({
          ...prev,
          azure: ` ${subName} | ${vms} VMs | ${sa} Storage Accounts | ${rgs} RGs`,
          azureBadge: 'Connected'
        }));
      } else {
        setData(prev => ({
          ...prev,
          azure: 'Unavailable (No Azure subscription configured)',
          azureBadge: 'Unavailable'
        }));
      }
    } catch {
      setData(prev => ({
        ...prev,
        azure: 'Unavailable',
        azureBadge: 'Unavailable'
      }));
    }
  };

  const fetchDockerStatus = async () => {
    const env = getDockerEnvironment();
    if (!env.isLocalAccessAllowed && !env.isRemoteBackendConfigured) {
      setData(prev => ({
        ...prev,
        docker: 'Local CaelumOS runtime required to view host container metrics.',
        dockerBadge: 'Local Engine Required'
      }));
      return;
    }

    try {
      const [res, containers] = await Promise.all([
        apiRequest('/docker/status').catch(() => null),
        apiRequest('/docker/containers').catch(() => []),
      ]);

      if (res && res.connected) {
        const contList = Array.isArray(containers) && containers.length > 0 
          ? containers 
          : (Array.isArray(res.containers) ? res.containers : []);
        const activeContainers = contList.filter((c: any) => 
          c.state === 'running' || (typeof c.status === 'string' && c.status.toLowerCase().startsWith('up'))
        );
        const cCount = activeContainers.length;
        const iCount = res.images?.length ?? 0;
        const vCount = res.volumes?.length ?? 0;
        setData(prev => ({
          ...prev,
          docker: ` ${cCount} Containers Active | ${iCount} Images | ${vCount} Volumes`,
          dockerBadge: 'Daemon Online'
        }));
      } else {
        setData(prev => ({
          ...prev,
          docker: 'Local Docker daemon is stopped or unreachable.',
          dockerBadge: 'Daemon Offline'
        }));
      }
    } catch {
      setData(prev => ({
        ...prev,
        docker: 'Local CaelumOS backend service unreachable.',
        dockerBadge: 'Daemon Offline'
      }));
    }
  };

  const fetchKubernetesStatus = async () => {
    const env = getDockerEnvironment();
    if (!env.isLocalAccessAllowed && !env.isRemoteBackendConfigured) {
      setData(prev => ({
        ...prev,
        k8s: 'Local CaelumOS runtime required to view cluster metrics.',
        k8sBadge: 'Local Cluster Required'
      }));
      return;
    }

    try {
      const res = await apiRequest('/kubernetes/cluster-info');
      if (res && res.connected) {
        const pCount = res.podCount ?? 0;
        const dCount = res.deploymentCount ?? 0;
        const ctx = res.context || 'cluster';
        setData(prev => ({
          ...prev,
          k8s: ` ${ctx} | ${pCount} Pods running | ${dCount} Deploys`,
          k8sBadge: 'Cluster Online'
        }));
      } else {
        setData(prev => ({
          ...prev,
          k8s: 'Unavailable (Cluster unreachable or no context)',
          k8sBadge: 'Cluster Offline'
        }));
      }
    } catch {
      setData(prev => ({
        ...prev,
        k8s: 'Unavailable',
        k8sBadge: 'Cluster Offline'
      }));
    }
  };

  const fetchSystemMetrics = async () => {
    try {
      const [cpuRes, memRes, storageRes] = await Promise.all([
        apiRequest('/system/cpu').catch(() => null),
        apiRequest('/system/memory').catch(() => null),
        apiRequest('/system/storage').catch(() => null),
      ]);

      setData(prev => {
        let cpu = prev.cpu;
        let ram = prev.ram;
        let storage = prev.storage;

        if (cpuRes && isValidNum(cpuRes.load)) {
          cpu = parseFloat(cpuRes.load.toFixed(1));
        }
        if (memRes && isValidNum(memRes.percentage)) {
          ram = parseFloat(memRes.percentage.toFixed(1));
        }
        if (storageRes && Array.isArray(storageRes.volumes) && storageRes.volumes.length > 0) {
          const mainVol = storageRes.volumes[0];
          if (isValidNum(mainVol.use)) {
            storage = parseFloat(mainVol.use.toFixed(1));
          }
        }

        return {
          ...prev,
          cpu,
          ram,
          storage,
        };
      });
    } catch {
      // ignore
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchAwsStatus();
    fetchAzureStatus();
    fetchDockerStatus();
    fetchKubernetesStatus();
    fetchSystemMetrics();
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

      {/* Primary Deploy Center Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* AWS Summary Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 text-amber-600">
            <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center">
              <Cloud className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-800 block">AWS Summary</span>
              <span className={`text-[9px] font-bold uppercase block font-mono ${
                data.awsBadge === 'Connected' ? 'text-amber-500' : 'text-slate-400'
              }`}>
                {data.awsBadge}
              </span>
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
              <span className={`text-[9px] font-bold uppercase block font-mono ${
                data.azureBadge === 'Connected' ? 'text-blue-500' : 'text-slate-400'
              }`}>
                {data.azureBadge}
              </span>
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
              <span className={`text-[9px] font-bold uppercase block font-mono ${
                data.dockerBadge === 'Daemon Online' 
                  ? 'text-cyan-500' 
                  : data.dockerBadge === 'Local Engine Required'
                    ? 'text-amber-500'
                    : 'text-slate-400'
              }`}>
                {data.dockerBadge}
              </span>
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
              <span className={`text-[9px] font-bold uppercase block font-mono ${
                data.k8sBadge === 'Cluster Online'
                  ? 'text-indigo-500'
                  : data.k8sBadge === 'Cluster Offline'
                    ? 'text-amber-500'
                    : 'text-slate-400'
              }`}>
                {data.k8sBadge}
              </span>
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
            <span className="text-xs font-extrabold font-mono text-emerald-500">
              {isValidNum(data.cpu) ? `${data.cpu}%` : 'N/A'}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${isValidNum(data.cpu) ? Math.min(100, Math.max(0, data.cpu)) : 0}%` }} 
            />
          </div>
        </div>

        {/* RAM Memory Gauge */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Database className="w-5 h-5 text-purple-500" />
              <span className="text-xs font-extrabold text-slate-800">Memory Allocation</span>
            </div>
            <span className="text-xs font-extrabold font-mono text-purple-500">
              {isValidNum(data.ram) ? `${data.ram}%` : 'N/A'}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${isValidNum(data.ram) ? Math.min(100, Math.max(0, data.ram)) : 0}%` }} 
            />
          </div>
        </div>

        {/* Storage Volume Gauge */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <HardDrive className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-extrabold text-slate-800">Storage Volume</span>
            </div>
            <span className="text-xs font-extrabold font-mono text-amber-500">
              {isValidNum(data.storage) ? `${data.storage}%` : 'N/A'}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div 
              className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${isValidNum(data.storage) ? Math.min(100, Math.max(0, data.storage)) : 0}%` }} 
            />
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
              <span className="text-xs font-extrabold text-slate-700 font-mono mt-0.5 block">
                {data.network && !data.network.includes('NaN') ? data.network : 'N/A'}
              </span>
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
