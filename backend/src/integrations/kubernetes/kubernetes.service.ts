import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { CreateDeploymentDto, CreateServiceDto } from './dto/create-k8s.dto';

@Injectable()
export class KubernetesService {
  private readonly logger = new Logger(KubernetesService.name);

  /**
   * Resiliently locate the kubectl executable on Windows or Linux
   */
  private getKubectlBinary(): string {
    const candidates = [
      'C:\\Program Files\\Kubernetes\\Minikube\\kubectl.exe',
      'C:\\Users\\karth\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Kubernetes.kubectl_Microsoft.Winget.Source_8wekyb3d8bbwe\\kubectl.exe',
      'C:\\Program Files\\Docker\\Docker\\resources\\bin\\kubectl.exe',
      'kubectl.exe',
      'kubectl',
    ];
    for (const c of candidates) {
      if (c.includes('\\') && fs.existsSync(c)) {
        return c;
      }
    }
    return 'kubectl';
  }

  /**
   * Execute real kubectl command against current active context
   */
  private runKubectl(args: string[], timeoutMs = 15000): string {
    const bin = this.getKubectlBinary();
    const userHome = process.env.USERPROFILE || process.env.HOME || '';
    const kubeConfig = process.env.KUBECONFIG || path.join(userHome, '.kube', 'config');
    const env = {
      ...process.env,
      KUBECONFIG: kubeConfig,
    };

    try {
      return execFileSync(bin, args, {
        encoding: 'utf8',
        env,
        timeout: timeoutMs,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    } catch (err: any) {
      const stderr = err.stderr ? err.stderr.toString().trim() : '';
      const stdout = err.stdout ? err.stdout.toString().trim() : '';
      const msg = stderr || stdout || err.message || 'kubectl execution failed';
      throw new Error(msg);
    }
  }

  /**
   * Get cluster summary using active context and dynamic port
   */
  async getClusterSummary() {
    try {
      let context = 'unknown';
      try {
        context = this.runKubectl(['config', 'current-context'], 5000).trim();
      } catch {}

      let server = 'unknown';
      try {
        const s = this.runKubectl(['config', 'view', '--minify', '-o', 'jsonpath={.clusters[0].cluster.server}'], 5000).trim();
        if (s) server = s;
      } catch {}

      const [nodes, namespaces, pods, deployments] = await Promise.all([
        this.listNodes().catch(() => []),
        this.listNamespaces().catch(() => []),
        this.listPods('all').catch(() => []),
        this.listDeployments('all').catch(() => []),
      ]);

      const isReady = nodes.some(n => n.status === 'Ready');
      const version = nodes[0]?.version || 'v1.34.0';

      return {
        connected: nodes.length > 0 || isReady,
        context: context || 'minikube',
        server,
        version,
        status: isReady ? 'Ready' : (nodes.length > 0 ? 'Connected' : 'Offline'),
        nodeCount: nodes.length,
        podCount: pods.length,
        deploymentCount: deployments.length,
        namespaceCount: namespaces.length,
      };
    } catch (err: any) {
      this.logger.error(`Error fetching cluster summary: ${err.message}`);
      return {
        connected: false,
        status: 'unavailable',
        error: err.message || 'Kubernetes cluster unreachable. Ensure minikube is running with a valid context.',
      };
    }
  }

  /**
   * List all cluster nodes
   */
  async listNodes() {
    try {
      const out = this.runKubectl(['get', 'nodes', '-o', 'json'], 10000);
      const json = JSON.parse(out);
      return (json.items || []).map((node: any) => {
        const readyCond = node.status?.conditions?.find((c: any) => c.type === 'Ready');
        const roles = Object.keys(node.metadata?.labels || {})
          .filter((l: string) => l.startsWith('node-role.kubernetes.io/'))
          .map((l: string) => l.split('/')[1])
          .join(', ') || 'control-plane';
        const internalIP = node.status?.addresses?.find((a: any) => a.type === 'InternalIP')?.address || 'N/A';

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

  /**
   * List all namespaces
   */
  async listNamespaces(): Promise<string[]> {
    try {
      const out = this.runKubectl(['get', 'namespaces', '-o', 'json'], 10000);
      const json = JSON.parse(out);
      return (json.items || []).map((ns: any) => ns.metadata?.name).filter((name: any): name is string => Boolean(name));
    } catch (err: any) {
      this.logger.warn(`Failed to list namespaces: ${err.message}`);
      return [];
    }
  }

  /**
   * List pods (all or namespaced)
   */
  async listPods(namespace?: string) {
    try {
      const args = ['get', 'pods'];
      if (!namespace || namespace === 'all') {
        args.push('-A');
      } else {
        args.push('-n', namespace);
      }
      args.push('-o', 'json');

      const out = this.runKubectl(args, 10000);
      const json = JSON.parse(out);
      return (json.items || []).map((pod: any) => ({
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

  /**
   * Get detailed pod specifications, containers, and conditions
   */
  async getPodDetails(namespace: string, name: string) {
    try {
      const out = this.runKubectl(['get', 'pod', name, '-n', namespace, '-o', 'json'], 10000);
      const pod = JSON.parse(out);

      const containerStatuses = pod.status?.containerStatuses || [];
      const containers = (pod.spec?.containers || []).map((c: any) => {
        const cStatus = containerStatuses.find((cs: any) => cs.name === c.name);
        let state = 'Unknown';
        let startedAt = '';
        if (cStatus?.state?.running) {
          state = 'Running';
          startedAt = cStatus.state.running.startedAt;
        } else if (cStatus?.state?.waiting) {
          state = `Waiting (${cStatus.state.waiting.reason || 'Init'})`;
        } else if (cStatus?.state?.terminated) {
          state = `Terminated (${cStatus.state.terminated.reason || 'Stopped'})`;
        }

        return {
          name: c.name,
          image: c.image || 'unknown',
          ready: Boolean(cStatus?.ready),
          restartCount: cStatus?.restartCount || 0,
          state,
          startedAt,
          ports: (c.ports || []).map((p: any) => `${p.containerPort}/${p.protocol || 'TCP'}`),
          resources: c.resources || {},
        };
      });

      const conditions = (pod.status?.conditions || []).map((cond: any) => ({
        type: cond.type,
        status: cond.status,
        lastTransitionTime: cond.lastTransitionTime,
        reason: cond.reason || '',
        message: cond.message || '',
      }));

      return {
        name: pod.metadata?.name || name,
        namespace: pod.metadata?.namespace || namespace,
        uid: pod.metadata?.uid || '',
        status: pod.status?.phase || 'Unknown',
        ip: pod.status?.podIP || 'Pending',
        hostIP: pod.status?.hostIP || 'Pending',
        node: pod.spec?.nodeName || 'N/A',
        startTime: pod.status?.startTime || pod.metadata?.creationTimestamp || '',
        labels: pod.metadata?.labels || {},
        annotations: pod.metadata?.annotations || {},
        containers,
        conditions,
      };
    } catch (err: any) {
      throw new NotFoundException(`Pod "${name}" in namespace "${namespace}" could not be retrieved: ${err.message}`);
    }
  }

  /**
   * Get logs for a specific container in a pod
   */
  async getPodLogs(namespace: string, name: string, container?: string, tailLines = 100) {
    try {
      const args = ['logs', name, '-n', namespace, `--tail=${tailLines}`];
      if (container) {
        args.push('-c', container);
      }
      const logs = this.runKubectl(args, 10000);
      return {
        name,
        namespace,
        container: container || '',
        logs: logs.trim() || '(No logs emitted)',
      };
    } catch (err: any) {
      return {
        name,
        namespace,
        container: container || '',
        logs: `Error fetching logs: ${err.message}`,
      };
    }
  }

  /**
   * Delete a pod from the cluster
   */
  async deletePod(namespace: string, name: string) {
    try {
      this.runKubectl(['delete', 'pod', name, '-n', namespace, '--wait=false'], 10000);
      return {
        success: true,
        message: `Pod "${name}" deleted from namespace "${namespace}".`,
      };
    } catch (err: any) {
      throw new BadRequestException(`Failed to delete pod "${name}": ${err.message}`);
    }
  }

  /**
   * Restart a pod (delete pod so its controller recreates it with clean state)
   */
  async restartPod(namespace: string, name: string) {
    try {
      this.runKubectl(['delete', 'pod', name, '-n', namespace, '--wait=false'], 10000);
      return {
        success: true,
        message: `Pod "${name}" restart initiated. Replacement instance is being spun up.`,
      };
    } catch (err: any) {
      throw new BadRequestException(`Failed to restart pod "${name}": ${err.message}`);
    }
  }

  /**
   * List deployments
   */
  async listDeployments(namespace?: string) {
    try {
      const args = ['get', 'deployments'];
      if (!namespace || namespace === 'all') {
        args.push('-A');
      } else {
        args.push('-n', namespace);
      }
      args.push('-o', 'json');

      const out = this.runKubectl(args, 10000);
      const json = JSON.parse(out);
      return (json.items || []).map((dep: any) => ({
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

  /**
   * Create a new deployment
   */
  async createDeployment(dto: CreateDeploymentDto) {
    try {
      const args = [
        'create', 'deployment', dto.name,
        `--image=${dto.image}`,
        `--replicas=${dto.replicas || 1}`,
        '-n', dto.namespace || 'default',
      ];
      if (dto.port) {
        args.push(`--port=${dto.port}`);
      }

      this.runKubectl(args, 15000);
      return {
        success: true,
        name: dto.name,
        namespace: dto.namespace || 'default',
        message: `Deployment "${dto.name}" created successfully.`,
      };
    } catch (err: any) {
      throw new BadRequestException(`Failed to create deployment: ${err.message}`);
    }
  }

  /**
   * Scale deployment replicas
   */
  async scaleDeployment(namespace: string, name: string, replicas: number) {
    try {
      this.runKubectl(['scale', 'deployment', name, `--replicas=${replicas}`, '-n', namespace], 10000);
      return {
        success: true,
        name,
        namespace,
        replicas,
        message: `Deployment "${name}" scaled to ${replicas} replicas.`,
      };
    } catch (err: any) {
      throw new BadRequestException(`Failed to scale deployment "${name}": ${err.message}`);
    }
  }

  /**
   * Delete deployment
   */
  async deleteDeployment(namespace: string, name: string) {
    try {
      this.runKubectl(['delete', 'deployment', name, '-n', namespace], 10000);
      return {
        success: true,
        name,
        namespace,
        message: `Deployment "${name}" deleted successfully.`,
      };
    } catch (err: any) {
      throw new BadRequestException(`Failed to delete deployment "${name}": ${err.message}`);
    }
  }

  /**
   * List StatefulSets
   */
  async listStatefulSets(namespace?: string) {
    try {
      const args = ['get', 'statefulsets'];
      if (!namespace || namespace === 'all') {
        args.push('-A');
      } else {
        args.push('-n', namespace);
      }
      args.push('-o', 'json');

      const out = this.runKubectl(args, 10000);
      const json = JSON.parse(out);
      return (json.items || []).map((ss: any) => ({
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

  /**
   * List Services
   */
  async listServices(namespace?: string) {
    try {
      const args = ['get', 'services'];
      if (!namespace || namespace === 'all') {
        args.push('-A');
      } else {
        args.push('-n', namespace);
      }
      args.push('-o', 'json');

      const out = this.runKubectl(args, 10000);
      const json = JSON.parse(out);
      return (json.items || []).map((svc: any) => {
        const ports = (svc.spec?.ports || [])
          .map((p: any) => `${p.port}:${p.targetPort || p.port}/${p.protocol || 'TCP'}`)
          .join(', ');

        return {
          name: svc.metadata?.name || '',
          namespace: svc.metadata?.namespace || '',
          type: svc.spec?.type || 'ClusterIP',
          clusterIP: svc.spec?.clusterIP || 'None',
          ports: ports || 'None',
          age: svc.metadata?.creationTimestamp || '',
        };
      });
    } catch (err: any) {
      this.logger.warn(`Failed to list services: ${err.message}`);
      return [];
    }
  }

  /**
   * Create a new Service
   */
  async createService(dto: CreateServiceDto) {
    try {
      const typeStr = (dto.type || 'ClusterIP').toLowerCase();
      const targetPort = dto.targetPort || dto.port;
      const ns = dto.namespace || 'default';
      const args = [
        'create', 'service', typeStr, dto.name,
        `--tcp=${dto.port}:${targetPort}`,
        '-n', ns,
      ];

      this.runKubectl(args, 15000);

      // If selectorApp is provided, patch the service selector
      if (dto.selectorApp && dto.selectorApp.trim()) {
        try {
          const patchJson = JSON.stringify({
            spec: {
              selector: {
                app: dto.selectorApp.trim(),
              },
            },
          });
          this.runKubectl(['patch', 'service', dto.name, '-n', ns, '-p', patchJson], 10000);
        } catch (patchErr: any) {
          this.logger.warn(`Service created, but failed to patch selector: ${patchErr.message}`);
        }
      }

      return {
        success: true,
        name: dto.name,
        namespace: ns,
        message: `Service "${dto.name}" created successfully in namespace "${ns}".`,
      };
    } catch (err: any) {
      throw new BadRequestException(`Failed to create service: ${err.message}`);
    }
  }

  /**
   * Get Service details
   */
  async getServiceDetails(namespace: string, name: string) {
    try {
      const out = this.runKubectl(['get', 'service', name, '-n', namespace, '-o', 'json'], 10000);
      const svc = JSON.parse(out);
      const ports = (svc.spec?.ports || []).map((p: any) => ({
        name: p.name || '',
        port: p.port,
        protocol: p.protocol || 'TCP',
        targetPort: p.targetPort || p.port,
        nodePort: p.nodePort,
      }));

      return {
        name: svc.metadata?.name || '',
        namespace: svc.metadata?.namespace || '',
        uid: svc.metadata?.uid || '',
        creationTimestamp: svc.metadata?.creationTimestamp || '',
        type: svc.spec?.type || 'ClusterIP',
        clusterIP: svc.spec?.clusterIP || 'None',
        clusterIPs: svc.spec?.clusterIPs || [],
        externalIPs: svc.spec?.externalIPs || [],
        ports,
        selector: svc.spec?.selector || {},
        sessionAffinity: svc.spec?.sessionAffinity || 'None',
        labels: svc.metadata?.labels || {},
        annotations: svc.metadata?.annotations || {},
      };
    } catch (err: any) {
      throw new NotFoundException(`Service ${name} not found in namespace ${namespace}: ${err.message}`);
    }
  }

  /**
   * Delete Service
   */
  async deleteService(namespace: string, name: string) {
    try {
      this.runKubectl(['delete', 'service', name, '-n', namespace], 10000);
      return {
        success: true,
        name,
        namespace,
        message: `Service "${name}" deleted successfully.`,
      };
    } catch (err: any) {
      throw new BadRequestException(`Failed to delete service "${name}": ${err.message}`);
    }
  }

  /**
   * List ConfigMaps
   */
  async listConfigMaps(namespace?: string) {
    try {
      const args = ['get', 'configmaps'];
      if (!namespace || namespace === 'all') {
        args.push('-A');
      } else {
        args.push('-n', namespace);
      }
      args.push('-o', 'json');

      const out = this.runKubectl(args, 10000);
      const json = JSON.parse(out);
      return (json.items || []).map((cm: any) => ({
        name: cm.metadata?.name || '',
        namespace: cm.metadata?.namespace || '',
        data: `${Object.keys(cm.data || {}).length} keys`,
        age: cm.metadata?.creationTimestamp || '',
      }));
    } catch (err: any) {
      this.logger.warn(`Failed to list configmaps: ${err.message}`);
      return [];
    }
  }

  /**
   * Get ConfigMap details
   */
  async getConfigMap(namespace: string, name: string) {
    try {
      const out = this.runKubectl(['get', 'configmap', name, '-n', namespace, '-o', 'json'], 10000);
      const cm = JSON.parse(out);
      return {
        name,
        namespace,
        data: cm.data || {},
      };
    } catch (err: any) {
      throw new NotFoundException(`ConfigMap "${name}" in namespace "${namespace}" not found: ${err.message}`);
    }
  }

  /**
   * List Ingress
   */
  async listIngress(namespace?: string) {
    try {
      const args = ['get', 'ingress'];
      if (!namespace || namespace === 'all') {
        args.push('-A');
      } else {
        args.push('-n', namespace);
      }
      args.push('-o', 'json');

      const out = this.runKubectl(args, 10000);
      const json = JSON.parse(out);
      return (json.items || []).map((ing: any) => {
        const hosts = (ing.spec?.rules || []).map((r: any) => r.host).filter(Boolean).join(', ') || '*';
        const addrs = (ing.status?.loadBalancer?.ingress || []).map((i: any) => i.ip || i.hostname).filter(Boolean).join(', ') || '-';
        return {
          name: ing.metadata?.name || '',
          namespace: ing.metadata?.namespace || '',
          hosts,
          address: addrs,
          age: ing.metadata?.creationTimestamp || '',
        };
      });
    } catch (err: any) {
      this.logger.warn(`Failed to list ingress: ${err.message}`);
      return [];
    }
  }

  /**
   * List Events
   */
  async listEvents(namespace?: string) {
    try {
      const args = ['get', 'events'];
      if (!namespace || namespace === 'all') {
        args.push('-A');
      } else {
        args.push('-n', namespace);
      }
      args.push('--sort-by=.metadata.creationTimestamp', '-o', 'json');

      const out = this.runKubectl(args, 10000);
      const json = JSON.parse(out);
      return (json.items || []).map((ev: any) => ({
        name: ev.metadata?.name || '',
        namespace: ev.metadata?.namespace || '',
        type: ev.type || 'Normal',
        reason: ev.reason || '',
        message: ev.message || '',
        count: ev.count || 1,
        lastTimestamp: ev.lastTimestamp || ev.metadata?.creationTimestamp || '',
      }));
    } catch (err: any) {
      this.logger.warn(`Failed to list events: ${err.message}`);
      return [];
    }
  }
}
