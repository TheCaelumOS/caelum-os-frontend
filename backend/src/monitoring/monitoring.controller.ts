import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MonitoringService } from './monitoring.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('System Information & Monitoring')
@Controller('system')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('info')
  @ApiOperation({ summary: 'Get basic host system specifications and platform details' })
  @ApiResponse({ status: 200, description: 'Specs fetched successfully.' })
  getSystemInfo() {
    return this.monitoringService.getSystemInfo();
  }

  @Get('cpu')
  @ApiOperation({ summary: 'Get CPU model, speed, cores, and active load percentage details' })
  @ApiResponse({ status: 200, description: 'CPU stats fetched successfully.' })
  getCpuStats() {
    return this.monitoringService.getCpuStats();
  }

  @Get('memory')
  @ApiOperation({ summary: 'Get RAM memory total, free, used, and active allocation details' })
  @ApiResponse({ status: 200, description: 'Memory stats fetched successfully.' })
  getMemoryStats() {
    return this.monitoringService.getMemoryStats();
  }

  @Get('network')
  @ApiOperation({ summary: 'Get details of host network interfaces and speed statistics' })
  @ApiResponse({ status: 200, description: 'Network stats fetched successfully.' })
  getNetworkStats() {
    return this.monitoringService.getNetworkStats();
  }

  @Get('storage')
  @ApiOperation({ summary: 'Get layout details of host storage disks and mounted volume capacities' })
  @ApiResponse({ status: 200, description: 'Storage stats fetched successfully.' })
  getStorageStats() {
    return this.monitoringService.getStorageStats();
  }

  @Get('processes')
  @ApiOperation({ summary: 'Get host process lists sorted by active CPU/Memory usage' })
  @ApiResponse({ status: 200, description: 'Process lists fetched successfully.' })
  getProcessesStats() {
    return this.monitoringService.getProcessesStats();
  }
}
