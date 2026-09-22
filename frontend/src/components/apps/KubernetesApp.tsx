"use client";

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { Network, RefreshCw, Cpu, Layers, Server, AlertCircle, HardDrive, Shield } from 'lucide-react';

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

interface ClusterSummary {
  connected: boolean;
  context?: string;
  server?: string;
  version?: string;
  status?: string;
  nodeCount?: number;
  podCount?: number;
  deploymentCount?: number;
  namespaceCount?: number;
  error?: string;
}

interface NodeItem {
  name: string;
  status: string;
  roles: string;
  version: string;
  os: string;
  internalIP: string;
  age: string;
}

interface ServiceItem {
  name: string;
  namespace: string;
  type: string;
  clusterIP: string;
  ports: string;
  age: string;
}

interface StatefulSetItem {
  name: string;
  namespace: string;
  replicas: string;
  age: string;
}

interface IngressItem {
  name: string;
  namespace: string;
  rules: string;
  age: string;
}

interface EventItem {
  timestamp: string;
  type: string;
  reason: string;
  message: string;
  object: string;
  namespace: string;
}

interface KubernetesAppProps {
  initialSubPath?: string;
  onPathChange?: (subpath: string) => void;
}

export default function KubernetesApp({ initialSubPath = '', onPathChange }: KubernetesAppProps) {
  const [clusterInfo, setClusterInfo] = useState<ClusterSummary | null>(null);
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [activeNamespace, setActiveNamespace] = useState<string>('default');
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  const [pods, setPods] = useState<Pod[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [statefulSets, setStatefulSets] = useState<StatefulSetItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [ingresses, setIngresses] = useState<IngressItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Tabs mapping
  const [activeTab, setActiveTab] = useState<string>(initialSubPath || 'pods');

  const tabs = [
    { id: 'clusters', name: 'Clusters' },
    { id: 'nodes', name: 'Nodes' },
    { id: 'namespaces', name: 'Namespaces' },
    { id: 'pods', name: 'Pods' },
    { id: 'deployments', name: 'Deployments' },
    { id: 'statefulsets', name: 'StatefulSets' },
    { id: 'services', name: 'Services' },
    { id: 'ingress', name: 'Ingress Routes' },
    { id: 'logs', name: 'Cluster Logs' },
  ];

  const fetchClusterInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const summary: ClusterSummary = await apiRequest('/kubernetes/cluster-info');
      if (!summary || !summary.connected) {
        setError(summary?.error || 'Kubernetes cluster connection unavailable. Ensure minikube or local cluster is running.');
        setClusterInfo(summary || null);
        setNamespaces([]);
        setNodes([]);
        setPods([]);
        setDeployments([]);
        setStatefulSets([]);
        setServices([]);
        setIngresses([]);
        setEvents([]);
        return;
      }

      setClusterInfo(summary);

      const [nsList, nodeList] = await Promise.all([
        apiRequest('/kubernetes/namespaces'),
        apiRequest('/kubernetes/nodes'),
      ]);

      const validNamespaces = Array.isArray(nsList) ? nsList : [];
      setNamespaces(validNamespaces);
      setNodes(Array.isArray(nodeList) ? nodeList : []);

      let nextNs = activeNamespace;
      if (validNamespaces.length > 0 && nextNs !== 'all' && !validNamespaces.includes(nextNs)) {
        nextNs = validNamespaces.includes('default') ? 'default' : validNamespaces[0];
        setActiveNamespace(nextNs);
      }

      await fetchNamespacedResources(nextNs);
    } catch (e: any) {
      console.warn('Kubernetes cluster unreachable:', e);
      setError('Kubernetes cluster connection unavailable. Ensure minikube or local cluster is running.');
      setClusterInfo(null);
      setNamespaces([]);
      setNodes([]);
      setPods([]);
      setDeployments([]);
      setStatefulSets([]);
      setServices([]);
      setIngresses([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNamespacedResources = async (ns: string) => {
    try {
      const [podList, depList, ssList, svcList, ingList, evList] = await Promise.all([
        apiRequest(`/kubernetes/pods?namespace=${ns}`),
        apiRequest(`/kubernetes/deployments?namespace=${ns}`),
        apiRequest(`/kubernetes/statefulsets?namespace=${ns}`),
        apiRequest(`/kubernetes/services?namespace=${ns}`),
        apiRequest(`/kubernetes/ingress?namespace=${ns}`),
        apiRequest(`/kubernetes/events?namespace=${ns}`),
      ]);
      setPods(Array.isArray(podList) ? podList : []);
      setDeployments(Array.isArray(depList) ? depList : []);
      setStatefulSets(Array.isArray(ssList) ? ssList : []);
      setServices(Array.isArray(svcList) ? svcList : []);
      setIngresses(Array.isArray(ingList) ? ingList : []);
      setEvents(Array.isArray(evList) ? evList : []);
    } catch (e) {
      console.warn('Error fetching namespaced resources:', e);
    }
  };

  useEffect(() => {
    fetchClusterInfo();
  }, []);

  useEffect(() => {
    if (clusterInfo?.connected && activeNamespace) {
      fetchNamespacedResources(activeNamespace);
    }
  }, [activeNamespace]);

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

  return (
    <div className="flex-grow flex bg-[#0c0c0e] text-slate-100 min-h-0 select-text font-sans h-full">
      {/* Side Navigation Bar */}
      <div className="w-1/4 bg-[#0f0f12] border-r border-neutral-850 p-3 space-y-4 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5 px-3 py-2 border-b border-neutral-850 mb-3">
            <Layers className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="font-extrabold text-xs text-slate-200 block">K8s Engine</span>
              <span className={`text-[8px] uppercase font-bold font-mono ${error ? 'text-amber-500 font-extrabold animate-pulse' : 'text-indigo-400'}`}>
                {error ? 'Cluster Offline' : `Status: ${clusterInfo?.status || 'Ready'}`}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => selectTab(t.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === t.id 
                    ? 'bg-indigo-500/10 text-indigo-450' 
                    : 'hover:bg-neutral-900 text-slate-400'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={fetchClusterInfo}
          className="w-full py-1.5 border border-neutral-850 hover:bg-neutral-900 transition-colors text-slate-400 hover:text-slate-200 text-[10px] font-bold rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Cluster</span>
        </button>
      </div>

      {/* Main Content Pane */}
      <div className="flex-grow overflow-y-auto p-5 min-h-0 bg-[#08080a]">
        {error && (
          <div className="mb-4 p-3 bg-amber-950/20 border border-amber-500/20 rounded-2xl flex items-center justify-between text-xs text-amber-400 shadow-sm font-sans">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-4.5 h-4.5 text-amber-500 flex-shrink-0" />
              <span className="font-semibold text-amber-300">Kubernetes cluster unreachable. Ensure minikube or your local Kubernetes cluster is running with a valid kubectl context.</span>
            </div>
            <button 
              onClick={fetchClusterInfo}
              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded-lg cursor-pointer transition-all border border-amber-500/30"
            >
              Retry
            </button>
          </div>
        )}

        {activeTab === 'pods' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">Pods (Namespace: {activeNamespace === 'all' ? 'All Namespaces' : activeNamespace})</h4>
              <select
                value={activeNamespace}
                onChange={(e) => setActiveNamespace(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
              >
                <option value="all">All Namespaces</option>
                {namespaces.map(ns => (
                  <option key={ns} value={ns}>{ns}</option>
                ))}
              </select>
            </div>
            {pods.length === 0 ? (
              <div className="p-4 bg-neutral-900/40 border border-neutral-850 rounded-2xl text-xs font-mono text-slate-450">
                {error ? 'Unable to load pods while cluster is unreachable.' : `No pods found in ${activeNamespace === 'all' ? 'cluster' : 'namespace ' + activeNamespace}.`}
              </div>
            ) : (
              <div className="space-y-3">
                {pods.map(p => (
                  <div key={p.name} className="p-3 bg-neutral-900/35 border border-neutral-900/85 rounded-2xl flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2.5">
                        <Layers className="w-4 h-4 text-cyan-400" />
                        <span className="font-bold text-xs text-slate-200 truncate max-w-[260px]">{p.name}</span>
                        {p.namespace && (
                          <span className="text-[9px] bg-neutral-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                            {p.namespace}
                          </span>
                        )}
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
          </div>
        )}

        {activeTab === 'deployments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider font-sans">
                Deployments (Namespace: {activeNamespace === 'all' ? 'All Namespaces' : activeNamespace})
              </h4>
              <select
                value={activeNamespace}
                onChange={(e) => setActiveNamespace(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
              >
                <option value="all">All Namespaces</option>
                {namespaces.map(ns => (
                  <option key={ns} value={ns}>{ns}</option>
                ))}
              </select>
            </div>
            {deployments.length === 0 ? (
              <div className="p-4 bg-neutral-900/40 border border-neutral-850 rounded-2xl text-xs font-mono text-slate-450">
                {error ? 'Unable to load deployments while cluster is unreachable.' : `No deployments found in ${activeNamespace === 'all' ? 'cluster' : 'namespace ' + activeNamespace}.`}
              </div>
            ) : (
              <div className="space-y-3">
                {deployments.map(d => (
                  <div key={d.name} className="p-3 bg-neutral-900/35 border border-neutral-900/85 rounded-2xl flex items-center justify-between font-mono">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2.5 font-sans">
                        <Server className="w-4 h-4 text-blue-500" />
                        <span className="font-bold text-xs text-slate-200">{d.name}</span>
                        {d.namespace && (
                          <span className="text-[9px] bg-neutral-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                            {d.namespace}
                          </span>
                        )}
                      </div>
                      <div className="text-[9.5px] text-slate-450">Available replicas: <span className="text-slate-300 font-bold">{d.available}</span></div>
                    </div>
                    <span className="text-[9px] font-bold bg-neutral-850 text-slate-300 px-2 py-0.5 rounded border border-neutral-800">
                      Replicas: {d.replicas}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'clusters' && (
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">Kubernetes Clusters</h4>
            {clusterInfo && clusterInfo.connected ? (
              <div className="p-4 bg-neutral-900/40 border border-neutral-850 rounded-2xl space-y-3 text-xs text-slate-300 font-mono">
                <div className="flex justify-between items-center font-sans">
                  <span className="font-extrabold text-slate-200">{clusterInfo.context}</span>
                  <span className="text-[9px] bg-green-500/15 border border-green-500/25 text-green-400 px-2 py-0.5 rounded uppercase font-bold">
                    {clusterInfo.status || 'Active'}
                  </span>
                </div>
                <div className="border-t border-neutral-850 pt-2 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                  <div>API Endpoint: <span className="font-bold text-slate-300">{clusterInfo.server}</span></div>
                  <div>Kubernetes Version: <span className="font-bold text-slate-300">{clusterInfo.version}</span></div>
                  <div>Active Nodes: <span className="font-bold text-slate-300">{clusterInfo.nodeCount}</span></div>
                  <div>Active Pods: <span className="font-bold text-slate-300">{clusterInfo.podCount}</span></div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-neutral-900/40 border border-neutral-850 rounded-2xl text-xs font-mono text-slate-450">
                {error || 'No active Kubernetes clusters connected to CaelumOS.'}
              </div>
            )}
          </div>
        )}

        {activeTab === 'nodes' && (
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">Cluster Nodes</h4>
            {nodes.length === 0 ? (
              <div className="p-4 bg-neutral-900/40 border border-neutral-850 rounded-2xl text-xs font-mono text-slate-450">
                {error ? 'Unable to load nodes while cluster is unreachable.' : 'No nodes found in cluster.'}
              </div>
            ) : (
              <div className="space-y-3">
                {nodes.map(n => (
                  <div key={n.name} className="p-3.5 bg-neutral-900/40 border border-neutral-850 rounded-2xl flex items-center justify-between text-xs font-mono text-slate-300">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold font-sans">{n.name}</span>
                        <span className="text-[9px] bg-neutral-800 text-slate-400 px-1.5 py-0.5 rounded">
                          {n.roles}
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-450">
                        IP: {n.internalIP} | OS: {n.os} | Kubelet: {n.version}
                      </div>
                    </div>
                    <span className={`text-[8px] px-1.5 py-0.5 border rounded font-bold uppercase ${
                      n.status === 'Ready' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {n.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'namespaces' && (
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">Namespaces</h4>
            {namespaces.length === 0 ? (
              <div className="p-4 bg-neutral-900/40 border border-neutral-850 rounded-2xl text-xs font-mono text-slate-450">
                {error ? 'Unable to load namespaces while cluster is unreachable.' : 'No namespaces found.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {namespaces.map(ns => (
                  <div key={ns} className="p-3 bg-neutral-900/40 border border-neutral-850 rounded-2xl flex items-center space-x-3 text-xs text-slate-300">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 font-bold font-mono">ns</div>
                    <div>
                      <span className="font-bold block">{ns}</span>
                      <span className="text-[9px] text-slate-450 font-mono">Status: Active</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'statefulsets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">
                StatefulSets (Namespace: {activeNamespace === 'all' ? 'All Namespaces' : activeNamespace})
              </h4>
              <select
                value={activeNamespace}
                onChange={(e) => setActiveNamespace(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
              >
                <option value="all">All Namespaces</option>
                {namespaces.map(ns => (
                  <option key={ns} value={ns}>{ns}</option>
                ))}
              </select>
            </div>
            {statefulSets.length === 0 ? (
              <div className="p-4 bg-neutral-900/40 border border-neutral-850 rounded-2xl text-xs font-mono text-slate-450">
                {error ? 'Unable to load StatefulSets while cluster is unreachable.' : 'No active StatefulSets configured in workspace namespace.'}
              </div>
            ) : (
              <div className="space-y-3">
                {statefulSets.map(ss => (
                  <div key={ss.name} className="p-3 bg-neutral-900/35 border border-neutral-900/85 rounded-2xl flex items-center justify-between font-mono">
                    <div className="space-y-1">
                      <span className="font-bold text-xs text-slate-200">{ss.name}</span>
                      <div className="text-[9.5px] text-slate-450">Namespace: {ss.namespace}</div>
                    </div>
                    <span className="text-[9px] font-bold bg-neutral-850 text-slate-300 px-2 py-0.5 rounded border border-neutral-800">
                      Replicas: {ss.replicas}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">
                Cluster Services (Namespace: {activeNamespace === 'all' ? 'All Namespaces' : activeNamespace})
              </h4>
              <select
                value={activeNamespace}
                onChange={(e) => setActiveNamespace(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
              >
                <option value="all">All Namespaces</option>
                {namespaces.map(ns => (
                  <option key={ns} value={ns}>{ns}</option>
                ))}
              </select>
            </div>
            {services.length === 0 ? (
              <div className="p-4 bg-neutral-900/40 border border-neutral-850 rounded-2xl text-xs font-mono text-slate-450">
                {error ? 'Unable to load services while cluster is unreachable.' : 'No services found in namespace.'}
              </div>
            ) : (
              <div className="space-y-3 font-mono text-xs text-slate-300">
                {services.map(svc => (
                  <div key={svc.name + svc.namespace} className="p-3 bg-neutral-900/40 border border-neutral-850 rounded-2xl flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-200">{svc.name}</span>
                        {svc.namespace && (
                          <span className="text-[9px] bg-neutral-800 text-slate-400 px-1.5 py-0.5 rounded">
                            {svc.namespace}
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] text-slate-450">Type: {svc.type} | Cluster-IP: {svc.clusterIP}</div>
                    </div>
                    <span className="text-[9px] text-indigo-400 font-bold">Port: {svc.ports}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ingress' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">
                Ingress Controllers (Namespace: {activeNamespace === 'all' ? 'All Namespaces' : activeNamespace})
              </h4>
              <select
                value={activeNamespace}
                onChange={(e) => setActiveNamespace(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
              >
                <option value="all">All Namespaces</option>
                {namespaces.map(ns => (
                  <option key={ns} value={ns}>{ns}</option>
                ))}
              </select>
            </div>
            {ingresses.length === 0 ? (
              <div className="p-4 bg-neutral-900/40 border border-neutral-850 rounded-2xl text-xs font-mono text-slate-450">
                {error ? 'Unable to load ingress while cluster is unreachable.' : 'No Ingress controllers or rules found.'}
              </div>
            ) : (
              <div className="space-y-3 font-mono text-xs text-slate-300">
                {ingresses.map(ing => (
                  <div key={ing.name + ing.namespace} className="p-3 bg-neutral-900/40 border border-neutral-850 rounded-2xl text-xs font-mono text-slate-300 flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-200">{ing.name}</span>
                        {ing.namespace && (
                          <span className="text-[9px] bg-neutral-800 text-slate-400 px-1.5 py-0.5 rounded">
                            {ing.namespace}
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] text-slate-450">{ing.rules}</div>
                    </div>
                    <span className="text-[9px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20">Active</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-4 flex flex-col h-full min-h-[300px]">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">Cluster Logs Event Stream</h4>
              <select
                value={activeNamespace}
                onChange={(e) => setActiveNamespace(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
              >
                <option value="all">All Namespaces</option>
                {namespaces.map(ns => (
                  <option key={ns} value={ns}>{ns}</option>
                ))}
              </select>
            </div>
            {events.length === 0 ? (
              <div className="p-4 bg-neutral-900/40 border border-neutral-850 rounded-2xl text-xs font-mono text-slate-450">
                {error ? 'Unable to load events while cluster is unreachable.' : 'No cluster events recorded.'}
              </div>
            ) : (
              <pre className="flex-1 p-3 bg-black/45 border border-neutral-900 rounded-2xl text-[10px] text-slate-350 font-mono overflow-auto leading-relaxed whitespace-pre-wrap">
                {events.map(ev => `${ev.timestamp} [${ev.reason}] ${ev.object ? ev.object + ' : ' : ''}${ev.message}`).join('\n')}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
