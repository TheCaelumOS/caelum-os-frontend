"use client";

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { Network, RefreshCw, Cpu, Layers, Server } from 'lucide-react';

interface Pod {
  name: string;
  namespace: string;
  status: string;
  ip: string;
  node: string;
  age: string;
}

interface Deployment {
  name: string;
  namespace: string;
  replicas: string;
  available: number;
  age: string;
}

export default function KubernetesApp() {
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [activeNamespace, setActiveNamespace] = useState<string>('default');
  const [pods, setPods] = useState<Pod[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tab, setTab] = useState<'pods' | 'deployments'>('pods');

  const fetchClusterInfo = async () => {
    setLoading(true);
    try {
      const nsList = await apiRequest('/kubernetes/namespaces');
      setNamespaces(nsList);
      if (nsList.length > 0 && !nsList.includes(activeNamespace)) {
        setActiveNamespace(nsList[0]);
      }
      await fetchNamespacedResources(activeNamespace);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchNamespacedResources = async (ns: string) => {
    try {
      const [podList, depList] = await Promise.all([
        apiRequest(`/kubernetes/pods?namespace=${ns}`),
        apiRequest(`/kubernetes/deployments?namespace=${ns}`),
      ]);
      setPods(podList);
      setDeployments(depList);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchClusterInfo();
  }, []);

  useEffect(() => {
    if (activeNamespace) {
      fetchNamespacedResources(activeNamespace);
    }
  }, [activeNamespace]);

  return (
    <div className="flex-1 flex bg-[#0c0c0e] text-slate-100 min-h-0 select-text font-sans">
      {/* Sidebar: Namespaces list */}
      <div className="w-1/4 border-r border-neutral-800 flex flex-col min-h-0 bg-[#0f0f12]">
        <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Namespaces</span>
          <button 
            onClick={fetchClusterInfo} 
            disabled={loading}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto p-2 space-y-1.5">
          {namespaces.map(ns => (
            <div
              key={ns}
              onClick={() => setActiveNamespace(ns)}
              className={`p-2 rounded-xl text-xs font-mono font-bold cursor-pointer transition-all border ${
                activeNamespace === ns 
                  ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' 
                  : 'bg-neutral-900/40 border-neutral-850 hover:bg-neutral-900/80 text-slate-350'
              }`}
            >
              {ns}
            </div>
          ))}
        </div>
      </div>

      {/* Main panel: Pods, Deployments and cluster status */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#0c0c0e]">
        {/* Header Tabs */}
        <div className="p-3 bg-[#0f0f12] border-b border-neutral-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTab('pods')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                tab === 'pods' ? 'bg-blue-600 text-white shadow-sm' : 'bg-neutral-900 border border-neutral-800 text-slate-400 hover:text-white'
              }`}
            >
              Pods ({pods.length})
            </button>
            <button
              onClick={() => setTab('deployments')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                tab === 'deployments' ? 'bg-blue-600 text-white shadow-sm' : 'bg-neutral-900 border border-neutral-800 text-slate-400 hover:text-white'
              }`}
            >
              Deployments ({deployments.length})
            </button>
          </div>
          <span className="text-[10px] bg-green-500/15 border border-green-500/25 text-green-400 px-2 py-0.5 rounded font-extrabold uppercase font-mono tracking-wider">
            Connected K8s
          </span>
        </div>

        {/* Content list area */}
        <div className="flex-grow overflow-y-auto p-4 min-h-0 bg-[#08080a]">
          {tab === 'pods' && (
            <div className="space-y-3">
              {pods.map(p => (
                <div key={p.name} className="p-3 bg-neutral-900/35 border border-neutral-900/80 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-xs text-slate-200 truncate max-w-[200px]">{p.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9.5px] text-slate-400 font-mono">
                      <div>IP: <span className="text-slate-350">{p.ip}</span></div>
                      <div>Node: <span className="text-slate-350">{p.node}</span></div>
                    </div>
                  </div>
                  <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 uppercase font-mono">
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {tab === 'deployments' && (
            <div className="space-y-3">
              {deployments.map(d => (
                <div key={d.name} className="p-3 bg-neutral-900/35 border border-neutral-900/80 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <Server className="w-4 h-4 text-blue-500" />
                      <span className="font-bold text-xs text-slate-200">{d.name}</span>
                    </div>
                    <div className="text-[9.5px] text-slate-450 font-mono">Available replicas: <span className="text-slate-300 font-bold">{d.available}</span></div>
                  </div>
                  <span className="text-[9px] font-bold font-mono bg-neutral-800 text-slate-300 px-2 py-0.5 rounded border border-neutral-700">
                    Replicas: {d.replicas}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
