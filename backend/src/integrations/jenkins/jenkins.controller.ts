import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
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
import { JenkinsService } from './jenkins.service';
import { ConnectJenkinsDto } from './dto/connect-jenkins.dto';
import { TriggerBuildDto } from './dto/trigger-build.dto';

@ApiTags('Integrations: Jenkins CI/CD')
@Controller('jenkins')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JenkinsController {
  constructor(private readonly jenkinsService: JenkinsService) {}

  // =========================================================================
  // CONNECTION MANAGEMENT & STATUS
  // =========================================================================

  @Post('connect')
  @ApiOperation({ summary: 'Connect user to a local or remote Jenkins CI/CD server' })
  @ApiResponse({ status: 200, description: 'Jenkins connection established successfully.' })
  async connect(
    @GetUser('id') userId: string,
    @Body() dto: ConnectJenkinsDto,
  ) {
    return this.jenkinsService.connect(userId || 'dev-user', dto);
  }

  @Post('disconnect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disconnect the active Jenkins instance' })
  @ApiResponse({ status: 200, description: 'Jenkins disconnected successfully.' })
  async disconnect(@GetUser('id') userId: string) {
    return this.jenkinsService.disconnect(userId || 'dev-user');
  }

  @Post('autodetect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Auto-detect local Jenkins server running on common localhost ports' })
  @ApiResponse({ status: 200, description: 'Local Jenkins detection result.' })
  async autoDetect(@GetUser('id') userId: string) {
    return this.jenkinsService.autoDetectLocal(userId || 'dev-user');
  }

  @Get('status')
  @ApiOperation({ summary: 'Get current Jenkins connection status, version, and server metadata' })
  @ApiResponse({ status: 200, description: 'Authoritative Jenkins connection status.' })
  async getStatus(@GetUser('id') userId: string) {
    return this.jenkinsService.getStatus(userId || 'dev-user');
  }

  @Get('overview')
  @ApiOperation({ summary: 'Live Jenkins Overview with total jobs, executors, nodes, queue and recent builds' })
  @ApiResponse({ status: 200, description: 'Jenkins server overview metrics.' })
  async getOverview(@GetUser('id') userId: string) {
    return this.jenkinsService.getOverview(userId || 'dev-user');
  }

  // =========================================================================
  // JOBS
  // =========================================================================

  @Get('jobs')
  @ApiOperation({ summary: 'List discovered jobs and folders from connected Jenkins instance' })
  @ApiQuery({ name: 'folder', required: false, description: 'Optional folder path to browse nested jobs' })
  @ApiQuery({ name: 'query', required: false, description: 'Filter jobs by text query' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter jobs by status (SUCCESS, FAILURE, etc.)' })
  async getJobs(
    @GetUser('id') userId: string,
    @Query('folder') folder?: string,
    @Query('query') query?: string,
    @Query('status') status?: string,
  ) {
    return this.jenkinsService.getJobs(userId || 'dev-user', folder, query, status);
  }

  @Get('job')
  @ApiOperation({ summary: 'Get detailed information and builds history for a specific job path' })
  @ApiQuery({ name: 'path', required: true, description: 'Job path or nested folder path' })
  async getJobDetails(
    @GetUser('id') userId: string,
    @Query('path') jobPath: string,
  ) {
    return this.jenkinsService.getJobDetails(userId || 'dev-user', jobPath);
  }

  // =========================================================================
  // BUILD OPERATIONS & QUEUE
  // =========================================================================

  @Post('build')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger a build (parameterized or plain) on the specified job' })
  @ApiQuery({ name: 'path', required: true, description: 'Target job path' })
  async triggerBuild(
    @GetUser('id') userId: string,
    @Query('path') jobPath: string,
    @Body() dto: TriggerBuildDto,
  ) {
    return this.jenkinsService.triggerBuild(userId || 'dev-user', jobPath, dto);
  }

  @Post('stop')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stop / abort an in-progress build' })
  @ApiQuery({ name: 'path', required: true, description: 'Target job path' })
  @ApiQuery({ name: 'buildNumber', required: true, description: 'Build number to stop' })
  async stopBuild(
    @GetUser('id') userId: string,
    @Query('path') jobPath: string,
    @Query('buildNumber', ParseIntPipe) buildNumber: number,
  ) {
    return this.jenkinsService.stopBuild(userId || 'dev-user', jobPath, buildNumber);
  }

  @Get('build-detail')
  @ApiOperation({ summary: 'Get full details for an individual build (causes, artifacts, commit info)' })
  @ApiQuery({ name: 'path', required: true, description: 'Target job path' })
  @ApiQuery({ name: 'buildNumber', required: true, description: 'Build number' })
  async getBuildDetail(
    @GetUser('id') userId: string,
    @Query('path') jobPath: string,
    @Query('buildNumber', ParseIntPipe) buildNumber: number,
  ) {
    return this.jenkinsService.getBuild(userId || 'dev-user', jobPath, buildNumber);
  }

  @Get('console')
  @ApiOperation({ summary: 'Get progressive console text output for a running or completed build' })
  @ApiQuery({ name: 'path', required: true, description: 'Target job path' })
  @ApiQuery({ name: 'buildNumber', required: true, description: 'Build number' })
  @ApiQuery({ name: 'startOffset', required: false, description: 'Byte offset for progressive log polling' })
  async getConsole(
    @GetUser('id') userId: string,
    @Query('path') jobPath: string,
    @Query('buildNumber', ParseIntPipe) buildNumber: number,
    @Query('startOffset') startOffset?: string,
  ) {
    const offset = startOffset ? parseInt(startOffset, 10) : 0;
    return this.jenkinsService.getConsoleOutput(userId || 'dev-user', jobPath, buildNumber, isNaN(offset) ? 0 : offset);
  }

  @Get('tests')
  @ApiOperation({ summary: 'Get test report summary for a build if supported by test plugins' })
  @ApiQuery({ name: 'path', required: true, description: 'Target job path' })
  @ApiQuery({ name: 'buildNumber', required: true, description: 'Build number' })
  async getTests(
    @GetUser('id') userId: string,
    @Query('path') jobPath: string,
    @Query('buildNumber', ParseIntPipe) buildNumber: number,
  ) {
    return this.jenkinsService.getTestReport(userId || 'dev-user', jobPath, buildNumber);
  }

  @Get('queue')
  @ApiOperation({ summary: 'List pending items in the Jenkins build queue' })
  async getQueue(@GetUser('id') userId: string) {
    return this.jenkinsService.getQueue(userId || 'dev-user');
  }

  @Post('queue/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a pending item in the build queue' })
  @ApiParam({ name: 'id', description: 'Queue item ID' })
  async cancelQueueItem(
    @GetUser('id') userId: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.jenkinsService.cancelQueueItem(userId || 'dev-user', id);
  }

  @Get('nodes')
  @ApiOperation({ summary: 'List Jenkins nodes, agents, executors, and availability' })
  async getNodes(@GetUser('id') userId: string) {
    return this.jenkinsService.getNodes(userId || 'dev-user');
  }
}
