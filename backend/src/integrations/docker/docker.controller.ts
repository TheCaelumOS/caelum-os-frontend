import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DockerService } from './docker.service';
import { ContainerActionDto } from '../dto/integrations.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Integrations: Docker Engine')
@Controller('docker')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DockerController {
  constructor(private readonly dockerService: DockerService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get Docker Engine daemon connection and status info' })
  @ApiResponse({ status: 200, description: 'Docker Engine status fetched successfully.' })
  getStatus() {
    return this.dockerService.getStatus();
  }

  @Get('containers')
  @ApiOperation({ summary: 'List all running and stopped Docker containers' })
  @ApiResponse({ status: 200, description: 'Docker container profiles listed successfully.' })
  listContainers() {
    return this.dockerService.listContainers();
  }

  @Get('images')
  @ApiOperation({ summary: 'List all local Docker images' })
  @ApiResponse({ status: 200, description: 'Docker images listed successfully.' })
  listImages() {
    return this.dockerService.listImages();
  }

  @Get('networks')
  @ApiOperation({ summary: 'List all local Docker networks' })
  @ApiResponse({ status: 200, description: 'Docker networks listed successfully.' })
  listNetworks() {
    return this.dockerService.listNetworks();
  }

  @Get('volumes')
  @ApiOperation({ summary: 'List all local Docker volumes' })
  @ApiResponse({ status: 200, description: 'Docker volumes listed successfully.' })
  listVolumes() {
    return this.dockerService.listVolumes();
  }

  @Get('daemon-logs')
  @ApiOperation({ summary: 'Fetch recent Docker daemon event log streams' })
  @ApiResponse({ status: 200, description: 'Daemon event logs fetched successfully.' })
  getDaemonLogs() {
    return this.dockerService.getDaemonLogs();
  }

  @Post('container/:id/action')
  @ApiOperation({ summary: 'Execute lifecycle controls (start, stop, restart, remove) on a container' })
  @ApiResponse({ status: 200, description: 'Container control triggered successfully.' })
  controlContainer(
    @Param('id') containerId: string,
    @Body() dto: ContainerActionDto,
  ) {
    return this.dockerService.controlContainer(containerId, dto.action);
  }

  @Get('container/:id/logs')
  @ApiOperation({ summary: 'Fetch stdout/stderr logs from a specific container' })
  @ApiResponse({ status: 200, description: 'Container logs fetched successfully.' })
  getContainerLogs(@Param('id') containerId: string) {
    return this.dockerService.getContainerLogs(containerId);
  }
}
