import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseBoolPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { GrafanaService } from './grafana.service';
import { ConnectGrafanaDto } from './dto/connect-grafana.dto';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { QueryGrafanaDto } from './dto/query-grafana.dto';

@ApiTags('Integrations: Grafana Observability')
@Controller('grafana')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GrafanaController {
  constructor(private readonly grafanaService: GrafanaService) {}

  // =========================================================================
  // CONNECTION MANAGEMENT & STATUS
  // =========================================================================

  @Post('connect')
  @ApiOperation({ summary: 'Connect user to a local or remote Grafana instance' })
  @ApiResponse({ status: 200, description: 'Grafana connection established successfully.' })
  async connect(
    @GetUser('id') userId: string,
    @Body() dto: ConnectGrafanaDto,
  ) {
    return this.grafanaService.connect(userId || 'dev-user', dto);
  }

  @Post('disconnect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disconnect the active Grafana instance' })
  @ApiResponse({ status: 200, description: 'Grafana disconnected successfully.' })
  async disconnect(@GetUser('id') userId: string) {
    return this.grafanaService.disconnect(userId || 'dev-user');
  }

  @Post('autodetect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Auto-detect local Grafana instance running on localhost ports' })
  @ApiResponse({ status: 200, description: 'Local Grafana detection result.' })
  async autoDetect(@GetUser('id') userId: string) {
    return this.grafanaService.autoDetectLocal(userId || 'dev-user');
  }

  @Get('status')
  @ApiOperation({ summary: 'Get current Grafana connection status, version, and resource counts' })
  @ApiResponse({ status: 200, description: 'Authoritative Grafana connection status.' })
  async getStatus(@GetUser('id') userId: string) {
    return this.grafanaService.getStatus(userId || 'dev-user');
  }

  @Get('health')
  @ApiOperation({ summary: 'Direct Grafana instance health check' })
  @ApiResponse({ status: 200, description: 'Grafana server health response.' })
  async getHealth(@GetUser('id') userId: string) {
    return this.grafanaService.getHealth(userId || 'dev-user');
  }

  @Get('overview')
  @ApiOperation({ summary: 'CaelumOS Observability Overview combining real Prometheus, Loki, and Alert metrics' })
  @ApiResponse({ status: 200, description: 'Observability telemetry summary.' })
  async getOverview(@GetUser('id') userId: string) {
    return this.grafanaService.getOverview(userId || 'dev-user');
  }

  // =========================================================================
  // DASHBOARDS
  // =========================================================================

  @Get('dashboards')
  @ApiOperation({ summary: 'Search and list dashboards from the connected Grafana instance' })
  @ApiQuery({ name: 'query', required: false, description: 'Text search term' })
  @ApiQuery({ name: 'tag', required: false, description: 'Filter by tag' })
  @ApiQuery({ name: 'starred', required: false, type: Boolean, description: 'Filter starred dashboards' })
  async getDashboards(
    @GetUser('id') userId: string,
    @Query('query') query?: string,
    @Query('tag') tag?: string,
    @Query('starred') starred?: string,
  ) {
    const isStarred = starred === 'true' ? true : starred === 'false' ? false : undefined;
    return this.grafanaService.getDashboards(userId || 'dev-user', query, tag, isStarred);
  }

  @Get('dashboards/:uid')
  @ApiOperation({ summary: 'Get complete dashboard specification by UID' })
  @ApiParam({ name: 'uid', description: 'Dashboard UID' })
  async getDashboard(
    @GetUser('id') userId: string,
    @Param('uid') uid: string,
  ) {
    return this.grafanaService.getDashboard(userId || 'dev-user', uid);
  }

  @Post('dashboards')
  @ApiOperation({ summary: 'Create or update a dashboard' })
  async createDashboard(
    @GetUser('id') userId: string,
    @Body() dto: CreateDashboardDto,
  ) {
    return this.grafanaService.createDashboard(userId || 'dev-user', dto);
  }

  @Delete('dashboards/:uid')
  @ApiOperation({ summary: 'Delete a dashboard by UID' })
  @ApiParam({ name: 'uid', description: 'Dashboard UID' })
  async deleteDashboard(
    @GetUser('id') userId: string,
    @Param('uid') uid: string,
  ) {
    return this.grafanaService.deleteDashboard(userId || 'dev-user', uid);
  }

  @Post('dashboards/:uid/star')
  @ApiOperation({ summary: 'Star a dashboard' })
  async starDashboard(
    @GetUser('id') userId: string,
    @Param('uid') uid: string,
  ) {
    return this.grafanaService.starDashboard(userId || 'dev-user', uid, true);
  }

  @Delete('dashboards/:uid/star')
  @ApiOperation({ summary: 'Unstar a dashboard' })
  async unstarDashboard(
    @GetUser('id') userId: string,
    @Param('uid') uid: string,
  ) {
    return this.grafanaService.starDashboard(userId || 'dev-user', uid, false);
  }

  // =========================================================================
  // FOLDERS
  // =========================================================================

  @Get('folders')
  @ApiOperation({ summary: 'List all dashboard folders in Grafana' })
  async getFolders(@GetUser('id') userId: string) {
    return this.grafanaService.getFolders(userId || 'dev-user');
  }

  // =========================================================================
  // DATA SOURCES
  // =========================================================================

  @Get('datasources')
  @ApiOperation({ summary: 'List all configured data sources in Grafana' })
  async getDataSources(@GetUser('id') userId: string) {
    return this.grafanaService.getDataSources(userId || 'dev-user');
  }

  @Get('datasources/:id/health')
  @ApiOperation({ summary: 'Test health of a data source by UID or ID' })
  @ApiParam({ name: 'id', description: 'Data source UID or numeric ID' })
  async getDataSourceHealth(
    @GetUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.grafanaService.getDataSourceHealth(userId || 'dev-user', id);
  }

  // =========================================================================
  // ALERTS & NOTIFICATIONS
  // =========================================================================

  @Get('alerts')
  @ApiOperation({ summary: 'List alert rules and current evaluation states' })
  async getAlerts(@GetUser('id') userId: string) {
    return this.grafanaService.getAlerts(userId || 'dev-user');
  }

  @Get('contact-points')
  @ApiOperation({ summary: 'List configured alert contact points without leaking secrets' })
  async getContactPoints(@GetUser('id') userId: string) {
    return this.grafanaService.getContactPoints(userId || 'dev-user');
  }

  // =========================================================================
  // QUERY PROXY
  // =========================================================================

  @Post('query')
  @ApiOperation({ summary: 'Proxy metrics and log queries through Grafana backend without exposing credentials' })
  async query(
    @GetUser('id') userId: string,
    @Body() dto: QueryGrafanaDto,
  ) {
    return this.grafanaService.query(userId || 'dev-user', dto);
  }
}
