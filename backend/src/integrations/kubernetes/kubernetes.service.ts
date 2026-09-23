import { Injectable, Logger, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';
import { CreateDeploymentDto, CreateServiceDto } from './dto/create-k8s.dto';

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

  private extractErrorMessage(err: any): string {
    if (err?.body?.message) return err.body.message;
    if (typeof err?.body === 'string') {
      try {
        const parsed = JSON.parse(err.body);
        if (parsed.message) return parsed.message;
      } catch {}
      return err.body;
    }
    return err?.message || 'Unknown Kubernetes error';
  }

  async getPodDetails(namespace: string, name: string) {
    this.ensureLoaded();
    if (!this.isLoaded || !this.k8sApi) {
      throw new BadRequestException('Kubernetes cluster connection unavailable');
    }
    try {
      const pod = await this.k8sApi.readNamespacedPod({ name, namespace });
      const readyContainers = (pod.status?.containerStatuses || []).filter(c => c.ready).length;
      const totalContainers = pod.spec?.containers?.length || 0;
      const totalRestarts = (pod.status?.containerStatuses || []).reduce((acc, c) => acc + (c.restartCount || 0), 0);

      return {
        name: pod.metadata?.name || '',
        namespace: pod.metadata?.namespace || '',
        uid: pod.metadata?.uid || '',
        status: pod.status?.phase || 'Unknown',
        ready: `${readyContainers}/${totalContainers}`,
        podIP: pod.status?.podIP || 'Pending',
        hostIP: pod.status?.hostIP || 'N/A',
        nodeName: pod.spec?.nodeName || 'N/A',
        startTime: pod.status?.startTime || pod.metadata?.creationTimestamp || '',
        restartCount: totalRestarts,
        labels: pod.metadata?.labels || {},
        annotations: pod.metadata?.annotations || {},
        conditions: (pod.status?.conditions || []).map(c => ({
          type: c.type || '',
          status: c.status || '',
          reason: c.reason || '',
          message: c.message || '',
          lastTransitionTime: c.lastTransitionTime || '',
        })),
        containers: (pod.spec?.containers || []).map(c => {
          const cs = (pod.status?.containerStatuses || []).find(s => s.name === c.name);
          let state = 'Unknown';
          let stateDetails = '';
          if (cs?.state?.running) {
            state = 'Running';
            stateDetails = `Started at ${cs.state.running.startedAt || ''}`;
          } else if (cs?.state?.waiting) {
            state = 'Waiting';
            stateDetails = cs.state.waiting.reason || 'Waiting';
          } else if (cs?.state?.terminated) {
            state = 'Terminated';
            stateDetails = `Exit code ${cs.state.terminated.exitCode}: ${cs.state.terminated.reason || ''}`;
          }
          return {
            name: c.name,
            image: c.image || '',
            ready: Boolean(cs?.ready),
            restartCount: cs?.restartCount || 0,
            state,
            stateDetails,
            resources: c.resources || {},
            ports: (c.ports || []).map(p => `${p.containerPort}/${p.protocol || 'TCP'}`),
          };
        }),
      };
    } catch (err: any) {
      this.logger.error(`Failed to fetch pod ${namespace}/${name}: ${this.extractErrorMessage(err)}`);
      throw new NotFoundException(`Pod ${namespace}/${name} not found: ${this.extractErrorMessage(err)}`);
    }
  }

  async getPodLogs(namespace: string, name: string, container?: string, tailLines = 200) {
    this.ensureLoaded();
    if (!this.isLoaded || !this.k8sApi) {
      throw new BadRequestException('Kubernetes cluster connection unavailable');
    }
    try {
      const logs = await this.k8sApi.readNamespacedPodLog({
        name,
        namespace,
        container: container || undefined,
        tailLines: Number(tailLines) || 200,
      });
      return {
        logs: typeof logs === 'string' ? logs : String(logs || ''),
        container: container || 'default',
      };
    } catch (err: any) {
      const msg = this.extractErrorMessage(err);
      this.logger.warn(`Failed to fetch logs for ${namespace}/${name}: ${msg}`);
      return {
        logs: `Error retrieving logs: ${msg}`,
        container: container || 'default',
      };
    }
  }

  async deletePod(namespace: string, name: string) {
    this.ensureLoaded();
    if (!this.isLoaded || !this.k8sApi) {
      throw new BadRequestException('Kubernetes cluster connection unavailable');
    }
    try {
      await this.k8sApi.deleteNamespacedPod({ name, namespace });
      return {
        success: true,
        message: `Pod ${name} in namespace ${namespace} deleted successfully`,
      };
    } catch (err: any) {
      const msg = this.extractErrorMessage(err);
      this.logger.error(`Failed to delete pod ${namespace}/${name}: ${msg}`);
      throw new BadRequestException(`Failed to delete pod: ${msg}`);
    }
  }

  async restartPod(namespace: string, name: string) {
    this.ensureLoaded();
    if (!this.isLoaded || !this.k8sApi) {
      throw new BadRequestException('Kubernetes cluster connection unavailable');
    }
    try {
      // In Kubernetes, deleting a pod managed by a controller triggers immediate recreation
      await this.k8sApi.deleteNamespacedPod({ name, namespace });
      return {
        success: true,
        message: `Pod ${name} restart triggered (pod terminated for controller recreation)`,
      };
    } catch (err: any) {
      const msg = this.extractErrorMessage(err);
      this.logger.error(`Failed to restart pod ${namespace}/${name}: ${msg}`);
      throw new BadRequestException(`Failed to restart pod: ${msg}`);
    }
  }

  async scaleDeployment(namespace: string, name: string, replicas: number) {
    this.ensureLoaded();
    if (!this.isLoaded || !this.appsApi) {
      throw new BadRequestException('Kubernetes cluster connection unavailable');
    }
    try {
      await this.appsApi.patchNamespacedDeploymentScale({
        name,
        namespace,
        body: [{ op: 'replace', path: '/spec/replicas', value: replicas }],
      });
      return {
        success: true,
        replicas,
        message: `Deployment ${name} scaled to ${replicas} replicas`,
      };
    } catch (err: any) {
      const msg = this.extractErrorMessage(err);
      this.logger.error(`Failed to scale deployment ${namespace}/${name}: ${msg}`);
      throw new BadRequestException(`Failed to scale deployment: ${msg}`);
    }
  }

  async createDeployment(dto: CreateDeploymentDto) {
    this.ensureLoaded();
    if (!this.isLoaded || !this.appsApi) {
      throw new BadRequestException('Kubernetes cluster connection unavailable');
    }
    try {
      const body: k8s.V1Deployment = {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: {
          name: dto.name,
          namespace: dto.namespace,
          labels: { app: dto.name },
        },
        spec: {
          replicas: dto.replicas ?? 1,
          selector: {
            matchLabels: { app: dto.name },
          },
          template: {
            metadata: {
              labels: { app: dto.name },
            },
            spec: {
              containers: [
                {
                  name: dto.name,
                  image: dto.image,
                  ports: dto.port ? [{ containerPort: dto.port }] : undefined,
                },
              ],
            },
          },
        },
      };

      await this.appsApi.createNamespacedDeployment({
        namespace: dto.namespace,
        body,
      });

      return {
        success: true,
        message: `Deployment ${dto.name} created successfully in namespace ${dto.namespace}`,
      };
    } catch (err: any) {
      const msg = this.extractErrorMessage(err);
      this.logger.error(`Failed to create deployment ${dto.namespace}/${dto.name}: ${msg}`);
      throw new BadRequestException(`Failed to create deployment: ${msg}`);
    }
  }

  async deleteDeployment(namespace: string, name: string) {
    this.ensureLoaded();
    if (!this.isLoaded || !this.appsApi) {
      throw new BadRequestException('Kubernetes cluster connection unavailable');
    }
    try {
      await this.appsApi.deleteNamespacedDeployment({ name, namespace });
      return {
        success: true,
        message: `Deployment ${name} deleted successfully from namespace ${namespace}`,
      };
    } catch (err: any) {
      const msg = this.extractErrorMessage(err);
      this.logger.error(`Failed to delete deployment ${namespace}/${name}: ${msg}`);
      throw new BadRequestException(`Failed to delete deployment: ${msg}`);
    }
  }

  async listConfigMaps(namespace?: string) {
    this.ensureLoaded();
    if (!this.isLoaded || !this.k8sApi) return [];
    try {
      const isAll = !namespace || namespace === 'all';
      const res = isAll
        ? await this.k8sApi.listConfigMapForAllNamespaces()
        : await this.k8sApi.listNamespacedConfigMap({ namespace });

      return (res.items || []).map(cm => ({
        name: cm.metadata?.name || '',
        namespace: cm.metadata?.namespace || '',
        dataCount: Object.keys(cm.data || {}).length + Object.keys(cm.binaryData || {}).length,
        keys: Object.keys(cm.data || {}).concat(Object.keys(cm.binaryData || {})),
        age: cm.metadata?.creationTimestamp || '',
      }));
    } catch (err: any) {
      this.logger.warn(`Failed to list configmaps: ${err.message}`);
      return [];
    }
  }

  async getConfigMap(namespace: string, name: string) {
    this.ensureLoaded();
    if (!this.isLoaded || !this.k8sApi) {
      throw new BadRequestException('Kubernetes cluster connection unavailable');
    }
    try {
      const cm = await this.k8sApi.readNamespacedConfigMap({ name, namespace });
      return {
        name: cm.metadata?.name || '',
        namespace: cm.metadata?.namespace || '',
        labels: cm.metadata?.labels || {},
        age: cm.metadata?.creationTimestamp || '',
        data: cm.data || {},
      };
    } catch (err: any) {
      const msg = this.extractErrorMessage(err);
      this.logger.error(`Failed to fetch configmap ${namespace}/${name}: ${msg}`);
      throw new NotFoundException(`ConfigMap not found: ${msg}`);
    }
  }

  async createService(dto: CreateServiceDto) {
    this.ensureLoaded();
    if (!this.isLoaded || !this.k8sApi) {
      throw new BadRequestException('Kubernetes cluster connection unavailable');
    }
    try {
      const body: k8s.V1Service = {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
          name: dto.name,
          namespace: dto.namespace,
        },
        spec: {
          type: dto.type || 'ClusterIP',
          selector: {
            app: dto.selectorApp,
          },
          ports: [
            {
              port: dto.port,
              targetPort: (dto.targetPort || dto.port) as any,
              protocol: 'TCP',
            },
          ],
        },
      };

      await this.k8sApi.createNamespacedService({
        namespace: dto.namespace,
        body,
      });

      return {
        success: true,
        message: `Service ${dto.name} created successfully in namespace ${dto.namespace}`,
      };
    } catch (err: any) {
      const msg = this.extractErrorMessage(err);
      this.logger.error(`Failed to create service ${dto.namespace}/${dto.name}: ${msg}`);
      throw new BadRequestException(`Failed to create service: ${msg}`);
    }
  }

  async deleteService(namespace: string, name: string) {
    this.ensureLoaded();
    if (!this.isLoaded || !this.k8sApi) {
      throw new BadRequestException('Kubernetes cluster connection unavailable');
    }
    try {
      await this.k8sApi.deleteNamespacedService({ name, namespace });
      return {
        success: true,
        message: `Service ${name} deleted successfully from namespace ${namespace}`,
      };
    } catch (err: any) {
      const msg = this.extractErrorMessage(err);
      this.logger.error(`Failed to delete service ${namespace}/${name}: ${msg}`);
      throw new BadRequestException(`Failed to delete service: ${msg}`);
    }
  }
}
