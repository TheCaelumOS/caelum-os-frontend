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

  @Get('namespaces')
  @ApiOperation({ summary: 'List namespaces registered in cluster context' })
  @ApiResponse({ status: 200, description: 'Namespaces list fetched successfully.' })
  listNamespaces() {
    return this.k8sService.listNamespaces();
  }

  @Get('pods')
  @ApiOperation({ summary: 'List pods active in a specific namespace' })
  @ApiResponse({ status: 200, description: 'Pods list fetched successfully.' })
  listPods(@Query('namespace') namespace?: string) {
    return this.k8sService.listPods(namespace);
  }

  @Get('deployments')
  @ApiOperation({ summary: 'List deployments active in a specific namespace' })
  @ApiResponse({ status: 200, description: 'Deployments list fetched successfully.' })
  listDeployments(@Query('namespace') namespace?: string) {
    return this.k8sService.listDeployments(namespace);
  }
}
