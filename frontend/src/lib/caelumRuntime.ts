/**
 * CaelumOS Native Runtime Client
 * 
 * Communicates directly with the local CaelumOS Runtime daemon running
 * on 127.0.0.1:48721.
 * 
 * Philosophy:
 * - Real desktop OS behavior (like Ubuntu/macOS)
 * - Zero manual pairing keys or copy-pasting
 * - Silent local session handshake
 * - Real-time discovery of Docker, Kubernetes, Git, Terraform, AWS, Azure
 * - Absolute isolation: Each user's browser only accesses their own machine's localhost.
 */

export const CAELUM_RUNTIME_URL = 'http://127.0.0.1:48721';
export const RUNTIME_TOKEN_KEY = 'caelum_runtime_session';

export interface ToolStatus<T = any> {
  status: 'connected' | 'ready' | 'authenticated' | 'offline' | 'not_configured' | 'not_authenticated' | 'not_installed';
  installed: boolean;
  version?: string | null;
  error?: string | null;
  details?: T;
}

export interface RuntimeSystemInfo {
  runtime: {
    status: 'running' | 'offline';
    version: string;
    name: string;
    platform: string;
    arch: string;
    hostname: string;
    uptime: number;
    timestamp: string;
  };
  infrastructure: {
    docker: ToolStatus & { engine?: string | null };
    kubernetes: ToolStatus & { context?: string | null; server?: string | null };
    git: ToolStatus & { userName?: string | null; userEmail?: string | null };
    terraform: ToolStatus;
    aws: ToolStatus & { account?: string | null; arn?: string | null; userId?: string | null };
    azure: ToolStatus & { user?: string | null; subscription?: string | null; tenantId?: string | null };
  };
}

let inMemoryToken: string = '';
let cachedRuntimeInfo: RuntimeSystemInfo | null = null;
let lastCheckTime = 0;
const CACHE_TTL = 4000; // 4s in-browser cache

export function getRuntimeSessionToken(): string {
  if (inMemoryToken) return inMemoryToken;
  if (typeof window !== 'undefined') {
    inMemoryToken = localStorage.getItem(RUNTIME_TOKEN_KEY) || '';
  }
  return inMemoryToken;
}

export function setRuntimeSessionToken(token: string): void {
  inMemoryToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(RUNTIME_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(RUNTIME_TOKEN_KEY);
    }
  }
}

/**
 * Performs a silent handshake with the local runtime on 127.0.0.1:48721.
 * Automatically acquires and stores the session token without any user prompts.
 */
export async function performSilentHandshake(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${CAELUM_RUNTIME_URL}/runtime/handshake`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        setRuntimeSessionToken(data.token);
        return data.token;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Checks the complete status of the local CaelumOS Runtime and detected infrastructure.
 */
export async function checkCaelumRuntimeStatus(forceRefresh = false): Promise<RuntimeSystemInfo | null> {
  if (typeof window === 'undefined') return null;

  const now = Date.now();
  if (!forceRefresh && cachedRuntimeInfo && (now - lastCheckTime < CACHE_TTL)) {
    return cachedRuntimeInfo;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const refreshParam = forceRefresh ? '?refresh=true' : '';
    const res = await fetch(`${CAELUM_RUNTIME_URL}/runtime/status${refreshParam}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data: RuntimeSystemInfo = await res.json();
      cachedRuntimeInfo = data;
      lastCheckTime = now;
      
      // Also silently ensure we have the session token
      if (!getRuntimeSessionToken()) {
        performSilentHandshake().catch(() => {});
      }

      return data;
    }
    return null;
  } catch {
    // If runtime is unreachable, return null
    return null;
  }
}

/**
 * Checks if the local CaelumOS runtime is reachable on loopback
 */
export async function isLocalRuntimeReachable(timeoutMs = 1500): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(`${CAELUM_RUNTIME_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Executes a request against the local CaelumOS Runtime API (Docker / Kubernetes / System)
 * Zero manual authentication — seamlessly attaches loopback session token.
 */
export async function caelumRuntimeRequest(endpoint: string, options: RequestInit = {}) {
  if (typeof window === 'undefined') return null;

  let token = getRuntimeSessionToken();
  if (!token) {
    // Attempt rapid silent handshake first
    token = (await performSilentHandshake()) || '';
  }

  const headers: Record<string, string> = {};

  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((v, k) => { headers[k] = v; });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([k, v]) => { headers[k] = v; });
    } else {
      Object.assign(headers, options.headers);
    }
  }

  if (token) {
    headers['X-Caelum-Token'] = token;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const signal = options.signal || AbortSignal.timeout(25000);

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const targetUrl = `${CAELUM_RUNTIME_URL}${cleanEndpoint}`;

  try {
    const res = await fetch(targetUrl, {
      ...options,
      headers,
      signal,
    });

    if (res.status === 204) return null;

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.error || data?.message || `Local runtime request failed (${res.status})`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err: any) {
    if (err.name === 'AbortError' || err.name === 'TimeoutError') {
      throw new Error('Local runtime request timed out. Please check if your local daemon is running.');
    }
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new Error('CaelumOS Native Runtime is unreachable on 127.0.0.1:48721.');
    }
    throw err;
  }
}
