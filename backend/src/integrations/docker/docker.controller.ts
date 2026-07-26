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

  @Get('containers')
  @ApiOperation({ summary: 'List all running and stopped Docker containers' })
  @ApiResponse({ status: 200, description: 'Docker container profiles listed successfully.' })
  listContainers() {
    return this.dockerService.listContainers();
  }

  @Post('container/:id/action')
  @ApiOperation({ summary: 'Execute lifecycle controls (start, stop, restart) on a container' })
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
