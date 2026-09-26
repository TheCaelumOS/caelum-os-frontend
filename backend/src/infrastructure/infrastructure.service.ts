import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DockerService } from '../integrations/docker/docker.service';
import { KubernetesService } from '../integrations/kubernetes/kubernetes.service';
import { GithubService } from '../integrations/github/github.service';
import { GrafanaService } from '../integrations/grafana/grafana.service';
import { AwsService } from '../integrations/aws/aws.service';
import { AzureService } from '../integrations/azure/azure.service';
import { MonitoringService } from '../monitoring/monitoring.service';
import {
  InfrastructureOverview,
  InfrastructureResource,
  InfrastructureTopology,
  InfrastructureRelationship,
  InfrastructureIssue,
  ResourceDiagnostics,
  InfrastructureTimelineEvent,
  ProviderConnectionStatus,
  ResourceHealthStatus,
} from './dto/infrastructure.dto';

@Injectable()
export class InfrastructureService {
  private readonly logger = new Logger(InfrastructureService.name);
  private resourceCache = new Map<string, { timestamp: number; data: InfrastructureResource[] }>();
  private azureResourceCache: { timestamp: number; resources: InfrastructureResource[] } | null = null;
  private awsResourceCache: { timestamp: number; resources: InfrastructureResource[] } | null = null;

  constructor(
    private readonly dockerService: DockerService,
    private readonly kubernetesService: KubernetesService,
    private readonly githubService: GithubService,
    private readonly grafanaService: GrafanaService,
    private readonly awsService: AwsService,
    private readonly azureService: AzureService,
    private readonly monitoringService: MonitoringService,
  ) {}

  /**
   * Health and connectivity check for all providers
   */
  async getOverview(userId: string, forceRefresh = false): Promise<InfrastructureOverview> {
    const timestamp = new Date().toISOString();

    const [
      hostSys,
      cpuStats,
      memStats,
      dockerHealth,
      k8sSummary,
      githubStatus,
      grafanaStatus,
      awsHealth,
      azureHealth,
    ] = await Promise.allSettled([
      this.monitoringService.getSystemInfo(),
      this.monitoringService.getCpuStats(),
      this.monitoringService.getMemoryStats(),
      this.dockerService.getHealth().catch(err => ({ connected: false, error: err.message })),
      this.kubernetesService.getClusterSummary().catch(err => ({ connected: false, error: err.message })),
      this.githubService.getStatus(userId).catch(err => ({ connected: false, configured: false, error: err.message })),
      this.grafanaService.getStatus(userId).catch(err => ({ connected: false, status: 'disconnected', error: err.message })),
      this.awsService.getHealth(userId).catch(err => ({ connected: false, error: err.message })),
      this.azureService.getHealth(userId).catch(err => ({ connected: false, error: err.message })),
    ]);

    const sysVal = hostSys.status === 'fulfilled' ? hostSys.value : { hostname: 'CaelumOS-Host', platform: 'linux', arch: 'x64' };
    const cpuVal = cpuStats.status === 'fulfilled' ? cpuStats.value : { cores: 4, load: 0 };
    const memVal = memStats.status === 'fulfilled' ? memStats.value : { total: 0, used: 0, percentage: 0 };

    // Discover all resources to get honest counts (reusing already fetched provider health probes)
    const resources = await this.discoverAllResources(userId, forceRefresh, {
      docker: dockerHealth.status === 'fulfilled' ? dockerHealth.value : null,
      k8s: k8sSummary.status === 'fulfilled' ? k8sSummary.value : null,
      github: githubStatus.status === 'fulfilled' ? githubStatus.value : null,
      grafana: grafanaStatus.status === 'fulfilled' ? grafanaStatus.value : null,
      aws: awsHealth.status === 'fulfilled' ? awsHealth.value : null,
      azure: azureHealth.status === 'fulfilled' ? azureHealth.value : null,
    });
    const issues = await this.getIssues(userId, resources);

    let healthyCount = 0;
    let warningCount = 0;
    let errorCount = 0;
    let stoppedCount = 0;

    for (const r of resources) {
      if (r.status === 'healthy' || r.status === 'running') healthyCount++;
      else if (r.status === 'warning') warningCount++;
      else if (r.status === 'error') errorCount++;
      else if (r.status === 'stopped') stoppedCount++;
    }

    // Docker status
    const dockerVal: any = dockerHealth.status === 'fulfilled' ? dockerHealth.value : { connected: false };
    const dockerResCount = resources.filter(r => r.provider === 'docker').length;
    const dockerStatus: ProviderConnectionStatus = {
      provider: 'docker',
      name: 'Docker Engine',
      connected: Boolean(dockerVal.connected),
      status: dockerVal.connected ? 'connected' : 'disconnected',
      version: dockerVal.version,
      context: dockerVal.context,
      error: dockerVal.error,
      resourceCount: dockerResCount,
      lastChecked: timestamp,
    };

    // Kubernetes status
    const k8sVal: any = k8sSummary.status === 'fulfilled' ? k8sSummary.value : { connected: false };
    const k8sResCount = resources.filter(r => r.provider === 'kubernetes').length;
    const k8sStatus: ProviderConnectionStatus = {
      provider: 'kubernetes',
      name: 'Kubernetes Cluster',
      connected: Boolean(k8sVal.connected),
      status: k8sVal.connected ? 'connected' : 'disconnected',
      version: k8sVal.version,
      context: k8sVal.context,
      error: k8sVal.error,
      resourceCount: k8sResCount,
      lastChecked: timestamp,
    };

    // GitHub status
    const ghVal: any = githubStatus.status === 'fulfilled' ? githubStatus.value : { connected: false };
    const ghResCount = resources.filter(r => r.provider === 'github').length;
    const ghStatus: ProviderConnectionStatus = {
      provider: 'github',
      name: 'GitHub',
      connected: Boolean(ghVal.connected),
      status: ghVal.connected ? 'connected' : (ghVal.configured ? 'disconnected' : 'unconfigured'),
      version: ghVal.username ? `@${ghVal.username}` : undefined,
      error: ghVal.configError || ghVal.error,
      resourceCount: ghResCount,
      lastChecked: timestamp,
    };

    // Grafana status
    const grafanaVal: any = grafanaStatus.status === 'fulfilled' ? grafanaStatus.value : { status: 'disconnected' };
    const grafanaResCount = resources.filter(r => r.provider === 'grafana').length;
    const isGrafanaConnected = grafanaVal.status === 'connected' || Boolean(grafanaVal.connected);
    const grafanaConnStatus: ProviderConnectionStatus = {
      provider: 'grafana',
      name: 'Grafana Observability',
      connected: isGrafanaConnected,
      status: isGrafanaConnected ? 'connected' : 'disconnected',
      version: grafanaVal.version,
      error: grafanaVal.error,
      resourceCount: grafanaResCount,
      lastChecked: timestamp,
    };

    // AWS status
    const awsVal: any = awsHealth.status === 'fulfilled' ? awsHealth.value : { connected: false };
    const awsResCount = resources.filter(r => r.provider === 'aws').length;
    const awsStatus: ProviderConnectionStatus = {
      provider: 'aws',
      name: 'Amazon Web Services',
      connected: Boolean(awsVal.connected),
      status: awsVal.connected ? 'connected' : 'disconnected',
      version: awsVal.region,
      error: awsVal.error,
      resourceCount: awsResCount,
      lastChecked: timestamp,
    };

    // Azure status
    const azureVal: any = azureHealth.status === 'fulfilled' ? azureHealth.value : { connected: false };
    const azureResCount = resources.filter(r => r.provider === 'azure').length;
    const azureStatus: ProviderConnectionStatus = {
      provider: 'azure',
      name: 'Microsoft Azure',
      connected: Boolean(azureVal.connected),
      status: azureVal.connected ? 'connected' : 'disconnected',
      version: azureVal.subscriptionName,
      error: azureVal.error,
      resourceCount: azureResCount,
      lastChecked: timestamp,
    };

    // Host status
    const hostStatus: ProviderConnectionStatus = {
      provider: 'host',
      name: 'CaelumOS Host',
      connected: true,
      status: 'connected',
      version: `${sysVal.platform} (${sysVal.arch})`,
      context: sysVal.hostname,
      resourceCount: 1,
      lastChecked: timestamp,
    };

    return {
      providers: [hostStatus, dockerStatus, k8sStatus, ghStatus, grafanaConnStatus, awsStatus, azureStatus],
      totalResources: resources.length,
      healthyCount,
      warningCount,
      errorCount,
      stoppedCount,
      activeIssuesCount: issues.length,
      lastDiscovery: timestamp,
      hostSystem: {
        hostname: sysVal.hostname,
        platform: sysVal.platform,
        arch: sysVal.arch,
        cpuCores: cpuVal.cores || 1,
        memoryTotal: memVal.total || 0,
        memoryUsed: memVal.used || 0,
        cpuLoad: Math.round(cpuVal.load || 0),
      },
    };
  }

  /**
   * Discover and normalize all real resources from all connected systems
   */
  async discoverAllResources(userId: string, forceRefresh = false, preloadedHealth?: any): Promise<InfrastructureResource[]> {
    if (forceRefresh) {
      this.resourceCache.delete(userId);
    } else {
      const cached = this.resourceCache.get(userId);
      if (cached && Date.now() - cached.timestamp < 2500) {
        return cached.data;
      }
    }

    const timestamp = new Date().toISOString();
    const resources: InfrastructureResource[] = [];

    // 1. Host Machine Resource
    try {
      const [sysInfo, cpuStats, memStats] = await Promise.all([
        this.monitoringService.getSystemInfo().catch(() => null),
        this.monitoringService.getCpuStats().catch(() => null),
        this.monitoringService.getMemoryStats().catch(() => null),
      ]);

      const hostname = sysInfo?.hostname || 'CaelumOS-Host';
      resources.push({
        id: 'host:machine',
        provider: 'host',
        type: 'host_machine',
        name: hostname,
        displayName: `Host (${hostname})`,
        status: 'healthy',
        rawStatus: 'Online',
        sourceApp: 'task_manager',
        sourceId: 'host',
        metadata: {
          platform: sysInfo?.platform,
          distro: sysInfo?.distro,
          arch: sysInfo?.arch,
          cpuModel: cpuStats?.brand,
          cores: cpuStats?.cores,
          totalMemoryGB: memStats?.total ? +(memStats.total / (1024 ** 3)).toFixed(2) : undefined,
        },
        metrics: {
          cpu: cpuStats?.load ? Math.round(cpuStats.load) : undefined,
          memory: memStats?.percentage ? Math.round(memStats.percentage) : undefined,
          memoryBytes: memStats?.used,
        },
        lastUpdated: timestamp,
      });
    } catch (err: any) {
      this.logger.warn(`Failed to collect host resource: ${err.message}`);
    }

    // 2. Docker Resources
    try {
      const dockerHealth = preloadedHealth?.docker ?? await this.dockerService.getHealth().catch(() => ({ connected: false }));
      if (dockerHealth.connected) {
        // Register Docker Engine Core resource
        resources.push({
          id: 'docker:engine',
          provider: 'docker',
          type: 'docker_engine',
          name: 'Docker Engine',
          displayName: `Docker Engine (${dockerHealth.version || '29.8.0'})`,
          status: 'healthy',
          rawStatus: dockerHealth.status || 'Running',
          parentId: 'host:machine',
          sourceApp: 'docker',
          sourceId: 'docker-engine',
          metadata: {
            version: dockerHealth.version,
            context: dockerHealth.context,
            engine: dockerHealth.engine,
          },
          lastUpdated: timestamp,
        });

        const [containers, images, volumes, networks, statsMap] = await Promise.all([
          this.dockerService.listContainers().catch(() => []),
          this.dockerService.listImages().catch(() => []),
          this.dockerService.listVolumes().catch(() => []),
          this.dockerService.listNetworks().catch(() => []),
          this.dockerService.getContainerStats().catch(() => ({})),
        ]);

        for (const c of containers) {
          const isUp = c.state === 'running' || (c.status && c.status.toLowerCase().startsWith('up'));
          const isExited = c.state === 'exited' || (c.status && c.status.toLowerCase().startsWith('exited'));
          const isPaused = c.state === 'paused';

          let status: ResourceHealthStatus = 'stopped';
          if (isUp) status = 'running';
          else if (isPaused) status = 'warning';
          else if (isExited && c.status && c.status.includes('Exited (0)')) status = 'stopped';
          else if (isExited) status = 'error';

          const shortId = c.id.substring(0, 12);
          const cStats = statsMap[shortId] || statsMap[c.name] || {};

          resources.push({
            id: `docker:container:${c.id}`,
            provider: 'docker',
            type: 'docker_container',
            name: c.name || c.id,
            displayName: c.name || `Container ${shortId}`,
            status,
            rawStatus: c.status || c.state,
            parentId: 'docker:engine',
            sourceApp: 'docker',
            sourceId: c.id,
            metadata: {
              containerId: c.id,
              image: c.image,
              ports: c.ports,
              created: c.created,
              state: c.state,
              memUsage: cStats.memUsage,
              netIO: cStats.netIO,
            },
            metrics: {
              cpu: cStats.cpuPerc !== undefined ? Math.round(cStats.cpuPerc) : undefined,
              memory: cStats.memPerc !== undefined ? Math.round(cStats.memPerc) : undefined,
            },
            lastUpdated: timestamp,
          });
        }

        for (const img of images) {
          const repoTag = img.repository ? `${img.repository}:${img.tag || 'latest'}` : img.id;
          resources.push({
            id: `docker:image:${img.id || img.repository}`,
            provider: 'docker',
            type: 'docker_image',
            name: repoTag,
            displayName: repoTag,
            status: 'healthy',
            rawStatus: 'Available',
            sourceApp: 'docker',
            sourceId: img.id,
            metadata: {
              imageId: img.id,
              repository: img.repository,
              tag: img.tag,
              size: img.size,
              created: img.created,
            },
            lastUpdated: timestamp,
          });
        }

        for (const vol of volumes) {
          resources.push({
            id: `docker:volume:${vol.name}`,
            provider: 'docker',
            type: 'docker_volume',
            name: vol.name,
            displayName: `Volume ${vol.name.substring(0, 16)}`,
            status: 'healthy',
            rawStatus: vol.driver || 'local',
            sourceApp: 'docker',
            sourceId: vol.name,
            metadata: {
              driver: vol.driver,
              scope: vol.scope,
            },
            lastUpdated: timestamp,
          });
        }

        for (const net of networks) {
          resources.push({
            id: `docker:network:${net.id || net.name}`,
            provider: 'docker',
            type: 'docker_network',
            name: net.name,
            displayName: `Network: ${net.name}`,
            status: 'healthy',
            rawStatus: net.driver || 'active',
            sourceApp: 'docker',
            sourceId: net.id,
            metadata: {
              networkId: net.id,
              driver: net.driver,
              scope: net.scope,
            },
            lastUpdated: timestamp,
          });
        }
      }
    } catch (err: any) {
      this.logger.warn(`Failed to collect docker resources: ${err.message}`);
    }

    // 3. Kubernetes Resources
    try {
      const k8sSummary = preloadedHealth?.k8s ?? await this.kubernetesService.getClusterSummary().catch(() => ({ connected: false }));
      if (k8sSummary.connected) {
        const [nodes, namespaces, pods, deployments, services] = await Promise.all([
          this.kubernetesService.listNodes().catch(() => []),
          this.kubernetesService.listNamespaces().catch(() => []),
          this.kubernetesService.listPods('all').catch(() => []),
          this.kubernetesService.listDeployments('all').catch(() => []),
          this.kubernetesService.listServices('all').catch(() => []),
        ]);

        for (const node of nodes) {
          resources.push({
            id: `k8s:node:${node.name}`,
            provider: 'kubernetes',
            type: 'k8s_node',
            name: node.name,
            displayName: `Node: ${node.name}`,
            status: node.status === 'Ready' ? 'healthy' : 'error',
            rawStatus: node.status,
            sourceApp: 'kubernetes',
            sourceId: node.name,
            metadata: {
              roles: node.roles,
              version: node.version,
              os: node.os,
              internalIP: node.internalIP,
              cpuCapacity: node.cpuCapacity,
              memoryCapacity: node.memoryCapacity,
              containerRuntime: node.containerRuntime,
            },
            lastUpdated: timestamp,
          });
        }

        for (const ns of namespaces) {
          resources.push({
            id: `k8s:namespace:${ns.name}`,
            provider: 'kubernetes',
            type: 'k8s_namespace',
            name: ns.name,
            displayName: `Namespace: ${ns.name}`,
            status: ns.status === 'Active' ? 'healthy' : 'warning',
            rawStatus: ns.status,
            sourceApp: 'kubernetes',
            sourceId: ns.name,
            metadata: {
              creationTimestamp: ns.creationTimestamp,
              age: ns.age,
            },
            lastUpdated: timestamp,
          });
        }

        for (const dep of deployments) {
          const isHealthy = dep.readyReplicas === dep.replicas && dep.replicas > 0;
          resources.push({
            id: `k8s:deployment:${dep.namespace}/${dep.name}`,
            provider: 'kubernetes',
            type: 'k8s_deployment',
            name: dep.name,
            displayName: `Deployment: ${dep.name}`,
            namespace: dep.namespace,
            parentId: `k8s:namespace:${dep.namespace}`,
            status: isHealthy ? 'healthy' : (dep.readyReplicas === 0 ? 'error' : 'warning'),
            rawStatus: `${dep.readyReplicas || 0}/${dep.replicas || 0} Ready`,
            sourceApp: 'kubernetes',
            sourceId: dep.name,
            metadata: {
              namespace: dep.namespace,
              replicas: dep.replicas,
              readyReplicas: dep.readyReplicas,
              updatedReplicas: dep.updatedReplicas,
              availableReplicas: dep.availableReplicas,
              images: dep.images || [],
            },
            lastUpdated: timestamp,
          });
        }

        for (const pod of pods) {
          let status: ResourceHealthStatus = 'unknown';
          const pStatus = (pod.status || '').toLowerCase();
          if (pStatus === 'running' || pStatus === 'completed') {
            status = (pod.restartCount || 0) > 5 ? 'warning' : 'running';
          } else if (pStatus === 'pending') {
            status = 'pending';
          } else if (pStatus.includes('crashloop') || pStatus.includes('error') || pStatus.includes('oom') || pStatus.includes('failed')) {
            status = 'error';
          } else if (pStatus.includes('imagepull') || pStatus.includes('errimagepull')) {
            status = 'warning';
          }

          resources.push({
            id: `k8s:pod:${pod.namespace}/${pod.name}`,
            provider: 'kubernetes',
            type: 'k8s_pod',
            name: pod.name,
            displayName: `Pod: ${pod.name}`,
            namespace: pod.namespace,
            parentId: pod.node ? `k8s:node:${pod.node}` : `k8s:namespace:${pod.namespace}`,
            status,
            rawStatus: pod.status,
            sourceApp: 'kubernetes',
            sourceId: pod.name,
            metadata: {
              namespace: pod.namespace,
              node: pod.node,
              ip: pod.ip,
              ready: pod.ready,
              restartCount: pod.restartCount,
              age: pod.age,
              containers: pod.containers || [],
            },
            lastUpdated: timestamp,
          });
        }

        for (const svc of services) {
          resources.push({
            id: `k8s:service:${svc.namespace}/${svc.name}`,
            provider: 'kubernetes',
            type: 'k8s_service',
            name: svc.name,
            displayName: `Service: ${svc.name}`,
            namespace: svc.namespace,
            parentId: `k8s:namespace:${svc.namespace}`,
            status: 'healthy',
            rawStatus: svc.type,
            sourceApp: 'kubernetes',
            sourceId: svc.name,
            metadata: {
              namespace: svc.namespace,
              type: svc.type,
              clusterIP: svc.clusterIP,
              externalIP: svc.externalIP,
              ports: svc.ports || [],
              endpoints: svc.endpoints || [],
              selector: svc.selector || {},
            },
            lastUpdated: timestamp,
          });
        }
      }
    } catch (err: any) {
      this.logger.warn(`Failed to collect kubernetes resources: ${err.message}`);
    }

    // 4. GitHub Resources
    try {
      const ghStatus = preloadedHealth?.github ?? await this.githubService.getStatus(userId).catch(() => ({ connected: false }));
      if (ghStatus.connected) {
        const repos = await this.githubService.getRepositories(userId, { per_page: 25 }).catch(() => []);
        for (const repo of repos) {
          resources.push({
            id: `github:repo:${repo.fullName || repo.name}`,
            provider: 'github',
            type: 'github_repo',
            name: repo.name,
            displayName: repo.fullName || repo.name,
            status: 'healthy',
            rawStatus: repo.private ? 'Private' : 'Public',
            sourceApp: 'github',
            sourceId: repo.fullName || repo.name,
            metadata: {
              owner: repo.owner?.login || '',
              fullName: repo.fullName,
              defaultBranch: repo.defaultBranch,
              stars: repo.stargazersCount,
              forks: repo.forksCount,
              openIssues: repo.openIssuesCount,
              language: repo.language,
              htmlUrl: repo.htmlUrl,
              updatedAt: repo.updatedAt,
            },
            lastUpdated: timestamp,
          });
        }
      }
    } catch (err: any) {
      this.logger.warn(`Failed to collect github resources: ${err.message}`);
    }

    // 5. Grafana Resources
    try {
      const grafanaStatus: any = preloadedHealth?.grafana ?? await this.grafanaService.getStatus(userId).catch(() => ({ status: 'disconnected' }));
      if (grafanaStatus.status === 'connected' || grafanaStatus.connected) {
        const overview = await this.grafanaService.getOverview(userId).catch(() => null);
        if (overview) {
          resources.push({
            id: 'grafana:instance:main',
            provider: 'grafana',
            type: 'grafana_instance',
            name: 'Grafana Workspace',
            displayName: 'Grafana Observability',
            status: overview.alerts?.firingCount > 0 ? 'warning' : 'healthy',
            rawStatus: `${overview.alerts?.firingCount || 0} Alerts Firing`,
            sourceApp: 'grafana',
            sourceId: 'main',
            metadata: {
              firingAlerts: overview.alerts?.firingCount || 0,
              pendingAlerts: overview.alerts?.pendingCount || 0,
              dataSources: overview.dataSources?.types || [],
            },
            lastUpdated: timestamp,
          });
        }
      }
    } catch (err: any) {
      this.logger.warn(`Failed to collect grafana resources: ${err.message}`);
    }

    // 6. AWS Resources
    try {
      const awsHealth: any = preloadedHealth?.aws ?? await this.awsService.getHealth(userId).catch(() => ({ connected: false }));
      if (awsHealth.connected) {
        const [vpcs, ec2s, buckets, rdsDatabases, lambdas] = await Promise.all([
          this.awsService.listVpcs(userId).catch(() => []),
          this.awsService.listEc2Instances(userId).catch(() => []),
          this.awsService.listS3Buckets(userId).catch(() => []),
          this.awsService.listRdsDatabases(userId).catch(() => []),
          this.awsService.listLambdaFunctions(userId).catch(() => []),
        ]);

        for (const vpc of vpcs) {
          resources.push({
            id: `aws:vpc:${vpc.VpcId || vpc.id}`,
            provider: 'aws',
            type: 'aws_vpc',
            name: vpc.VpcId || vpc.id,
            displayName: `VPC: ${vpc.VpcId || vpc.id}`,
            region: awsHealth.region,
            status: 'healthy',
            rawStatus: vpc.State || 'available',
            sourceApp: 'aws',
            sourceId: vpc.VpcId || vpc.id,
            metadata: {
              cidrBlock: vpc.CidrBlock,
              isDefault: vpc.IsDefault,
            },
            lastUpdated: timestamp,
          });
        }

        for (const ec2 of ec2s) {
          const state = (ec2.State?.Name || ec2.state || '').toLowerCase();
          let status: ResourceHealthStatus = 'stopped';
          if (state === 'running') status = 'running';
          else if (state === 'pending') status = 'pending';
          else if (state === 'terminated') status = 'stopped';

          resources.push({
            id: `aws:ec2:${ec2.InstanceId || ec2.id}`,
            provider: 'aws',
            type: 'aws_ec2',
            name: ec2.InstanceId || ec2.id,
            displayName: `EC2: ${ec2.InstanceId || ec2.id}`,
            region: awsHealth.region,
            parentId: ec2.VpcId ? `aws:vpc:${ec2.VpcId}` : undefined,
            status,
            rawStatus: ec2.State?.Name || ec2.state || 'unknown',
            sourceApp: 'aws',
            sourceId: ec2.InstanceId || ec2.id,
            metadata: {
              instanceType: ec2.InstanceType,
              publicIp: ec2.PublicIpAddress,
              privateIp: ec2.PrivateIpAddress,
              vpcId: ec2.VpcId,
            },
            lastUpdated: timestamp,
          });
        }

        for (const s3 of buckets) {
          resources.push({
            id: `aws:s3:${s3.Name || s3.name}`,
            provider: 'aws',
            type: 'aws_s3',
            name: s3.Name || s3.name,
            displayName: `S3: ${s3.Name || s3.name}`,
            status: 'healthy',
            rawStatus: 'Active',
            sourceApp: 'aws',
            sourceId: s3.Name || s3.name,
            metadata: {
              creationDate: s3.CreationDate,
            },
            lastUpdated: timestamp,
          });
        }

        for (const rds of rdsDatabases) {
          resources.push({
            id: `aws:rds:${rds.DBInstanceIdentifier || rds.id}`,
            provider: 'aws',
            type: 'aws_rds',
            name: rds.DBInstanceIdentifier || rds.id,
            displayName: `RDS: ${rds.DBInstanceIdentifier || rds.id}`,
            region: awsHealth.region,
            status: (rds.DBInstanceStatus || '').toLowerCase() === 'available' ? 'healthy' : 'warning',
            rawStatus: rds.DBInstanceStatus || 'unknown',
            sourceApp: 'aws',
            sourceId: rds.DBInstanceIdentifier || rds.id,
            metadata: {
              engine: rds.Engine,
              instanceClass: rds.DBInstanceClass,
              endpoint: rds.Endpoint?.Address,
            },
            lastUpdated: timestamp,
          });
        }

        for (const fn of lambdas) {
          resources.push({
            id: `aws:lambda:${fn.FunctionName || fn.name}`,
            provider: 'aws',
            type: 'aws_lambda',
            name: fn.FunctionName || fn.name,
            displayName: `Lambda: ${fn.FunctionName || fn.name}`,
            region: awsHealth.region,
            status: 'healthy',
            rawStatus: 'Active',
            sourceApp: 'aws',
            sourceId: fn.FunctionName || fn.name,
            metadata: {
              runtime: fn.Runtime,
              handler: fn.Handler,
              memorySize: fn.MemorySize,
              lastModified: fn.LastModified,
            },
            lastUpdated: timestamp,
          });
        }
      }
    } catch (err: any) {
      this.logger.warn(`Failed to collect AWS resources: ${err.message}`);
    }

    // 7. Azure Resources
    try {
      const azureHealth = preloadedHealth?.azure ?? await this.azureService.getHealth(userId).catch(() => ({ connected: false }));
      if (azureHealth.connected) {
        const [rgs, vms, storageAccounts, appServices] = await Promise.all([
          this.azureService.listResourceGroups(userId).catch(() => []),
          this.azureService.listVirtualMachines(userId).catch(() => []),
          this.azureService.listStorageAccounts(userId).catch(() => []),
          this.azureService.listAppServices(userId).catch(() => []),
        ]);

        for (const rg of rgs) {
          resources.push({
            id: `azure:rg:${rg.name}`,
            provider: 'azure',
            type: 'azure_rg',
            name: rg.name,
            displayName: `RG: ${rg.name}`,
            region: rg.location,
            status: 'healthy',
            rawStatus: rg.properties?.provisioningState || 'Succeeded',
            sourceApp: 'azure',
            sourceId: rg.name,
            metadata: {
              location: rg.location,
            },
            lastUpdated: timestamp,
          });
        }

        for (const vm of vms) {
          resources.push({
            id: `azure:vm:${vm.id || vm.name}`,
            provider: 'azure',
            type: 'azure_vm',
            name: vm.name,
            displayName: `Azure VM: ${vm.name}`,
            region: vm.location,
            parentId: vm.resourceGroup ? `azure:rg:${vm.resourceGroup}` : undefined,
            status: 'running',
            rawStatus: 'Running',
            sourceApp: 'azure',
            sourceId: vm.id || vm.name,
            metadata: {
              vmSize: vm.hardwareProfile?.vmSize,
              osType: vm.storageProfile?.osDisk?.osType,
              resourceGroup: vm.resourceGroup,
            },
            lastUpdated: timestamp,
          });
        }

        for (const sa of storageAccounts) {
          resources.push({
            id: `azure:storage:${sa.name}`,
            provider: 'azure',
            type: 'azure_storage',
            name: sa.name,
            displayName: `Storage: ${sa.name}`,
            region: sa.location,
            parentId: sa.resourceGroup ? `azure:rg:${sa.resourceGroup}` : undefined,
            status: 'healthy',
            rawStatus: sa.status || 'Available',
            sourceApp: 'azure',
            sourceId: sa.name,
            metadata: {
              sku: sa.sku?.name,
              kind: sa.kind,
            },
            lastUpdated: timestamp,
          });
        }

        for (const app of appServices) {
          resources.push({
            id: `azure:app:${app.name}`,
            provider: 'azure',
            type: 'azure_app',
            name: app.name,
            displayName: `App: ${app.name}`,
            region: app.location,
            parentId: app.resourceGroup ? `azure:rg:${app.resourceGroup}` : undefined,
            status: app.state === 'Running' ? 'running' : 'stopped',
            rawStatus: app.state || 'Running',
            sourceApp: 'azure',
            sourceId: app.name,
            metadata: {
              defaultHostName: app.defaultHostName,
              resourceGroup: app.resourceGroup,
            },
            lastUpdated: timestamp,
          });
        }
      }
    } catch (err: any) {
      this.logger.warn(`Failed to collect Azure resources: ${err.message}`);
    }

    this.resourceCache.set(userId, { timestamp: Date.now(), data: resources });
    return resources;
  }

  /**
   * Compute real graph topology edges between discovered resources
   */
  async getTopology(userId: string, forceRefresh = false): Promise<InfrastructureTopology> {
    const nodes = await this.discoverAllResources(userId, forceRefresh);
    const edges: InfrastructureRelationship[] = [];
    const nodeMap = new Map<string, InfrastructureResource>();

    for (const n of nodes) {
      nodeMap.set(n.id, n);
    }

    // Edge generator helper
    const addEdge = (source: string, target: string, type: any, label: string) => {
      if (source === target) return;
      if (!nodeMap.has(source) || !nodeMap.has(target)) return;
      const edgeId = `${source}->${type}->${target}`;
      if (!edges.some(e => e.id === edgeId)) {
        edges.push({ id: edgeId, source, target, type, label });
      }
    };

    // 1. Docker Engine -> Containers -> Networks / Volumes / Images
    const hostNode = nodes.find(n => n.id === 'host:machine');
    const dockerEngineNode = nodes.find(n => n.id === 'docker:engine');
    const containers = nodes.filter(n => n.type === 'docker_container');
    const dockerImages = nodes.filter(n => n.type === 'docker_image');
    const dockerNetworks = nodes.filter(n => n.type === 'docker_network');
    const dockerVolumes = nodes.filter(n => n.type === 'docker_volume');

    if (dockerEngineNode && hostNode) {
      addEdge(dockerEngineNode.id, hostNode.id, 'HOSTED_ON', 'hosted on host machine');
    }

    for (const c of containers) {
      if (dockerEngineNode) {
        addEdge(c.id, dockerEngineNode.id, 'HOSTED_ON', 'managed by Docker Engine');
      } else if (hostNode) {
        addEdge(c.id, hostNode.id, 'HOSTED_ON', 'hosted on host machine');
      }

      // Check if container uses a local Docker image
      const cImgName = c.metadata?.image || '';
      for (const img of dockerImages) {
        if (
          img.name === cImgName ||
          cImgName.startsWith(img.metadata?.repository || '') ||
          (img.metadata?.imageId && cImgName.includes(img.metadata.imageId.substring(0, 12)))
        ) {
          addEdge(c.id, img.id, 'DEPLOYED_FROM', 'deployed from image');
          break;
        }
      }

      // Connect container -> network
      for (const net of dockerNetworks) {
        if (net.name === 'bridge') {
          addEdge(c.id, net.id, 'ROUTES_TO', `routed via ${net.name}`);
        }
      }

      // Connect container -> volume
      for (const vol of dockerVolumes) {
        if (c.name.includes(vol.name)) {
          addEdge(c.id, vol.id, 'DEPENDS_ON', `mounts volume ${vol.name}`);
        }
      }
    }

    // 2. Kubernetes Nodes, Namespaces, Deployments, Pods, Services
    const k8sNodes = nodes.filter(n => n.type === 'k8s_node');
    const k8sNamespaces = nodes.filter(n => n.type === 'k8s_namespace');
    const k8sDeployments = nodes.filter(n => n.type === 'k8s_deployment');
    const k8sPods = nodes.filter(n => n.type === 'k8s_pod');
    const k8sServices = nodes.filter(n => n.type === 'k8s_service');

    for (const pod of k8sPods) {
      // Pod -> Node (HOSTED_ON)
      const podNodeName = pod.metadata?.node;
      if (podNodeName) {
        const matchingNode = k8sNodes.find(n => n.name === podNodeName);
        if (matchingNode) {
          addEdge(pod.id, matchingNode.id, 'HOSTED_ON', 'runs on node');
        }
      }

      // Pod -> Namespace (BELONGS_TO)
      if (pod.namespace) {
        const nsNode = k8sNamespaces.find(n => n.name === pod.namespace);
        if (nsNode) {
          addEdge(pod.id, nsNode.id, 'BELONGS_TO', 'belongs to namespace');
        }
      }

      // Pod -> Deployment (BELONGS_TO)
      for (const dep of k8sDeployments) {
        if (dep.namespace === pod.namespace && pod.name.startsWith(dep.name)) {
          addEdge(pod.id, dep.id, 'BELONGS_TO', 'managed by deployment');
          break;
        }
      }

      // Pod container images -> Docker image or GitHub repo
      const podContainers: any[] = pod.metadata?.containers || [];
      for (const pc of podContainers) {
        const img = pc.image || '';
        for (const dImg of dockerImages) {
          if (dImg.name === img || (dImg.metadata?.repository && img.includes(dImg.metadata.repository))) {
            addEdge(pod.id, dImg.id, 'DEPLOYED_FROM', 'uses container image');
          }
        }
      }
    }

    // Deployment -> Namespace
    for (const dep of k8sDeployments) {
      if (dep.namespace) {
        const nsNode = k8sNamespaces.find(n => n.name === dep.namespace);
        if (nsNode) {
          addEdge(dep.id, nsNode.id, 'BELONGS_TO', 'in namespace');
        }
      }
    }

    // Service -> Pods (ROUTES_TO)
    for (const svc of k8sServices) {
      if (svc.namespace) {
        const nsNode = k8sNamespaces.find(n => n.name === svc.namespace);
        if (nsNode) {
          addEdge(svc.id, nsNode.id, 'BELONGS_TO', 'in namespace');
        }
      }

      // Route by selector or endpoint IP
      const selector = svc.metadata?.selector || {};
      const endpointAddresses: string[] = (svc.metadata?.endpoints || []).flatMap((ep: any) => ep.addresses || []);

      for (const pod of k8sPods) {
        if (pod.namespace !== svc.namespace) continue;
        const podIp = pod.metadata?.ip;
        if (podIp && endpointAddresses.includes(podIp)) {
          addEdge(svc.id, pod.id, 'ROUTES_TO', 'routes traffic to pod');
        } else if (Object.keys(selector).length > 0 && pod.name.startsWith(svc.name)) {
          addEdge(svc.id, pod.id, 'ROUTES_TO', 'routes to matching pod');
        }
      }
    }

    // 3. GitHub Repositories -> Deployments / Pods (DEPLOYED_FROM)
    const githubRepos = nodes.filter(n => n.type === 'github_repo');
    for (const repo of githubRepos) {
      const repoCleanName = repo.name.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Match against deployments
      for (const dep of k8sDeployments) {
        const depClean = dep.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (depClean.includes(repoCleanName) || repoCleanName.includes(depClean)) {
          addEdge(dep.id, repo.id, 'DEPLOYED_FROM', 'codebase repository');
        }
      }

      // Match against docker containers
      for (const c of containers) {
        const cClean = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cClean.includes(repoCleanName) || repoCleanName.includes(cClean)) {
          addEdge(c.id, repo.id, 'DEPLOYED_FROM', 'codebase repository');
        }
      }
    }

    // 4. Grafana -> Host / K8s
    const grafanaNode = nodes.find(n => n.id === 'grafana:instance:main');
    if (grafanaNode) {
      if (hostNode) {
        addEdge(grafanaNode.id, hostNode.id, 'MONITORED_BY', 'observes host telemetry');
      }
      for (const node of k8sNodes) {
        addEdge(grafanaNode.id, node.id, 'MONITORED_BY', 'observes node metrics');
      }
    }

    // 5. AWS EC2/RDS -> VPC
    const awsVpcs = nodes.filter(n => n.type === 'aws_vpc');
    const awsEc2s = nodes.filter(n => n.type === 'aws_ec2');
    const awsRds = nodes.filter(n => n.type === 'aws_rds');

    for (const ec2 of awsEc2s) {
      if (ec2.parentId && nodeMap.has(ec2.parentId)) {
        addEdge(ec2.id, ec2.parentId, 'HOSTED_ON', 'placed in VPC');
      }
    }
    for (const rds of awsRds) {
      if (awsVpcs.length > 0) {
        addEdge(rds.id, awsVpcs[0].id, 'HOSTED_ON', 'network attached');
      }
    }

    // 6. Azure VM/App/Storage -> RG
    const azureVms = nodes.filter(n => n.type === 'azure_vm');
    const azureApps = nodes.filter(n => n.type === 'azure_app');
    const azureStorages = nodes.filter(n => n.type === 'azure_storage');
    for (const vm of azureVms) {
      if (vm.parentId && nodeMap.has(vm.parentId)) {
        addEdge(vm.id, vm.parentId, 'BELONGS_TO', 'in resource group');
      }
    }
    for (const app of azureApps) {
      if (app.parentId && nodeMap.has(app.parentId)) {
        addEdge(app.id, app.parentId, 'BELONGS_TO', 'in resource group');
      }
    }
    for (const sa of azureStorages) {
      if (sa.parentId && nodeMap.has(sa.parentId)) {
        addEdge(sa.id, sa.parentId, 'BELONGS_TO', 'in resource group');
      }
    }

    const providerCounts: Record<string, number> = {};
    for (const n of nodes) {
      providerCounts[n.provider] = (providerCounts[n.provider] || 0) + 1;
    }

    return {
      nodes,
      edges,
      summary: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        providers: providerCounts,
      },
    };
  }

  /**
   * Scans real resources for actual problems, unhealthy states, or warning events
   */
  async getIssues(userId: string, preloadedResources?: InfrastructureResource[]): Promise<InfrastructureIssue[]> {
    const resources = preloadedResources || (await this.discoverAllResources(userId));
    const issues: InfrastructureIssue[] = [];
    const timestamp = new Date().toISOString();

    // 1. Inspect Kubernetes Pods & Nodes
    const k8sPods = resources.filter(r => r.type === 'k8s_pod');
    for (const pod of k8sPods) {
      const raw = (pod.rawStatus || '').toLowerCase();
      const restarts = pod.metadata?.restartCount || 0;

      if (raw.includes('crashloopbackoff') || raw.includes('error') || raw.includes('failed') || raw.includes('oomkilled')) {
        issues.push({
          id: `issue:k8s:pod:${pod.id}`,
          resourceId: pod.id,
          resourceName: pod.name,
          resourceType: pod.type,
          provider: 'kubernetes',
          severity: 'critical',
          title: `Pod "${pod.name}" is failing (${pod.rawStatus})`,
          description: `The pod in namespace "${pod.namespace}" has entered ${pod.rawStatus} with ${restarts} container restarts.`,
          timestamp: pod.lastUpdated || timestamp,
          evidence: {
            rawStatus: pod.rawStatus,
            affectedDependencies: pod.parentId ? [pod.parentId] : [],
          },
          recommendedAction: 'Inspect pod container logs and verify restart backoff reasons.',
          deepLinkApp: 'kubernetes',
        });
      } else if (raw.includes('imagepull') || raw.includes('errimagepull') || raw.includes('pending') || restarts > 5) {
        issues.push({
          id: `issue:k8s:pod:${pod.id}`,
          resourceId: pod.id,
          resourceName: pod.name,
          resourceType: pod.type,
          provider: 'kubernetes',
          severity: 'warning',
          title: `Pod "${pod.name}" in abnormal state: ${pod.rawStatus}`,
          description: `Pod has ${restarts} restarts or is waiting for image pulling in namespace "${pod.namespace}".`,
          timestamp: pod.lastUpdated || timestamp,
          evidence: {
            rawStatus: pod.rawStatus,
          },
          recommendedAction: 'Check container registry credentials or network connectivity.',
          deepLinkApp: 'kubernetes',
        });
      }
    }

    // Inspect Kubernetes Deployments
    const k8sDeps = resources.filter(r => r.type === 'k8s_deployment');
    for (const dep of k8sDeps) {
      const ready = dep.metadata?.readyReplicas || 0;
      const desired = dep.metadata?.replicas || 0;
      if (desired > 0 && ready === 0) {
        issues.push({
          id: `issue:k8s:dep:${dep.id}`,
          resourceId: dep.id,
          resourceName: dep.name,
          resourceType: dep.type,
          provider: 'kubernetes',
          severity: 'critical',
          title: `Deployment "${dep.name}" has 0/${desired} ready replicas`,
          description: `All pods managed by deployment "${dep.name}" in namespace "${dep.namespace}" are unready.`,
          timestamp: dep.lastUpdated || timestamp,
          evidence: {
            rawStatus: dep.rawStatus,
          },
          recommendedAction: 'Scale deployment or examine replica pod failure events.',
          deepLinkApp: 'kubernetes',
        });
      }
    }

    // 2. Inspect Docker Containers & Daemon
    const hasDockerResources = resources.some(r => r.provider === 'docker');
    if (!hasDockerResources) {
      try {
        const dockerHealth: any = await this.dockerService.getHealth().catch(() => ({ connected: false, error: undefined }));
        if (!dockerHealth.connected) {
          issues.push({
            id: 'issue:docker:daemon:offline',
            resourceId: 'docker:engine',
            resourceName: 'Docker Engine',
            resourceType: 'docker_engine',
            provider: 'docker',
            severity: 'critical',
            title: 'Docker Engine is disconnected or offline',
            description: dockerHealth.error || 'Docker daemon is stopped or unreachable on the host system.',
            timestamp,
            evidence: {
              rawStatus: 'Unavailable',
            },
            recommendedAction: 'Start Docker Desktop or the system docker service.',
            deepLinkApp: 'docker',
          });
        }
      } catch {}
    }

    const containers = resources.filter(r => r.type === 'docker_container');
    for (const c of containers) {
      const raw = (c.rawStatus || '').toLowerCase();
      const isExitedError = raw.includes('dead') || (raw.includes('exited') && !raw.includes('exited (0)'));
      const isRestarting = raw.includes('restarting');
      const isStopped = c.status === 'stopped' || raw.includes('exited (0)') || raw.includes('created');

      if (isExitedError) {
        issues.push({
          id: `issue:docker:${c.id}:error`,
          resourceId: c.id,
          resourceName: c.name,
          resourceType: c.type,
          provider: 'docker',
          severity: 'critical',
          title: `Container "${c.name}" terminated abnormally`,
          description: `Docker container stopped with abnormal status "${c.rawStatus}".`,
          timestamp: c.lastUpdated || timestamp,
          evidence: {
            rawStatus: c.rawStatus,
          },
          recommendedAction: 'Check container logs in Docker app for stack traces.',
          deepLinkApp: 'docker',
        });
      } else if (isRestarting) {
        issues.push({
          id: `issue:docker:${c.id}:restarting`,
          resourceId: c.id,
          resourceName: c.name,
          resourceType: c.type,
          provider: 'docker',
          severity: 'warning',
          title: `Container "${c.name}" is in a crash-restart loop`,
          description: `Docker container is repeatedly restarting (${c.rawStatus}).`,
          timestamp: c.lastUpdated || timestamp,
          evidence: {
            rawStatus: c.rawStatus,
          },
          recommendedAction: 'Check container logs to diagnose startup crash.',
          deepLinkApp: 'docker',
        });
      } else if (isStopped) {
        issues.push({
          id: `issue:docker:${c.id}:stopped`,
          resourceId: c.id,
          resourceName: c.name,
          resourceType: c.type,
          provider: 'docker',
          severity: 'warning',
          title: `Container "${c.name}" is stopped`,
          description: `Docker container "${c.name}" (${c.metadata?.image || 'image'}) is stopped (${c.rawStatus}).`,
          timestamp: c.lastUpdated || timestamp,
          evidence: {
            rawStatus: c.rawStatus,
          },
          recommendedAction: `Start container with 'docker start ${c.name}' or manage via Docker Containerizer.`,
          deepLinkApp: 'docker',
        });
      }
    }

    // 3. Real Kubernetes Events (Warning)
    const hasK8s = resources.some(r => r.provider === 'kubernetes');
    if (hasK8s) {
      try {
        const events = await this.kubernetesService.listEvents('all').catch(() => []);
        const warningEvents = events.filter(e => e.type === 'Warning');

        for (const ev of warningEvents.slice(0, 10)) {
          const issueId = `issue:k8s:event:${ev.name}`;
          if (!issues.some(i => i.id === issueId)) {
            issues.push({
              id: issueId,
              resourceId: `k8s:pod:${ev.namespace}/${ev.name}`,
              resourceName: ev.name,
              resourceType: 'k8s_event',
              provider: 'kubernetes',
              severity: 'warning',
              title: `K8s Warning: ${ev.reason || 'Event'} in ${ev.namespace}`,
              description: ev.message,
              timestamp: ev.lastTimestamp || timestamp,
              evidence: {
                rawStatus: ev.type,
                events: [{ type: ev.type, reason: ev.reason, message: ev.message, timestamp: ev.lastTimestamp }],
              },
              recommendedAction: `Investigate ${ev.reason} in Kubernetes namespace ${ev.namespace}.`,
              deepLinkApp: 'kubernetes',
            });
          }
        }
      } catch {}
    }

    return issues;
  }

  /**
   * Deep diagnostics ("Why is this broken?") for a specific resource
   */
  async diagnoseResource(userId: string, resourceId: string): Promise<ResourceDiagnostics> {
    const topology = await this.getTopology(userId);
    const resource = topology.nodes.find(n => n.id === resourceId);

    if (!resource) {
      throw new NotFoundException(`Resource with ID "${resourceId}" not found in discovered infrastructure.`);
    }

    // Find direct dependencies (what this resource depends on / points to)
    const outgoingEdges = topology.edges.filter(e => e.source === resourceId);
    const dependencies = topology.nodes.filter(n => outgoingEdges.some(e => e.target === n.id));

    // Find direct dependents (what depends on this resource)
    const incomingEdges = topology.edges.filter(e => e.target === resourceId);
    const dependents = topology.nodes.filter(n => incomingEdges.some(e => e.source === n.id));

    let logsSnippet: string[] = [];
    let events: any[] = [];
    const suggestedSteps: string[] = [];
    let statusDetails = `Resource is currently ${resource.status} (${resource.rawStatus}).`;

    // 1. If Kubernetes Pod
    if (resource.type === 'k8s_pod' && resource.namespace) {
      try {
        const podDetails = await this.kubernetesService.getPodDetails(resource.namespace, resource.name).catch(() => null);
        if (podDetails) {
          statusDetails = `Pod phase is ${podDetails.status} on node ${podDetails.node}. Container count: ${podDetails.containers?.length || 0}.`;
          events = (podDetails.conditions || []).map(c => ({
            type: c.type,
            status: c.status,
            reason: c.reason,
            message: c.message,
            timestamp: c.lastTransitionTime,
          }));
        }

        // Fetch logs
        const logsResult = await this.kubernetesService.getPodLogs(resource.namespace, resource.name, undefined, 40).catch(() => null);
        if (logsResult && typeof logsResult === 'string') {
          logsSnippet = logsResult.split('\n').filter(Boolean).slice(-30);
        }
      } catch (err: any) {
        this.logger.warn(`Could not fetch pod diagnostics: ${err.message}`);
      }

      if (resource.status === 'error') {
        suggestedSteps.push('Check the container logs above for unhandled exceptions or missing environment variables.');
        suggestedSteps.push('Review Pod event conditions to check if memory limit was exceeded (OOMKilled).');
        suggestedSteps.push(`Run 'kubectl describe pod ${resource.name} -n ${resource.namespace}' in CaelumOS Terminal.`);
      } else if (resource.status === 'warning') {
        suggestedSteps.push('Verify image tag and pull secret validity.');
        suggestedSteps.push('Check node resource allocatable limits.');
      } else {
        suggestedSteps.push('Pod is healthy and accepting traffic.');
      }
    }

    // 2. If Docker Container
    if (resource.type === 'docker_container') {
      try {
        const logRes = await this.dockerService.getContainerLogs(resource.sourceId).catch(() => null);
        if (logRes?.logs) {
          logsSnippet = logRes.logs.split('\n').filter(Boolean).slice(-30);
        }
      } catch (err: any) {
        this.logger.warn(`Could not fetch docker logs: ${err.message}`);
      }

      if (resource.status === 'error' || resource.status === 'stopped') {
        suggestedSteps.push('Examine the recent container stdout/stderr output above.');
        suggestedSteps.push(`Use CaelumOS Docker app to restart container '${resource.name}'.`);
        suggestedSteps.push(`Inspect port bindings: ${resource.metadata?.ports || 'None'}.`);
      } else {
        suggestedSteps.push('Container is currently running normally.');
      }
    }

    // 3. If Host
    if (resource.type === 'host_machine') {
      suggestedSteps.push(`CPU Load: ${resource.metrics?.cpu || 0}%, Memory: ${resource.metrics?.memory || 0}% used.`);
      suggestedSteps.push('Open CaelumOS Task Manager to view active processes and memory allocation.');
    }

    return {
      resource,
      health: {
        status: resource.status,
        summary: statusDetails,
      },
      evidence: {
        statusDetails,
        events,
        logsSnippet,
        dependencies,
        dependents,
      },
      suggestedSteps,
      nativeApp: resource.sourceApp,
    };
  }

  /**
   * Collect chronological stream of real infrastructure events
   */
  async getTimeline(userId: string, forceRefresh = false): Promise<InfrastructureTimelineEvent[]> {
    const events: InfrastructureTimelineEvent[] = [];
    const timestamp = new Date().toISOString();
    const resources = await this.discoverAllResources(userId, forceRefresh);

    // 1. K8s events
    const hasK8s = resources.some(r => r.provider === 'kubernetes');
    if (hasK8s) {
      try {
        const k8sEvents = await this.kubernetesService.listEvents('all').catch(() => []);
        for (const ev of k8sEvents) {
          events.push({
            id: `k8s:ev:${ev.name}:${ev.lastTimestamp || Date.now()}`,
            timestamp: ev.lastTimestamp || timestamp,
            provider: 'kubernetes',
            resourceId: `k8s:pod:${ev.namespace}/${ev.name}`,
            resourceName: ev.name,
            resourceType: 'k8s_event',
            type: 'k8s_event',
            severity: ev.type === 'Warning' ? 'warning' : 'info',
            message: `[${ev.reason}] ${ev.message}`,
            details: {
              namespace: ev.namespace,
              count: ev.count,
              reason: ev.reason,
            },
          });
        }
      } catch {}
    }

    // 2. Real Docker daemon events stream
    try {
      const dockerHealth = await this.dockerService.getHealth().catch(() => ({ connected: false }));
      if (dockerHealth.connected) {
        const realEvents = await this.dockerService.getRealEvents('24h').catch(() => []);
        for (const ev of realEvents) {
          const action = ev.Action || 'event';
          const type = ev.Type || 'container';
          const name = ev.Actor?.Attributes?.name || ev.Actor?.ID?.substring(0, 12) || 'Docker';
          const isStart = action === 'start' || action === 'create';
          const isStop = action === 'stop' || action === 'die' || action === 'kill';

          const evTime = ev.time ? new Date(ev.time * 1000).toISOString() : timestamp;
          events.push({
            id: `docker:ev:${ev.timeNano || ev.time || Math.random()}`,
            timestamp: evTime,
            provider: 'docker',
            resourceId: `docker:${type}:${ev.Actor?.ID?.substring(0, 12) || ''}`,
            resourceName: name,
            resourceType: `docker_${type}`,
            type: action,
            severity: isStart ? 'success' : (isStop ? 'warning' : 'info'),
            message: `Docker ${type} "${name}" ${action}ed (image: ${ev.Actor?.Attributes?.image || 'unknown'})`,
            details: {
              action,
              type,
              actor: ev.Actor?.Attributes,
            },
          });
        }

        // Snapshot fallback if no historical daemon events in last 24h
        if (realEvents.length === 0) {
          const containers = await this.dockerService.listContainers().catch(() => []);
          for (const c of containers) {
            const isUp = c.state === 'running';
            events.push({
              id: `docker:ev:${c.id}`,
              timestamp: c.created || timestamp,
              provider: 'docker',
              resourceId: `docker:container:${c.id}`,
              resourceName: c.name,
              resourceType: 'docker_container',
              type: 'state_change',
              severity: isUp ? 'success' : 'info',
              message: `Container "${c.name}" is in state: ${c.status || c.state}`,
              details: {
                image: c.image,
                ports: c.ports,
              },
            });
          }
        }
      }
    } catch {}

    // Sort descending by timestamp
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return events.slice(0, 50);
  }

  /**
   * Search across all discovered infrastructure
   */
  async search(userId: string, query: string): Promise<InfrastructureResource[]> {
    const resources = await this.discoverAllResources(userId);
    if (!query || !query.trim()) return resources;

    const q = query.trim().toLowerCase();
    return resources.filter(r => {
      return (
        r.name.toLowerCase().includes(q) ||
        r.displayName.toLowerCase().includes(q) ||
        r.provider.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        (r.namespace && r.namespace.toLowerCase().includes(q)) ||
        (r.rawStatus && r.rawStatus.toLowerCase().includes(q)) ||
        (r.metadata?.image && r.metadata.image.toLowerCase().includes(q))
      );
    });
  }
}
