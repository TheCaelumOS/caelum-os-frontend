import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as net from 'net';
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
   * Helper to map live EndpointSlices to Services using discovery.k8s.io/v1 EndpointSlice
   */
  private getEndpointSlicesMap(namespace?: string): Map<string, Array<{ addresses: string[]; ports: number[] }>> {
    const map = new Map<string, Array<{ addresses: string[]; ports: number[] }>>();
    try {
      const args = ['get', 'endpointslice'];
      if (!namespace || namespace === 'all') {
        args.push('-A');
      } else {
        args.push('-n', namespace);
      }
      args.push('-o', 'json');
      const out = this.runKubectl(args, 10000);
      const json = JSON.parse(out);
      for (const slice of json.items || []) {
        const svcName = slice.metadata?.labels?.['kubernetes.io/service-name'];
        const sliceNs = slice.metadata?.namespace || 'default';
        if (!svcName) continue;
        const key = `${sliceNs}/${svcName}`;
        const addresses: string[] = [];
        for (const ep of slice.endpoints || []) {
          if (ep.addresses && Array.isArray(ep.addresses)) {
            addresses.push(...ep.addresses);
          }
        }
        const ports = (slice.ports || []).map((p: any) => p.port).filter((p: any) => typeof p === 'number');
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key)!.push({ addresses, ports });
      }
    } catch (err: any) {
      this.logger.warn(`Failed to fetch EndpointSlices: ${err.message}`);
    }
    return map;
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
        const s = this.runKubectl(['config', 'view', '--minify', '-o', 'jsonpath={.clusters[0].cluster.server}'], 3000).trim();
        if (s) server = s;
      } catch {}

      // Ultra-fast TCP socket probe: if minikube / API server is down, fail in <50ms instead of 30s
      if (server && server.startsWith('http')) {
        try {
          const u = new URL(server);
          const isReachable = await new Promise<boolean>((resolve) => {
            const socket = net.createConnection({ host: u.hostname, port: parseInt(u.port, 10) || 443, timeout: 800 });
            socket.on('connect', () => { socket.destroy(); resolve(true); });
            socket.on('error', () => { socket.destroy(); resolve(false); });
            socket.on('timeout', () => { socket.destroy(); resolve(false); });
          });
          if (!isReachable) {
            return {
              connected: false,
              context: context || 'minikube',
              server,
              status: 'unavailable',
              error: 'Kubernetes cluster is not running or unreachable.',
              nodeCount: 0,
              podCount: 0,
              deploymentCount: 0,
              statefulSetCount: 0,
              serviceCount: 0,
              namespaceCount: 0,
            };
          }
        } catch {}
      }

      const [nodes, namespaces, pods, deployments, statefulsets, services] = await Promise.all([
        this.listNodes().catch(() => []),
        this.listNamespaces().catch(() => []),
        this.listPods('all').catch(() => []),
        this.listDeployments('all').catch(() => []),
        this.listStatefulSets('all').catch(() => []),
        this.listServices('all').catch(() => []),
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
        statefulSetCount: statefulsets.length,
        serviceCount: services.length,
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
   * List all cluster nodes with real capacity and specs
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
          creationTimestamp: node.metadata?.creationTimestamp || '',
          kernelVersion: node.status?.nodeInfo?.kernelVersion || 'unknown',
          containerRuntime: node.status?.nodeInfo?.containerRuntimeVersion || 'unknown',
          cpuCapacity: node.status?.capacity?.cpu || 'N/A',
          memoryCapacity: node.status?.capacity?.memory || 'N/A',
          cpuAllocatable: node.status?.allocatable?.cpu || 'N/A',
          memoryAllocatable: node.status?.allocatable?.memory || 'N/A',
        };
      });
    } catch (err: any) {
      this.logger.warn(`Failed to list nodes: ${err.message}`);
      return [];
    }
  }

  /**
   * Get detailed node specifications, conditions, addresses, and allocatable resources
   */
  async getNodeDetails(name: string) {
    try {
      const out = this.runKubectl(['get', 'node', name, '-o', 'json'], 10000);
      const node = JSON.parse(out);
      const readyCond = node.status?.conditions?.find((c: any) => c.type === 'Ready');
      const conditions = (node.status?.conditions || []).map((c: any) => ({
        type: c.type,
        status: c.status,
        reason: c.reason || '',
        message: c.message || '',
        lastTransitionTime: c.lastTransitionTime,
      }));

      return {
        name: node.metadata?.name || name,
        uid: node.metadata?.uid || '',
        creationTimestamp: node.metadata?.creationTimestamp || '',
        status: readyCond?.status === 'True' ? 'Ready' : 'NotReady',
        addresses: node.status?.addresses || [],
        nodeInfo: node.status?.nodeInfo || {},
        capacity: node.status?.capacity || {},
        allocatable: node.status?.allocatable || {},
        conditions,
        labels: node.metadata?.labels || {},
        annotations: node.metadata?.annotations || {},
      };
    } catch (err: any) {
      throw new NotFoundException(`Node "${name}" not found: ${err.message}`);
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
   * List pods (all or namespaced) with ready state, restarts count, and container information
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
      return (json.items || []).map((pod: any) => {
        const containerStatuses = pod.status?.containerStatuses || [];
        const totalContainers = pod.spec?.containers?.length || containerStatuses.length || 1;
        const readyContainers = containerStatuses.filter((c: any) => c.ready).length;
        const restarts = containerStatuses.reduce((acc: number, c: any) => acc + (c.restartCount || 0), 0);
        const containerNames = (pod.spec?.containers || []).map((c: any) => c.name);

        return {
          name: pod.metadata?.name || '',
          namespace: pod.metadata?.namespace || '',
          status: pod.status?.phase || 'Unknown',
          ready: `${readyContainers}/${totalContainers}`,
          restarts,
          containers: containerNames,
          ip: pod.status?.podIP || 'Pending',
          node: pod.spec?.nodeName || 'N/A',
          age: pod.metadata?.creationTimestamp || '',
          creationTimestamp: pod.metadata?.creationTimestamp || '',
          labels: pod.metadata?.labels || {},
        };
      });
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
        creationTimestamp: pod.metadata?.creationTimestamp || '',
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
   * List deployments with replica details and status
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
      return (json.items || []).map((dep: any) => {
        const desired = dep.spec?.replicas ?? 1;
        const ready = dep.status?.readyReplicas || 0;
        const available = dep.status?.availableReplicas || 0;
        const updated = dep.status?.updatedReplicas || 0;
        const images = (dep.spec?.template?.spec?.containers || []).map((c: any) => c.image).filter(Boolean);
        const status = ready === desired ? 'Active' : (ready > 0 ? 'Progressing' : 'Updating');

        return {
          name: dep.metadata?.name || '',
          namespace: dep.metadata?.namespace || '',
          desired,
          ready,
          available,
          updated,
          replicas: `${ready}/${desired}`,
          status,
          images,
          age: dep.metadata?.creationTimestamp || '',
          creationTimestamp: dep.metadata?.creationTimestamp || '',
        };
      });
    } catch (err: any) {
      this.logger.warn(`Failed to list deployments: ${err.message}`);
      return [];
    }
  }

  /**
   * Get deployment detailed specification, strategy, selector, and conditions
   */
  async getDeploymentDetails(namespace: string, name: string) {
    try {
      const out = this.runKubectl(['get', 'deployment', name, '-n', namespace, '-o', 'json'], 10000);
      const dep = JSON.parse(out);
      const desired = dep.spec?.replicas ?? 1;
      const ready = dep.status?.readyReplicas || 0;
      const available = dep.status?.availableReplicas || 0;
      const updated = dep.status?.updatedReplicas || 0;
      const containers = (dep.spec?.template?.spec?.containers || []).map((c: any) => ({
        name: c.name,
        image: c.image || 'unknown',
        ports: (c.ports || []).map((p: any) => `${p.containerPort}/${p.protocol || 'TCP'}`),
        envCount: (c.env || []).length,
      }));
      const conditions = (dep.status?.conditions || []).map((c: any) => ({
        type: c.type,
        status: c.status,
        reason: c.reason || '',
        message: c.message || '',
        lastUpdateTime: c.lastUpdateTime,
      }));

      return {
        name: dep.metadata?.name || name,
        namespace: dep.metadata?.namespace || namespace,
        uid: dep.metadata?.uid || '',
        creationTimestamp: dep.metadata?.creationTimestamp || '',
        desired,
        ready,
        available,
        updated,
        strategy: dep.spec?.strategy?.type || 'RollingUpdate',
        selector: dep.spec?.selector?.matchLabels || {},
        labels: dep.metadata?.labels || {},
        annotations: dep.metadata?.annotations || {},
        containers,
        conditions,
      };
    } catch (err: any) {
      throw new NotFoundException(`Deployment "${name}" in namespace "${namespace}" not found: ${err.message}`);
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
   * List StatefulSets with desired, ready, current, and updated replica counts
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
      return (json.items || []).map((ss: any) => {
        const desired = ss.spec?.replicas ?? 1;
        const ready = ss.status?.readyReplicas || 0;
        const current = ss.status?.currentReplicas || 0;
        const updated = ss.status?.updatedReplicas || 0;
        const status = ready === desired ? 'Ready' : (ready > 0 ? 'Progressing' : 'Updating');
        const images = (ss.spec?.template?.spec?.containers || []).map((c: any) => c.image).filter(Boolean);

        return {
          name: ss.metadata?.name || '',
          namespace: ss.metadata?.namespace || '',
          desired,
          ready,
          current,
          updated,
          replicas: `${ready}/${desired}`,
          serviceName: ss.spec?.serviceName || '',
          status,
          images,
          age: ss.metadata?.creationTimestamp || '',
          creationTimestamp: ss.metadata?.creationTimestamp || '',
        };
      });
    } catch (err: any) {
      this.logger.warn(`Failed to list statefulsets: ${err.message}`);
      return [];
    }
  }

  /**
   * Get StatefulSet detailed specification
   */
  async getStatefulSetDetails(namespace: string, name: string) {
    try {
      const out = this.runKubectl(['get', 'statefulset', name, '-n', namespace, '-o', 'json'], 10000);
      const ss = JSON.parse(out);
      const desired = ss.spec?.replicas ?? 1;
      const ready = ss.status?.readyReplicas || 0;
      const current = ss.status?.currentReplicas || 0;
      const updated = ss.status?.updatedReplicas || 0;
      const containers = (ss.spec?.template?.spec?.containers || []).map((c: any) => ({
        name: c.name,
        image: c.image || 'unknown',
        ports: (c.ports || []).map((p: any) => `${p.containerPort}/${p.protocol || 'TCP'}`),
      }));

      return {
        name: ss.metadata?.name || name,
        namespace: ss.metadata?.namespace || namespace,
        uid: ss.metadata?.uid || '',
        creationTimestamp: ss.metadata?.creationTimestamp || '',
        desired,
        ready,
        current,
        updated,
        serviceName: ss.spec?.serviceName || '',
        selector: ss.spec?.selector?.matchLabels || {},
        labels: ss.metadata?.labels || {},
        annotations: ss.metadata?.annotations || {},
        containers,
      };
    } catch (err: any) {
      throw new NotFoundException(`StatefulSet "${name}" in namespace "${namespace}" not found: ${err.message}`);
    }
  }

  /**
   * Scale StatefulSet replica count
   */
  async scaleStatefulSet(namespace: string, name: string, replicas: number) {
    try {
      this.runKubectl(['scale', 'statefulset', name, `--replicas=${replicas}`, '-n', namespace], 10000);
      return {
        success: true,
        name,
        namespace,
        replicas,
        message: `StatefulSet "${name}" scaled to ${replicas} replicas.`,
      };
    } catch (err: any) {
      throw new BadRequestException(`Failed to scale statefulset "${name}": ${err.message}`);
    }
  }

  /**
   * Delete StatefulSet
   */
  async deleteStatefulSet(namespace: string, name: string) {
    try {
      this.runKubectl(['delete', 'statefulset', name, '-n', namespace], 10000);
      return {
        success: true,
        name,
        namespace,
        message: `StatefulSet "${name}" deleted successfully.`,
      };
    } catch (err: any) {
      throw new BadRequestException(`Failed to delete statefulset "${name}": ${err.message}`);
    }
  }

  /**
   * List Services with EndpointSlice real networking endpoints
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
      const epMap = this.getEndpointSlicesMap(namespace);

      return (json.items || []).map((svc: any) => {
        const ns = svc.metadata?.namespace || '';
        const name = svc.metadata?.name || '';
        const ports = (svc.spec?.ports || [])
          .map((p: any) => `${p.port}:${p.targetPort || p.port}/${p.protocol || 'TCP'}`)
          .join(', ');

        const key = `${ns}/${name}`;
        const slices = epMap.get(key) || [];
        const endpointStrings: string[] = [];
        for (const s of slices) {
          for (const addr of s.addresses) {
            for (const port of s.ports) {
              endpointStrings.push(`${addr}:${port}`);
            }
          }
        }
        const endpoints = endpointStrings.length > 0 ? endpointStrings.join(', ') : 'None';

        return {
          name,
          namespace: ns,
          type: svc.spec?.type || 'ClusterIP',
          clusterIP: svc.spec?.clusterIP || 'None',
          ports: ports || 'None',
          endpoints,
          age: svc.metadata?.creationTimestamp || '',
          creationTimestamp: svc.metadata?.creationTimestamp || '',
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
   * Get Service details and EndpointSlice live endpoints
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

      const epMap = this.getEndpointSlicesMap(namespace);
      const key = `${namespace}/${name}`;
      const slices = epMap.get(key) || [];
      const endpointStrings: string[] = [];
      for (const s of slices) {
        for (const addr of s.addresses) {
          for (const port of s.ports) {
            endpointStrings.push(`${addr}:${port}`);
          }
        }
      }

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
        endpoints: endpointStrings.length > 0 ? endpointStrings : ['None'],
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
      return (json.items || []).map((cm: any) => {
        const dataObj = cm.data || {};
        const binaryObj = cm.binaryData || {};
        const keys = [...Object.keys(dataObj), ...Object.keys(binaryObj)];
        return {
          name: cm.metadata?.name || '',
          namespace: cm.metadata?.namespace || '',
          dataCount: keys.length,
          keys,
          data: `${keys.length} keys`,
          dataEntries: dataObj,
          creationTimestamp: cm.metadata?.creationTimestamp || '',
          age: cm.metadata?.creationTimestamp || '',
          labels: cm.metadata?.labels || {},
          annotations: cm.metadata?.annotations || {},
        };
      });
    } catch (err: any) {
      this.logger.warn(`Failed to list configmaps: ${err.message}`);
      throw new BadRequestException(`Failed to list configmaps: ${err.message}`);
    }
  }

  /**
   * Get ConfigMap details
   */
  async getConfigMap(namespace: string, name: string) {
    try {
      const out = this.runKubectl(['get', 'configmap', name, '-n', namespace, '-o', 'json'], 10000);
      const cm = JSON.parse(out);
      const dataObj = cm.data || {};
      const binaryObj = cm.binaryData || {};
      const keys = [...Object.keys(dataObj), ...Object.keys(binaryObj)];
      return {
        name: cm.metadata?.name || name,
        namespace: cm.metadata?.namespace || namespace,
        uid: cm.metadata?.uid || '',
        creationTimestamp: cm.metadata?.creationTimestamp || '',
        age: cm.metadata?.creationTimestamp || '',
        labels: cm.metadata?.labels || {},
        annotations: cm.metadata?.annotations || {},
        dataCount: keys.length,
        keys,
        data: dataObj,
        binaryData: Object.keys(binaryObj),
      };
    } catch (err: any) {
      throw new NotFoundException(`ConfigMap "${name}" in namespace "${namespace}" not found: ${err.message}`);
    }
  }

  /**
   * List Secrets (metadata and key counts only - values are NEVER exposed in list)
   */
  async listSecrets(namespace?: string) {
    try {
      const args = ['get', 'secrets'];
      if (!namespace || namespace === 'all') {
        args.push('-A');
      } else {
        args.push('-n', namespace);
      }
      args.push('-o', 'json');

      const out = this.runKubectl(args, 10000);
      const json = JSON.parse(out);
      return (json.items || []).map((secret: any) => {
        const dataObj = secret.data || {};
        const keys = Object.keys(dataObj);
        return {
          name: secret.metadata?.name || '',
          namespace: secret.metadata?.namespace || '',
          type: secret.type || 'Opaque',
          keysCount: keys.length,
          keys,
          age: secret.metadata?.creationTimestamp || '',
          creationTimestamp: secret.metadata?.creationTimestamp || '',
          labels: secret.metadata?.labels || {},
          annotations: secret.metadata?.annotations || {},
        };
      });
    } catch (err: any) {
      this.logger.warn(`Failed to list secrets: ${err.message}`);
      return [];
    }
  }

  /**
   * Get Secret details (masked by default)
   */
  async getSecretDetails(namespace: string, name: string) {
    try {
      const out = this.runKubectl(['get', 'secret', name, '-n', namespace, '-o', 'json'], 10000);
      const secret = JSON.parse(out);
      const dataObj = secret.data || {};
      const keys = Object.keys(dataObj);
      const maskedData: Record<string, string> = {};
      for (const k of keys) {
        maskedData[k] = '•••••••• (Encrypted Base64)';
      }

      return {
        name: secret.metadata?.name || name,
        namespace: secret.metadata?.namespace || namespace,
        uid: secret.metadata?.uid || '',
        creationTimestamp: secret.metadata?.creationTimestamp || '',
        type: secret.type || 'Opaque',
        keysCount: keys.length,
        keys,
        data: maskedData,
        isMasked: true,
        labels: secret.metadata?.labels || {},
        annotations: secret.metadata?.annotations || {},
      };
    } catch (err: any) {
      throw new NotFoundException(`Secret "${name}" in namespace "${namespace}" not found: ${err.message}`);
    }
  }

  /**
   * Explicit on-demand reveal of secret values (never logs values to console)
   */
  async revealSecret(namespace: string, name: string) {
    try {
      const out = this.runKubectl(['get', 'secret', name, '-n', namespace, '-o', 'json'], 10000);
      const secret = JSON.parse(out);
      const dataObj = secret.data || {};
      const decodedData: Record<string, string> = {};
      for (const [key, b64val] of Object.entries(dataObj)) {
        if (typeof b64val === 'string') {
          decodedData[key] = Buffer.from(b64val, 'base64').toString('utf8');
        }
      }

      return {
        name: secret.metadata?.name || name,
        namespace: secret.metadata?.namespace || namespace,
        keys: Object.keys(decodedData),
        decodedData,
        revealed: true,
      };
    } catch (err: any) {
      throw new BadRequestException(`Failed to reveal secret "${name}": ${err.message}`);
    }
  }

  /**
   * Delete a Secret with confirmation
   */
  async deleteSecret(namespace: string, name: string) {
    try {
      this.runKubectl(['delete', 'secret', name, '-n', namespace], 10000);
      return {
        success: true,
        name,
        namespace,
        message: `Secret "${name}" deleted successfully.`,
      };
    } catch (err: any) {
      throw new BadRequestException(`Failed to delete secret "${name}": ${err.message}`);
    }
  }

  /**
   * List Ingress resources with rules and backend targets
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
        const ingressClassName = ing.spec?.ingressClassName || ing.metadata?.annotations?.['kubernetes.io/ingress.class'] || 'default';
        const rules = ing.spec?.rules || [];
        const hosts = rules.map((r: any) => r.host).filter(Boolean).join(', ') || '*';
        const pathsList: Array<{ host: string; path: string; backend: string }> = [];
        for (const r of rules) {
          for (const p of r.http?.paths || []) {
            const svcName = p.backend?.service?.name || 'unknown';
            const svcPort = p.backend?.service?.port?.number || p.backend?.service?.port?.name || '80';
            pathsList.push({
              host: r.host || '*',
              path: p.path || '/',
              backend: `${svcName}:${svcPort}`,
            });
          }
        }
        const addrs = (ing.status?.loadBalancer?.ingress || []).map((i: any) => i.ip || i.hostname).filter(Boolean).join(', ') || '-';
        return {
          name: ing.metadata?.name || '',
          namespace: ing.metadata?.namespace || '',
          className: ingressClassName,
          hosts,
          paths: pathsList,
          address: addrs,
          age: ing.metadata?.creationTimestamp || '',
          creationTimestamp: ing.metadata?.creationTimestamp || '',
        };
      });
    } catch (err: any) {
      this.logger.warn(`Failed to list ingress: ${err.message}`);
      return [];
    }
  }

  /**
   * Get Ingress details with rules, paths, TLS, and annotations
   */
  async getIngressDetails(namespace: string, name: string) {
    try {
      const out = this.runKubectl(['get', 'ingress', name, '-n', namespace, '-o', 'json'], 10000);
      const ing = JSON.parse(out);
      const ingressClassName = ing.spec?.ingressClassName || ing.metadata?.annotations?.['kubernetes.io/ingress.class'] || 'default';
      const rules = (ing.spec?.rules || []).map((r: any) => ({
        host: r.host || '*',
        paths: (r.http?.paths || []).map((p: any) => ({
          path: p.path || '/',
          pathType: p.pathType || 'Prefix',
          serviceName: p.backend?.service?.name || '',
          servicePort: p.backend?.service?.port?.number || p.backend?.service?.port?.name || '',
        })),
      }));
      const tls = (ing.spec?.tls || []).map((t: any) => ({
        hosts: t.hosts || [],
        secretName: t.secretName || '',
      }));
      const loadBalancer = (ing.status?.loadBalancer?.ingress || []).map((i: any) => i.ip || i.hostname).filter(Boolean);

      return {
        name: ing.metadata?.name || name,
        namespace: ing.metadata?.namespace || namespace,
        uid: ing.metadata?.uid || '',
        creationTimestamp: ing.metadata?.creationTimestamp || '',
        className: ingressClassName,
        rules,
        tls,
        loadBalancer,
        labels: ing.metadata?.labels || {},
        annotations: ing.metadata?.annotations || {},
      };
    } catch (err: any) {
      throw new NotFoundException(`Ingress "${name}" in namespace "${namespace}" not found: ${err.message}`);
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
