import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Res,
  Req,
  Headers,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { GithubService } from './github.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { DeleteFileDto } from './dto/delete-file.dto';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePullRequestDto } from './dto/create-pr.dto';
import { MergePullRequestDto } from './dto/merge-pr.dto';
import { WorkflowDispatchDto } from './dto/workflow-dispatch.dto';
import { ConnectTokenDto } from './dto/connect-token.dto';

@ApiTags('GitHub Integration')
@Controller('github')
export class GithubController {
  constructor(
    private readonly githubService: GithubService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // =========================================================================
  // AUTHENTICATION & CONNECTION STATUS
  // =========================================================================

  @Get('config')
  @ApiOperation({ summary: 'Check if GitHub OAuth is configured on the backend and get public client ID' })
  @ApiResponse({ status: 200, description: 'Configuration status without secrets' })
  getConfig() {
    return this.githubService.getConfig();
  }

  @Get('auth')
  @ApiOperation({ summary: 'Generate GitHub OAuth authorization URL with secure state token' })
  @ApiQuery({ name: 'redirect', required: false, type: Boolean, description: 'Redirect browser directly if true' })
  @ApiResponse({ status: 200, description: 'Returns OAuth URL and state' })
  getAuthUrl(
    @Req() req: Request,
    @Query('redirect') redirect: string,
    @Res() res: Response,
  ) {
    let userId: string | undefined;
    const authHeader = req.headers['authorization'] as string;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const payload = this.jwtService.verify(token, {
          secret: this.configService.get<string>('JWT_SECRET') || 'caelum_jwt_super_secret_signing_key_2026_prod',
        });
        if (payload?.sub) {
          userId = payload.sub;
        }
      } catch {
        // Unauthenticated or invalid token: generate clean anonymous OAuth state
      }
    }

    const authData = this.githubService.getAuthUrl(userId);
    if (redirect === 'true') {
      return res.redirect(authData.url);
    }
    return res.json(authData);
  }

  @Get('callback')
  @ApiOperation({ summary: 'Handle GitHub OAuth callback and exchange code for access token' })
  @ApiQuery({ name: 'code', required: false, description: 'OAuth code from GitHub' })
  @ApiQuery({ name: 'state', required: false, description: 'CSRF state parameter' })
  @ApiQuery({ name: 'error', required: false, description: 'Error code from GitHub if user cancelled' })
  @ApiQuery({ name: 'error_description', required: false, description: 'Error description' })
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Query('error_description') errorDescription: string,
    @Res() res: Response,
  ) {
    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    if (error) {
      return res.redirect(`${frontendBaseUrl}/github?error=${encodeURIComponent(errorDescription || error)}`);
    }
    if (!code || !state) {
      return res.redirect(`${frontendBaseUrl}/github?error=${encodeURIComponent('Missing authorization code or state from GitHub')}`);
    }

    try {
      const result = await this.githubService.handleCallback(code, state);
      return res.redirect(result.redirectUrl);
    } catch (err: any) {
      return res.redirect(`${frontendBaseUrl}/github?error=${encodeURIComponent(err.message || 'OAuth exchange failed')}`);
    }
  }

  @Get('status')
  @ApiOperation({ summary: 'Check current GitHub connection status and profile for the authenticated session' })
  @ApiResponse({ status: 200, description: 'Connection status and profile data' })
  async getStatus(@Req() req: Request) {
    let userId: string | undefined;
    const authHeader = req.headers['authorization'] as string;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const payload = this.jwtService.verify(token, {
          secret: this.configService.get<string>('JWT_SECRET') || 'caelum_jwt_super_secret_signing_key_2026_prod',
        });
        if (payload?.sub) {
          userId = payload.sub;
        }
      } catch {
        // Token invalid or expired
      }
    }

    if (!userId) {
      const config = this.githubService.getConfig();
      return {
        connected: false,
        configured: config.configured,
        configError: config.error,
      };
    }

    return await this.githubService.getStatus(userId);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch authenticated GitHub user profile from GitHub API' })
  @ApiResponse({ status: 200, description: 'Authenticated GitHub user profile' })
  async getUser(@GetUser('id') userId: string) {
    return await this.githubService.getCurrentUser(userId);
  }

  @Delete('connection')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disconnect GitHub account and revoke stored credentials for the session' })
  @ApiResponse({ status: 200, description: 'Disconnected successfully' })
  async disconnect(@GetUser('id') userId: string) {
    return await this.githubService.disconnect(userId);
  }

  @Get('local-account')
  @ApiOperation({ summary: 'Check if local host Git credentials are available' })
  @ApiResponse({ status: 200, description: 'Local account availability' })
  getLocalAccount() {
    return this.githubService.getLocalAccountInfo();
  }

  @Post('connect-local')
  @ApiOperation({ summary: 'Connect and authenticate using detected local Git credential' })
  @ApiResponse({ status: 200, description: 'Connected successfully with local credentials' })
  async connectLocal() {
    return await this.githubService.connectLocal();
  }

  @Post('connect-token')
  @ApiOperation({ summary: 'Connect and authenticate using a provided GitHub Personal Access Token or OAuth Token' })
  @ApiResponse({ status: 200, description: 'Connected successfully with token' })
  async connectToken(@Body() body: ConnectTokenDto) {
    return await this.githubService.connectWithToken(body.token);
  }

  // =========================================================================
  // REPOSITORIES
  // =========================================================================

  @Get('repos')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List repositories accessible to the authenticated GitHub user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'per_page', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, enum: ['created', 'updated', 'pushed', 'full_name'] })
  @ApiQuery({ name: 'direction', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'type', required: false, enum: ['all', 'owner', 'public', 'private', 'member'] })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Search query for filtering repositories' })
  async getRepositories(
    @GetUser('id') userId: string,
    @Query('page') page?: string,
    @Query('per_page') perPage?: string,
    @Query('sort') sort?: 'created' | 'updated' | 'pushed' | 'full_name',
    @Query('direction') direction?: 'asc' | 'desc',
    @Query('type') type?: 'all' | 'owner' | 'public' | 'private' | 'member',
    @Query('q') q?: string,
  ) {
    return await this.githubService.getRepositories(userId, {
      page: page ? parseInt(page, 10) : 1,
      per_page: perPage ? parseInt(perPage, 10) : 30,
      sort,
      direction,
      type,
      q,
    });
  }

  @Get('repos/:owner/:repo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get repository details, topics, and permissions' })
  @ApiParam({ name: 'owner', description: 'Repository owner' })
  @ApiParam({ name: 'repo', description: 'Repository name' })
  async getRepository(
    @GetUser('id') userId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return await this.githubService.getRepository(userId, owner, repo);
  }

  // =========================================================================
  // BRANCHES
  // =========================================================================

  @Get('repos/:owner/:repo/branches')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List branches for a repository' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'per_page', required: false, type: Number })
  async getBranches(
    @GetUser('id') userId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('page') page?: string,
    @Query('per_page') perPage?: string,
  ) {
    return await this.githubService.getBranches(
      userId,
      owner,
      repo,
      page ? parseInt(page, 10) : 1,
      perPage ? parseInt(perPage, 10) : 30,
    );
  }

  @Post('repos/:owner/:repo/branches')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new branch in a repository' })
  async createBranch(
    @GetUser('id') userId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Body() dto: CreateBranchDto,
  ) {
    return await this.githubService.createBranch(userId, owner, repo, dto);
  }

  // =========================================================================
  // FILE TREE & CONTENTS
  // =========================================================================

  @Get('repos/:owner/:repo/tree')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tree structure for folder in repository' })
  @ApiQuery({ name: 'branch', required: false, type: String })
  @ApiQuery({ name: 'path', required: false, type: String })
  async getTree(
    @GetUser('id') userId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('branch') branch?: string,
    @Query('path') pathParam?: string,
  ) {
    return await this.githubService.getTree(userId, owner, repo, branch, pathParam);
  }

  @Get('repos/:owner/:repo/file')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get content and metadata for a specific file' })
  @ApiQuery({ name: 'path', required: true, type: String })
  @ApiQuery({ name: 'branch', required: false, type: String })
  async getFile(
    @GetUser('id') userId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('path') filePath: string,
    @Query('branch') branch?: string,
  ) {
    return await this.githubService.getFile(userId, owner, repo, filePath, branch);
  }

  @Post('repos/:owner/:repo/file')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new file with an initial Git commit' })
  async createFile(
    @GetUser('id') userId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Body() dto: CreateFileDto,
  ) {
    return await this.githubService.createFile(userId, owner, repo, dto);
  }

  @Put('repos/:owner/:repo/file')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing file with a Git commit' })
  async updateFile(
    @GetUser('id') userId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Body() dto: UpdateFileDto,
  ) {
    return await this.githubService.updateFile(userId, owner, repo, dto);
  }

  @Delete('repos/:owner/:repo/file')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a file with a Git commit' })
  async deleteFile(
    @GetUser('id') userId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Body() dto: DeleteFileDto,
  ) {
    return await this.githubService.deleteFile(userId, owner, repo, dto);
  }

  // =========================================================================
  // COMMITS
  // =========================================================================

  @Get('repos/:owner/:repo/commits')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get commit history for a repository' })
  @ApiQuery({ name: 'branch', required: false, type: String })
  @ApiQuery({ name: 'path', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'per_page', required: false, type: Number })
  async getCommits(
    @GetUser('id') userId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('branch') branch?: string,
    @Query('path') pathParam?: string,
    @Query('page') page?: string,
    @Query('per_page') perPage?: string,
  ) {
    return await this.githubService.getCommits(
      userId,
      owner,
      repo,
      branch,
      pathParam,
      page ? parseInt(page, 10) : 1,
      perPage ? parseInt(perPage, 10) : 30,
    );
  }

  @Get('repos/:owner/:repo/commits/:sha')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get commit details with stats and diff patches' })
  async getCommit(
    @GetUser('id') userId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('sha') sha: string,
  ) {
    return await this.githubService.getCommit(userId, owner, repo, sha);
  }

  // =========================================================================
  // ISSUES
  // =========================================================================

  @Get('repos/:owner/:repo/issues')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List issues for a repository' })
  @ApiQuery({ name: 'state', required: false, enum: ['open', 'closed', 'all'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'per_page', required: false, type: Number })
  @ApiQuery({ name: 'labels', required: false, type: String })
  @ApiQuery({ name: 'assignee', required: false, type: String })
  async getIssues(
    @GetUser('id') userId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('state') state?: 'open' | 'closed' | 'all',
    @Query('page') page?: string,
    @Query('per_page') perPage?: string,
    @Query('labels') labels?: string,
    @Query('assignee') assignee?: string,
  ) {
    return await this.githubService.getIssues(
      userId,
      owner,
      repo,
      state || 'open',
      page ? parseInt(page, 10) : 1,
      perPage ? parseInt(perPage, 10) : 30,
      labels,
      assignee,
    );
  }

  @Post('repos/:owner/:repo/issues')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new issue in a repository' })
  async createIssue(
    @GetUser('id') userId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Body() dto: CreateIssueDto,
  ) {
    return await this.githubService.createIssue(userId, owner, repo, dto);
  }

  @Patch('repos/:owner/:repo/issues/:number')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an issue title, body, state, or labels' })
  async updateIssue(
    @GetUser('id') userId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('number', ParseIntPipe) issueNumber: number,
    @Body() dto: UpdateIssueDto,
  ) {
    return await this.githubService.updateIssue(userId, owner, repo, issueNumber, dto);
  }

  @Get('repos/:owner/:repo/issues/:number/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get comments on a specific issue' })
  async getIssueComments(
    @GetUser('id') userId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('number', ParseIntPipe) issueNumber: number,
  ) {
    return await this.githubService.getIssueComments(userId, owner, repo, issueNumber);
  }

  @Post('repos/:owner/:repo/issues/:number/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a comment to an issue' })
  async createIssueComment(
    @GetUser('id') userId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('number', ParseIntPipe) issueNumber: number,
    @Body() dto: CreateCommentDto,
  ) {
    return await this.githubService.createIssueComment(userId, owner, repo, issueNumber, dto.body);
  }

  // =========================================================================
  // PULL REQUESTS
  // =========================================================================

  @Get('repos/:owner/:repo/pulls')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List pull requests for a repository' })
  @ApiQuery({ name: 'state', required: false, enum: ['open', 'closed', 'all'] })
  @ApiQuery({ name: 'base', required: false, type: String })
  @ApiQuery({ name: 'head', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'per_page', required: false, type: Number })
  async getPullRequests(
    @GetUser('id') userId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('state') state?: 'open' | 'closed' | 'all',
    @Query('base') base?: string,
    @Query('head') head?: string,
    @Query('page') page?: string,
    @Query('per_page') perPage?: string,
  ) {
    return await this.githubService.getPullRequests(
      userId,
      owner,
      repo,
      state || 'open',
      base,
      head,
      page ? parseInt(page, 10) : 1,
      perPage ? parseInt(perPage, 10) : 30,
    );
  }

  @Get('repos/:owner/:repo/pulls/:number')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pull request details and mergeability status' })
  async getPullRequest(
    @GetUser('id') userId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('number', ParseIntPipe) pullNumber: number,
  ) {
    return await this.githubService.getPullRequest(userId, owner, repo, pullNumber);
  }

  @Post('repos/:owner/:repo/pulls')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new pull request' })
  async createPullRequest(
    @GetUser('id') userId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Body() dto: CreatePullRequestDto,
  ) {
    return await this.githubService.createPullRequest(userId, owner, repo, dto);
  }

  @Get('repos/:owner/:repo/pulls/:number/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get reviews for a pull request' })
  async getPullRequestReviews(
    @GetUser('id') userId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('number', ParseIntPipe) pullNumber: number,
  ) {
    return await this.githubService.getPullRequestReviews(userId, owner, repo, pullNumber);
  }

  @Post('repos/:owner/:repo/pulls/:number/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a review for a pull request' })
  async createPullRequestReview(
    @GetUser('id') userId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('number', ParseIntPipe) pullNumber: number,
    @Body() body: { event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT'; body?: string },
  ) {
    return await this.githubService.createPullRequestReview(
      userId,
      owner,
      repo,
      pullNumber,
      body.event,
      body.body,
    );
  }

  @Put('repos/:owner/:repo/pulls/:number/merge')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Merge a pull request using merge, squash, or rebase' })
  async mergePullRequest(
    @GetUser('id') userId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('number', ParseIntPipe) pullNumber: number,
    @Body() dto: MergePullRequestDto,
  ) {
    return await this.githubService.mergePullRequest(userId, owner, repo, pullNumber, dto);
  }

  // =========================================================================
  // GITHUB ACTIONS
  // =========================================================================

  @Get('repos/:owner/:repo/actions/workflows')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List GitHub Actions workflows for a repository' })
  async getWorkflows(
    @GetUser('id') userId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return await this.githubService.getWorkflows(userId, owner, repo);
  }

  @Get('repos/:owner/:repo/actions/runs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List workflow runs for a repository' })
  @ApiQuery({ name: 'workflowId', required: false, type: String })
  @ApiQuery({ name: 'branch', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'per_page', required: false, type: Number })
  async getWorkflowRuns(
    @GetUser('id') userId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('workflowId') workflowId?: string,
    @Query('branch') branch?: string,
    @Query('page') page?: string,
    @Query('per_page') perPage?: string,
  ) {
    return await this.githubService.getWorkflowRuns(
      userId,
      owner,
      repo,
      workflowId,
      branch,
      page ? parseInt(page, 10) : 1,
      perPage ? parseInt(perPage, 10) : 20,
    );
  }

  @Get('repos/:owner/:repo/actions/runs/:runId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get details of a single workflow run' })
  async getWorkflowRun(
    @GetUser('id') userId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('runId', ParseIntPipe) runId: number,
  ) {
    return await this.githubService.getWorkflowRun(userId, owner, repo, runId);
  }

  @Get('repos/:owner/:repo/actions/runs/:runId/logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get direct logs URL for a workflow run' })
  async getWorkflowRunLogs(
    @GetUser('id') userId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('runId', ParseIntPipe) runId: number,
  ) {
    return await this.githubService.getWorkflowRunLogs(userId, owner, repo, runId);
  }

  @Post('repos/:owner/:repo/actions/workflows/:workflowId/dispatches')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually dispatch / trigger a workflow run' })
  async dispatchWorkflow(
    @GetUser('id') userId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('workflowId') workflowId: string,
    @Body() dto: WorkflowDispatchDto,
  ) {
    return await this.githubService.dispatchWorkflow(userId, owner, repo, workflowId, dto);
  }

  // =========================================================================
  // RELEASES & TAGS
  // =========================================================================

  @Get('repos/:owner/:repo/releases')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List releases for a repository' })
  async getReleases(
    @GetUser('id') userId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return await this.githubService.getReleases(userId, owner, repo);
  }

  @Get('repos/:owner/:repo/tags')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List git tags for a repository' })
  async getTags(
    @GetUser('id') userId: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return await this.githubService.getTags(userId, owner, repo);
  }

  // =========================================================================
  // WEBHOOK INGESTION
  // =========================================================================

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ingest and verify GitHub webhooks' })
  async handleWebhook(
    @Headers('x-hub-signature-256') signature: string,
    @Body() payload: any,
  ) {
    return this.githubService.handleWebhook(signature, payload);
  }
}
