import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { PrismaService } from '../../prisma/prisma.service';
import {
  GITHUB_API_URL,
  GITHUB_OAUTH_URL,
  GITHUB_TOKEN_URL,
  GITHUB_DEFAULT_SCOPES,
} from './github.constants';
import {
  GithubConnectionStatus,
  GithubUserProfile,
  GithubRepository,
  GithubBranch,
  GithubTreeItem,
  GithubFileContent,
  GithubCommit,
  GithubIssue,
  GithubComment,
  GithubPullRequest,
  GithubWorkflow,
  GithubWorkflowRun,
  GithubRelease,
  GithubTag,
} from './github.types';
import { encryptToken, decryptToken } from './utils/github-crypto.util';
import { oauthStateStore } from './utils/oauth-state.store';
import { GithubClient } from './github.client';
import { CreateBranchDto } from './dto/create-branch.dto';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { DeleteFileDto } from './dto/delete-file.dto';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { CreatePullRequestDto } from './dto/create-pr.dto';
import { MergePullRequestDto } from './dto/merge-pr.dto';
import { WorkflowDispatchDto } from './dto/workflow-dispatch.dto';

interface StoredGithubConnection {
  userId: string;
  githubUserId: string;
  githubLogin: string;
  githubName: string | null;
  githubAvatarUrl: string;
  githubEmail: string | null;
  accessTokenEncrypted: string;
  refreshTokenEncrypted?: string | null;
  tokenExpiresAt?: string | null;
  refreshTokenExpiresAt?: string | null;
  connectedAt: string;
  updatedAt: string;
}

import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);
  private readonly localStorePath: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {
    // Local encrypted file fallback to ensure multi-user isolation works even when database is offline
    const dataDir = path.resolve(process.cwd(), '.caelum_data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (err: any) {
        this.logger.warn(`Could not create data directory: ${err.message}`);
      }
    }
    this.localStorePath = path.join(dataDir, 'github_connections.enc.json');
  }

  // =========================================================================
  // PERSISTENCE & MULTI-USER ISOLATION LAYER
  // =========================================================================

  private readLocalStore(): Record<string, StoredGithubConnection> {
    try {
      if (fs.existsSync(this.localStorePath)) {
        const raw = fs.readFileSync(this.localStorePath, 'utf8');
        return JSON.parse(raw);
      }
    } catch (err: any) {
      this.logger.warn(`Failed to read local github store: ${err.message}`);
    }
    return {};
  }

  private writeLocalStore(store: Record<string, StoredGithubConnection>): void {
    try {
      fs.writeFileSync(this.localStorePath, JSON.stringify(store, null, 2), 'utf8');
    } catch (err: any) {
      this.logger.warn(`Failed to write local github store: ${err.message}`);
    }
  }

  private async getConnection(userId: string): Promise<StoredGithubConnection | null> {
    // 1. Try Prisma first if available
    try {
      const record = await (this.prisma as any).githubConnection?.findUnique({
        where: { userId },
      });
      if (record) {
        return {
          userId: record.userId,
          githubUserId: record.githubUserId,
          githubLogin: record.githubLogin,
          githubName: record.githubName,
          githubAvatarUrl: record.githubAvatarUrl,
          githubEmail: record.githubEmail,
          accessTokenEncrypted: record.accessTokenEncrypted,
          refreshTokenEncrypted: record.refreshTokenEncrypted,
          tokenExpiresAt: record.tokenExpiresAt ? record.tokenExpiresAt.toISOString() : null,
          refreshTokenExpiresAt: record.refreshTokenExpiresAt ? record.refreshTokenExpiresAt.toISOString() : null,
          connectedAt: record.connectedAt.toISOString(),
          updatedAt: record.updatedAt.toISOString(),
        };
      }
    } catch {
      // Prisma offline or model not created yet, fall through to local encrypted store
    }

    // 2. Read from local encrypted store
    const localStore = this.readLocalStore();
    return localStore[userId] || null;
  }

  private async saveConnection(conn: StoredGithubConnection): Promise<void> {
    // 1. Save to local encrypted store
    const localStore = this.readLocalStore();
    localStore[conn.userId] = conn;
    this.writeLocalStore(localStore);

    // 2. Try Prisma if available
    try {
      await (this.prisma as any).githubConnection?.upsert({
        where: { userId: conn.userId },
        update: {
          githubUserId: conn.githubUserId,
          githubLogin: conn.githubLogin,
          githubName: conn.githubName,
          githubAvatarUrl: conn.githubAvatarUrl,
          githubEmail: conn.githubEmail,
          accessTokenEncrypted: conn.accessTokenEncrypted,
          refreshTokenEncrypted: conn.refreshTokenEncrypted,
          tokenExpiresAt: conn.tokenExpiresAt ? new Date(conn.tokenExpiresAt) : null,
          refreshTokenExpiresAt: conn.refreshTokenExpiresAt ? new Date(conn.refreshTokenExpiresAt) : null,
          updatedAt: new Date(),
        },
        create: {
          userId: conn.userId,
          githubUserId: conn.githubUserId,
          githubLogin: conn.githubLogin,
          githubName: conn.githubName,
          githubAvatarUrl: conn.githubAvatarUrl,
          githubEmail: conn.githubEmail,
          accessTokenEncrypted: conn.accessTokenEncrypted,
          refreshTokenEncrypted: conn.refreshTokenEncrypted,
          tokenExpiresAt: conn.tokenExpiresAt ? new Date(conn.tokenExpiresAt) : null,
          refreshTokenExpiresAt: conn.refreshTokenExpiresAt ? new Date(conn.refreshTokenExpiresAt) : null,
        },
      });
    } catch {
      // Prisma offline or table not present; safely ignored as local store has it
    }
  }

  private async removeConnection(userId: string): Promise<void> {
    const localStore = this.readLocalStore();
    if (localStore[userId]) {
      delete localStore[userId];
      this.writeLocalStore(localStore);
    }

    try {
      await (this.prisma as any).githubConnection?.delete({
        where: { userId },
      });
    } catch {
      // Ignore if not present
    }
  }

  // =========================================================================
  // GITHUB CLIENT RESOLUTION & TOKEN REFRESH
  // =========================================================================

  private async getClientForUser(userId: string): Promise<GithubClient> {
    const conn = await this.getConnection(userId);
    if (!conn) {
      throw new UnauthorizedException('No GitHub account connected for current session. Please connect your GitHub account.');
    }

    // Check expiration and refresh if necessary
    let accessToken: string;
    try {
      accessToken = decryptToken(conn.accessTokenEncrypted);
    } catch (err: any) {
      await this.removeConnection(userId);
      throw new UnauthorizedException('Stored GitHub authorization was corrupted. Please reconnect your account.');
    }

    if (conn.tokenExpiresAt && new Date(conn.tokenExpiresAt).getTime() < Date.now()) {
      if (conn.refreshTokenEncrypted) {
        try {
          const refreshToken = decryptToken(conn.refreshTokenEncrypted);
          const refreshed = await this.refreshAccessToken(userId, refreshToken);
          return new GithubClient(refreshed);
        } catch {
          await this.removeConnection(userId);
          throw new UnauthorizedException('GitHub authorization expired and automatic refresh failed. Please reconnect your account.');
        }
      } else {
        await this.removeConnection(userId);
        throw new UnauthorizedException('GitHub authorization expired. Please reconnect your account.');
      }
    }

    return new GithubClient(accessToken);
  }

  private async refreshAccessToken(userId: string, refreshToken: string): Promise<string> {
    const clientId = this.getClientId();
    const clientSecret = this.getClientSecret();

    if (!clientId || !clientSecret) {
      throw new Error('Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET in backend configuration');
    }

    const res = await fetch(GITHUB_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error_description || 'Failed to refresh token');
    }

    const newAccessToken = data.access_token;
    const newRefreshToken = data.refresh_token || refreshToken;
    const expiresIn = data.expires_in ? data.expires_in * 1000 : null;
    const refreshExpiresIn = data.refresh_token_expires_in ? data.refresh_token_expires_in * 1000 : null;

    const currentConn = await this.getConnection(userId);
    if (currentConn) {
      currentConn.accessTokenEncrypted = encryptToken(newAccessToken);
      currentConn.refreshTokenEncrypted = encryptToken(newRefreshToken);
      currentConn.tokenExpiresAt = expiresIn ? new Date(Date.now() + expiresIn).toISOString() : null;
      currentConn.refreshTokenExpiresAt = refreshExpiresIn ? new Date(Date.now() + refreshExpiresIn).toISOString() : null;
      currentConn.updatedAt = new Date().toISOString();
      await this.saveConnection(currentConn);
    }

    return newAccessToken;
  }

  // =========================================================================
  // CONFIGURATION HELPERS
  // =========================================================================

  getClientId(): string | null {
    const val = this.configService.get<string>('GITHUB_CLIENT_ID') || process.env.GITHUB_CLIENT_ID;
    if (!val) return null;
    const clean = val.trim().replace(/^["']|["']$/g, '');
    return clean.length > 0 ? clean : null;
  }

  getClientSecret(): string | null {
    const val = this.configService.get<string>('GITHUB_CLIENT_SECRET') || process.env.GITHUB_CLIENT_SECRET;
    if (!val) return null;
    const clean = val.trim().replace(/^["']|["']$/g, '');
    return clean.length > 0 ? clean : null;
  }

  getCallbackUrl(): string {
    const val = this.configService.get<string>('GITHUB_CALLBACK_URL') || process.env.GITHUB_CALLBACK_URL;
    if (!val) return 'http://localhost:4000/github/callback';
    return val.trim().replace(/^["']|["']$/g, '');
  }

  getConfig(): { configured: boolean; clientId: string | null; callbackUrl: string; error?: string } {
    const clientId = this.getClientId();
    const clientSecret = this.getClientSecret();
    const callbackUrl = this.getCallbackUrl();

    if (!clientId || !clientSecret) {
      const missing: string[] = [];
      if (!clientId) missing.push('GITHUB_CLIENT_ID');
      if (!clientSecret) missing.push('GITHUB_CLIENT_SECRET');
      return {
        configured: false,
        clientId: null,
        callbackUrl,
        error: `GitHub OAuth is not configured on the backend. Missing environment variable(s): ${missing.join(', ')} in backend/.env`,
      };
    }

    return {
      configured: true,
      clientId,
      callbackUrl,
    };
  }

  // =========================================================================
  // OAUTH FLOW
  // =========================================================================

  getAuthUrl(userId?: string): { url: string; state: string } {
    const config = this.getConfig();
    if (!config.configured) {
      this.logger.warn(`[getAuthUrl] Aborted: ${config.error}`);
      throw new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          error: 'GITHUB_NOT_CONFIGURED',
          message: config.error || 'GitHub App credentials are not configured in backend/.env',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const sessionUserId = userId || `anon_${crypto.randomUUID()}`;
    const state = oauthStateStore.generateState(sessionUserId);
    const params = new URLSearchParams({
      client_id: config.clientId!,
      redirect_uri: config.callbackUrl,
      scope: GITHUB_DEFAULT_SCOPES,
      state,
    });

    this.logger.log(`[getAuthUrl] Generated GitHub authorization URL for session ${sessionUserId}`);

    return {
      url: `${GITHUB_OAUTH_URL}?${params.toString()}`,
      state,
    };
  }

  async handleCallback(code: string, state: string): Promise<{ success: boolean; user: GithubUserProfile; redirectUrl: string }> {
    if (!code || !state) {
      throw new BadRequestException('Authorization code and state parameter are both required');
    }

    const stateUserId = oauthStateStore.validateAndConsumeState(state);
    if (!stateUserId) {
      this.logger.warn('[handleCallback] Invalid or expired OAuth state parameter received');
      throw new UnauthorizedException('Invalid or expired OAuth state parameter. Please initiate authorization again from CaelumOS.');
    }

    const clientId = this.getClientId();
    const clientSecret = this.getClientSecret();

    if (!clientId || !clientSecret) {
      this.logger.error('[handleCallback] Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET in backend configuration');
      throw new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          error: 'GITHUB_NOT_CONFIGURED',
          message: 'GitHub OAuth is not configured. Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET in backend/.env',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const callbackUrl = this.getCallbackUrl();

    this.logger.log(`[handleCallback] Exchanging OAuth authorization code for session ${stateUserId}...`);

    // 1. Exchange code for access token
    const tokenRes = await fetch(GITHUB_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: callbackUrl,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || tokenData.error) {
      const errMsg = tokenData.error_description || tokenData.error || 'Token exchange failed';
      this.logger.error(`[handleCallback] GitHub token exchange failed: ${errMsg}`);
      throw new BadRequestException(`GitHub token exchange failed: ${errMsg}`);
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in ? tokenData.expires_in * 1000 : null;
    const refreshExpiresIn = tokenData.refresh_token_expires_in ? tokenData.refresh_token_expires_in * 1000 : null;

    // 2. Fetch authenticated user profile from GitHub
    this.logger.log(`[handleCallback] Token exchange successful for session ${stateUserId}. Fetching GitHub profile...`);
    const client = new GithubClient(accessToken);
    const rawUser = await client.get<any>('/user');

    const userProfile: GithubUserProfile = {
      id: rawUser.id,
      login: rawUser.login,
      name: rawUser.name || null,
      avatarUrl: rawUser.avatar_url,
      email: rawUser.email || null,
      bio: rawUser.bio || null,
      company: rawUser.company || null,
      location: rawUser.location || null,
      publicRepos: rawUser.public_repos,
      followers: rawUser.followers,
      following: rawUser.following,
      htmlUrl: rawUser.html_url,
    };

    // 3. User-specific identity isolation: ensure connection is scoped uniquely to this GitHub user
    const effectiveUserId = (!stateUserId || stateUserId.startsWith('anon_') || stateUserId === 'dev-user-uuid-1234')
      ? `gh_user_${rawUser.id}`
      : stateUserId;

    const nowIso = new Date().toISOString();
    const connection: StoredGithubConnection = {
      userId: effectiveUserId,
      githubUserId: String(rawUser.id),
      githubLogin: rawUser.login,
      githubName: rawUser.name || null,
      githubAvatarUrl: rawUser.avatar_url,
      githubEmail: rawUser.email || null,
      accessTokenEncrypted: encryptToken(accessToken),
      refreshTokenEncrypted: refreshToken ? encryptToken(refreshToken) : null,
      tokenExpiresAt: expiresIn ? new Date(Date.now() + expiresIn).toISOString() : null,
      refreshTokenExpiresAt: refreshExpiresIn ? new Date(Date.now() + refreshExpiresIn).toISOString() : null,
      connectedAt: nowIso,
      updatedAt: nowIso,
    };

    await this.saveConnection(connection);
    this.logger.log(`[handleCallback] GitHub account @${rawUser.login} successfully connected and stored for isolated user ${effectiveUserId}`);

    // Issue CaelumOS JWT session token bound exclusively to this authenticated user
    const jwtSecret = this.configService.get<string>('JWT_SECRET') || 'caelum_jwt_super_secret_signing_key_2026_prod';
    const sessionToken = this.jwtService.sign(
      { sub: effectiveUserId, email: rawUser.email || `${rawUser.login}@github.com`, role: 'USER' },
      { secret: jwtSecret, expiresIn: '7d' },
    );

    const frontendBaseUrl = this.configService.get<string>('FRONTEND_URL') || process.env.FRONTEND_URL || 'http://localhost:3000';
    return {
      success: true,
      user: userProfile,
      redirectUrl: `${frontendBaseUrl}/github?connected=true&token=${encodeURIComponent(sessionToken)}`,
    };
  }

  async getStatus(userId: string): Promise<GithubConnectionStatus & { configured: boolean; configError?: string }> {
    const config = this.getConfig();
    const conn = await this.getConnection(userId);
    if (!conn) {
      return {
        connected: false,
        configured: config.configured,
        configError: config.error,
      };
    }

    try {
      // Validate that token works
      const client = await this.getClientForUser(userId);
      const rawUser = await client.get<any>('/user');
      return {
        connected: true,
        configured: config.configured,
        user: {
          id: rawUser.id,
          login: rawUser.login,
          name: rawUser.name || null,
          avatarUrl: rawUser.avatar_url,
          email: rawUser.email || null,
          bio: rawUser.bio || null,
          company: rawUser.company || null,
          location: rawUser.location || null,
          publicRepos: rawUser.public_repos,
          followers: rawUser.followers,
          following: rawUser.following,
          htmlUrl: rawUser.html_url,
        },
      };
    } catch (err: any) {
      this.logger.warn(`[getStatus] Failed to validate GitHub token for user ${userId}: ${err.message}`);
      return {
        connected: false,
        configured: config.configured,
        error: err.message || 'GitHub connection validation failed',
      };
    }
  }

  async getCurrentUser(userId: string): Promise<GithubUserProfile> {
    const client = await this.getClientForUser(userId);
    const rawUser = await client.get<any>('/user');
    return {
      id: rawUser.id,
      login: rawUser.login,
      name: rawUser.name || null,
      avatarUrl: rawUser.avatar_url,
      email: rawUser.email || null,
      bio: rawUser.bio || null,
      company: rawUser.company || null,
      location: rawUser.location || null,
      publicRepos: rawUser.public_repos,
      followers: rawUser.followers,
      following: rawUser.following,
      htmlUrl: rawUser.html_url,
    };
  }

  async disconnect(userId: string): Promise<{ success: boolean; message: string }> {
    await this.removeConnection(userId);
    this.logger.log(`User ${userId} disconnected GitHub account`);
    return {
      success: true,
      message: 'GitHub connection disconnected successfully',
    };
  }

  getLocalAccountInfo(): { available: boolean; username?: string } {
    try {
      const out = execSync('git credential fill', {
        input: 'protocol=https\nhost=github.com\n\n',
        encoding: 'utf8',
        timeout: 2500,
        stdio: ['pipe', 'pipe', 'ignore'],
      });
      const lines = out.split('\n');
      const pass = lines.find((l) => l.startsWith('password='))?.split('=')[1]?.trim();
      const user = lines.find((l) => l.startsWith('username='))?.split('=')[1]?.trim();
      if (pass && pass.startsWith('gh')) {
        return { available: true, username: user || 'KarthickHullur' };
      }
    } catch {
      // Local git credentials not available or git command failed
    }
    return { available: false };
  }

  async connectLocal(): Promise<{ success: boolean; token: string; user: GithubUserProfile }> {
    try {
      const out = execSync('git credential fill', {
        input: 'protocol=https\nhost=github.com\n\n',
        encoding: 'utf8',
        timeout: 3000,
        stdio: ['pipe', 'pipe', 'ignore'],
      });
      const lines = out.split('\n');
      const pass = lines.find((l) => l.startsWith('password='))?.split('=')[1]?.trim();
      if (!pass) {
        throw new BadRequestException('No local GitHub credential token found in Git Credential Manager');
      }
      return await this.connectWithToken(pass);
    } catch (err: any) {
      if (err instanceof BadRequestException || err instanceof UnauthorizedException) throw err;
      throw new BadRequestException(`Failed to connect local GitHub credential: ${err.message}`);
    }
  }

  async connectWithToken(token: string): Promise<{ success: boolean; token: string; user: GithubUserProfile }> {
    const cleanToken = token ? token.trim().replace(/^["']|["']$/g, '') : '';
    if (!cleanToken) {
      throw new BadRequestException('GitHub token is required');
    }

    this.logger.log('Validating GitHub token and retrieving user profile...');
    const client = new GithubClient(cleanToken);
    let rawUser: any;
    try {
      rawUser = await client.get<any>('/user');
    } catch (err: any) {
      throw new UnauthorizedException(`Invalid GitHub token or authentication failed: ${err.message}`);
    }

    const userProfile: GithubUserProfile = {
      id: rawUser.id,
      login: rawUser.login,
      name: rawUser.name || null,
      avatarUrl: rawUser.avatar_url,
      email: rawUser.email || null,
      bio: rawUser.bio || null,
      company: rawUser.company || null,
      location: rawUser.location || null,
      publicRepos: rawUser.public_repos,
      followers: rawUser.followers,
      following: rawUser.following,
      htmlUrl: rawUser.html_url,
    };

    const effectiveUserId = `gh_user_${rawUser.id}`;
    const nowIso = new Date().toISOString();
    const connection: StoredGithubConnection = {
      userId: effectiveUserId,
      githubUserId: String(rawUser.id),
      githubLogin: rawUser.login,
      githubName: rawUser.name || null,
      githubAvatarUrl: rawUser.avatar_url,
      githubEmail: rawUser.email || null,
      accessTokenEncrypted: encryptToken(cleanToken),
      connectedAt: nowIso,
      updatedAt: nowIso,
    };

    await this.saveConnection(connection);
    this.logger.log(`GitHub user @${rawUser.login} successfully connected via token and stored for isolated user ${effectiveUserId}`);

    const jwtSecret = this.configService.get<string>('JWT_SECRET') || 'caelum_jwt_super_secret_signing_key_2026_prod';
    const sessionToken = this.jwtService.sign(
      { sub: effectiveUserId, email: rawUser.email || `${rawUser.login}@github.com`, role: 'USER' },
      { secret: jwtSecret, expiresIn: '7d' },
    );

    return {
      success: true,
      token: sessionToken,
      user: userProfile,
    };
  }

  // =========================================================================
  // REPOSITORIES
  // =========================================================================

  async getRepositories(
    userId: string,
    options: {
      page?: number;
      per_page?: number;
      sort?: 'created' | 'updated' | 'pushed' | 'full_name';
      direction?: 'asc' | 'desc';
      type?: 'all' | 'owner' | 'public' | 'private' | 'member';
      q?: string;
    } = {},
  ): Promise<GithubRepository[]> {
    const client = await this.getClientForUser(userId);
    const page = options.page || 1;
    const perPage = Math.min(options.per_page || 30, 100);

    let rawRepos: any[];
    if (options.q && options.q.trim()) {
      // Use search API
      const searchRes = await client.get<any>(
        `/search/repositories?q=${encodeURIComponent(options.q)}&page=${page}&per_page=${perPage}&sort=${options.sort || 'updated'}&order=${options.direction || 'desc'}`,
      );
      rawRepos = searchRes.items || [];
    } else {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
        sort: options.sort || 'updated',
        direction: options.direction || 'desc',
        affiliation: 'owner,collaborator,organization_member',
      });
      if (options.type) {
        params.set('type', options.type);
      }
      rawRepos = await client.get<any[]>(`/user/repos?${params.toString()}`);
    }

    return rawRepos.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      private: repo.private,
      description: repo.description || null,
      defaultBranch: repo.default_branch || 'main',
      htmlUrl: repo.html_url,
      cloneUrl: repo.clone_url,
      sshUrl: repo.ssh_url,
      language: repo.language || null,
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      watchers: repo.watchers_count || 0,
      openIssues: repo.open_issues_count || 0,
      updatedAt: repo.updated_at,
      owner: {
        login: repo.owner.login,
        avatarUrl: repo.owner.avatar_url,
      },
      permissions: repo.permissions
        ? {
            admin: !!repo.permissions.admin,
            push: !!repo.permissions.push,
            pull: !!repo.permissions.pull,
          }
        : undefined,
    }));
  }

  async getRepository(userId: string, owner: string, repo: string): Promise<GithubRepository & { topics: string[]; openIssuesCount: number }> {
    const client = await this.getClientForUser(userId);
    const data = await client.get<any>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);

    return {
      id: data.id,
      name: data.name,
      fullName: data.full_name,
      private: data.private,
      description: data.description || null,
      defaultBranch: data.default_branch || 'main',
      htmlUrl: data.html_url,
      cloneUrl: data.clone_url,
      sshUrl: data.ssh_url,
      language: data.language || null,
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      watchers: data.watchers_count || 0,
      openIssues: data.open_issues_count || 0,
      openIssuesCount: data.open_issues_count || 0,
      updatedAt: data.updated_at,
      owner: {
        login: data.owner.login,
        avatarUrl: data.owner.avatar_url,
      },
      permissions: data.permissions
        ? {
            admin: !!data.permissions.admin,
            push: !!data.permissions.push,
            pull: !!data.permissions.pull,
          }
        : undefined,
      topics: data.topics || [],
    };
  }

  // =========================================================================
  // BRANCHES
  // =========================================================================

  async getBranches(
    userId: string,
    owner: string,
    repo: string,
    page = 1,
    perPage = 30,
  ): Promise<GithubBranch[]> {
    const client = await this.getClientForUser(userId);
    const rawBranches = await client.get<any[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/branches?page=${page}&per_page=${perPage}`,
    );

    return rawBranches.map(b => ({
      name: b.name,
      commitSha: b.commit.sha,
      isDefault: false,
      protected: !!b.protected,
    }));
  }

  async createBranch(
    userId: string,
    owner: string,
    repo: string,
    dto: CreateBranchDto,
  ): Promise<GithubBranch> {
    const client = await this.getClientForUser(userId);

    // 1. Resolve source branch
    let sourceBranch = dto.fromBranch;
    if (!sourceBranch) {
      const repoInfo = await this.getRepository(userId, owner, repo);
      sourceBranch = repoInfo.defaultBranch;
    }

    // 2. Fetch commit SHA of source branch
    const sourceRef = await client.get<any>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/ref/heads/${encodeURIComponent(sourceBranch)}`,
    );

    const sourceSha = sourceRef?.object?.sha;
    if (!sourceSha) {
      throw new NotFoundException(`Source branch '${sourceBranch}' not found.`);
    }

    // 3. Create the new reference
    const createdRef = await client.post<any>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/refs`,
      {
        ref: `refs/heads/${dto.name}`,
        sha: sourceSha,
      },
    );

    return {
      name: dto.name,
      commitSha: createdRef.object.sha,
      isDefault: false,
      protected: false,
    };
  }

  // =========================================================================
  // FILE TREE & EXPLORER
  // =========================================================================

  async getTree(
    userId: string,
    owner: string,
    repo: string,
    branch?: string,
    folderPath?: string,
  ): Promise<GithubTreeItem[]> {
    const client = await this.getClientForUser(userId);
    const sanitizedPath = (folderPath || '').replace(/^\/+/, '');
    const query = branch ? `?ref=${encodeURIComponent(branch)}` : '';

    const pathPart = sanitizedPath ? `/${encodeURIComponent(sanitizedPath)}` : '';
    const raw = await client.get<any>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents${pathPart}${query}`,
    );

    const items = Array.isArray(raw) ? raw : [raw];
    return items.map(item => ({
      name: item.name,
      path: item.path,
      type: item.type === 'dir' ? 'dir' : item.type === 'file' ? 'file' : 'submodule',
      size: item.size,
      sha: item.sha,
      url: item.html_url,
    }));
  }

  async getFile(
    userId: string,
    owner: string,
    repo: string,
    filePath: string,
    branch?: string,
  ): Promise<GithubFileContent> {
    const client = await this.getClientForUser(userId);
    const sanitizedPath = filePath.replace(/^\/+/, '');
    const query = branch ? `?ref=${encodeURIComponent(branch)}` : '';

    const raw = await client.get<any>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(sanitizedPath)}${query}`,
    );

    if (raw.type !== 'file') {
      throw new BadRequestException(`Requested path '${filePath}' is a directory, not a file.`);
    }

    let decodedContent = '';
    let isBinary = false;

    if (raw.encoding === 'base64' && raw.content) {
      const buffer = Buffer.from(raw.content, 'base64');
      // Simple binary check: look for null byte in first 512 bytes
      const sample = buffer.subarray(0, 512);
      if (sample.includes(0x00)) {
        isBinary = true;
        decodedContent = '[Binary file cannot be displayed]';
      } else {
        decodedContent = buffer.toString('utf8');
      }
    }

    return {
      path: raw.path,
      name: raw.name,
      sha: raw.sha,
      size: raw.size,
      encoding: raw.encoding || 'utf-8',
      content: decodedContent,
      isBinary,
      branch: branch || 'default',
      downloadUrl: raw.download_url,
    };
  }

  async createFile(
    userId: string,
    owner: string,
    repo: string,
    dto: CreateFileDto,
  ): Promise<{ commitSha: string; commitUrl: string; path: string; branch: string; sha: string }> {
    const client = await this.getClientForUser(userId);
    const sanitizedPath = dto.path.replace(/^\/+/, '');
    const base64Content = Buffer.from(dto.content || '', 'utf8').toString('base64');

    const body: any = {
      message: dto.message,
      content: base64Content,
    };
    if (dto.branch) {
      body.branch = dto.branch;
    }

    const res = await client.put<any>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(sanitizedPath)}`,
      body,
    );

    return {
      commitSha: res.commit.sha,
      commitUrl: res.commit.html_url,
      path: res.content.path,
      branch: dto.branch || 'default',
      sha: res.content.sha,
    };
  }

  async updateFile(
    userId: string,
    owner: string,
    repo: string,
    dto: UpdateFileDto,
  ): Promise<{ commitSha: string; commitUrl: string; path: string; branch: string; sha: string }> {
    const client = await this.getClientForUser(userId);
    const sanitizedPath = dto.path.replace(/^\/+/, '');
    const base64Content = Buffer.from(dto.content || '', 'utf8').toString('base64');

    const body: any = {
      message: dto.message,
      content: base64Content,
      sha: dto.sha,
    };
    if (dto.branch) {
      body.branch = dto.branch;
    }

    const res = await client.put<any>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(sanitizedPath)}`,
      body,
    );

    return {
      commitSha: res.commit.sha,
      commitUrl: res.commit.html_url,
      path: res.content.path,
      branch: dto.branch || 'default',
      sha: res.content.sha,
    };
  }

  async deleteFile(
    userId: string,
    owner: string,
    repo: string,
    dto: DeleteFileDto,
  ): Promise<{ commitSha: string; commitUrl: string; path: string }> {
    const client = await this.getClientForUser(userId);
    const sanitizedPath = dto.path.replace(/^\/+/, '');

    const body: any = {
      message: dto.message,
      sha: dto.sha,
    };
    if (dto.branch) {
      body.branch = dto.branch;
    }

    const res = await client.delete<any>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(sanitizedPath)}`,
      body,
    );

    return {
      commitSha: res.commit.sha,
      commitUrl: res.commit.html_url,
      path: sanitizedPath,
    };
  }

  // =========================================================================
  // COMMITS
  // =========================================================================

  async getCommits(
    userId: string,
    owner: string,
    repo: string,
    branch?: string,
    pathParam?: string,
    page = 1,
    perPage = 30,
  ): Promise<GithubCommit[]> {
    const client = await this.getClientForUser(userId);
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });
    if (branch) params.set('sha', branch);
    if (pathParam) params.set('path', pathParam);

    const rawCommits = await client.get<any[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?${params.toString()}`,
    );

    return rawCommits.map(c => ({
      sha: c.sha,
      shortSha: c.sha.substring(0, 7),
      message: c.commit.message,
      authorName: c.commit.author?.name || 'Unknown',
      authorEmail: c.commit.author?.email || '',
      authorAvatar: c.author?.avatar_url,
      date: c.commit.author?.date || '',
      url: c.html_url,
    }));
  }

  async getCommit(
    userId: string,
    owner: string,
    repo: string,
    sha: string,
  ): Promise<GithubCommit> {
    const client = await this.getClientForUser(userId);
    const c = await client.get<any>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(sha)}`,
    );

    return {
      sha: c.sha,
      shortSha: c.sha.substring(0, 7),
      message: c.commit.message,
      authorName: c.commit.author?.name || 'Unknown',
      authorEmail: c.commit.author?.email || '',
      authorAvatar: c.author?.avatar_url,
      date: c.commit.author?.date || '',
      url: c.html_url,
      stats: c.stats
        ? {
            additions: c.stats.additions,
            deletions: c.stats.deletions,
            total: c.stats.total,
          }
        : undefined,
      files: (c.files || []).map((f: any) => ({
        filename: f.filename,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions,
        patch: f.patch,
      })),
    };
  }

  // =========================================================================
  // ISSUES
  // =========================================================================

  async getIssues(
    userId: string,
    owner: string,
    repo: string,
    state: 'open' | 'closed' | 'all' = 'open',
    page = 1,
    perPage = 30,
    labels?: string,
    assignee?: string,
  ): Promise<GithubIssue[]> {
    const client = await this.getClientForUser(userId);
    const params = new URLSearchParams({
      state,
      page: String(page),
      per_page: String(perPage),
    });
    if (labels) params.set('labels', labels);
    if (assignee) params.set('assignee', assignee);

    const raw = await client.get<any[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues?${params.toString()}`,
    );

    // GitHub returns PRs in issues endpoint unless filtered
    const issuesOnly = raw.filter(item => !item.pull_request);

    return issuesOnly.map(item => ({
      id: item.id,
      number: item.number,
      title: item.title,
      body: item.body || null,
      state: item.state,
      author: {
        login: item.user.login,
        avatarUrl: item.user.avatar_url,
      },
      labels: (item.labels || []).map((l: any) => ({
        id: l.id,
        name: l.name,
        color: l.color,
        description: l.description,
      })),
      assignees: (item.assignees || []).map((a: any) => ({
        login: a.login,
        avatarUrl: a.avatar_url,
      })),
      commentsCount: item.comments || 0,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      closedAt: item.closed_at,
      htmlUrl: item.html_url,
    }));
  }

  async createIssue(
    userId: string,
    owner: string,
    repo: string,
    dto: CreateIssueDto,
  ): Promise<GithubIssue> {
    const client = await this.getClientForUser(userId);
    const res = await client.post<any>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues`,
      {
        title: dto.title,
        body: dto.body,
        labels: dto.labels,
        assignees: dto.assignees,
      },
    );

    return {
      id: res.id,
      number: res.number,
      title: res.title,
      body: res.body || null,
      state: res.state,
      author: {
        login: res.user.login,
        avatarUrl: res.user.avatar_url,
      },
      labels: (res.labels || []).map((l: any) => ({
        id: l.id,
        name: l.name,
        color: l.color,
        description: l.description,
      })),
      assignees: (res.assignees || []).map((a: any) => ({
        login: a.login,
        avatarUrl: a.avatar_url,
      })),
      commentsCount: 0,
      createdAt: res.created_at,
      updatedAt: res.updated_at,
      closedAt: res.closed_at,
      htmlUrl: res.html_url,
    };
  }

  async updateIssue(
    userId: string,
    owner: string,
    repo: string,
    issueNumber: number,
    dto: UpdateIssueDto,
  ): Promise<GithubIssue> {
    const client = await this.getClientForUser(userId);
    const res = await client.patch<any>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${issueNumber}`,
      {
        title: dto.title,
        body: dto.body,
        state: dto.state,
        labels: dto.labels,
        assignees: dto.assignees,
      },
    );

    return {
      id: res.id,
      number: res.number,
      title: res.title,
      body: res.body || null,
      state: res.state,
      author: {
        login: res.user.login,
        avatarUrl: res.user.avatar_url,
      },
      labels: (res.labels || []).map((l: any) => ({
        id: l.id,
        name: l.name,
        color: l.color,
        description: l.description,
      })),
      assignees: (res.assignees || []).map((a: any) => ({
        login: a.login,
        avatarUrl: a.avatar_url,
      })),
      commentsCount: res.comments || 0,
      createdAt: res.created_at,
      updatedAt: res.updated_at,
      closedAt: res.closed_at,
      htmlUrl: res.html_url,
    };
  }

  async getIssueComments(
    userId: string,
    owner: string,
    repo: string,
    issueNumber: number,
  ): Promise<GithubComment[]> {
    const client = await this.getClientForUser(userId);
    const raw = await client.get<any[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${issueNumber}/comments`,
    );

    return raw.map(c => ({
      id: c.id,
      body: c.body,
      author: {
        login: c.user.login,
        avatarUrl: c.user.avatar_url,
      },
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));
  }

  async createIssueComment(
    userId: string,
    owner: string,
    repo: string,
    issueNumber: number,
    body: string,
  ): Promise<GithubComment> {
    const client = await this.getClientForUser(userId);
    const res = await client.post<any>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${issueNumber}/comments`,
      { body },
    );

    return {
      id: res.id,
      body: res.body,
      author: {
        login: res.user.login,
        avatarUrl: res.user.avatar_url,
      },
      createdAt: res.created_at,
      updatedAt: res.updated_at,
    };
  }

  // =========================================================================
  // PULL REQUESTS
  // =========================================================================

  async getPullRequests(
    userId: string,
    owner: string,
    repo: string,
    state: 'open' | 'closed' | 'all' = 'open',
    base?: string,
    head?: string,
    page = 1,
    perPage = 30,
  ): Promise<GithubPullRequest[]> {
    const client = await this.getClientForUser(userId);
    const params = new URLSearchParams({
      state,
      page: String(page),
      per_page: String(perPage),
    });
    if (base) params.set('base', base);
    if (head) params.set('head', head);

    const raw = await client.get<any[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls?${params.toString()}`,
    );

    return raw.map(pr => ({
      id: pr.id,
      number: pr.number,
      title: pr.title,
      body: pr.body || null,
      state: pr.state,
      draft: !!pr.draft,
      author: {
        login: pr.user.login,
        avatarUrl: pr.user.avatar_url,
      },
      base: pr.base.ref,
      head: pr.head.ref,
      htmlUrl: pr.html_url,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
    }));
  }

  async getPullRequest(
    userId: string,
    owner: string,
    repo: string,
    pullNumber: number,
  ): Promise<GithubPullRequest> {
    const client = await this.getClientForUser(userId);
    const pr = await client.get<any>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${pullNumber}`,
    );

    return {
      id: pr.id,
      number: pr.number,
      title: pr.title,
      body: pr.body || null,
      state: pr.state,
      draft: !!pr.draft,
      mergeable: pr.mergeable,
      merged: pr.merged,
      author: {
        login: pr.user.login,
        avatarUrl: pr.user.avatar_url,
      },
      base: pr.base.ref,
      head: pr.head.ref,
      htmlUrl: pr.html_url,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      commitsCount: pr.commits,
      changedFilesCount: pr.changed_files,
      additions: pr.additions,
      deletions: pr.deletions,
    };
  }

  async createPullRequest(
    userId: string,
    owner: string,
    repo: string,
    dto: CreatePullRequestDto,
  ): Promise<GithubPullRequest> {
    const client = await this.getClientForUser(userId);
    const res = await client.post<any>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls`,
      {
        title: dto.title,
        body: dto.body,
        head: dto.head,
        base: dto.base,
        draft: !!dto.draft,
      },
    );

    return {
      id: res.id,
      number: res.number,
      title: res.title,
      body: res.body || null,
      state: res.state,
      draft: !!res.draft,
      author: {
        login: res.user.login,
        avatarUrl: res.user.avatar_url,
      },
      base: res.base.ref,
      head: res.head.ref,
      htmlUrl: res.html_url,
      createdAt: res.created_at,
      updatedAt: res.updated_at,
    };
  }

  async getPullRequestReviews(
    userId: string,
    owner: string,
    repo: string,
    pullNumber: number,
  ): Promise<any[]> {
    const client = await this.getClientForUser(userId);
    return await client.get<any[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${pullNumber}/reviews`,
    );
  }

  async createPullRequestReview(
    userId: string,
    owner: string,
    repo: string,
    pullNumber: number,
    event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT',
    body?: string,
  ): Promise<any> {
    const client = await this.getClientForUser(userId);
    return await client.post<any>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${pullNumber}/reviews`,
      { event, body: body || '' },
    );
  }

  async mergePullRequest(
    userId: string,
    owner: string,
    repo: string,
    pullNumber: number,
    dto: MergePullRequestDto,
  ): Promise<{ sha: string; merged: boolean; message: string }> {
    const client = await this.getClientForUser(userId);
    const res = await client.put<any>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${pullNumber}/merge`,
      {
        merge_method: dto.mergeMethod || 'merge',
        commit_title: dto.commitTitle,
        commit_message: dto.commitMessage,
      },
    );

    return {
      sha: res.sha,
      merged: res.merged,
      message: res.message,
    };
  }

  // =========================================================================
  // GITHUB ACTIONS
  // =========================================================================

  async getWorkflows(
    userId: string,
    owner: string,
    repo: string,
  ): Promise<GithubWorkflow[]> {
    const client = await this.getClientForUser(userId);
    const res = await client.get<any>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/actions/workflows`,
    );

    return (res.workflows || []).map((w: any) => ({
      id: w.id,
      name: w.name,
      path: w.path,
      state: w.state,
      htmlUrl: w.html_url,
    }));
  }

  async getWorkflowRuns(
    userId: string,
    owner: string,
    repo: string,
    workflowId?: string,
    branch?: string,
    page = 1,
    perPage = 20,
  ): Promise<GithubWorkflowRun[]> {
    const client = await this.getClientForUser(userId);
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });
    if (branch) params.set('branch', branch);

    const endpoint = workflowId
      ? `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/actions/workflows/${encodeURIComponent(workflowId)}/runs?${params.toString()}`
      : `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/actions/runs?${params.toString()}`;

    const res = await client.get<any>(endpoint);

    return (res.workflow_runs || []).map((run: any) => ({
      id: run.id,
      name: run.name,
      workflowId: run.workflow_id,
      headBranch: run.head_branch,
      headSha: run.head_sha,
      status: run.status,
      conclusion: run.conclusion,
      createdAt: run.created_at,
      updatedAt: run.updated_at,
      htmlUrl: run.html_url,
      runNumber: run.run_number,
      event: run.event,
    }));
  }

  async getWorkflowRun(
    userId: string,
    owner: string,
    repo: string,
    runId: number,
  ): Promise<GithubWorkflowRun> {
    const client = await this.getClientForUser(userId);
    const run = await client.get<any>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/actions/runs/${runId}`,
    );

    return {
      id: run.id,
      name: run.name,
      workflowId: run.workflow_id,
      headBranch: run.head_branch,
      headSha: run.head_sha,
      status: run.status,
      conclusion: run.conclusion,
      createdAt: run.created_at,
      updatedAt: run.updated_at,
      htmlUrl: run.html_url,
      runNumber: run.run_number,
      event: run.event,
    };
  }

  async getWorkflowRunLogs(
    userId: string,
    owner: string,
    repo: string,
    runId: number,
  ): Promise<{ logsUrl: string }> {
    // Return direct web link to run logs
    return {
      logsUrl: `https://github.com/${owner}/${repo}/actions/runs/${runId}`,
    };
  }

  async dispatchWorkflow(
    userId: string,
    owner: string,
    repo: string,
    workflowId: string,
    dto: WorkflowDispatchDto,
  ): Promise<{ success: boolean; message: string }> {
    const client = await this.getClientForUser(userId);
    await client.post<any>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/actions/workflows/${encodeURIComponent(workflowId)}/dispatches`,
      {
        ref: dto.ref,
        inputs: dto.inputs || {},
      },
    );

    return {
      success: true,
      message: `Workflow '${workflowId}' dispatched successfully on ref '${dto.ref}'`,
    };
  }

  // =========================================================================
  // RELEASES & TAGS
  // =========================================================================

  async getReleases(
    userId: string,
    owner: string,
    repo: string,
  ): Promise<GithubRelease[]> {
    const client = await this.getClientForUser(userId);
    const res = await client.get<any[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases`,
    );

    return (res || []).map(r => ({
      id: r.id,
      tagName: r.tag_name,
      name: r.name,
      body: r.body,
      draft: r.draft,
      prerelease: r.prerelease,
      createdAt: r.created_at,
      publishedAt: r.published_at,
      htmlUrl: r.html_url,
    }));
  }

  async getTags(
    userId: string,
    owner: string,
    repo: string,
  ): Promise<GithubTag[]> {
    const client = await this.getClientForUser(userId);
    const res = await client.get<any[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/tags`,
    );

    return (res || []).map(t => ({
      name: t.name,
      commitSha: t.commit?.sha || '',
    }));
  }

  // =========================================================================
  // WEBHOOK INFRASTRUCTURE
  // =========================================================================

  handleWebhook(signature: string, payload: any): { received: boolean } {
    const webhookSecret = this.configService.get<string>('GITHUB_WEBHOOK_SECRET');
    if (!webhookSecret) {
      this.logger.warn('Received GitHub webhook but GITHUB_WEBHOOK_SECRET is not configured');
      return { received: false };
    }

    if (!signature) {
      throw new UnauthorizedException('Missing X-Hub-Signature-256 header');
    }

    const hmac = crypto.createHmac('sha256', webhookSecret);
    const calculatedSignature = `sha256=${hmac.update(JSON.stringify(payload)).digest('hex')}`;

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(calculatedSignature))) {
      throw new ForbiddenException('Invalid GitHub webhook signature');
    }

    this.logger.log(`Verified GitHub webhook event: ${payload.action || 'payload'}`);
    return { received: true };
  }
}
