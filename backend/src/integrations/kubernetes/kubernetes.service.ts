import { Injectable, Logger } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';

@Injectable()
export class KubernetesService {
  private readonly logger = new Logger(KubernetesService.name);
  private kc: k8s.KubeConfig | null = null;
  private k8sApi: k8s.CoreV1Api | null = null;
  private appsApi: k8s.AppsV1Api | null = null;
  private versionApi: k8s.VersionApi | null = null;
  private netApi: k8s.NetworkingV1Api | null = null;
  private isLoaded = false;

  constructor() {
    this.initKubeConfig();
  }

  private initKubeConfig(): boolean {
    try {
      this.kc = new k8s.KubeConfig();
      this.kc.loadFromDefault();
      this.k8sApi = this.kc.makeApiClient(k8s.CoreV1Api);
      this.appsApi = this.kc.makeApiClient(k8s.AppsV1Api);
      this.versionApi = this.kc.makeApiClient(k8s.VersionApi);
      this.netApi = this.kc.makeApiClient(k8s.NetworkingV1Api);
      this.isLoaded = true;
      this.logger.log(`Kubernetes context loaded: ${this.kc.getCurrentContext()}`);
      return true;
    } catch (e: any) {
      this.isLoaded = false;
      this.kc = null;
      this.k8sApi = null;
      this.appsApi = null;
      this.versionApi = null;
      this.netApi = null;
      this.logger.warn(`Kubernetes Kubeconfig not loaded: ${e.message}`);
      return false;
    }
  }

  private ensureLoaded(): boolean {
    if (!this.isLoaded || !this.kc) {
      return this.initKubeConfig();
    }
    return true;
  }

  async getClusterSummary() {
    this.ensureLoaded();
    if (!this.isLoaded || !this.kc || !this.k8sApi || !this.versionApi) {
      return {
        connected: false,
        error: 'Kubernetes configuration not found. Ensure minikube or local cluster is configured.',
      };
    }

    try {
      const context = this.kc.getCurrentContext() || 'unknown';
      const currentCluster = this.kc.getCurrentCluster();
      const server = currentCluster?.server || 'unknown';

      let version = 'unknown';
      try {
        const v = await this.versionApi.getCode();
        version = v.gitVersion || `${v.major}.${v.minor}`;
      } catch (err: any) {
        this.logger.warn(`Could not fetch cluster server version: ${err.message}`);
      }

      const [nodes, namespaces, pods, deployments] = await Promise.all([
        this.listNodes(),
        this.listNamespaces(),
        this.listPods('all'),
        this.listDeployments('all'),
      ]);

      const isReady = nodes.some(n => n.status === 'Ready');

      return {
        connected: true,
        context,
        server,
        version,
        status: isReady ? 'Ready' : 'Connected',
        nodeCount: nodes.length,
        podCount: pods.length,
        deploymentCount: deployments.length,
        namespaceCount: namespaces.length,
      };
    } catch (err: any) {
      this.logger.error(`Error fetching cluster summary: ${err.message}`);
      return {
        connected: false,
        error: err.message || 'Failed to connect to Kubernetes cluster',
      };
    }
  }

  async listNodes() {
    this.ensureLoaded();
    if (!this.isLoaded || !this.k8sApi) return [];
    try {
      const res = await this.k8sApi.listNode();
      return (res.items || []).map(node => {
        const readyCond = node.status?.conditions?.find(c => c.type === 'Ready');
        const roles = Object.keys(node.metadata?.labels || {})
          .filter(l => l.startsWith('node-role.kubernetes.io/'))
          .map(l => l.split('/')[1])
          .join(', ') || 'worker';
        const internalIP = node.status?.addresses?.find(a => a.type === 'InternalIP')?.address || 'N/A';

        return {
          name: node.metadata?.name || 'unknown',
          status: readyCond?.status === 'True' ? 'Ready' : 'NotReady',
          roles,
          version: node.status?.nodeInfo?.kubeletVersion || 'unknown',
          os: node.status?.nodeInfo?.osImage || 'Linux',
          internalIP,
          age: node.metadata?.creationTimestamp || '',
        };
      });
    } catch (err: any) {
      this.logger.warn(`Failed to list nodes: ${err.message}`);
      return [];
    }
  }

  async listNamespaces(): Promise<string[]> {
    this.ensureLoaded();
    if (!this.isLoaded || !this.k8sApi) return [];
    try {
      const res = await this.k8sApi.listNamespace();
      return (res.items || []).map(ns => ns.metadata?.name).filter((name): name is string => Boolean(name));
    } catch (err: any) {
      this.logger.warn(`Failed to list namespaces: ${err.message}`);
      return [];
    }
  }

  async listPods(namespace?: string) {
    this.ensureLoaded();
    if (!this.isLoaded || !this.k8sApi) return [];
    try {
      const isAll = !namespace || namespace === 'all';
      const res = isAll
        ? await this.k8sApi.listPodForAllNamespaces()
        : await this.k8sApi.listNamespacedPod({ namespace });

      return (res.items || []).map(pod => ({
        name: pod.metadata?.name || '',
        namespace: pod.metadata?.namespace || '',
        status: pod.status?.phase || 'Unknown',
        ip: pod.status?.podIP || 'Pending',
        node: pod.spec?.nodeName || 'N/A',
        age: pod.metadata?.creationTimestamp || '',
      }));
    } catch (err: any) {
      this.logger.warn(`Failed to list pods: ${err.message}`);
      return [];
    }
  }

  async listDeployments(namespace?: string) {
    this.ensureLoaded();
    if (!this.isLoaded || !this.appsApi) return [];
    try {
      const isAll = !namespace || namespace === 'all';
      const res = isAll
        ? await this.appsApi.listDeploymentForAllNamespaces()
        : await this.appsApi.listNamespacedDeployment({ namespace });

      return (res.items || []).map(dep => ({
        name: dep.metadata?.name || '',
        namespace: dep.metadata?.namespace || '',
        replicas: `${dep.status?.readyReplicas || 0}/${dep.status?.replicas || 0}`,
        available: dep.status?.availableReplicas || 0,
        age: dep.metadata?.creationTimestamp || '',
      }));
    } catch (err: any) {
      this.logger.warn(`Failed to list deployments: ${err.message}`);
      return [];
    }
  }

  async listStatefulSets(namespace?: string) {
    this.ensureLoaded();
    if (!this.isLoaded || !this.appsApi) return [];
    try {
      const isAll = !namespace || namespace === 'all';
      const res = isAll
        ? await this.appsApi.listStatefulSetForAllNamespaces()
        : await this.appsApi.listNamespacedStatefulSet({ namespace });

      return (res.items || []).map(ss => ({
        name: ss.metadata?.name || '',
        namespace: ss.metadata?.namespace || '',
        replicas: `${ss.status?.readyReplicas || 0}/${ss.status?.replicas || 0}`,
        age: ss.metadata?.creationTimestamp || '',
      }));
    } catch (err: any) {
      this.logger.warn(`Failed to list statefulsets: ${err.message}`);
      return [];
    }
  }

  async listServices(namespace?: string) {
    this.ensureLoaded();
    if (!this.isLoaded || !this.k8sApi) return [];
    try {
      const isAll = !namespace || namespace === 'all';
      const res = isAll
        ? await this.k8sApi.listServiceForAllNamespaces()
        : await this.k8sApi.listNamespacedService({ namespace });

      return (res.items || []).map(svc => ({
        name: svc.metadata?.name || '',
        namespace: svc.metadata?.namespace || '',
        type: svc.spec?.type || 'ClusterIP',
        clusterIP: svc.spec?.clusterIP || 'None',
        ports: (svc.spec?.ports || []).map(p => `${p.port}/${p.protocol}`).join(', ') || 'N/A',
        age: svc.metadata?.creationTimestamp || '',
      }));
    } catch (err: any) {
      this.logger.warn(`Failed to list services: ${err.message}`);
      return [];
    }
  }

  async listIngress(namespace?: string) {
    this.ensureLoaded();
    if (!this.isLoaded || !this.netApi) return [];
    try {
      const isAll = !namespace || namespace === 'all';
      const res = isAll
        ? await this.netApi.listIngressForAllNamespaces()
        : await this.netApi.listNamespacedIngress({ namespace });

      return (res.items || []).map(ing => {
        const rules = (ing.spec?.rules || []).map(r => {
          const host = r.host || '*';
          const paths = (r.http?.paths || []).map(p => p.backend?.service?.name || '').filter(Boolean).join(', ');
          return `${host} -> ${paths}`;
        }).join('; ') || 'No rules configured';

        return {
          name: ing.metadata?.name || '',
          namespace: ing.metadata?.namespace || '',
          rules,
          age: ing.metadata?.creationTimestamp || '',
        };
      });
    } catch (err: any) {
      this.logger.warn(`Failed to list ingress: ${err.message}`);
      return [];
    }
  }

  async listEvents(namespace?: string) {
    this.ensureLoaded();
    if (!this.isLoaded || !this.k8sApi) return [];
    try {
      const isAll = !namespace || namespace === 'all';
      const res = isAll
        ? await this.k8sApi.listEventForAllNamespaces()
        : await this.k8sApi.listNamespacedEvent({ namespace });

      const sorted = (res.items || []).sort((a, b) => {
        const tA = new Date(a.lastTimestamp || a.metadata?.creationTimestamp || 0).getTime();
        const tB = new Date(b.lastTimestamp || b.metadata?.creationTimestamp || 0).getTime();
        return tB - tA;
      });

      return sorted.map(ev => ({
        timestamp: ev.lastTimestamp || ev.metadata?.creationTimestamp || '',
        type: ev.type || 'Normal',
        reason: ev.reason || 'Event',
        message: ev.message || '',
        object: ev.involvedObject ? `${ev.involvedObject.kind || ''}/${ev.involvedObject.name || ''}` : '',
        namespace: ev.metadata?.namespace || '',
      }));
    } catch (err: any) {
      this.logger.warn(`Failed to list events: ${err.message}`);
      return [];
    }
  }
}
