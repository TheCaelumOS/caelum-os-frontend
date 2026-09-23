import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { KubernetesService } from './kubernetes.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateDeploymentDto, ScaleDeploymentDto, CreateServiceDto } from './dto/create-k8s.dto';

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

  @Get('pods/:namespace/:name')
  @ApiOperation({ summary: 'Get detailed pod specifications, containers, and conditions' })
  @ApiResponse({ status: 200, description: 'Pod details fetched successfully.' })
  getPodDetails(
    @Param('namespace') namespace: string,
    @Param('name') name: string,
  ) {
    return this.k8sService.getPodDetails(namespace, name);
  }

  @Get('pods/:namespace/:name/logs')
  @ApiOperation({ summary: 'Get stdout/stderr logs from a specific pod and container' })
  @ApiResponse({ status: 200, description: 'Pod logs fetched successfully.' })
  getPodLogs(
    @Param('namespace') namespace: string,
    @Param('name') name: string,
    @Query('container') container?: string,
    @Query('tailLines') tailLines?: number,
  ) {
    return this.k8sService.getPodLogs(namespace, name, container, tailLines);
  }

  @Delete('pods/:namespace/:name')
  @ApiOperation({ summary: 'Delete a pod from the cluster' })
  @ApiResponse({ status: 200, description: 'Pod deleted successfully.' })
  deletePod(
    @Param('namespace') namespace: string,
    @Param('name') name: string,
  ) {
    return this.k8sService.deletePod(namespace, name);
  }

  @Post('pods/:namespace/:name/restart')
  @ApiOperation({ summary: 'Trigger restart of a pod' })
  @ApiResponse({ status: 200, description: 'Pod restart initiated successfully.' })
  restartPod(
    @Param('namespace') namespace: string,
    @Param('name') name: string,
  ) {
    return this.k8sService.restartPod(namespace, name);
  }

  @Get('deployments')
  @ApiOperation({ summary: 'List deployments active in a specific namespace or all namespaces' })
  @ApiResponse({ status: 200, description: 'Deployments list fetched successfully.' })
  listDeployments(@Query('namespace') namespace?: string) {
    return this.k8sService.listDeployments(namespace);
  }

  @Post('deployments')
  @ApiOperation({ summary: 'Create a new deployment in a namespace' })
  @ApiResponse({ status: 201, description: 'Deployment created successfully.' })
  createDeployment(@Body() dto: CreateDeploymentDto) {
    return this.k8sService.createDeployment(dto);
  }

  @Post('deployments/:namespace/:name/scale')
  @ApiOperation({ summary: 'Scale deployment replica count' })
  @ApiResponse({ status: 200, description: 'Deployment scaled successfully.' })
  scaleDeployment(
    @Param('namespace') namespace: string,
    @Param('name') name: string,
    @Body() dto: ScaleDeploymentDto,
  ) {
    return this.k8sService.scaleDeployment(namespace, name, dto.replicas);
  }

  @Delete('deployments/:namespace/:name')
  @ApiOperation({ summary: 'Delete a deployment from the cluster' })
  @ApiResponse({ status: 200, description: 'Deployment deleted successfully.' })
  deleteDeployment(
    @Param('namespace') namespace: string,
    @Param('name') name: string,
  ) {
    return this.k8sService.deleteDeployment(namespace, name);
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

  @Post('services')
  @ApiOperation({ summary: 'Create a new service in a namespace' })
  @ApiResponse({ status: 201, description: 'Service created successfully.' })
  createService(@Body() dto: CreateServiceDto) {
    return this.k8sService.createService(dto);
  }

  @Delete('services/:namespace/:name')
  @ApiOperation({ summary: 'Delete a service from the cluster' })
  @ApiResponse({ status: 200, description: 'Service deleted successfully.' })
  deleteService(
    @Param('namespace') namespace: string,
    @Param('name') name: string,
  ) {
    return this.k8sService.deleteService(namespace, name);
  }

  @Get('configmaps')
  @ApiOperation({ summary: 'List configmaps active in a specific namespace or all namespaces' })
  @ApiResponse({ status: 200, description: 'ConfigMaps list fetched successfully.' })
  listConfigMaps(@Query('namespace') namespace?: string) {
    return this.k8sService.listConfigMaps(namespace);
  }

  @Get('configmaps/:namespace/:name')
  @ApiOperation({ summary: 'Get details and keys of a specific configmap' })
  @ApiResponse({ status: 200, description: 'ConfigMap details fetched successfully.' })
  getConfigMap(
    @Param('namespace') namespace: string,
    @Param('name') name: string,
  ) {
    return this.k8sService.getConfigMap(namespace, name);
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
