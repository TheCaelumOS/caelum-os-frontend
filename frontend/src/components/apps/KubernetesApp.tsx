"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiRequest } from '../../lib/api';
import { checkLocalConnectorHealth } from '../../lib/localConnector';
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
  Clock,
  Eye,
  EyeOff,
  Globe,
  Key,
  Database
} from 'lucide-react';

interface Pod {
  name: string;
  namespace: string;
  status: string;
  ip: string;
  node: string;
  ready?: string;
  restarts?: number;
  containers?: string[];
  labels?: Record<string, string>;
  age: string;
}

interface PodContainer {
  name: string;
  image: string;
  ready: boolean;
  restartCount: number;
  state: string;
  startedAt?: string;
  ports: string[];
  resources: any;
}

interface PodCondition {
  type: string;
  status: string;
  reason?: string;
  message?: string;
  lastTransitionTime?: string;
}

interface PodDetails {
  name: string;
  namespace: string;
  uid: string;
  status: string;
  ip: string;
  hostIP: string;
  node: string;
  startTime: string;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  conditions: PodCondition[];
  containers: PodContainer[];
}

interface Deployment {
  name: string;
  namespace: string;
  desired?: number;
  ready?: number;
  available?: number;
  updated?: number;
  replicas: string;
  status?: string;
  images?: string[];
  age: string;
}

interface DeploymentDetails {
  name: string;
  namespace: string;
  uid: string;
  creationTimestamp: string;
  desired: number;
  ready: number;
  available: number;
  updated: number;
  strategy: string;
  selector: Record<string, string>;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  containers: Array<{ name: string; image: string; ports: string[]; envCount: number }>;
  conditions: Array<{ type: string; status: string; reason: string; message: string; lastUpdateTime?: string }>;
}

interface StatefulSetItem {
  name: string;
  namespace: string;
  desired?: number;
  ready?: number;
  current?: number;
  updated?: number;
  replicas: string;
  serviceName?: string;
  status?: string;
  images?: string[];
  age: string;
}

interface StatefulSetDetails {
  name: string;
  namespace: string;
  uid: string;
  creationTimestamp: string;
  desired: number;
  ready: number;
  current: number;
  updated: number;
  serviceName: string;
  selector: Record<string, string>;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  containers: Array<{ name: string; image: string; ports: string[] }>;
}

interface ClusterSummary {
  connected: boolean;
  context?: string;
  currentContext?: string;
  server?: string;
  version?: string;
  status?: string;
  nodeCount?: number;
  podCount?: number;
  deploymentCount?: number;
  statefulSetCount?: number;
  serviceCount?: number;
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
  kernelVersion?: string;
  containerRuntime?: string;
  cpuCapacity?: string;
  memoryCapacity?: string;
  cpuAllocatable?: string;
  memoryAllocatable?: string;
}

interface NodeDetails {
  name: string;
  uid: string;
  creationTimestamp: string;
  status: string;
  addresses: Array<{ type: string; address: string }>;
  nodeInfo: Record<string, any>;
  capacity: Record<string, string>;
  allocatable: Record<string, string>;
  conditions: Array<{ type: string; status: string; reason?: string; message?: string; lastTransitionTime?: string }>;
  labels: Record<string, string>;
  annotations: Record<string, string>;
}

interface ServiceItem {
  name: string;
  namespace: string;
  type: string;
  clusterIP: string;
  ports: string;
  endpoints?: string;
  age: string;
}

interface ServicePort {
  name: string;
  port: number;
  protocol: string;
  targetPort: number | string;
  nodePort?: number;
}

interface ServiceDetails {
  name: string;
  namespace: string;
  uid: string;
  creationTimestamp: string;
  type: string;
  clusterIP: string;
  clusterIPs: string[];
  externalIPs: string[];
  ports: ServicePort[];
  selector: Record<string, string>;
  endpoints: string[];
  sessionAffinity: string;
  labels: Record<string, string>;
  annotations: Record<string, string>;
}

interface IngressItem {
  name: string;
  namespace: string;
  className?: string;
  hosts?: string;
  paths?: Array<{ host: string; path: string; backend: string }>;
  address?: string;
  age: string;
}

interface IngressDetails {
  name: string;
  namespace: string;
  uid: string;
  creationTimestamp: string;
  className: string;
  rules: Array<{ host: string; paths: Array<{ path: string; pathType: string; serviceName: string; servicePort: string | number }> }>;
  tls: Array<{ hosts: string[]; secretName: string }>;
  loadBalancer: string[];
  labels: Record<string, string>;
  annotations: Record<string, string>;
}

interface EventItem {
  name?: string;
  timestamp?: string;
  lastTimestamp?: string;
  type: string;
  reason: string;
  message: string;
  count?: number;
  namespace: string;
}

interface ConfigMapItem {
  name: string;
  namespace: string;
  dataCount: number;
  keys: string[];
  data?: string | Record<string, string>;
  dataEntries?: Record<string, string>;
  creationTimestamp?: string;
  age?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
}

interface ConfigMapDetails {
  name: string;
  namespace: string;
  uid?: string;
  creationTimestamp?: string;
  age?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  dataCount?: number;
  keys?: string[];
  data: Record<string, string>;
  binaryData?: string[];
}

interface SecretItem {
  name: string;
  namespace: string;
  type: string;
  keysCount: number;
  keys: string[];
  age: string;
  creationTimestamp?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
}

interface SecretDetails {
  name: string;
  namespace: string;
  uid: string;
  creationTimestamp: string;
  type: string;
  keysCount: number;
  keys: string[];
  data: Record<string, string>;
  isMasked: boolean;
  labels: Record<string, string>;
  annotations: Record<string, string>;
}

interface KubernetesAppProps {
  initialSubPath?: string;
  onPathChange?: (subpath: string) => void;
}

export type KubernetesConnectionState = 
  | 'checking' 
  | 'connected' 
  | 'unavailable' 
  | 'runtime_offline';

export default function KubernetesApp({ initialSubPath = '', onPathChange }: KubernetesAppProps) {
  const [clusterInfo, setClusterInfo] = useState<ClusterSummary | null>(null);
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [activeNamespace, setActiveNamespace] = useState<string>('default');
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  const [pods, setPods] = useState<Pod[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [statefulSets, setStatefulSets] = useState<StatefulSetItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [secrets, setSecrets] = useState<SecretItem[]>([]);
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

  const [scaleModalSs, setScaleModalSs] = useState<{ name: string; namespace: string; currentReplicas: number } | null>(null);
  const [scaleSsCount, setScaleSsCount] = useState<number>(1);
  const [scalingSsLoading, setScalingSsLoading] = useState<boolean>(false);

  const [selectedDepDetails, setSelectedDepDetails] = useState<DeploymentDetails | null>(null);
  const [loadingDepDetails, setLoadingDepDetails] = useState<boolean>(false);

  const [selectedSsDetails, setSelectedSsDetails] = useState<StatefulSetDetails | null>(null);
  const [loadingSsDetails, setLoadingSsDetails] = useState<boolean>(false);

  const [createDepOpen, setCreateDepOpen] = useState<boolean>(false);
  const [newDepForm, setNewDepForm] = useState({ name: '', namespace: 'default', image: '', replicas: 1, port: '' });
  const [creatingDep, setCreatingDep] = useState<boolean>(false);

  const [createSvcOpen, setCreateSvcOpen] = useState<boolean>(false);
  const [newSvcForm, setNewSvcForm] = useState({ name: '', namespace: 'default', type: 'ClusterIP', port: 80, targetPort: 80, selectorApp: '' });
  const [creatingSvc, setCreatingSvc] = useState<boolean>(false);

  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; confirmLabel: string; isDanger?: boolean; onConfirm: () => Promise<void> } | null>(null);

  const [selectedConfigMap, setSelectedConfigMap] = useState<ConfigMapDetails | null>(null);
  const [loadingConfigMap, setLoadingConfigMap] = useState<boolean>(false);
  const [loadingConfigMaps, setLoadingConfigMaps] = useState<boolean>(false);
  const [configMapsError, setConfigMapsError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [selectedServiceDetails, setSelectedServiceDetails] = useState<ServiceDetails | null>(null);
  const [loadingServiceDetails, setLoadingServiceDetails] = useState<boolean>(false);

  const [selectedSecretDetails, setSelectedSecretDetails] = useState<SecretDetails | null>(null);
  const [loadingSecretDetails, setLoadingSecretDetails] = useState<boolean>(false);
  const [loadingSecrets, setLoadingSecrets] = useState<boolean>(false);
  const [secretsError, setSecretsError] = useState<string | null>(null);
  const [revealedSecretValues, setRevealedSecretValues] = useState<Record<string, string> | null>(null);
  const [revealingSecret, setRevealingSecret] = useState<boolean>(false);

  const [selectedIngressDetails, setSelectedIngressDetails] = useState<IngressDetails | null>(null);
  const [loadingIngressDetails, setLoadingIngressDetails] = useState<boolean>(false);

  const [selectedNodeDetails, setSelectedNodeDetails] = useState<NodeDetails | null>(null);
  const [loadingNodeDetails, setLoadingNodeDetails] = useState<boolean>(false);

  // Native Kubernetes Connection State
  const [connectionState, setConnectionState] = useState<KubernetesConnectionState>('checking');
  const connectionStateRef = useRef<KubernetesConnectionState>(connectionState);
  connectionStateRef.current = connectionState;

  const activeTabRef = useRef<string>(activeTab);
  activeTabRef.current = activeTab;

  const activeNamespaceRef = useRef<string>(activeNamespace);
  activeNamespaceRef.current = activeNamespace;

  // Tabs list with Secrets added
  const tabs = [
    { id: 'clusters', name: 'Clusters' },
    { id: 'nodes', name: 'Nodes' },
    { id: 'namespaces', name: 'Namespaces' },
    { id: 'pods', name: 'Pods' },
    { id: 'deployments', name: 'Deployments' },
    { id: 'statefulsets', name: 'StatefulSets' },
    { id: 'services', name: 'Services' },
    { id: 'configmaps', name: 'ConfigMaps' },
    { id: 'secrets', name: 'Secrets' },
    { id: 'ingress', name: 'Ingress Routes' },
    { id: 'logs', name: 'Cluster Logs' },
  ];

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setActionFeedback({ type, message });
    setTimeout(() => {
      setActionFeedback(null);
    }, 4500);
  };

  const fetchNamespacedResources = async (ns: string, silent = false) => {
    try {
      const [podList, depList, ssList, svcList, secretList, ingList, evList, cmList] = await Promise.all([
        apiRequest(`/kubernetes/pods?namespace=${ns}`),
        apiRequest(`/kubernetes/deployments?namespace=${ns}`),
        apiRequest(`/kubernetes/statefulsets?namespace=${ns}`),
        apiRequest(`/kubernetes/services?namespace=${ns}`),
        apiRequest(`/kubernetes/secrets?namespace=${ns}`),
        apiRequest(`/kubernetes/ingress?namespace=${ns}`),
        apiRequest(`/kubernetes/events?namespace=${ns}`),
        apiRequest(`/kubernetes/configmaps?namespace=${ns}`),
      ]);
      setPods(Array.isArray(podList) ? podList : []);
      setDeployments(Array.isArray(depList) ? depList : []);
      setStatefulSets(Array.isArray(ssList) ? ssList : []);
      setServices(Array.isArray(svcList) ? svcList : []);
      setSecrets(Array.isArray(secretList) ? secretList : []);
      setIngresses(Array.isArray(ingList) ? ingList : []);
      setEvents(Array.isArray(evList) ? evList : []);

      // Defensive parsing for ConfigMaps
      let rawCms: any[] = [];
      if (Array.isArray(cmList)) {
        rawCms = cmList;
      } else if (cmList && Array.isArray((cmList as any).items)) {
        rawCms = (cmList as any).items;
      }

      const normalizedCms: ConfigMapItem[] = rawCms.map((cm: any) => {
        const dataEntries = cm.dataEntries || (typeof cm.data === 'object' && cm.data !== null ? cm.data : {}) || {};
        const keys: string[] = Array.isArray(cm.keys) 
          ? cm.keys 
          : Object.keys(dataEntries);
        const dataCount: number = typeof cm.dataCount === 'number'
          ? cm.dataCount
          : (typeof cm.data === 'string' && cm.data.includes('key') ? parseInt(cm.data, 10) || keys.length : keys.length);
        return {
          name: cm.name || cm.metadata?.name || 'unknown',
          namespace: cm.namespace || cm.metadata?.namespace || ns,
          dataCount,
          keys,
          data: cm.data || `${keys.length} keys`,
          dataEntries,
          age: cm.age || cm.creationTimestamp || cm.metadata?.creationTimestamp || '',
          creationTimestamp: cm.creationTimestamp || cm.metadata?.creationTimestamp || '',
          labels: cm.labels || cm.metadata?.labels || {},
          annotations: cm.annotations || cm.metadata?.annotations || {},
        };
      });
      setConfigMaps(normalizedCms);
      setConfigMapsError(null);
    } catch (e: any) {
      if (!silent) {
        console.warn('Error fetching namespaced resources:', e);
        setConfigMapsError(e?.message || 'Failed to fetch resources');
      }
    }
  };

  /**
   * Native Kubernetes status check & background detection.
   * Probes http://127.0.0.1:48721/health directly on user's machine.
   * If running, retrieves the user's real local cluster resources.
   * If stopped, remains in a calm native state and auto-detects when Minikube / K8s opens.
   */
  const fetchClusterInfo = useCallback(async (silent: boolean | unknown = false) => {
    const isSilent = silent === true;
    if (!isSilent) {
      setLoading(true);
      setError(null);
    }
    try {
      // 1. Probe the Local Runtime on 127.0.0.1:48721
      const health = await checkLocalConnectorHealth();
      if (!health) {
        setConnectionState('runtime_offline');
        setClusterInfo(null);
        setNamespaces([]);
        setNodes([]);
        setPods([]);
        setDeployments([]);
        setStatefulSets([]);
        setServices([]);
        setSecrets([]);
        setIngresses([]);
        setEvents([]);
        setConfigMaps([]);
        if (!isSilent) setLoading(false);
        return;
      }

      // 2. Query local Kubernetes cluster health
      const summary: ClusterSummary = await apiRequest('/kubernetes/cluster-info');
      if (summary && summary.connected) {
        const wasConnected = connectionStateRef.current === 'connected';
        setConnectionState('connected');
        setClusterInfo(summary);
        setError(null);

        const [nsList, nodeList] = await Promise.all([
          apiRequest('/kubernetes/namespaces'),
          apiRequest('/kubernetes/nodes'),
        ]);

        const validNamespaces = Array.isArray(nsList) ? nsList : [];
        setNamespaces(validNamespaces);
        setNodes(Array.isArray(nodeList) ? nodeList : []);

        let nextNs = activeNamespaceRef.current;
        if (validNamespaces.length > 0 && nextNs !== 'all' && !validNamespaces.includes(nextNs)) {
          nextNs = validNamespaces.includes('default') ? 'default' : validNamespaces[0];
          setActiveNamespace(nextNs);
        }

        await fetchNamespacedResources(nextNs, isSilent);
      } else {
        setConnectionState('unavailable');
        setClusterInfo(summary || null);
        setNamespaces([]);
        setNodes([]);
        setPods([]);
        setDeployments([]);
        setStatefulSets([]);
        setServices([]);
        setSecrets([]);
        setIngresses([]);
        setEvents([]);
        setConfigMaps([]);
      }
    } catch (e: any) {
      setConnectionState('unavailable');
      setClusterInfo(null);
      setNamespaces([]);
      setNodes([]);
      setPods([]);
      setDeployments([]);
      setStatefulSets([]);
      setServices([]);
      setSecrets([]);
      setIngresses([]);
      setEvents([]);
      setConfigMaps([]);
    } finally {
      if (!isSilent) {
        setLoading(false);
      }
    }
  }, []);

  // Initial check on mount
  useEffect(() => {
    fetchClusterInfo(false);
  }, [fetchClusterInfo]);

  // Namespaces switch
  useEffect(() => {
    if (connectionState === 'connected' && activeNamespace) {
      fetchNamespacedResources(activeNamespace);
    }
  }, [activeNamespace, connectionState]);

  // Background auto-detect loop (checks silently every 4 seconds)
  // If Minikube or Docker Desktop Kubernetes starts up, it immediately connects without user interaction.
  useEffect(() => {
    const timer = setInterval(() => {
      fetchClusterInfo(true);
    }, 4000);

    return () => clearInterval(timer);
  }, [fetchClusterInfo]);

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
      const details: PodDetails = await apiRequest(`/kubernetes/pods/${pod.namespace}/${pod.name}`);
      const containerNames = (details.containers || []).map(c => c.name);
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

  const handleRefreshCurrentLogs = async () => {
    if (!logModalData) return;
    setLoadingLogs(true);
    try {
      const logsRes = await apiRequest(`/kubernetes/pods/${logModalData.namespace}/${logModalData.name}/logs?container=${encodeURIComponent(selectedLogContainer)}&tailLines=${logTailLines}`);
      setLogContent(logsRes?.logs || '(No logs emitted)');
    } catch (e: any) {
      setLogContent(`Error fetching logs: ${e.message || 'Unreachable'}`);
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
      message: `Restarting pod "${pod.name}" in namespace "${pod.namespace}" will terminate the container and spin up a fresh replica. Are you sure you want to proceed?`,
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
      message: `Permanently delete pod "${pod.name}" in namespace "${pod.namespace}"? If managed by a Deployment or ReplicaSet, a new pod may be scheduled.`,
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
  const handleOpenDeploymentDetails = async (dep: Deployment) => {
    setLoadingDepDetails(true);
    setSelectedDepDetails(null);
    try {
      const details: DeploymentDetails = await apiRequest(`/kubernetes/deployments/${dep.namespace}/${dep.name}`);
      setSelectedDepDetails(details);
    } catch (e: any) {
      showFeedback('error', e.message || 'Failed to fetch deployment details');
    } finally {
      setLoadingDepDetails(false);
    }
  };

  const handleOpenScaleDep = (dep: Deployment) => {
    const cur = dep.desired !== undefined ? dep.desired : (parseInt(dep.replicas.split('/')[1], 10) || 1);
    setScaleModalDep({ name: dep.name, namespace: dep.namespace, currentReplicas: cur });
    setScaleCount(cur);
  };

  const handleExecuteScale = async () => {
    if (!scaleModalDep) return;
    setScalingLoading(true);
    try {
      const res = await apiRequest(`/kubernetes/deployments/${scaleModalDep.namespace}/${scaleModalDep.name}/scale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replicas: Number(scaleCount) }),
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
      message: `Permanently delete deployment "${dep.name}" in namespace "${dep.namespace}"? All managed replica pods will be terminated.`,
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

  // StatefulSet Actions
  const handleOpenStatefulSetDetails = async (ss: StatefulSetItem) => {
    setLoadingSsDetails(true);
    setSelectedSsDetails(null);
    try {
      const details: StatefulSetDetails = await apiRequest(`/kubernetes/statefulsets/${ss.namespace}/${ss.name}`);
      setSelectedSsDetails(details);
    } catch (e: any) {
      showFeedback('error', e.message || 'Failed to fetch StatefulSet details');
    } finally {
      setLoadingSsDetails(false);
    }
  };

  const handleOpenScaleSs = (ss: StatefulSetItem) => {
    const cur = ss.desired !== undefined ? ss.desired : (parseInt(ss.replicas.split('/')[1], 10) || 1);
    setScaleModalSs({ name: ss.name, namespace: ss.namespace, currentReplicas: cur });
    setScaleSsCount(cur);
  };

  const handleExecuteScaleSs = async () => {
    if (!scaleModalSs) return;
    setScalingSsLoading(true);
    try {
      const res = await apiRequest(`/kubernetes/statefulsets/${scaleModalSs.namespace}/${scaleModalSs.name}/scale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replicas: Number(scaleSsCount) }),
      });
      showFeedback('success', res.message || `StatefulSet ${scaleModalSs.name} scaled to ${scaleSsCount}`);
      setScaleModalSs(null);
      await fetchNamespacedResources(activeNamespace);
    } catch (e: any) {
      showFeedback('error', e.message || 'Failed to scale StatefulSet');
    } finally {
      setScalingSsLoading(false);
    }
  };

  const handleDeleteStatefulSet = (ss: StatefulSetItem) => {
    setConfirmModal({
      title: 'Delete StatefulSet',
      message: `Permanently delete StatefulSet "${ss.name}" in namespace "${ss.namespace}"? Associated replica pods will be terminated.`,
      confirmLabel: 'Delete StatefulSet',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await apiRequest(`/kubernetes/statefulsets/${ss.namespace}/${ss.name}`, {
            method: 'DELETE',
          });
          showFeedback('success', res.message || `StatefulSet ${ss.name} deleted`);
          await fetchNamespacedResources(activeNamespace);
        } catch (e: any) {
          showFeedback('error', e.message || 'Failed to delete StatefulSet');
        } finally {
          setConfirmModal(null);
        }
      },
    });
  };

  // Service Actions
  const handleOpenServiceDetails = async (svc: ServiceItem) => {
    setLoadingServiceDetails(true);
    setSelectedServiceDetails(null);
    try {
      const details: ServiceDetails = await apiRequest(`/kubernetes/services/${svc.namespace}/${svc.name}`);
      setSelectedServiceDetails(details);
    } catch (e: any) {
      showFeedback('error', e.message || 'Failed to fetch service details');
    } finally {
      setLoadingServiceDetails(false);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSvcForm.name) {
      showFeedback('error', 'Service name is required');
      return;
    }
    setCreatingSvc(true);
    try {
      const payload: any = {
        name: newSvcForm.name.trim().toLowerCase(),
        namespace: newSvcForm.namespace,
        type: newSvcForm.type,
        port: Number(newSvcForm.port) || 80,
        targetPort: Number(newSvcForm.targetPort) || Number(newSvcForm.port) || 80,
      };
      if (newSvcForm.selectorApp && newSvcForm.selectorApp.trim()) {
        payload.selectorApp = newSvcForm.selectorApp.trim();
      }
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
  const handleRefreshConfigMaps = async (targetNs?: string) => {
    const ns = targetNs || activeNamespace;
    setLoadingConfigMaps(true);
    setConfigMapsError(null);
    try {
      const res = await apiRequest(`/kubernetes/configmaps?namespace=${ns}`);
      let rawCms: any[] = [];
      if (Array.isArray(res)) {
        rawCms = res;
      } else if (res && Array.isArray((res as any).items)) {
        rawCms = (res as any).items;
      }
      const normalizedCms: ConfigMapItem[] = rawCms.map((cm: any) => {
        const dataEntries = cm.dataEntries || (typeof cm.data === 'object' && cm.data !== null ? cm.data : {}) || {};
        const keys: string[] = Array.isArray(cm.keys) ? cm.keys : Object.keys(dataEntries);
        const dataCount: number = typeof cm.dataCount === 'number' ? cm.dataCount : keys.length;
        return {
          name: cm.name || cm.metadata?.name || 'unknown',
          namespace: cm.namespace || cm.metadata?.namespace || ns,
          dataCount,
          keys,
          data: cm.data || `${keys.length} keys`,
          dataEntries,
          age: cm.age || cm.creationTimestamp || cm.metadata?.creationTimestamp || '',
          creationTimestamp: cm.creationTimestamp || cm.metadata?.creationTimestamp || '',
          labels: cm.labels || cm.metadata?.labels || {},
          annotations: cm.annotations || cm.metadata?.annotations || {},
        };
      });
      setConfigMaps(normalizedCms);
      showFeedback('success', `ConfigMaps refreshed (${normalizedCms.length} found)`);
    } catch (err: any) {
      const msg = err?.message || 'Failed to fetch ConfigMaps';
      setConfigMapsError(msg);
      showFeedback('error', msg);
    } finally {
      setLoadingConfigMaps(false);
    }
  };

  const handleOpenConfigMap = async (cm: ConfigMapItem) => {
    setLoadingConfigMap(true);
    setSelectedConfigMap(null);
    const ns = cm.namespace || activeNamespace || 'default';
    try {
      const details: any = await apiRequest(`/kubernetes/configmaps/${ns}/${cm.name}`);
      const rawData = (details?.data && typeof details.data === 'object') ? details.data : (cm.dataEntries || {});
      const keys = Array.isArray(details?.keys) ? details.keys : Object.keys(rawData);
      const normalizedDetails: ConfigMapDetails = {
        name: details?.name || cm.name,
        namespace: details?.namespace || ns,
        uid: details?.uid || '',
        creationTimestamp: details?.creationTimestamp || cm.creationTimestamp || '',
        age: details?.age || details?.creationTimestamp || cm.age || '',
        labels: details?.labels || cm.labels || {},
        annotations: details?.annotations || cm.annotations || {},
        dataCount: details?.dataCount ?? keys.length,
        keys,
        data: rawData,
        binaryData: Array.isArray(details?.binaryData) ? details.binaryData : [],
      };
      setSelectedConfigMap(normalizedDetails);
    } catch (e: any) {
      showFeedback('error', e.message || `Failed to fetch ConfigMap "${cm.name}"`);
    } finally {
      setLoadingConfigMap(false);
    }
  };

  // Secret Actions
  const handleRefreshSecrets = async (targetNs?: string) => {
    const ns = targetNs || activeNamespace;
    setLoadingSecrets(true);
    setSecretsError(null);
    try {
      const res = await apiRequest(`/kubernetes/secrets?namespace=${ns}`);
      const validSecrets = Array.isArray(res) ? res : [];
      setSecrets(validSecrets);
      showFeedback('success', `Secrets refreshed (${validSecrets.length} found)`);
    } catch (err: any) {
      const msg = err?.message || 'Failed to fetch Secrets';
      setSecretsError(msg);
      showFeedback('error', msg);
    } finally {
      setLoadingSecrets(false);
    }
  };

  const handleOpenSecretDetails = async (secret: SecretItem) => {
    setLoadingSecretDetails(true);
    setSelectedSecretDetails(null);
    setRevealedSecretValues(null);
    const ns = secret.namespace || activeNamespace || 'default';
    try {
      const details: SecretDetails = await apiRequest(`/kubernetes/secrets/${ns}/${secret.name}`);
      setSelectedSecretDetails(details);
    } catch (e: any) {
      showFeedback('error', e.message || `Failed to fetch Secret "${secret.name}"`);
    } finally {
      setLoadingSecretDetails(false);
    }
  };

  const handleRevealSecret = async (ns: string, name: string) => {
    setRevealingSecret(true);
    try {
      const res = await apiRequest(`/kubernetes/secrets/${ns}/${name}/reveal`, {
        method: 'POST',
      });
      if (res && res.decodedData) {
        setRevealedSecretValues(res.decodedData);
        showFeedback('success', `Secret values decoded securely on-demand`);
      }
    } catch (e: any) {
      showFeedback('error', e.message || 'Failed to reveal secret values');
    } finally {
      setRevealingSecret(false);
    }
  };

  const handleDeleteSecret = (secret: SecretItem) => {
    setConfirmModal({
      title: 'Delete Secret',
      message: `Permanently delete Secret "${secret.name}" in namespace "${secret.namespace}"? Pods and services mounting this secret may fail or crash immediately.`,
      confirmLabel: 'Delete Secret',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await apiRequest(`/kubernetes/secrets/${secret.namespace}/${secret.name}`, {
            method: 'DELETE',
          });
          showFeedback('success', res.message || `Secret ${secret.name} deleted`);
          await fetchNamespacedResources(activeNamespace);
        } catch (e: any) {
          showFeedback('error', e.message || 'Failed to delete Secret');
        } finally {
          setConfirmModal(null);
        }
      },
    });
  };

  // Ingress Actions
  const handleOpenIngressDetails = async (ing: IngressItem) => {
    setLoadingIngressDetails(true);
    setSelectedIngressDetails(null);
    try {
      const details: IngressDetails = await apiRequest(`/kubernetes/ingress/${ing.namespace}/${ing.name}`);
      setSelectedIngressDetails(details);
    } catch (e: any) {
      showFeedback('error', e.message || 'Failed to fetch Ingress details');
    } finally {
      setLoadingIngressDetails(false);
    }
  };

  // Node Actions
  const handleOpenNodeDetails = async (node: NodeItem) => {
    setLoadingNodeDetails(true);
    setSelectedNodeDetails(null);
    try {
      const details: NodeDetails = await apiRequest(`/kubernetes/nodes/${node.name}`);
      setSelectedNodeDetails(details);
    } catch (e: any) {
      showFeedback('error', e.message || 'Failed to fetch Node details');
    } finally {
      setLoadingNodeDetails(false);
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
      <div className="w-64 bg-[#0f0f12] border-r border-neutral-850 p-3 space-y-4 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-1">
          {/* Header Brand */}
          <div className="flex items-center space-x-2.5 px-3 py-2 border-b border-neutral-850 mb-3">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="font-extrabold text-xs text-slate-200 block truncate">Kubernetes</span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  connectionState === 'connected' 
                    ? 'bg-emerald-500 animate-pulse' 
                    : connectionState === 'unavailable' 
                      ? 'bg-amber-400' 
                      : connectionState === 'checking'
                        ? 'bg-indigo-400 animate-pulse'
                        : 'bg-neutral-500'
                }`} />
                <span className={`text-[9px] uppercase font-mono font-semibold truncate ${
                  connectionState === 'connected' 
                    ? 'text-emerald-400' 
                    : connectionState === 'unavailable' 
                      ? 'text-amber-400' 
                      : connectionState === 'checking'
                        ? 'text-indigo-400'
                        : 'text-neutral-400'
                }`}>
                  {connectionState === 'connected' 
                    ? `● Connected (${clusterInfo?.currentContext || clusterInfo?.context || 'Active'})` 
                    : connectionState === 'unavailable' 
                      ? '● Not Available' 
                      : connectionState === 'checking'
                        ? '○ Connecting...'
                        : '● Runtime Offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Active Namespace Status in Sidebar */}
          {connectionState === 'connected' && (
            <div className="px-3 py-1.5 mb-2.5 rounded-xl bg-neutral-900/60 border border-neutral-850 flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-500">Namespace:</span>
              <span className="font-bold text-indigo-400 truncate max-w-[105px]" title={activeNamespace}>
                {activeNamespace === 'all' ? 'All' : activeNamespace}
              </span>
            </div>
          )}

          <div className="space-y-1">
            {tabs.map(t => {
              const count = t.id === 'nodes' ? nodes.length
                          : t.id === 'namespaces' ? namespaces.length
                          : t.id === 'pods' ? pods.length
                          : t.id === 'deployments' ? deployments.length
                          : t.id === 'statefulsets' ? statefulSets.length
                          : t.id === 'services' ? services.length
                          : t.id === 'configmaps' ? configMaps.length
                          : t.id === 'secrets' ? secrets.length
                          : t.id === 'ingress' ? ingresses.length
                          : null;
              const isSelected = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => selectTab(t.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 shadow-xs' 
                      : 'hover:bg-neutral-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate">{t.name}</span>
                  {connectionState === 'connected' && count !== null && count > 0 && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                      isSelected 
                        ? 'bg-indigo-500/25 text-indigo-300 font-bold' 
                        : 'bg-neutral-800 text-slate-400'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <button
          onClick={() => fetchClusterInfo(false)}
          disabled={loading}
          className="w-full py-2 border border-neutral-850 hover:bg-neutral-900 transition-colors text-slate-300 hover:text-white text-xs font-medium rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
          <span>{loading ? 'Checking Cluster...' : 'Refresh Cluster'}</span>
        </button>
      </div>

      {/* Main Content Pane */}
      <div className="flex-grow overflow-y-auto p-5 min-h-0 bg-[#08080a] flex flex-col">
        {/* CONDITION 1: RUNTIME OFFLINE */}
        {connectionState === 'runtime_offline' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none min-h-0 h-full">
            <div className="max-w-md w-full flex flex-col items-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 shadow-inner">
                <Server className="w-7 h-7 text-neutral-500" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-slate-200 font-sans">CaelumOS Runtime Offline</h3>
                <p className="text-xs text-slate-400 font-sans max-w-sm leading-relaxed">
                  The local system runtime is offline. Start the CaelumOS background service to connect to your local infrastructure.
                </p>
              </div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                <span>Monitoring local runtime...</span>
              </div>
            </div>
          </div>
        ) : connectionState === 'unavailable' ? (
          /* CONDITION 2: KUBERNETES NOT RUNNING */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none min-h-0 h-full">
            <div className="max-w-md w-full flex flex-col items-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 shadow-inner">
                <Layers className="w-7 h-7 text-neutral-500" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-slate-200 font-sans">Kubernetes Cluster Not Available</h3>
                <p className="text-xs text-slate-400 font-sans max-w-sm leading-relaxed">
                  Kubernetes cluster was not detected on this machine. Start Minikube, Docker Desktop Kubernetes, or Kind to connect automatically.
                </p>
              </div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 animate-ping" />
                <span>Waiting for Kubernetes cluster...</span>
              </div>
            </div>
          </div>
        ) : connectionState === 'checking' && nodes.length === 0 && pods.length === 0 ? (
          /* CONDITION 3: INITIAL CHECKING */
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-mono space-x-2 h-full">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Connecting to Kubernetes Cluster...</span>
          </div>
        ) : (
          /* CONDITION 4: CONNECTED TO REAL CLUSTER */
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-950/20 border border-red-500/20 rounded-2xl flex items-center justify-between text-xs text-red-400 shadow-sm font-sans">
                <div className="flex items-center space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="font-semibold text-red-300">{error}</span>
                </div>
                <button 
                  onClick={() => setError(null)}
                  className="p-1 hover:bg-red-900/40 rounded text-red-400 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
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
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fetchNamespacedResources(activeNamespace)}
                  className="p-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Refresh Pods"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
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
                        <div className="flex items-center space-x-4 text-[9.5px] text-slate-400 font-mono">
                          <div>Ready: <span className="text-slate-200 font-semibold">{p.ready || '1/1'}</span></div>
                          <div>Restarts: <span className="text-slate-200 font-semibold">{p.restarts ?? 0}</span></div>
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
                <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">Deployments (Namespace: {activeNamespace === 'all' ? 'All Namespaces' : activeNamespace})</h4>
                <span className="text-[10px] text-slate-500 font-mono">Live replica management</span>
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
                  <span>Deploy</span>
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
                {error ? 'Unable to load deployments while cluster is unreachable.' : 'No deployments active in this namespace.'}
              </div>
            ) : (
              <div className="space-y-3 font-mono text-xs text-slate-300">
                {deployments.map(dep => {
                  const isDepSelected = selectedDepDetails?.name === dep.name && selectedDepDetails?.namespace === dep.namespace;
                  return (
                    <div 
                      key={dep.name + dep.namespace}
                      onClick={() => handleOpenDeploymentDetails(dep)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenDeploymentDetails(dep); }}
                      title="Click to view Deployment details and specs"
                      className={`p-3.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer select-none group ${
                        isDepSelected
                          ? 'bg-indigo-500/10 border border-indigo-500/70 ring-1 ring-indigo-500/30 shadow-md'
                          : 'bg-neutral-900/35 border border-neutral-900/85 hover:border-indigo-500/40 hover:bg-neutral-900/60'
                      }`}
                    >
                      <div className="space-y-1 min-w-0 pr-4">
                        <div className="flex items-center space-x-2.5">
                          <Server className={`w-4 h-4 flex-shrink-0 transition-colors ${
                            isDepSelected ? 'text-indigo-400' : 'text-indigo-400/80 group-hover:text-indigo-400'
                          }`} />
                          <span className="font-bold text-xs text-slate-200 truncate max-w-[280px] font-sans group-hover:text-white transition-colors">
                            {dep.name}
                          </span>
                          {dep.namespace && (
                            <span className="text-[9px] bg-neutral-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                              {dep.namespace}
                            </span>
                          )}
                          <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            dep.status === 'Active' 
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {dep.status || 'Active'}
                          </span>
                        </div>
                        <div className="text-[9.5px] text-slate-450 flex items-center space-x-4">
                          <span>Replicas: <span className="text-slate-200 font-bold">{dep.replicas}</span></span>
                          {dep.available !== undefined && <span>Available: <span className="text-slate-300">{dep.available}</span></span>}
                          {dep.images && dep.images.length > 0 && <span>Image: <span className="text-slate-350">{dep.images[0]}</span></span>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <div className="flex items-center space-x-1 pl-2 border-l border-neutral-850">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenScaleDep(dep); }}
                            title="Scale Deployment"
                            className="p-1.5 rounded-lg bg-neutral-850/60 hover:bg-neutral-800 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenDeploymentDetails(dep); }}
                            title="View Deployment Details"
                            className="p-1.5 rounded-lg bg-neutral-850/60 hover:bg-neutral-800 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteDeployment(dep); }}
                            title="Delete Deployment"
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

        {/* StatefulSets Tab */}
        {activeTab === 'statefulsets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">
                  StatefulSets (Namespace: {activeNamespace === 'all' ? 'All Namespaces' : activeNamespace})
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">Ordered, graceful deployment and scaling</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fetchNamespacedResources(activeNamespace)}
                  className="p-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Refresh StatefulSets"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
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
            {statefulSets.length === 0 ? (
              <div className="p-4 bg-neutral-900/40 border border-neutral-850 rounded-2xl text-xs font-mono text-slate-450">
                {error ? 'Unable to load StatefulSets while cluster is unreachable.' : 'No active StatefulSets configured in workspace namespace.'}
              </div>
            ) : (
              <div className="space-y-3 font-mono text-xs text-slate-300">
                {statefulSets.map(ss => {
                  const isSsSelected = selectedSsDetails?.name === ss.name && selectedSsDetails?.namespace === ss.namespace;
                  return (
                    <div 
                      key={ss.name + ss.namespace}
                      onClick={() => handleOpenStatefulSetDetails(ss)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenStatefulSetDetails(ss); }}
                      title="Click to view StatefulSet details"
                      className={`p-3.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer select-none group ${
                        isSsSelected
                          ? 'bg-indigo-500/10 border border-indigo-500/70 ring-1 ring-indigo-500/30 shadow-md'
                          : 'bg-neutral-900/35 border border-neutral-900/85 hover:border-indigo-500/40 hover:bg-neutral-900/60'
                      }`}
                    >
                      <div className="space-y-1 min-w-0 pr-4">
                        <div className="flex items-center space-x-2.5">
                          <Database className={`w-4 h-4 flex-shrink-0 transition-colors ${
                            isSsSelected ? 'text-indigo-400' : 'text-indigo-400/80 group-hover:text-indigo-400'
                          }`} />
                          <span className="font-bold text-xs text-slate-200 truncate max-w-[280px] font-sans group-hover:text-white transition-colors">
                            {ss.name}
                          </span>
                          {ss.namespace && (
                            <span className="text-[9px] bg-neutral-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                              {ss.namespace}
                            </span>
                          )}
                          <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            ss.status === 'Ready' 
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {ss.status || 'Ready'}
                          </span>
                        </div>
                        <div className="text-[9.5px] text-slate-450 flex items-center space-x-4">
                          <span>Replicas: <span className="text-slate-200 font-bold">{ss.replicas}</span></span>
                          {ss.serviceName && <span>Service: <span className="text-slate-350">{ss.serviceName}</span></span>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <div className="flex items-center space-x-1 pl-2 border-l border-neutral-850">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenScaleSs(ss); }}
                            title="Scale StatefulSet"
                            className="p-1.5 rounded-lg bg-neutral-850/60 hover:bg-neutral-800 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenStatefulSetDetails(ss); }}
                            title="View StatefulSet Details"
                            className="p-1.5 rounded-lg bg-neutral-850/60 hover:bg-neutral-800 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteStatefulSet(ss); }}
                            title="Delete StatefulSet"
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

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">
                  Cluster Services (Namespace: {activeNamespace === 'all' ? 'All Namespaces' : activeNamespace})
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">Real Kubernetes networking & EndpointSlices</span>
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
                {services.map(svc => {
                  const isSvcSelected = selectedServiceDetails?.name === svc.name && selectedServiceDetails?.namespace === svc.namespace;
                  return (
                    <div 
                      key={svc.name + svc.namespace} 
                      onClick={() => handleOpenServiceDetails(svc)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenServiceDetails(svc); }}
                      title="Click to view Service details and endpoints"
                      className={`p-3.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer select-none group ${
                        isSvcSelected
                          ? 'bg-indigo-500/10 border border-indigo-500/70 ring-1 ring-indigo-500/30 shadow-md'
                          : 'bg-neutral-900/35 border border-neutral-900/85 hover:border-indigo-500/40 hover:bg-neutral-900/60'
                      }`}
                    >
                      <div className="space-y-1 min-w-0 pr-4">
                        <div className="flex items-center space-x-2.5">
                          <Network className={`w-4 h-4 flex-shrink-0 transition-colors ${
                            isSvcSelected ? 'text-indigo-400' : 'text-indigo-400/80 group-hover:text-indigo-400'
                          }`} />
                          <span className="font-bold text-xs text-slate-200 truncate max-w-[280px] font-sans group-hover:text-white transition-colors">
                            {svc.name}
                          </span>
                          {svc.namespace && (
                            <span className="text-[9px] bg-neutral-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                              {svc.namespace}
                            </span>
                          )}
                          <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            svc.type === 'LoadBalancer' 
                              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25'
                              : svc.type === 'NodePort'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                                : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25'
                          }`}>
                            {svc.type}
                          </span>
                        </div>
                        <div className="text-[9.5px] text-slate-450 flex flex-wrap gap-x-4">
                          <span>Cluster-IP: <span className="text-slate-300 font-bold">{svc.clusterIP}</span></span>
                          <span>Port(s): <span className="text-slate-300">{svc.ports}</span></span>
                          {svc.endpoints && svc.endpoints !== 'None' && (
                            <span>Endpoints: <span className="text-emerald-400 font-semibold">{svc.endpoints}</span></span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <div className="flex items-center space-x-1 pl-2 border-l border-neutral-850">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenServiceDetails(svc); }}
                            title="View Service Details"
                            className="p-1.5 rounded-lg bg-neutral-850/60 hover:bg-neutral-800 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteService(svc); }}
                            title="Delete Service"
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

        {/* ConfigMaps Tab */}
        {activeTab === 'configmaps' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">
                    ConfigMaps
                  </h4>
                  <span className="text-[9.5px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 px-2 py-0.5 rounded-full font-mono font-semibold">
                    {activeNamespace === 'all' ? 'All Namespaces' : activeNamespace}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Application configurations & key-value datasets</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleRefreshConfigMaps()}
                  disabled={loadingConfigMaps}
                  className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                  title="Refresh ConfigMaps from cluster"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingConfigMaps ? 'animate-spin text-indigo-400' : ''}`} />
                  <span>Refresh</span>
                </button>
                <select
                  value={activeNamespace}
                  onChange={(e) => {
                    const ns = e.target.value;
                    setActiveNamespace(ns);
                    handleRefreshConfigMaps(ns);
                  }}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none cursor-pointer hover:border-neutral-700 transition-colors"
                >
                  <option value="all">All Namespaces</option>
                  {namespaces.map(ns => (
                    <option key={ns} value={ns}>{ns}</option>
                  ))}
                </select>
              </div>
            </div>

            {loadingConfigMaps && (
              <div className="p-8 bg-neutral-900/40 border border-neutral-850 rounded-2xl flex flex-col items-center justify-center space-y-2 text-xs font-mono text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
                <span>Fetching ConfigMaps from cluster...</span>
              </div>
            )}

            {!loadingConfigMaps && configMapsError && (
              <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-2xl flex items-center justify-between text-xs text-red-300">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{configMapsError}</span>
                </div>
                <button
                  onClick={() => handleRefreshConfigMaps()}
                  className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded text-[11px] font-semibold text-red-200 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {!loadingConfigMaps && !configMapsError && configMaps.length === 0 && (
              <div className="p-6 bg-neutral-900/40 border border-neutral-850 rounded-2xl text-xs font-mono text-slate-450 flex flex-col items-center justify-center space-y-2">
                <FileCode className="w-6 h-6 text-slate-600" />
                <span>No ConfigMaps found in {activeNamespace === 'all' ? 'any namespace' : `namespace: ${activeNamespace}`}.</span>
                <button
                  onClick={() => handleRefreshConfigMaps()}
                  className="text-indigo-400 hover:text-indigo-300 underline text-[11px] pt-1 cursor-pointer"
                >
                  Refresh
                </button>
              </div>
            )}

            {!loadingConfigMaps && !configMapsError && configMaps.length > 0 && (
              <div className="space-y-3 font-mono text-xs text-slate-300">
                {configMaps.map(cm => {
                  const isCmSelected = selectedConfigMap?.name === cm.name && selectedConfigMap?.namespace === cm.namespace;
                  const keysList = Array.isArray(cm.keys) ? cm.keys : [];
                  return (
                    <div 
                      key={cm.name + cm.namespace} 
                      onClick={() => handleOpenConfigMap(cm)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenConfigMap(cm); }}
                      title="Click to view ConfigMap details and data keys"
                      className={`p-3.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer select-none group ${
                        isCmSelected
                          ? 'bg-indigo-500/10 border border-indigo-500/70 ring-1 ring-indigo-500/30 shadow-md'
                          : 'bg-neutral-900/35 border border-neutral-900/85 hover:border-indigo-500/40 hover:bg-neutral-900/60'
                      }`}
                    >
                      <div className="space-y-1.5 min-w-0 pr-4">
                        <div className="flex items-center space-x-2.5">
                          <FileCode className={`w-4 h-4 flex-shrink-0 transition-colors ${
                            isCmSelected ? 'text-indigo-400' : 'text-indigo-400/80 group-hover:text-indigo-400'
                          }`} />
                          <span className="font-bold text-xs text-slate-200 truncate max-w-[280px] font-sans group-hover:text-white transition-colors">
                            {cm.name}
                          </span>
                          {cm.namespace && (
                            <span className="text-[9px] bg-neutral-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                              {cm.namespace}
                            </span>
                          )}
                          <span className="text-[8.5px] px-1.5 py-0.5 rounded font-bold uppercase bg-neutral-800/80 text-slate-350 border border-neutral-750">
                            {cm.dataCount} {cm.dataCount === 1 ? 'key' : 'keys'}
                          </span>
                        </div>
                        <div className="text-[9.5px] text-slate-450 flex items-center space-x-2">
                          <span className="text-slate-500">Keys:</span>
                          <span className="text-slate-350 font-semibold truncate max-w-[400px]">
                            {keysList.length > 0 ? keysList.join(', ') : 'None'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenConfigMap(cm); }}
                          title="View ConfigMap Details"
                          className="p-1.5 rounded-lg bg-neutral-850/60 hover:bg-neutral-800 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Secrets Tab */}
        {activeTab === 'secrets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">
                    Kubernetes Secrets
                  </h4>
                  <span className="text-[9.5px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 px-2 py-0.5 rounded-full font-mono font-semibold">
                    {activeNamespace === 'all' ? 'All Namespaces' : activeNamespace}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Masked by default · On-demand explicit reveal</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleRefreshSecrets()}
                  disabled={loadingSecrets}
                  className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                  title="Refresh Secrets from cluster"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingSecrets ? 'animate-spin text-indigo-400' : ''}`} />
                  <span>Refresh</span>
                </button>
                <select
                  value={activeNamespace}
                  onChange={(e) => {
                    const ns = e.target.value;
                    setActiveNamespace(ns);
                    handleRefreshSecrets(ns);
                  }}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none cursor-pointer hover:border-neutral-700 transition-colors"
                >
                  <option value="all">All Namespaces</option>
                  {namespaces.map(ns => (
                    <option key={ns} value={ns}>{ns}</option>
                  ))}
                </select>
              </div>
            </div>

            {loadingSecrets && (
              <div className="p-8 bg-neutral-900/40 border border-neutral-850 rounded-2xl flex flex-col items-center justify-center space-y-2 text-xs font-mono text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
                <span>Fetching Secrets from cluster...</span>
              </div>
            )}

            {!loadingSecrets && secretsError && (
              <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-2xl flex items-center justify-between text-xs text-red-300">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{secretsError}</span>
                </div>
                <button
                  onClick={() => handleRefreshSecrets()}
                  className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded text-[11px] font-semibold text-red-200 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {!loadingSecrets && !secretsError && secrets.length === 0 && (
              <div className="p-6 bg-neutral-900/40 border border-neutral-850 rounded-2xl text-xs font-mono text-slate-450 flex flex-col items-center justify-center space-y-2">
                <Key className="w-6 h-6 text-slate-600" />
                <span>No Secrets found in {activeNamespace === 'all' ? 'any namespace' : `namespace: ${activeNamespace}`}.</span>
                <button
                  onClick={() => handleRefreshSecrets()}
                  className="text-indigo-400 hover:text-indigo-300 underline text-[11px] pt-1 cursor-pointer"
                >
                  Refresh
                </button>
              </div>
            )}

            {!loadingSecrets && !secretsError && secrets.length > 0 && (
              <div className="space-y-3 font-mono text-xs text-slate-300">
                {secrets.map(secret => {
                  const isSecretSelected = selectedSecretDetails?.name === secret.name && selectedSecretDetails?.namespace === secret.namespace;
                  return (
                    <div 
                      key={secret.name + secret.namespace} 
                      onClick={() => handleOpenSecretDetails(secret)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenSecretDetails(secret); }}
                      title="Click to view Secret metadata and masked keys"
                      className={`p-3.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer select-none group ${
                        isSecretSelected
                          ? 'bg-indigo-500/10 border border-indigo-500/70 ring-1 ring-indigo-500/30 shadow-md'
                          : 'bg-neutral-900/35 border border-neutral-900/85 hover:border-indigo-500/40 hover:bg-neutral-900/60'
                      }`}
                    >
                      <div className="space-y-1.5 min-w-0 pr-4">
                        <div className="flex items-center space-x-2.5">
                          <Key className={`w-4 h-4 flex-shrink-0 transition-colors ${
                            isSecretSelected ? 'text-indigo-400' : 'text-amber-400 group-hover:text-amber-300'
                          }`} />
                          <span className="font-bold text-xs text-slate-200 truncate max-w-[280px] font-sans group-hover:text-white transition-colors">
                            {secret.name}
                          </span>
                          {secret.namespace && (
                            <span className="text-[9px] bg-neutral-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                              {secret.namespace}
                            </span>
                          )}
                          <span className="text-[8.5px] px-1.5 py-0.5 rounded font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {secret.type}
                          </span>
                          <span className="text-[8.5px] px-1.5 py-0.5 rounded font-bold uppercase bg-neutral-800/80 text-slate-350 border border-neutral-750">
                            {secret.keysCount} {secret.keysCount === 1 ? 'key' : 'keys'}
                          </span>
                        </div>
                        <div className="text-[9.5px] text-slate-450 flex items-center space-x-2">
                          <span className="text-slate-500">Keys:</span>
                          <span className="text-slate-350 font-semibold truncate max-w-[400px]">
                            {secret.keys && secret.keys.length > 0 ? secret.keys.join(', ') : 'None'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <div className="flex items-center space-x-1 pl-2 border-l border-neutral-850">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenSecretDetails(secret); }}
                            title="View Secret Details"
                            className="p-1.5 rounded-lg bg-neutral-850/60 hover:bg-neutral-800 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteSecret(secret); }}
                            title="Delete Secret"
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

        {/* Ingress Tab */}
        {activeTab === 'ingress' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">
                  Ingress Routes (Namespace: {activeNamespace === 'all' ? 'All Namespaces' : activeNamespace})
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">HTTP/HTTPS application layer routing</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fetchNamespacedResources(activeNamespace)}
                  className="p-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Refresh Ingress Routes"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
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
            {ingresses.length === 0 ? (
              <div className="p-4 bg-neutral-900/40 border border-neutral-850 rounded-2xl text-xs font-mono text-slate-450">
                {error ? 'Unable to load ingress while cluster is unreachable.' : 'No Ingress controllers or routing rules found in namespace.'}
              </div>
            ) : (
              <div className="space-y-3 font-mono text-xs text-slate-300">
                {ingresses.map(ing => (
                  <div 
                    key={ing.name + ing.namespace} 
                    onClick={() => handleOpenIngressDetails(ing)}
                    role="button"
                    tabIndex={0}
                    className="p-3.5 bg-neutral-900/35 border border-neutral-900/85 hover:border-indigo-500/40 hover:bg-neutral-900/60 rounded-2xl flex justify-between items-center transition-all cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2.5">
                        <Globe className="w-4 h-4 text-cyan-400" />
                        <span className="font-bold text-xs text-slate-200">{ing.name}</span>
                        {ing.namespace && (
                          <span className="text-[9px] bg-neutral-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                            {ing.namespace}
                          </span>
                        )}
                        {ing.className && (
                          <span className="text-[8.5px] px-1.5 py-0.5 rounded font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            Class: {ing.className}
                          </span>
                        )}
                      </div>
                      <div className="text-[9.5px] text-slate-450">
                        Hosts: <span className="text-slate-300">{ing.hosts || '*'}</span> | Address: <span className="text-slate-300">{ing.address || '-'}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenIngressDetails(ing); }}
                      title="View Ingress Details"
                      className="p-1.5 rounded-lg bg-neutral-850/60 hover:bg-neutral-800 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Clusters Overview Tab */}
        {activeTab === 'clusters' && (
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">Kubernetes Clusters</h4>
            <div className="p-4 bg-neutral-900/40 border border-neutral-850 rounded-2xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">{clusterInfo?.context || 'minikube'}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded border font-bold uppercase ${
                  clusterInfo?.status === 'Ready' || clusterInfo?.connected
                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {clusterInfo?.status || 'Ready'}
                </span>
              </div>
              <div className="text-[10px] text-slate-450 space-y-1">
                <div>API Endpoint: <span className="text-slate-300">{clusterInfo?.server || 'Dynamic Context Discovery'}</span></div>
                <div>Kubernetes Version: <span className="text-slate-300">{clusterInfo?.version || 'v1.34.0'}</span></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-slate-400">
                  <div className="p-2 bg-neutral-950/40 rounded-lg border border-neutral-800/60">
                    <span className="text-[9px] text-slate-500 block">Nodes</span>
                    <span className="font-bold text-slate-200">{clusterInfo?.nodeCount ?? nodes.length}</span>
                  </div>
                  <div className="p-2 bg-neutral-950/40 rounded-lg border border-neutral-800/60">
                    <span className="text-[9px] text-slate-500 block">Active Pods</span>
                    <span className="font-bold text-slate-200">{clusterInfo?.podCount ?? pods.length}</span>
                  </div>
                  <div className="p-2 bg-neutral-950/40 rounded-lg border border-neutral-800/60">
                    <span className="text-[9px] text-slate-500 block">Deployments</span>
                    <span className="font-bold text-slate-200">{clusterInfo?.deploymentCount ?? deployments.length}</span>
                  </div>
                  <div className="p-2 bg-neutral-950/40 rounded-lg border border-neutral-800/60">
                    <span className="text-[9px] text-slate-500 block">Namespaces</span>
                    <span className="font-bold text-slate-200">{clusterInfo?.namespaceCount ?? namespaces.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nodes Tab */}
        {activeTab === 'nodes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">Cluster Nodes</h4>
              <button
                onClick={() => fetchClusterInfo(false)}
                className="p-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Refresh Nodes"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            {nodes.length === 0 ? (
              <div className="p-4 bg-neutral-900/40 border border-neutral-850 rounded-2xl text-xs font-mono text-slate-450">
                {error ? 'Unable to load nodes while cluster is unreachable.' : 'No nodes found in cluster.'}
              </div>
            ) : (
              <div className="space-y-3">
                {nodes.map(n => (
                  <div 
                    key={n.name}
                    onClick={() => handleOpenNodeDetails(n)}
                    role="button"
                    tabIndex={0}
                    className="p-3.5 bg-neutral-900/40 border border-neutral-850 hover:border-indigo-500/40 hover:bg-neutral-900/60 rounded-2xl flex items-center justify-between text-xs font-mono text-slate-300 transition-all cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold font-sans text-slate-200">{n.name}</span>
                        <span className="text-[9px] bg-neutral-800 text-slate-400 px-1.5 py-0.5 rounded">
                          {n.roles}
                        </span>
                      </div>
                      <div className="text-[9.5px] text-slate-450 flex flex-wrap gap-x-4">
                        <span>IP: <span className="text-slate-300">{n.internalIP}</span></span>
                        <span>OS: <span className="text-slate-300">{n.os}</span></span>
                        <span>Version: <span className="text-slate-300">{n.version}</span></span>
                        {n.cpuCapacity && <span>CPU: <span className="text-slate-300">{n.cpuCapacity}</span></span>}
                        {n.memoryCapacity && <span>Memory: <span className="text-slate-300">{n.memoryCapacity}</span></span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[8px] px-1.5 py-0.5 border rounded font-bold uppercase ${
                        n.status === 'Ready' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {n.status}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenNodeDetails(n); }}
                        title="View Node Details"
                        className="p-1.5 rounded-lg bg-neutral-850/60 hover:bg-neutral-800 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
                <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">Kubernetes Namespaces</h4>
                <span className="text-[10px] text-slate-500 font-mono">Click any namespace card to switch active context</span>
              </div>
              <div className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                Active: <span className="font-bold">{activeNamespace === 'all' ? 'All Namespaces' : activeNamespace}</span>
              </div>
            </div>
            {namespaces.length === 0 ? (
              <div className="p-4 bg-neutral-900/40 border border-neutral-850 rounded-2xl text-xs font-mono text-slate-450">
                {error ? 'Unable to load namespaces while cluster is unreachable.' : 'No namespaces found in cluster.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Global All-Namespaces Card */}
                <div 
                  onClick={() => handleSelectNamespace('all')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectNamespace('all'); }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                    activeNamespace === 'all'
                      ? 'bg-indigo-500/15 border-indigo-500/70 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-950/30'
                      : 'bg-neutral-900/40 border-neutral-850 hover:border-indigo-500/40 hover:bg-neutral-900/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Layers className={`w-4 h-4 ${activeNamespace === 'all' ? 'text-indigo-400' : 'text-slate-400'}`} />
                      <span className="font-bold text-xs text-slate-200">All Namespaces</span>
                    </div>
                    {activeNamespace === 'all' ? (
                      <span className="text-[8px] bg-indigo-500 text-white font-extrabold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="text-[8px] bg-neutral-800 text-slate-400 font-bold px-1.5 py-0.5 rounded font-mono">
                        Global
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-450 font-mono mb-2">
                    View cluster-wide resources across every registered namespace.
                  </p>
                </div>

                {/* Individual Namespaces Cards */}
                {namespaces.map(ns => {
                  const isSelected = activeNamespace === ns;
                  return (
                    <div 
                      key={ns} 
                      onClick={() => handleSelectNamespace(ns)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectNamespace(ns); }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer select-none group ${
                        isSelected
                          ? 'bg-indigo-500/15 border-indigo-500/70 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-950/30'
                          : 'bg-neutral-900/40 border-neutral-850 hover:border-indigo-500/40 hover:bg-neutral-900/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-indigo-400 animate-pulse' : 'bg-emerald-400'}`} />
                          <span className="font-bold text-xs text-slate-200 group-hover:text-white transition-colors">{ns}</span>
                        </div>
                        {isSelected ? (
                          <span className="text-[8px] bg-indigo-500 text-white font-extrabold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider flex items-center space-x-1">
                            <Check className="w-2.5 h-2.5" />
                            <span>ACTIVE</span>
                          </span>
                        ) : (
                          <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold font-mono">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-450 font-mono mt-3 pt-2 border-t border-neutral-850">
                        <span>Click to filter all views</span>
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="space-y-4 flex flex-col h-full min-h-[300px]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">Cluster Logs & Event Stream</h4>
                <span className="text-[10px] text-slate-500 font-mono">Real Kubernetes system events & pod logs</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fetchNamespacedResources(activeNamespace)}
                  className="p-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Refresh Events"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
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
            {events.length === 0 ? (
              <div className="p-4 bg-neutral-900/40 border border-neutral-850 rounded-2xl text-xs font-mono text-slate-450">
                {error ? 'Unable to load events while cluster is unreachable.' : 'No cluster events recorded.'}
              </div>
            ) : (
              <pre className="flex-1 p-3 bg-black/45 border border-neutral-900 rounded-2xl text-[10px] text-slate-350 font-mono overflow-auto leading-relaxed whitespace-pre-wrap">
                {events.map(ev => `${ev.lastTimestamp || ev.timestamp || ''} [${ev.type || 'Normal'}] ${ev.reason || ''}: ${ev.message || ''}`).join('\n')}
              </pre>
            )}
          </div>
        )}
          </>
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
              <div className="flex items-center space-x-2">
                {selectedPodDetails && (
                  <button
                    onClick={() => {
                      const podObj = { name: selectedPodDetails.name, namespace: selectedPodDetails.namespace } as Pod;
                      setSelectedPodDetails(null);
                      handleOpenPodLogs(podObj);
                    }}
                    className="px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>View Logs</span>
                  </button>
                )}
                <button 
                  onClick={() => setSelectedPodDetails(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
              {loadingPodDetails ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                  <span>Querying Kubernetes API for pod metadata...</span>
                </div>
              ) : selectedPodDetails ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Status</span>
                      <span className="text-xs font-bold text-emerald-400 font-sans">{selectedPodDetails.status}</span>
                    </div>
                    <div className="p-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Pod IP</span>
                      <span className="text-xs font-bold text-slate-200">{selectedPodDetails.ip || 'Pending'}</span>
                    </div>
                    <div className="p-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Host Node</span>
                      <span className="text-xs font-bold text-slate-200">{selectedPodDetails.node || 'N/A'}</span>
                    </div>
                    <div className="p-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">UID</span>
                      <span className="text-[10px] text-slate-350 truncate block" title={selectedPodDetails.uid}>
                        {selectedPodDetails.uid.slice(0, 12)}...
                      </span>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-300 mb-2 uppercase text-[10px] tracking-wider">Containers ({selectedPodDetails.containers?.length || 0})</h5>
                    <div className="space-y-2">
                      {(selectedPodDetails.containers || []).map(c => (
                        <div key={c.name} className="p-3 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-200">{c.name}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${c.ready ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
                              {c.state}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">Image: <span className="text-slate-300">{c.image}</span></div>
                          <div className="text-[10px] text-slate-400">Restarts: <span className="text-slate-300">{c.restartCount}</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
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
            className="w-full max-w-4xl bg-[#121216] border border-neutral-800 rounded-2xl shadow-2xl text-slate-200 overflow-hidden flex flex-col h-[85vh] animate-in zoom-in-95 duration-150"
          >
            <div className="px-5 py-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
              <div className="flex items-center space-x-3 truncate">
                <Terminal className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <div className="truncate">
                  <span className="font-bold text-xs text-slate-100 block truncate">Logs: {logModalData.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Namespace: {logModalData.namespace}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {logModalData.containers.length > 1 && (
                  <select
                    value={selectedLogContainer}
                    onChange={(e) => {
                      setSelectedLogContainer(e.target.value);
                      handleOpenPodLogs({ name: logModalData.name, namespace: logModalData.namespace } as Pod, e.target.value);
                    }}
                    className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none"
                  >
                    {logModalData.containers.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}
                <select
                  value={logTailLines}
                  onChange={(e) => setLogTailLines(Number(e.target.value))}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none"
                >
                  <option value={50}>Tail 50</option>
                  <option value={100}>Tail 100</option>
                  <option value={200}>Tail 200</option>
                  <option value={500}>Tail 500</option>
                </select>
                <button
                  onClick={handleRefreshCurrentLogs}
                  disabled={loadingLogs}
                  className="p-1.5 rounded-lg bg-neutral-850 hover:bg-neutral-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Refresh logs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin text-cyan-400' : ''}`} />
                </button>
                <button
                  onClick={handleCopyLogs}
                  className="px-2.5 py-1 rounded-lg bg-neutral-850 hover:bg-neutral-800 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs font-semibold flex items-center space-x-1"
                >
                  {copiedLogs ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLogs ? 'Copied' : 'Copy'}</span>
                </button>
                <button 
                  onClick={() => setLogModalData(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <pre className="flex-1 p-4 bg-black/60 text-slate-300 font-mono text-xs overflow-auto leading-relaxed whitespace-pre-wrap select-text">
              {loadingLogs ? 'Fetching stdout/stderr stream from Kubernetes pod...' : logContent}
            </pre>
          </div>
        </div>
      )}

      {/* Deployment Details Modal */}
      {selectedDepDetails && (
        <div 
          onClick={() => setSelectedDepDetails(null)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#121216] border border-neutral-800 rounded-2xl shadow-2xl text-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
          >
            <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
              <div className="flex items-center space-x-3 truncate">
                <Server className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <div className="truncate">
                  <span className="font-bold text-sm text-slate-100 block truncate">{selectedDepDetails.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Namespace: {selectedDepDetails.namespace}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDepDetails(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Desired Replicas</span>
                  <span className="text-xs font-bold text-slate-200">{selectedDepDetails.desired}</span>
                </div>
                <div className="p-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Ready Replicas</span>
                  <span className="text-xs font-bold text-emerald-400">{selectedDepDetails.ready}</span>
                </div>
                <div className="p-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Strategy</span>
                  <span className="text-xs font-bold text-indigo-400">{selectedDepDetails.strategy}</span>
                </div>
                <div className="p-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Created</span>
                  <span className="text-[10px] text-slate-350">{new Date(selectedDepDetails.creationTimestamp).toLocaleDateString()}</span>
                </div>
              </div>
              <div>
                <h5 className="font-bold text-slate-300 mb-2 uppercase text-[10px] tracking-wider">Containers ({selectedDepDetails.containers.length})</h5>
                <div className="space-y-2">
                  {selectedDepDetails.containers.map(c => (
                    <div key={c.name} className="p-3 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-1">
                      <div className="font-bold text-slate-200">{c.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">Image: <span className="text-slate-300">{c.image}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* StatefulSet Details Modal */}
      {selectedSsDetails && (
        <div 
          onClick={() => setSelectedSsDetails(null)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#121216] border border-neutral-800 rounded-2xl shadow-2xl text-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
          >
            <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
              <div className="flex items-center space-x-3 truncate">
                <Database className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <div className="truncate">
                  <span className="font-bold text-sm text-slate-100 block truncate">{selectedSsDetails.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Namespace: {selectedSsDetails.namespace}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSsDetails(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Desired</span>
                  <span className="text-xs font-bold text-slate-200">{selectedSsDetails.desired}</span>
                </div>
                <div className="p-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Ready</span>
                  <span className="text-xs font-bold text-emerald-400">{selectedSsDetails.ready}</span>
                </div>
                <div className="p-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Service Name</span>
                  <span className="text-xs font-bold text-indigo-400">{selectedSsDetails.serviceName || 'None'}</span>
                </div>
                <div className="p-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Created</span>
                  <span className="text-[10px] text-slate-350">{new Date(selectedSsDetails.creationTimestamp).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Secret Details Modal */}
      {selectedSecretDetails && (
        <div 
          onClick={() => { setSelectedSecretDetails(null); setRevealedSecretValues(null); }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#121216] border border-neutral-800 rounded-2xl shadow-2xl text-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
          >
            <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
              <div className="flex items-center space-x-3 truncate">
                <Key className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div className="truncate">
                  <span className="font-bold text-sm text-slate-100 block truncate">{selectedSecretDetails.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Namespace: {selectedSecretDetails.namespace} | Type: {selectedSecretDetails.type}</span>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedSecretDetails(null); setRevealedSecretValues(null); }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl flex items-center justify-between text-amber-300">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-[11px]">Secret values are masked by default. Reveal only in secure environments.</span>
                </div>
                {revealedSecretValues ? (
                  <button
                    onClick={() => setRevealedSecretValues(null)}
                    className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-750 text-slate-300 rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleRevealSecret(selectedSecretDetails.namespace, selectedSecretDetails.name)}
                    disabled={revealingSecret}
                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    {revealingSecret ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>Reveal</span>
                  </button>
                )}
              </div>

              <div>
                <h5 className="font-bold text-slate-300 mb-2 uppercase text-[10px] tracking-wider">Secret Data Keys ({selectedSecretDetails.keysCount})</h5>
                <div className="space-y-2">
                  {selectedSecretDetails.keys.map(k => {
                    const val = revealedSecretValues ? revealedSecretValues[k] : selectedSecretDetails.data[k];
                    return (
                      <div key={k} className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-300">{k}</span>
                          {revealedSecretValues && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(val || '');
                                setCopiedKey(k);
                                setTimeout(() => setCopiedKey(null), 2000);
                              }}
                              className="text-[10px] text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer"
                            >
                              {copiedKey === k ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedKey === k ? 'Copied' : 'Copy'}</span>
                            </button>
                          )}
                        </div>
                        <div className="p-2 bg-black/40 rounded border border-neutral-850 text-slate-300 font-mono text-[10.5px] break-all">
                          {val || '(empty)'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Details Modal */}
      {selectedServiceDetails && (
        <div 
          onClick={() => setSelectedServiceDetails(null)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#121216] border border-neutral-800 rounded-2xl shadow-2xl text-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
          >
            <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
              <div className="flex items-center space-x-3 truncate">
                <Network className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <div className="truncate">
                  <span className="font-bold text-sm text-slate-100 block truncate">{selectedServiceDetails.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Namespace: {selectedServiceDetails.namespace} | Type: {selectedServiceDetails.type}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedServiceDetails(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Cluster IP</span>
                  <span className="text-xs font-bold text-slate-200">{selectedServiceDetails.clusterIP}</span>
                </div>
                <div className="p-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Session Affinity</span>
                  <span className="text-xs font-bold text-indigo-400">{selectedServiceDetails.sessionAffinity}</span>
                </div>
                <div className="p-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Created</span>
                  <span className="text-[10px] text-slate-350">{new Date(selectedServiceDetails.creationTimestamp).toLocaleDateString()}</span>
                </div>
              </div>
              <div>
                <h5 className="font-bold text-slate-300 mb-2 uppercase text-[10px] tracking-wider">Live Endpoints (EndpointSlice)</h5>
                <div className="p-3 bg-neutral-900/40 border border-neutral-800 rounded-xl">
                  <div className="text-emerald-400 font-semibold">{selectedServiceDetails.endpoints?.join(', ') || 'None'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ingress Details Modal */}
      {selectedIngressDetails && (
        <div 
          onClick={() => setSelectedIngressDetails(null)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#121216] border border-neutral-800 rounded-2xl shadow-2xl text-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
          >
            <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
              <div className="flex items-center space-x-3 truncate">
                <Globe className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <div className="truncate">
                  <span className="font-bold text-sm text-slate-100 block truncate">{selectedIngressDetails.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Namespace: {selectedIngressDetails.namespace} | Class: {selectedIngressDetails.className}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedIngressDetails(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
              <h5 className="font-bold text-slate-300 uppercase text-[10px] tracking-wider">Rules & Routes</h5>
              <div className="space-y-2">
                {selectedIngressDetails.rules.map((r, i) => (
                  <div key={i} className="p-3 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-1">
                    <div className="font-bold text-slate-200">Host: {r.host}</div>
                    <div className="space-y-1 pt-1">
                      {r.paths.map((p, j) => (
                        <div key={j} className="text-[10px] text-slate-400 flex items-center space-x-2">
                          <span className="text-cyan-400 font-semibold">{p.path}</span>
                          <span>→</span>
                          <span className="text-slate-200">{p.serviceName}:{p.servicePort}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Node Details Modal */}
      {selectedNodeDetails && (
        <div 
          onClick={() => setSelectedNodeDetails(null)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#121216] border border-neutral-800 rounded-2xl shadow-2xl text-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
          >
            <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
              <div className="flex items-center space-x-3 truncate">
                <Cpu className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <div className="truncate">
                  <span className="font-bold text-sm text-slate-100 block truncate">{selectedNodeDetails.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Status: {selectedNodeDetails.status}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedNodeDetails(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">CPU Capacity</span>
                  <span className="text-xs font-bold text-slate-200">{selectedNodeDetails.capacity?.cpu || 'N/A'}</span>
                </div>
                <div className="p-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Memory Capacity</span>
                  <span className="text-xs font-bold text-slate-200">{selectedNodeDetails.capacity?.memory || 'N/A'}</span>
                </div>
                <div className="p-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Kernel Version</span>
                  <span className="text-[10px] text-slate-350 truncate block">{selectedNodeDetails.nodeInfo?.kernelVersion || 'N/A'}</span>
                </div>
                <div className="p-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Container Runtime</span>
                  <span className="text-[10px] text-slate-350 truncate block">{selectedNodeDetails.nodeInfo?.containerRuntimeVersion || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ConfigMap Details Modal */}
      {selectedConfigMap && (
        <div 
          onClick={() => setSelectedConfigMap(null)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#121216] border border-neutral-800 rounded-2xl shadow-2xl text-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
          >
            <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
              <div className="flex items-center space-x-3 truncate">
                <FileCode className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <div className="truncate">
                  <span className="font-bold text-sm text-slate-100 block truncate">{selectedConfigMap.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Namespace: {selectedConfigMap.namespace}</span>
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
              <div className="space-y-2">
                {Object.entries(selectedConfigMap.data || {}).map(([k, v]) => (
                  <div key={k} className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-300">{k}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(v || '');
                          setCopiedKey(k);
                          setTimeout(() => setCopiedKey(null), 2000);
                        }}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer"
                      >
                        {copiedKey === k ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === k ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-2 bg-black/40 rounded border border-neutral-850 text-slate-300 font-mono text-[10.5px] overflow-auto whitespace-pre-wrap">
                      {v}
                    </pre>
                  </div>
                ))}
              </div>
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
            className="w-full max-w-sm bg-[#121216] border border-neutral-800 rounded-2xl p-5 shadow-2xl text-slate-200 animate-in zoom-in-95 duration-150"
          >
            <h3 className="font-bold text-sm text-slate-100 mb-1">Scale Deployment</h3>
            <p className="text-xs text-slate-400 font-mono mb-4">Set target replica count for "{scaleModalDep.name}"</p>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Replicas</label>
                <input 
                  type="number" 
                  min={0}
                  max={50}
                  value={scaleCount}
                  onChange={(e) => setScaleCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setScaleModalDep(null)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-800 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteScale}
                  disabled={scalingLoading}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 shadow-md"
                >
                  {scalingLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Apply Scale</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scale StatefulSet Modal */}
      {scaleModalSs && (
        <div 
          onClick={() => setScaleModalSs(null)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#121216] border border-neutral-800 rounded-2xl p-5 shadow-2xl text-slate-200 animate-in zoom-in-95 duration-150"
          >
            <h3 className="font-bold text-sm text-slate-100 mb-1">Scale StatefulSet</h3>
            <p className="text-xs text-slate-400 font-mono mb-4">Set target replica count for "{scaleModalSs.name}"</p>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Replicas</label>
                <input 
                  type="number" 
                  min={0}
                  max={50}
                  value={scaleSsCount}
                  onChange={(e) => setScaleSsCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setScaleModalSs(null)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-800 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteScaleSs}
                  disabled={scalingSsLoading}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 shadow-md"
                >
                  {scalingSsLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
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
            className="w-full max-w-md bg-[#121216] border border-neutral-800 rounded-2xl p-6 shadow-2xl text-slate-200 animate-in zoom-in-95 duration-150"
          >
            <h3 className="font-bold text-sm text-slate-100 mb-1">New Kubernetes Deployment</h3>
            <p className="text-xs text-slate-400 font-mono mb-4">Deploy a workload onto the live cluster</p>
            <form onSubmit={handleCreateDeployment} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. nginx-web"
                  value={newDepForm.name}
                  onChange={(e) => setNewDepForm({ ...newDepForm, name: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Namespace</label>
                <input 
                  type="text" 
                  required
                  value={newDepForm.namespace}
                  onChange={(e) => setNewDepForm({ ...newDepForm, namespace: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Container Image</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. nginx:alpine"
                  value={newDepForm.image}
                  onChange={(e) => setNewDepForm({ ...newDepForm, image: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Replicas</label>
                  <input 
                    type="number" 
                    min={1}
                    max={20}
                    value={newDepForm.replicas}
                    onChange={(e) => setNewDepForm({ ...newDepForm, replicas: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Port (optional)</label>
                  <input 
                    type="number" 
                    placeholder="80"
                    value={newDepForm.port}
                    onChange={(e) => setNewDepForm({ ...newDepForm, port: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-850">
                <button
                  type="button"
                  onClick={() => setCreateDepOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-800 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingDep}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 shadow-md"
                >
                  {creatingDep && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Deployment</span>
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
            className="w-full max-w-md bg-[#121216] border border-neutral-800 rounded-2xl p-6 shadow-2xl text-slate-200 animate-in zoom-in-95 duration-150"
          >
            <h3 className="font-bold text-sm text-slate-100 mb-1">Create Kubernetes Service</h3>
            <p className="text-xs text-slate-400 font-mono mb-4">Expose pods with stable cluster IP networking</p>
            <form onSubmit={handleCreateService} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Service Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. web-service"
                  value={newSvcForm.name}
                  onChange={(e) => setNewSvcForm({ ...newSvcForm, name: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Namespace</label>
                  <input 
                    type="text" 
                    required
                    value={newSvcForm.namespace}
                    onChange={(e) => setNewSvcForm({ ...newSvcForm, namespace: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Service Type</label>
                  <select 
                    value={newSvcForm.type}
                    onChange={(e) => setNewSvcForm({ ...newSvcForm, type: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value="ClusterIP">ClusterIP</option>
                    <option value="NodePort">NodePort</option>
                    <option value="LoadBalancer">LoadBalancer</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Port</label>
                  <input 
                    type="number" 
                    required
                    min={1}
                    max={65535}
                    value={newSvcForm.port}
                    onChange={(e) => setNewSvcForm({ ...newSvcForm, port: parseInt(e.target.value, 10) || 80 })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Port</label>
                  <input 
                    type="number" 
                    required
                    min={1}
                    max={65535}
                    value={newSvcForm.targetPort}
                    onChange={(e) => setNewSvcForm({ ...newSvcForm, targetPort: parseInt(e.target.value, 10) || 80 })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pod Selector (app label, optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. caelum-test"
                  value={newSvcForm.selectorApp}
                  onChange={(e) => setNewSvcForm({ ...newSvcForm, selectorApp: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-neutral-850">
                <button
                  type="button"
                  onClick={() => setCreateSvcOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-800 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingSvc}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 shadow-md"
                >
                  {creatingSvc && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Service</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div 
          onClick={() => setConfirmModal(null)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#121216] border border-neutral-800 rounded-2xl p-5 shadow-2xl text-slate-200 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center space-x-2.5 mb-2">
              <AlertCircle className={`w-5 h-5 ${confirmModal.isDanger ? 'text-red-400' : 'text-amber-400'}`} />
              <h3 className="font-bold text-sm text-slate-100">{confirmModal.title}</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">{confirmModal.message}</p>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-3 py-1.5 rounded-xl border border-neutral-800 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className={`px-4 py-1.5 rounded-xl text-white text-xs font-bold transition-colors cursor-pointer shadow-md ${
                  confirmModal.isDanger ? 'bg-red-600 hover:bg-red-500' : 'bg-amber-600 hover:bg-amber-500'
                }`}
              >
                {confirmModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
