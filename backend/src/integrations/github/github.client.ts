import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { GITHUB_API_URL, GITHUB_ERROR_MESSAGES } from './github.constants';

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

export class GithubClient {
  private lastRateLimit: RateLimitInfo = { limit: 5000, remaining: 5000, reset: 0 };

  constructor(private readonly accessToken: string) {}

  public getRateLimitInfo(): RateLimitInfo {
    return this.lastRateLimit;
  }

  private getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'CaelumOS-CloudEngine',
      ...customHeaders,
    };
  }

  private updateRateLimit(res: Response): void {
    const limit = res.headers.get('x-ratelimit-limit');
    const remaining = res.headers.get('x-ratelimit-remaining');
    const reset = res.headers.get('x-ratelimit-reset');

    if (limit && remaining && reset) {
      this.lastRateLimit = {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        reset: parseInt(reset, 10),
      };
    }
  }

  private async handleError(res: Response, endpoint: string): Promise<never> {
    this.updateRateLimit(res);
    let githubMessage = '';
    try {
      const data = await res.json();
      githubMessage = data?.message || '';
    } catch {
      // Body may not be JSON
    }

    const defaultMsg = GITHUB_ERROR_MESSAGES[res.status] || `GitHub request failed with status ${res.status}`;
    const detailedMsg = githubMessage ? `${defaultMsg} (${githubMessage})` : defaultMsg;

    switch (res.status) {
      case HttpStatus.UNAUTHORIZED:
        throw new UnauthorizedException(detailedMsg);
      case HttpStatus.FORBIDDEN:
        throw new ForbiddenException(detailedMsg);
      case HttpStatus.NOT_FOUND:
        throw new NotFoundException(detailedMsg);
      case HttpStatus.CONFLICT:
        throw new ConflictException(detailedMsg);
      case HttpStatus.UNPROCESSABLE_ENTITY:
        throw new BadRequestException(detailedMsg);
      case 429:
        throw new HttpException(detailedMsg, 429);
      default:
        throw new HttpException(detailedMsg, res.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async get<T>(path: string, customHeaders: Record<string, string> = {}): Promise<T> {
    const url = path.startsWith('http') ? path : `${GITHUB_API_URL}${path.startsWith('/') ? path : `/${path}`}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(customHeaders),
      signal: AbortSignal.timeout(20000),
    });

    this.updateRateLimit(res);

    if (!res.ok) {
      await this.handleError(res, path);
    }

    // Return empty object for 204 No Content
    if (res.status === 204) {
      return {} as T;
    }

    return (await res.json()) as T;
  }

  async post<T>(path: string, body?: any, customHeaders: Record<string, string> = {}): Promise<T> {
    const url = path.startsWith('http') ? path : `${GITHUB_API_URL}${path.startsWith('/') ? path : `/${path}`}`;
    const headers: Record<string, string> = this.getHeaders(customHeaders);
    if (body !== undefined && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(20000),
    });

    this.updateRateLimit(res);

    if (!res.ok) {
      await this.handleError(res, path);
    }

    if (res.status === 204) {
      return {} as T;
    }

    return (await res.json()) as T;
  }

  async put<T>(path: string, body?: any, customHeaders: Record<string, string> = {}): Promise<T> {
    const url = path.startsWith('http') ? path : `${GITHUB_API_URL}${path.startsWith('/') ? path : `/${path}`}`;
    const headers: Record<string, string> = this.getHeaders(customHeaders);
    if (body !== undefined && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, {
      method: 'PUT',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(20000),
    });

    this.updateRateLimit(res);

    if (!res.ok) {
      await this.handleError(res, path);
    }

    if (res.status === 204) {
      return {} as T;
    }

    return (await res.json()) as T;
  }

  async patch<T>(path: string, body?: any, customHeaders: Record<string, string> = {}): Promise<T> {
    const url = path.startsWith('http') ? path : `${GITHUB_API_URL}${path.startsWith('/') ? path : `/${path}`}`;
    const headers: Record<string, string> = this.getHeaders(customHeaders);
    if (body !== undefined && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, {
      method: 'PATCH',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(20000),
    });

    this.updateRateLimit(res);

    if (!res.ok) {
      await this.handleError(res, path);
    }

    if (res.status === 204) {
      return {} as T;
    }

    return (await res.json()) as T;
  }

  async delete<T>(path: string, body?: any, customHeaders: Record<string, string> = {}): Promise<T> {
    const url = path.startsWith('http') ? path : `${GITHUB_API_URL}${path.startsWith('/') ? path : `/${path}`}`;
    const headers: Record<string, string> = this.getHeaders(customHeaders);
    if (body !== undefined && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, {
      method: 'DELETE',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(20000),
    });

    this.updateRateLimit(res);

    if (!res.ok) {
      await this.handleError(res, path);
    }

    if (res.status === 204) {
      return {} as T;
    }

    return (await res.json()) as T;
  }
}
