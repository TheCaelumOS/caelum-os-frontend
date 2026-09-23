"use client";

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { 
  Network, 
  RefreshCw, 
  Cpu, 
  Layers, 
  Server, 
  AlertCircle, 
  HardDrive, 
  Shield, 
  Terminal, 
  RotateCw, 
  Trash2, 
  Plus, 
  Sliders, 
  Info, 
  Check, 
  X, 
  Copy, 
  FileCode, 
  ChevronRight,
  Clock
} from 'lucide-react';

interface Pod {
  name: string;
  namespace: string;
  status: string;
  ip: string;
  node: string;
  age: string;
}

interface PodContainer {
  name: string;
  image: string;
  ready: boolean;
  restartCount: number;
  state: string;
  stateDetails: string;
  resources: any;
  ports: string[];
}

interface PodCondition {
  type: string;
  status: string;
  reason: string;
  message: string;
  lastTransitionTime: string;
}

interface PodDetails {
  name: string;
  namespace: string;
  uid: string;
  status: string;
  ready: string;
  podIP: string;
  hostIP: string;
  nodeName: string;
  startTime: string;
  restartCount: number;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  conditions: PodCondition[];
  containers: PodContainer[];
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

interface ConfigMapItem {
  name: string;
  namespace: string;
  dataCount: number;
  keys: string[];
  age: string;
}

interface ConfigMapDetails {
  name: string;
  namespace: string;
  labels: Record<string, string>;
  age: string;
  data: Record<string, string>;
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
  const [configMaps, setConfigMaps] = useState<ConfigMapItem[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Tabs mapping
  const [activeTab, setActiveTab] = useState<string>(initialSubPath || 'pods');

  // Modals & Panels state
  const [selectedPodDetails, setSelectedPodDetails] = useState<PodDetails | null>(null);
  const [loadingPodDetails, setLoadingPodDetails] = useState<boolean>(false);

  const [logModalData, setLogModalData] = useState<{ name: string; namespace: string; containers: string[] } | null>(null);
  const [logContent, setLogContent] = useState<string>('');
  const [selectedLogContainer, setSelectedLogContainer] = useState<string>('');
  const [logTailLines, setLogTailLines] = useState<number>(200);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);
  const [copiedLogs, setCopiedLogs] = useState<boolean>(false);

  const [scaleModalDep, setScaleModalDep] = useState<{ name: string; namespace: string; currentReplicas: number } | null>(null);
  const [scaleCount, setScaleCount] = useState<number>(1);
  const [scalingLoading, setScalingLoading] = useState<boolean>(false);

  const [createDepOpen, setCreateDepOpen] = useState<boolean>(false);
  const [newDepForm, setNewDepForm] = useState({ name: '', namespace: 'default', image: '', replicas: 1, port: '' });
  const [creatingDep, setCreatingDep] = useState<boolean>(false);

  const [createSvcOpen, setCreateSvcOpen] = useState<boolean>(false);
  const [newSvcForm, setNewSvcForm] = useState({ name: '', namespace: 'default', type: 'ClusterIP', port: 80, targetPort: 80, selectorApp: '' });
  const [creatingSvc, setCreatingSvc] = useState<boolean>(false);

  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; confirmLabel: string; isDanger?: boolean; onConfirm: () => Promise<void> } | null>(null);

  const [selectedConfigMap, setSelectedConfigMap] = useState<ConfigMapDetails | null>(null);
  const [loadingConfigMap, setLoadingConfigMap] = useState<boolean>(false);

  const tabs = [
    { id: 'clusters', name: 'Clusters' },
    { id: 'nodes', name: 'Nodes' },
    { id: 'namespaces', name: 'Namespaces' },
    { id: 'pods', name: 'Pods' },
    { id: 'deployments', name: 'Deployments' },
    { id: 'statefulsets', name: 'StatefulSets' },
    { id: 'services', name: 'Services' },
    { id: 'configmaps', name: 'ConfigMaps' },
    { id: 'ingress', name: 'Ingress Routes' },
    { id: 'logs', name: 'Cluster Logs' },
  ];

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setActionFeedback({ type, message });
    setTimeout(() => {
      setActionFeedback(null);
    }, 4500);
  };

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
        setConfigMaps([]);
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
      setConfigMaps([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNamespacedResources = async (ns: string) => {
    try {
      const [podList, depList, ssList, svcList, ingList, evList, cmList] = await Promise.all([
        apiRequest(`/kubernetes/pods?namespace=${ns}`),
        apiRequest(`/kubernetes/deployments?namespace=${ns}`),
        apiRequest(`/kubernetes/statefulsets?namespace=${ns}`),
        apiRequest(`/kubernetes/services?namespace=${ns}`),
        apiRequest(`/kubernetes/ingress?namespace=${ns}`),
        apiRequest(`/kubernetes/events?namespace=${ns}`),
        apiRequest(`/kubernetes/configmaps?namespace=${ns}`),
      ]);
      setPods(Array.isArray(podList) ? podList : []);
      setDeployments(Array.isArray(depList) ? depList : []);
      setStatefulSets(Array.isArray(ssList) ? ssList : []);
      setServices(Array.isArray(svcList) ? svcList : []);
      setIngresses(Array.isArray(ingList) ? ingList : []);
      setEvents(Array.isArray(evList) ? evList : []);
      setConfigMaps(Array.isArray(cmList) ? cmList : []);
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

  // Real-time synchronization polling every 4 seconds
  useEffect(() => {
    if (!clusterInfo?.connected) return;
    const interval = setInterval(() => {
      fetchNamespacedResources(activeNamespace);
    }, 4000);
    return () => clearInterval(interval);
  }, [clusterInfo?.connected, activeNamespace]);

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

  // Namespace Selection Action
  const handleSelectNamespace = (ns: string) => {
    setActiveNamespace(ns);
    fetchNamespacedResources(ns);
    showFeedback('success', `Active namespace set to: ${ns === 'all' ? 'All Namespaces' : ns}`);
  };

  // Pod Actions
  const handleOpenPodDetails = async (pod: Pod) => {
    setLoadingPodDetails(true);
    setSelectedPodDetails(null);
    try {
      const details: PodDetails = await apiRequest(`/kubernetes/pods/${pod.namespace}/${pod.name}`);
      setSelectedPodDetails(details);
    } catch (e: any) {
      showFeedback('error', e.message || 'Failed to fetch pod details');
    } finally {
      setLoadingPodDetails(false);
    }
  };

  const handleOpenPodLogs = async (pod: Pod, containerName?: string) => {
    setLogModalData({ name: pod.name, namespace: pod.namespace, containers: [] });
    setLogContent('Connecting to cluster pod logs...');
    setLoadingLogs(true);
    try {
      // First fetch pod details to discover container list
      const details: PodDetails = await apiRequest(`/kubernetes/pods/${pod.namespace}/${pod.name}`);
      const containerNames = details.containers.map(c => c.name);
      const activeContainer = containerName || (containerNames.length > 0 ? containerNames[0] : '');
      setLogModalData({ name: pod.name, namespace: pod.namespace, containers: containerNames });
      setSelectedLogContainer(activeContainer);

      const logsRes = await apiRequest(`/kubernetes/pods/${pod.namespace}/${pod.name}/logs?container=${encodeURIComponent(activeContainer)}&tailLines=${logTailLines}`);
      setLogContent(logsRes?.logs || '(No logs emitted)');
    } catch (e: any) {
      setLogContent(`Error fetching logs: ${e.message || 'Unreachable'}`);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleRefreshLogs = async () => {
    if (!logModalData) return;
    setLoadingLogs(true);
    try {
      const logsRes = await apiRequest(`/kubernetes/pods/${logModalData.namespace}/${logModalData.name}/logs?container=${encodeURIComponent(selectedLogContainer)}&tailLines=${logTailLines}`);
      setLogContent(logsRes?.logs || '(No logs emitted)');
    } catch (e: any) {
      setLogContent(`Error refreshing logs: ${e.message || 'Unreachable'}`);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleCopyLogs = () => {
    if (!logContent) return;
    navigator.clipboard.writeText(logContent);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  const handleRestartPod = (pod: Pod) => {
    setConfirmModal({
      title: 'Restart Pod',
      message: `Restart pod "${pod.name}" in namespace "${pod.namespace}"? The pod will be terminated and automatically recreated with fresh state by its Kubernetes controller.`,
      confirmLabel: 'Restart Pod',
      isDanger: false,
      onConfirm: async () => {
        try {
          const res = await apiRequest(`/kubernetes/pods/${pod.namespace}/${pod.name}/restart`, {
            method: 'POST',
          });
          showFeedback('success', res.message || `Pod ${pod.name} restart initiated`);
          await fetchNamespacedResources(activeNamespace);
        } catch (e: any) {
          showFeedback('error', e.message || 'Failed to restart pod');
        } finally {
          setConfirmModal(null);
        }
      },
    });
  };

  const handleDeletePod = (pod: Pod) => {
    setConfirmModal({
      title: 'Delete Pod',
      message: `Permanently delete pod "${pod.name}" from namespace "${pod.namespace}"? If managed by a controller, a new replica will replace it.`,
      confirmLabel: 'Delete Pod',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await apiRequest(`/kubernetes/pods/${pod.namespace}/${pod.name}`, {
            method: 'DELETE',
          });
          showFeedback('success', res.message || `Pod ${pod.name} deleted`);
          await fetchNamespacedResources(activeNamespace);
        } catch (e: any) {
          showFeedback('error', e.message || 'Failed to delete pod');
        } finally {
          setConfirmModal(null);
        }
      },
    });
  };

  // Deployment Actions
  const handleOpenScaleModal = (dep: Deployment) => {
    const current = parseInt(dep.replicas.split('/')[1] || '1', 10) || 1;
    setScaleModalDep({ name: dep.name, namespace: dep.namespace, currentReplicas: current });
    setScaleCount(current);
  };

  const handleExecuteScale = async () => {
    if (!scaleModalDep) return;
    setScalingLoading(true);
    try {
      const res = await apiRequest(`/kubernetes/deployments/${scaleModalDep.namespace}/${scaleModalDep.name}/scale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replicas: scaleCount }),
      });
      showFeedback('success', res.message || `Deployment ${scaleModalDep.name} scaled to ${scaleCount}`);
      setScaleModalDep(null);
      await fetchNamespacedResources(activeNamespace);
    } catch (e: any) {
      showFeedback('error', e.message || 'Failed to scale deployment');
    } finally {
      setScalingLoading(false);
    }
  };

  const handleDeleteDeployment = (dep: Deployment) => {
    setConfirmModal({
      title: 'Delete Deployment',
      message: `Permanently delete deployment "${dep.name}" in namespace "${dep.namespace}"? All associated pods and replica sets will be terminated.`,
      confirmLabel: 'Delete Deployment',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await apiRequest(`/kubernetes/deployments/${dep.namespace}/${dep.name}`, {
            method: 'DELETE',
          });
          showFeedback('success', res.message || `Deployment ${dep.name} deleted`);
          await fetchNamespacedResources(activeNamespace);
        } catch (e: any) {
          showFeedback('error', e.message || 'Failed to delete deployment');
        } finally {
          setConfirmModal(null);
        }
      },
    });
  };

  const handleCreateDeployment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepForm.name || !newDepForm.image) {
      showFeedback('error', 'Name and container image are required');
      return;
    }
    setCreatingDep(true);
    try {
      const payload: any = {
        name: newDepForm.name.trim().toLowerCase(),
        namespace: newDepForm.namespace,
        image: newDepForm.image.trim(),
        replicas: Number(newDepForm.replicas) || 1,
      };
      if (newDepForm.port) {
        payload.port = Number(newDepForm.port);
      }
      const res = await apiRequest('/kubernetes/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      showFeedback('success', res.message || `Deployment ${payload.name} created`);
      setCreateDepOpen(false);
      setNewDepForm({ name: '', namespace: activeNamespace === 'all' ? 'default' : activeNamespace, image: '', replicas: 1, port: '' });
      await fetchNamespacedResources(activeNamespace);
    } catch (e: any) {
      showFeedback('error', e.message || 'Failed to create deployment');
    } finally {
      setCreatingDep(false);
    }
  };

  // Service Actions
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSvcForm.name || !newSvcForm.selectorApp) {
      showFeedback('error', 'Name and target selector app are required');
      return;
    }
    setCreatingSvc(true);
    try {
      const payload = {
        name: newSvcForm.name.trim().toLowerCase(),
        namespace: newSvcForm.namespace,
        type: newSvcForm.type,
        port: Number(newSvcForm.port) || 80,
        targetPort: Number(newSvcForm.targetPort) || Number(newSvcForm.port) || 80,
        selectorApp: newSvcForm.selectorApp.trim(),
      };
      const res = await apiRequest('/kubernetes/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      showFeedback('success', res.message || `Service ${payload.name} created`);
      setCreateSvcOpen(false);
      setNewSvcForm({ name: '', namespace: activeNamespace === 'all' ? 'default' : activeNamespace, type: 'ClusterIP', port: 80, targetPort: 80, selectorApp: '' });
      await fetchNamespacedResources(activeNamespace);
    } catch (e: any) {
      showFeedback('error', e.message || 'Failed to create service');
    } finally {
      setCreatingSvc(false);
    }
  };

  const handleDeleteService = (svc: ServiceItem) => {
    setConfirmModal({
      title: 'Delete Service',
      message: `Permanently delete service "${svc.name}" in namespace "${svc.namespace}"? Cluster IP routing to this service will cease immediately.`,
      confirmLabel: 'Delete Service',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await apiRequest(`/kubernetes/services/${svc.namespace}/${svc.name}`, {
            method: 'DELETE',
          });
          showFeedback('success', res.message || `Service ${svc.name} deleted`);
          await fetchNamespacedResources(activeNamespace);
        } catch (e: any) {
          showFeedback('error', e.message || 'Failed to delete service');
        } finally {
          setConfirmModal(null);
        }
      },
    });
  };

  // ConfigMap Actions
  const handleOpenConfigMap = async (cm: ConfigMapItem) => {
    setLoadingConfigMap(true);
    setSelectedConfigMap(null);
    try {
      const details: ConfigMapDetails = await apiRequest(`/kubernetes/configmaps/${cm.namespace}/${cm.name}`);
      setSelectedConfigMap(details);
    } catch (e: any) {
      showFeedback('error', e.message || 'Failed to fetch configmap');
    } finally {
      setLoadingConfigMap(false);
    }
  };

  return (
    <div className="flex-grow flex bg-[#0c0c0e] text-slate-100 min-h-0 select-text font-sans h-full relative">
      {/* Toast Feedback */}
      {actionFeedback && (
        <div className={`absolute top-4 right-4 z-50 px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 duration-200 ${
          actionFeedback.type === 'success' 
            ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300' 
            : 'bg-red-950/80 border-red-500/30 text-red-300'
        }`}>
          {actionFeedback.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          <span>{actionFeedback.message}</span>
        </div>
      )}

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
          {/* Active Namespace Status in Sidebar */}
          <div className="px-3 py-1.5 mb-2.5 rounded-xl bg-neutral-900/60 border border-neutral-850 flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-500">Namespace:</span>
            <span className="font-bold text-indigo-400 truncate max-w-[105px]" title={activeNamespace}>
              {activeNamespace === 'all' ? 'All' : activeNamespace}
            </span>
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

        {/* Pods Tab */}
        {activeTab === 'pods' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">Pods (Namespace: {activeNamespace === 'all' ? 'All Namespaces' : activeNamespace})</h4>
                <span className="text-[10px] text-slate-500 font-mono">Live synchronization active (4s interval)</span>
              </div>
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
                {pods.map(p => {
                  const isPodSelected = selectedPodDetails?.name === p.name && selectedPodDetails?.namespace === p.namespace;
                  return (
                    <div 
                      key={p.name + p.namespace} 
                      onClick={() => handleOpenPodDetails(p)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenPodDetails(p); }}
                      title="Click to view Pod details and metrics"
                      className={`p-3.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer select-none group ${
                        isPodSelected
                          ? 'bg-indigo-500/10 border border-indigo-500/70 ring-1 ring-indigo-500/30 shadow-md'
                          : 'bg-neutral-900/35 border border-neutral-900/85 hover:border-indigo-500/40 hover:bg-neutral-900/60'
                      }`}
                    >
                      <div className="space-y-1 min-w-0 pr-4">
                        <div className="flex items-center space-x-2.5">
                          <Layers className={`w-4 h-4 flex-shrink-0 transition-colors ${
                            isPodSelected ? 'text-indigo-400' : 'text-cyan-400 group-hover:text-indigo-400'
                          }`} />
                          <span className="font-bold text-xs text-slate-200 truncate max-w-[280px] group-hover:text-white transition-colors">
                            {p.name}
                          </span>
                          {p.namespace && (
                            <span className="text-[9px] bg-neutral-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                              {p.namespace}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[9.5px] text-slate-400 font-mono">
                          <div>IP: <span className="text-slate-350">{p.ip}</span></div>
                          <div>Node: <span className="text-slate-350">{p.node}</span></div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border uppercase font-mono ${
                          p.status === 'Running' 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {p.status}
                        </span>
                        <div className="flex items-center space-x-1 pl-2 border-l border-neutral-850">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenPodDetails(p); }}
                            title="View Pod Details"
                            className="p-1.5 rounded-lg bg-neutral-850/60 hover:bg-neutral-800 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenPodLogs(p); }}
                            title="View Pod Logs"
                            className="p-1.5 rounded-lg bg-neutral-850/60 hover:bg-neutral-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                          >
                            <Terminal className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRestartPod(p); }}
                            title="Restart Pod"
                            className="p-1.5 rounded-lg bg-neutral-850/60 hover:bg-neutral-800 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeletePod(p); }}
                            title="Delete Pod"
                            className="p-1.5 rounded-lg bg-neutral-850/60 hover:bg-neutral-800 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Deployments Tab */}
        {activeTab === 'deployments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider font-sans">
                  Deployments (Namespace: {activeNamespace === 'all' ? 'All Namespaces' : activeNamespace})
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">Live control & scaling</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setNewDepForm({
                      name: '',
                      namespace: activeNamespace === 'all' ? (namespaces.includes('default') ? 'default' : namespaces[0] || 'default') : activeNamespace,
                      image: '',
                      replicas: 1,
                      port: '',
                    });
                    setCreateDepOpen(true);
                  }}
                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Deployment</span>
                </button>
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
            </div>
            {deployments.length === 0 ? (
              <div className="p-4 bg-neutral-900/40 border border-neutral-850 rounded-2xl text-xs font-mono text-slate-450">
                {error ? 'Unable to load deployments while cluster is unreachable.' : `No deployments found in ${activeNamespace === 'all' ? 'cluster' : 'namespace ' + activeNamespace}.`}
              </div>
            ) : (
              <div className="space-y-3">
                {deployments.map(d => (
                  <div key={d.name + d.namespace} className="p-3.5 bg-neutral-900/35 border border-neutral-900/85 hover:border-neutral-800 rounded-2xl flex items-center justify-between font-mono transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2.5 font-sans">
                        <Server className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="font-bold text-xs text-slate-200">{d.name}</span>
                        {d.namespace && (
                          <span className="text-[9px] bg-neutral-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                            {d.namespace}
                          </span>
                        )}
                      </div>
                      <div className="text-[9.5px] text-slate-450">Available replicas: <span className="text-slate-300 font-bold">{d.available}</span></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[9px] font-bold bg-neutral-850 text-slate-300 px-2 py-0.5 rounded border border-neutral-800">
                        Replicas: {d.replicas}
                      </span>
                      <button
                        onClick={() => handleOpenScaleModal(d)}
                        className="px-2 py-1 bg-neutral-800 hover:bg-neutral-750 text-indigo-400 text-xs font-bold rounded-lg border border-neutral-700/60 flex items-center space-x-1 cursor-pointer transition-colors"
                      >
                        <Sliders className="w-3 h-3" />
                        <span>Scale</span>
                      </button>
                      <button
                        onClick={() => handleDeleteDeployment(d)}
                        title="Delete Deployment"
                        className="p-1.5 rounded-lg bg-neutral-850/60 hover:bg-neutral-800 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Clusters Tab */}
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

        {/* Nodes Tab */}
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

        {/* Namespaces Tab */}
        {activeTab === 'namespaces' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">
                  Namespaces (Active: {activeNamespace === 'all' ? 'All Namespaces' : activeNamespace})
                </h4>
                <p className="text-[10px] text-slate-500 font-mono">
                  Select a namespace to focus all Pods, Deployments, Services, StatefulSets, and ConfigMaps
                </p>
              </div>
              <span className="text-[10px] font-mono bg-neutral-900 border border-neutral-850 text-slate-300 px-2.5 py-1 rounded-lg">
                {namespaces.length} Discovered
              </span>
            </div>

            {namespaces.length === 0 ? (
              <div className="p-4 bg-neutral-900/40 border border-neutral-850 rounded-2xl text-xs font-mono text-slate-450">
                {error ? 'Unable to load namespaces while cluster is unreachable.' : 'No namespaces found in cluster.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Global Option: All Namespaces */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectNamespace('all')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectNamespace('all'); }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between group ${
                    activeNamespace === 'all'
                      ? 'bg-indigo-500/15 border-indigo-500 shadow-[0_0_18px_rgba(99,102,241,0.22)] ring-1 ring-indigo-500/50'
                      : 'bg-neutral-900/40 border border-neutral-850 hover:border-neutral-750 hover:bg-neutral-900/70 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold font-mono text-sm transition-colors flex-shrink-0 ${
                      activeNamespace === 'all'
                        ? 'bg-indigo-500 text-white shadow-sm'
                        : 'bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 group-hover:bg-indigo-500/25'
                    }`}>
                      *
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold text-xs truncate ${
                          activeNamespace === 'all' ? 'text-white' : 'text-slate-200'
                        }`}>
                          All Namespaces
                        </span>
                        {activeNamespace === 'all' && (
                          <span className="text-[9px] bg-indigo-500/30 text-indigo-300 font-bold px-1.5 py-0.5 rounded font-mono">
                            SELECTED
                          </span>
                        )}
                      </div>
                      <span className="text-[9.5px] text-slate-450 font-mono block">
                        Scope: Cluster-wide (all resources)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {activeNamespace === 'all' ? (
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); selectTab('pods'); }}
                          className="text-[10px] text-indigo-300 hover:text-white bg-indigo-500/20 hover:bg-indigo-500/30 px-2 py-1 rounded-lg font-mono flex items-center space-x-1 transition-colors cursor-pointer"
                        >
                          <span>View Pods</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                        <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to select
                      </span>
                    )}
                  </div>
                </div>

                {/* Individual Discovered Namespaces */}
                {namespaces.map(ns => {
                  const isSelected = activeNamespace === ns;
                  return (
                    <div
                      key={ns}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectNamespace(ns)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectNamespace(ns); }}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between group ${
                        isSelected
                          ? 'bg-indigo-500/15 border-indigo-500 shadow-[0_0_18px_rgba(99,102,241,0.22)] ring-1 ring-indigo-500/50'
                          : 'bg-neutral-900/40 border border-neutral-850 hover:border-neutral-750 hover:bg-neutral-900/70 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold font-mono text-xs transition-colors flex-shrink-0 ${
                          isSelected
                            ? 'bg-indigo-500 text-white shadow-sm'
                            : 'bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 group-hover:bg-indigo-500/25'
                        }`}>
                          ns
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className={`font-bold text-xs truncate ${
                              isSelected ? 'text-white' : 'text-slate-200'
                            }`}>
                              {ns}
                            </span>
                            {isSelected && (
                              <span className="text-[9px] bg-indigo-500/30 text-indigo-300 font-bold px-1.5 py-0.5 rounded font-mono">
                                SELECTED
                              </span>
                            )}
                          </div>
                          <span className="text-[9.5px] text-slate-450 font-mono block">
                            Status: Active
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {isSelected ? (
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); selectTab('pods'); }}
                              className="text-[10px] text-indigo-300 hover:text-white bg-indigo-500/20 hover:bg-indigo-500/30 px-2 py-1 rounded-lg font-mono flex items-center space-x-1 transition-colors cursor-pointer"
                            >
                              <span>View Pods</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                            <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to select
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

        {/* StatefulSets Tab */}
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
                  <div key={ss.name + ss.namespace} className="p-3 bg-neutral-900/35 border border-neutral-900/85 rounded-2xl flex items-center justify-between font-mono">
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

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">
                  Cluster Services (Namespace: {activeNamespace === 'all' ? 'All Namespaces' : activeNamespace})
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">Real Kubernetes networking</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setNewSvcForm({
                      name: '',
                      namespace: activeNamespace === 'all' ? (namespaces.includes('default') ? 'default' : namespaces[0] || 'default') : activeNamespace,
                      type: 'ClusterIP',
                      port: 80,
                      targetPort: 80,
                      selectorApp: '',
                    });
                    setCreateSvcOpen(true);
                  }}
                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Service</span>
                </button>
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
                        <span className="font-bold text-slate-200 font-sans">{svc.name}</span>
                        {svc.namespace && (
                          <span className="text-[9px] bg-neutral-800 text-slate-400 px-1.5 py-0.5 rounded">
                            {svc.namespace}
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] text-slate-450">Type: {svc.type} | Cluster-IP: {svc.clusterIP}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[9px] text-indigo-400 font-bold">Port: {svc.ports}</span>
                      <button
                        onClick={() => handleDeleteService(svc)}
                        title="Delete Service"
                        className="p-1.5 rounded-lg bg-neutral-850/60 hover:bg-neutral-800 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ConfigMaps Tab */}
        {activeTab === 'configmaps' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">
                  ConfigMaps (Namespace: {activeNamespace === 'all' ? 'All Namespaces' : activeNamespace})
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">Cluster configuration and environment objects</span>
              </div>
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
            {configMaps.length === 0 ? (
              <div className="p-4 bg-neutral-900/40 border border-neutral-850 rounded-2xl text-xs font-mono text-slate-450">
                {error ? 'Unable to load ConfigMaps while cluster is unreachable.' : 'No ConfigMaps found in namespace.'}
              </div>
            ) : (
              <div className="space-y-3">
                {configMaps.map(cm => (
                  <div 
                    key={cm.name + cm.namespace}
                    onClick={() => handleOpenConfigMap(cm)}
                    className="p-3.5 bg-neutral-900/35 border border-neutral-900/85 hover:border-neutral-800 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2.5">
                        <FileCode className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-xs text-slate-200">{cm.name}</span>
                        {cm.namespace && (
                          <span className="text-[9px] bg-neutral-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                            {cm.namespace}
                          </span>
                        )}
                      </div>
                      <div className="text-[9.5px] text-slate-450 font-mono">
                        Keys: {cm.keys.length > 0 ? cm.keys.join(', ') : 'None'}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[9px] font-bold bg-neutral-850 text-emerald-400 px-2 py-0.5 rounded border border-neutral-800 font-mono">
                        {cm.dataCount} {cm.dataCount === 1 ? 'key' : 'keys'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Ingress Tab */}
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

        {/* Logs Tab */}
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

      {/* ========================================================= */}
      {/* MODALS & DRAWERS                                          */}
      {/* ========================================================= */}

      {/* Pod Details Modal */}
      {(selectedPodDetails || loadingPodDetails) && (
        <div 
          onClick={() => setSelectedPodDetails(null)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#121216] border border-neutral-800 rounded-2xl shadow-2xl text-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
              <div className="flex items-center space-x-3 truncate">
                <Layers className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <div className="truncate">
                  <span className="font-bold text-sm text-slate-100 block truncate">
                    {loadingPodDetails ? 'Loading Pod Details...' : selectedPodDetails?.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Namespace: {selectedPodDetails?.namespace}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPodDetails(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
              {loadingPodDetails ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                  <span>Querying Kubernetes API for pod metadata...</span>
                </div>
              ) : selectedPodDetails ? (
                <>
                  {/* Status & Key Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Status</span>
                      <span className="text-xs font-bold text-emerald-400 font-sans">{selectedPodDetails.status}</span>
                    </div>
                    <div className="p-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Ready Containers</span>
                      <span className="text-xs font-bold text-slate-200">{selectedPodDetails.ready}</span>
                    </div>
                    <div className="p-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Restarts</span>
                      <span className="text-xs font-bold text-amber-400">{selectedPodDetails.restartCount}</span>
                    </div>
                    <div className="p-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Pod IP</span>
                      <span className="text-xs font-bold text-indigo-400">{selectedPodDetails.podIP}</span>
                    </div>
                  </div>

                  {/* General Specifications */}
                  <div className="p-3.5 bg-neutral-900/40 border border-neutral-800/60 rounded-xl space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Node Name:</span>
                      <span className="text-slate-200 font-bold">{selectedPodDetails.nodeName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Host IP:</span>
                      <span className="text-slate-200">{selectedPodDetails.hostIP}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Start Time:</span>
                      <span className="text-slate-200">{selectedPodDetails.startTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">UID:</span>
                      <span className="text-slate-400 truncate max-w-[280px]">{selectedPodDetails.uid}</span>
                    </div>
                  </div>

                  {/* Conditions */}
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">Conditions</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedPodDetails.conditions.map(c => (
                        <div key={c.type} className="p-2 bg-neutral-900/40 border border-neutral-800/60 rounded-lg flex items-center justify-between">
                          <span className="text-[10px] text-slate-300">{c.type}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            c.status === 'True' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-neutral-800 text-slate-400'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Containers List */}
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">Containers</h5>
                    <div className="space-y-2">
                      {selectedPodDetails.containers.map(c => (
                        <div key={c.name} className="p-3 bg-neutral-900/50 border border-neutral-800/80 rounded-xl space-y-1.5">
                          <div className="flex justify-between items-center font-sans">
                            <span className="font-bold text-xs text-indigo-300">{c.name}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase font-mono ${
                              c.state === 'Running' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              {c.state}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            <div>Image: <span className="text-slate-200">{c.image}</span></div>
                            {c.stateDetails && <div>Detail: <span className="text-slate-350">{c.stateDetails}</span></div>}
                            {c.ports.length > 0 && <div>Ports: <span className="text-slate-350">{c.ports.join(', ')}</span></div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Labels */}
                  {Object.keys(selectedPodDetails.labels).length > 0 && (
                    <div>
                      <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">Labels</h5>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(selectedPodDetails.labels).map(([k, v]) => (
                          <span key={k} className="px-2 py-0.5 bg-neutral-800/70 border border-neutral-700/60 rounded text-[9.5px] text-slate-300">
                            {k}={v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Pod Logs Modal */}
      {logModalData && (
        <div 
          onClick={() => setLogModalData(null)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl bg-[#0e0e12] border border-neutral-800 rounded-2xl shadow-2xl text-slate-200 overflow-hidden flex flex-col h-[80vh] animate-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="px-5 py-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
              <div className="flex items-center space-x-2.5 truncate">
                <Terminal className="w-4.5 h-4.5 text-cyan-400 flex-shrink-0" />
                <div className="truncate">
                  <span className="font-bold text-xs text-slate-100 block truncate">Logs: {logModalData.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Namespace: {logModalData.namespace}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-2">
                {logModalData.containers.length > 1 && (
                  <select
                    value={selectedLogContainer}
                    onChange={(e) => {
                      setSelectedLogContainer(e.target.value);
                      handleOpenPodLogs({ name: logModalData.name, namespace: logModalData.namespace } as Pod, e.target.value);
                    }}
                    className="bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none"
                  >
                    {logModalData.containers.map(c => (
                      <option key={c} value={c}>container: {c}</option>
                    ))}
                  </select>
                )}

                <select
                  value={logTailLines}
                  onChange={(e) => setLogTailLines(Number(e.target.value))}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none"
                >
                  <option value={50}>50 lines</option>
                  <option value={100}>100 lines</option>
                  <option value={200}>200 lines</option>
                  <option value={500}>500 lines</option>
                  <option value={1000}>1000 lines</option>
                </select>

                <button
                  onClick={handleRefreshLogs}
                  disabled={loadingLogs}
                  className="p-1.5 rounded-lg bg-neutral-850 hover:bg-neutral-800 text-slate-300 hover:text-white cursor-pointer transition-colors"
                  title="Refresh Logs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={handleCopyLogs}
                  className="p-1.5 rounded-lg bg-neutral-850 hover:bg-neutral-800 text-slate-300 hover:text-white cursor-pointer transition-colors"
                  title="Copy Logs"
                >
                  {copiedLogs ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <button 
                  onClick={() => setLogModalData(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Terminal Log Screen */}
            <div className="flex-1 p-4 bg-black/60 overflow-auto font-mono text-[10.5px] leading-relaxed text-slate-300 whitespace-pre-wrap select-text">
              {loadingLogs ? (
                <div className="text-slate-500 flex items-center space-x-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Fetching live stdout/stderr stream...</span>
                </div>
              ) : (
                logContent || '(No logs available)'
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scale Deployment Modal */}
      {scaleModalDep && (
        <div 
          onClick={() => setScaleModalDep(null)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#121216] border border-neutral-800 rounded-2xl shadow-2xl text-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
          >
            <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
              <div className="flex items-center space-x-2.5">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-xs text-slate-100">Scale Deployment</span>
              </div>
              <button 
                onClick={() => setScaleModalDep(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <span className="text-xs text-slate-300 font-semibold block">{scaleModalDep.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">Namespace: {scaleModalDep.namespace}</span>
              </div>

              <div className="flex items-center justify-center space-x-4 py-2">
                <button
                  type="button"
                  onClick={() => setScaleCount(Math.max(0, scaleCount - 1))}
                  className="w-9 h-9 rounded-xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-700/60 text-lg font-bold flex items-center justify-center cursor-pointer transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={scaleCount}
                  onChange={(e) => setScaleCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-20 text-center py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-sm font-bold font-mono text-indigo-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setScaleCount(scaleCount + 1)}
                  className="w-9 h-9 rounded-xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-700/60 text-lg font-bold flex items-center justify-center cursor-pointer transition-colors"
                >
                  +
                </button>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setScaleModalDep(null)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-800 hover:bg-neutral-850 text-xs text-slate-400 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteScale}
                  disabled={scalingLoading}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors"
                >
                  {scalingLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Apply Scale</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Deployment Modal */}
      {createDepOpen && (
        <div 
          onClick={() => setCreateDepOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#121216] border border-neutral-800 rounded-2xl shadow-2xl text-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
          >
            <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
              <div className="flex items-center space-x-2.5">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-xs text-slate-100">Create Kubernetes Deployment</span>
              </div>
              <button 
                onClick={() => setCreateDepOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDeployment} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Deployment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. nginx-frontend"
                  value={newDepForm.name}
                  onChange={(e) => setNewDepForm({ ...newDepForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-slate-200 outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Namespace *</label>
                  <select
                    value={newDepForm.namespace}
                    onChange={(e) => setNewDepForm({ ...newDepForm, namespace: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-slate-200 outline-none focus:border-indigo-500 font-mono"
                  >
                    {namespaces.map(ns => (
                      <option key={ns} value={ns}>{ns}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Replicas</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newDepForm.replicas}
                    onChange={(e) => setNewDepForm({ ...newDepForm, replicas: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-slate-200 outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Container Image *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. nginx:alpine or redis:7-alpine"
                  value={newDepForm.image}
                  onChange={(e) => setNewDepForm({ ...newDepForm, image: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-slate-200 outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Container Port (Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 80"
                  value={newDepForm.port}
                  onChange={(e) => setNewDepForm({ ...newDepForm, port: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-slate-200 outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-850">
                <button
                  type="button"
                  onClick={() => setCreateDepOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-800 hover:bg-neutral-850 text-xs text-slate-400 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingDep}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors"
                >
                  {creatingDep && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Service Modal */}
      {createSvcOpen && (
        <div 
          onClick={() => setCreateSvcOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#121216] border border-neutral-800 rounded-2xl shadow-2xl text-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
          >
            <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
              <div className="flex items-center space-x-2.5">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-xs text-slate-100">Create Kubernetes Service</span>
              </div>
              <button 
                onClick={() => setCreateSvcOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. nginx-svc"
                  value={newSvcForm.name}
                  onChange={(e) => setNewSvcForm({ ...newSvcForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-slate-200 outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Namespace *</label>
                  <select
                    value={newSvcForm.namespace}
                    onChange={(e) => setNewSvcForm({ ...newSvcForm, namespace: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-slate-200 outline-none focus:border-indigo-500 font-mono"
                  >
                    {namespaces.map(ns => (
                      <option key={ns} value={ns}>{ns}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Service Type</label>
                  <select
                    value={newSvcForm.type}
                    onChange={(e) => setNewSvcForm({ ...newSvcForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-slate-200 outline-none focus:border-indigo-500 font-mono"
                  >
                    <option value="ClusterIP">ClusterIP</option>
                    <option value="NodePort">NodePort</option>
                    <option value="LoadBalancer">LoadBalancer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Port *</label>
                  <input
                    type="number"
                    required
                    placeholder="80"
                    value={newSvcForm.port}
                    onChange={(e) => setNewSvcForm({ ...newSvcForm, port: parseInt(e.target.value, 10) || 80 })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-slate-200 outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Target Port</label>
                  <input
                    type="number"
                    placeholder="80"
                    value={newSvcForm.targetPort}
                    onChange={(e) => setNewSvcForm({ ...newSvcForm, targetPort: parseInt(e.target.value, 10) || 80 })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-slate-200 outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1 font-semibold">App Selector Label (app=...) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. caelum-demo"
                  value={newSvcForm.selectorApp}
                  onChange={(e) => setNewSvcForm({ ...newSvcForm, selectorApp: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-slate-200 outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-850">
                <button
                  type="button"
                  onClick={() => setCreateSvcOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-800 hover:bg-neutral-850 text-xs text-slate-400 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingSvc}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors"
                >
                  {creatingSvc && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmModal && (
        <div 
          onClick={() => setConfirmModal(null)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#121216] border border-neutral-800 rounded-2xl shadow-2xl text-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
          >
            <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
              <span className="font-bold text-xs text-slate-100">{confirmModal.title}</span>
              <button 
                onClick={() => setConfirmModal(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{confirmModal.message}</p>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-800 hover:bg-neutral-850 text-xs text-slate-400 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold text-white cursor-pointer transition-colors ${
                    confirmModal.isDanger 
                      ? 'bg-red-600 hover:bg-red-500' 
                      : 'bg-indigo-600 hover:bg-indigo-500'
                  }`}
                >
                  {confirmModal.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ConfigMap Details Modal */}
      {(selectedConfigMap || loadingConfigMap) && (
        <div 
          onClick={() => setSelectedConfigMap(null)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#121216] border border-neutral-800 rounded-2xl shadow-2xl text-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
          >
            <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
              <div className="flex items-center space-x-2.5 truncate">
                <FileCode className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0" />
                <div className="truncate">
                  <span className="font-bold text-xs text-slate-100 block truncate">
                    {loadingConfigMap ? 'Loading...' : selectedConfigMap?.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Namespace: {selectedConfigMap?.namespace}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedConfigMap(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
              {loadingConfigMap ? (
                <div className="py-8 flex justify-center items-center text-slate-400 space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Reading ConfigMap...</span>
                </div>
              ) : selectedConfigMap ? (
                <>
                  <div className="text-[10.5px] text-slate-400 space-y-1 bg-neutral-900/40 p-3 rounded-xl border border-neutral-800/60">
                    <div>Created: <span className="text-slate-200">{selectedConfigMap.age}</span></div>
                  </div>

                  <div>
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">Data Keys</h5>
                    {Object.keys(selectedConfigMap.data).length === 0 ? (
                      <div className="text-slate-500 italic text-[11px]">No plain-text data entries in this ConfigMap.</div>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(selectedConfigMap.data).map(([key, val]) => (
                          <div key={key} className="space-y-1">
                            <span className="text-[11px] font-bold text-emerald-400 block">{key}:</span>
                            <pre className="p-3 bg-black/60 border border-neutral-850 rounded-xl text-[10px] text-slate-350 overflow-x-auto whitespace-pre-wrap max-h-48 leading-relaxed">
                              {val}
                            </pre>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
