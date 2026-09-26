import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Header,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { InfrastructureService } from './infrastructure.service';

@ApiTags('CaelumOS Infrastructure Intelligence')
@Controller('infrastructure')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InfrastructureController {
  constructor(private readonly infrastructureService: InfrastructureService) {}

  @Get('overview')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @ApiOperation({ summary: 'Get aggregated infrastructure overview across all providers' })
  @ApiResponse({ status: 200, description: 'Infrastructure overview retrieved successfully.' })
  async getOverview(@GetUser('id') userId: string, @Query('force') force?: string) {
    return this.infrastructureService.getOverview(userId, force === 'true');
  }

  @Get('resources')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @ApiOperation({ summary: 'Discover and list all real infrastructure resources' })
  @ApiResponse({ status: 200, description: 'All discovered infrastructure resources.' })
  async getResources(@GetUser('id') userId: string, @Query('force') force?: string) {
    return this.infrastructureService.discoverAllResources(userId, force === 'true');
  }

  @Get('topology')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @ApiOperation({ summary: 'Get unified multi-provider infrastructure graph topology' })
  @ApiResponse({ status: 200, description: 'Unified topology nodes and relationships.' })
  async getTopology(@GetUser('id') userId: string, @Query('force') force?: string) {
    return this.infrastructureService.getTopology(userId, force === 'true');
  }

  @Get('issues')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @ApiOperation({ summary: 'Get active issues detected across connected infrastructure' })
  @ApiResponse({ status: 200, description: 'List of active issues and warnings.' })
  async getIssues(@GetUser('id') userId: string, @Query('force') force?: string) {
    const resources = await this.infrastructureService.discoverAllResources(userId, force === 'true');
    return this.infrastructureService.getIssues(userId, resources);
  }

  @Get('diagnose/:id')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @ApiOperation({ summary: 'Run deep diagnostics on a specific infrastructure resource' })
  @ApiParam({ name: 'id', description: 'Resource ID (e.g. k8s:pod:default/my-pod)' })
  @ApiResponse({ status: 200, description: 'Deep diagnostics and root cause evidence.' })
  async diagnoseResource(
    @GetUser('id') userId: string,
    @Param('id') resourceId: string,
  ) {
    return this.infrastructureService.diagnoseResource(userId, resourceId);
  }

  @Get('timeline')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @ApiOperation({ summary: 'Get chronological timeline of infrastructure events' })
  @ApiResponse({ status: 200, description: 'Chronological events stream.' })
  async getTimeline(@GetUser('id') userId: string, @Query('force') force?: string) {
    return this.infrastructureService.getTimeline(userId, force === 'true');
  }

  @Get('search')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @ApiOperation({ summary: 'Search discovered infrastructure resources' })
  @ApiQuery({ name: 'query', required: false, description: 'Search query' })
  @ApiResponse({ status: 200, description: 'Matching resources.' })
  async search(
    @GetUser('id') userId: string,
    @Query('query') query = '',
  ) {
    return this.infrastructureService.search(userId, query);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Force refresh infrastructure discovery cache' })
  @ApiResponse({ status: 200, description: 'Fresh discovery overview and topology.' })
  async refresh(@GetUser('id') userId: string) {
    const [overview, topology] = await Promise.all([
      this.infrastructureService.getOverview(userId, true),
      this.infrastructureService.getTopology(userId, true),
    ]);
    return {
      success: true,
      refreshedAt: new Date().toISOString(),
      overview,
      topology,
    };
  }
}
