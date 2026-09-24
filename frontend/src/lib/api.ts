import { isDockerLocalAccessAllowed, isRemoteDockerBackendConfigured } from './dockerEnvironment';

export const API_BASE = (() => {
  if (process.env.NEXT_PUBLIC_REMOTE_DOCKER_AGENT_URL) {
    return process.env.NEXT_PUBLIC_REMOTE_DOCKER_AGENT_URL;
  }
  if (process.env.NEXT_PUBLIC_API_URL !== undefined && process.env.NEXT_PUBLIC_API_URL !== '') {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return 'http://localhost:4000';
})();

let jwtToken = '';

if (typeof window !== 'undefined') {
  jwtToken = localStorage.getItem('caelum_token') || '';
}

// Auto-authenticate developer account on start
export async function ensureAuthenticated(force = false) {
  if (typeof window === 'undefined') return '';
  if (jwtToken && !force) return jwtToken;

  if (force) {
    jwtToken = '';
    localStorage.removeItem('caelum_token');
    console.log('[API] Forcing re-authentication, cleared cached token.');
  }

  const credentials = {
    email: 'dev@caelum-os.io',
    password: 'CaelumDeveloper123!',
  };

  const attemptLogin = async (baseUrl: string) => {
    return await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      signal: AbortSignal.timeout(5000),
    });
  };

  const attemptRegister = async (baseUrl: string) => {
    return await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      signal: AbortSignal.timeout(5000),
    });
  };

  try {
    console.log('[API] Authenticating with developer credentials...');
    let activeBase = API_BASE;
    let loginRes: Response;
    try {
      loginRes = await attemptLogin(activeBase);
    } catch (e: any) {
      if (activeBase.includes('localhost')) {
        activeBase = activeBase.replace('localhost', '127.0.0.1');
        loginRes = await attemptLogin(activeBase);
      } else {
        throw e;
      }
    }

    if (loginRes.ok) {
      const data = await loginRes.json();
      jwtToken = data.accessToken;
      localStorage.setItem('caelum_token', jwtToken);
      console.log('[API] Authentication successful.');
      return jwtToken;
    }

    // If login fails (user doesn't exist), Register
    const regRes = await attemptRegister(activeBase);
    if (regRes.ok) {
      const retryRes = await attemptLogin(activeBase);
      if (retryRes.ok) {
        const data = await retryRes.json();
        jwtToken = data.accessToken;
        localStorage.setItem('caelum_token', jwtToken);
        console.log('[API] Registration and authentication successful.');
        return jwtToken;
      }
    }
  } catch (err) {
    console.warn('[API] Backend server unreachable during authentication. Operating in local mode.', err);
  }

  return '';
}

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  if (typeof window === 'undefined') return null;

  let token = typeof window !== 'undefined' ? (localStorage.getItem('caelum_token') || '') : '';
  if (!token && !endpoint.startsWith('/github/')) {
    try {
      token = await ensureAuthenticated();
    } catch (err) {
      console.warn('Authentication token fetch failed, continuing without token.', err);
    }
  }
  
  const makeRequest = async (baseUrl: string, authToken: string) => {
    const headers: Record<string, string> = {};

    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, options.headers);
      }
    }

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const signal = options.signal || AbortSignal.timeout(30000);

    return await fetch(`${baseUrl}${endpoint}`, {
      cache: 'no-store',
      ...options,
      signal,
      headers,
    });
  };

  try {
    let currentBase = API_BASE;
    let response: Response;
    try {
      response = await makeRequest(currentBase, token);
    } catch (netErr: any) {
      // Loopback fallback: If localhost failed, attempt 127.0.0.1
      if (currentBase.includes('localhost') && (netErr.name === 'TypeError' || netErr.message?.includes('fetch') || netErr.message?.includes('NetworkError'))) {
        currentBase = currentBase.replace('localhost', '127.0.0.1');
        response = await makeRequest(currentBase, token);
      } else {
        throw netErr;
      }
    }

    if (response.status === 401) {
      if (!endpoint.startsWith('/github/')) {
        console.warn(`[API] Received 401 Unauthorized on ${endpoint}. Clearing credentials and retrying...`);
        token = await ensureAuthenticated(true);
        response = await makeRequest(currentBase, token);
      } else {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('caelum_token');
        }
      }
    }

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData?.message) {
          errorMessage = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message;
        } else if (errorData?.error) {
          errorMessage = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
        }
      } catch {
        // Response was not JSON, retain HTTP status text
      }
      const apiErr: any = new Error(errorMessage);
      apiErr.status = response.status;
      throw apiErr;
    }

    const data = await response.json();
    return data;
  } catch (err: any) {
    if (err.name === 'AbortError' || options.signal?.aborted) {
      throw err;
    }
    console.warn(`[API] Fetch operation failed for ${endpoint}:`, err?.message || err);
    // Graceful error handling for offline backend:
    if (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
      throw new Error('Backend is unavailable. Ensure the CaelumOS backend daemon is running on port 4000.');
    }
    throw err;
  }
}

import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export function getSocket(): Socket | null {
  if (socketInstance) return socketInstance;
  
  socketInstance = io(API_BASE, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });
  
  return socketInstance;
}
