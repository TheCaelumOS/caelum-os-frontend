import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { KubernetesService } from './kubernetes.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Integrations: Kubernetes Engine')
@Controller('kubernetes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class KubernetesController {
  constructor(private readonly k8sService: KubernetesService) {}

  @Get('cluster-info')
  @ApiOperation({ summary: 'Get active Kubernetes cluster context and summary' })
  @ApiResponse({ status: 200, description: 'Cluster info fetched successfully.' })
  getClusterInfo() {
    return this.k8sService.getClusterSummary();
  }

  @Get('nodes')
  @ApiOperation({ summary: 'List cluster nodes with health and specs' })
  @ApiResponse({ status: 200, description: 'Nodes list fetched successfully.' })
  listNodes() {
    return this.k8sService.listNodes();
  }

  @Get('namespaces')
  @ApiOperation({ summary: 'List namespaces registered in cluster context' })
  @ApiResponse({ status: 200, description: 'Namespaces list fetched successfully.' })
  listNamespaces() {
    return this.k8sService.listNamespaces();
  }

  @Get('pods')
  @ApiOperation({ summary: 'List pods active in a specific namespace or all namespaces' })
  @ApiResponse({ status: 200, description: 'Pods list fetched successfully.' })
  listPods(@Query('namespace') namespace?: string) {
    return this.k8sService.listPods(namespace);
  }

  @Get('deployments')
  @ApiOperation({ summary: 'List deployments active in a specific namespace or all namespaces' })
  @ApiResponse({ status: 200, description: 'Deployments list fetched successfully.' })
  listDeployments(@Query('namespace') namespace?: string) {
    return this.k8sService.listDeployments(namespace);
  }

  @Get('statefulsets')
  @ApiOperation({ summary: 'List statefulsets active in a specific namespace or all namespaces' })
  @ApiResponse({ status: 200, description: 'StatefulSets list fetched successfully.' })
  listStatefulSets(@Query('namespace') namespace?: string) {
    return this.k8sService.listStatefulSets(namespace);
  }

  @Get('services')
  @ApiOperation({ summary: 'List services active in a specific namespace or all namespaces' })
  @ApiResponse({ status: 200, description: 'Services list fetched successfully.' })
  listServices(@Query('namespace') namespace?: string) {
    return this.k8sService.listServices(namespace);
  }

  @Get('ingress')
  @ApiOperation({ summary: 'List ingress controllers and routes in a specific namespace or all namespaces' })
  @ApiResponse({ status: 200, description: 'Ingress list fetched successfully.' })
  listIngress(@Query('namespace') namespace?: string) {
    return this.k8sService.listIngress(namespace);
  }

  @Get('events')
  @ApiOperation({ summary: 'List cluster events in a specific namespace or all namespaces' })
  @ApiResponse({ status: 200, description: 'Events list fetched successfully.' })
  listEvents(@Query('namespace') namespace?: string) {
    return this.k8sService.listEvents(namespace);
  }
}
