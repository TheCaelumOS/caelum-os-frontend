export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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

  try {
    console.log('[API] Authenticating with developer credentials...');
    // Attempt Login
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (loginRes.ok) {
      const data = await loginRes.json();
      jwtToken = data.accessToken;
      localStorage.setItem('caelum_token', jwtToken);
      console.log('[API] Authentication successful.');
      return jwtToken;
    }

    // If login fails (user doesn't exist), Register
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (regRes.ok) {
      // Re-attempt Login
      const retryRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (retryRes.ok) {
        const data = await retryRes.json();
        jwtToken = data.accessToken;
        localStorage.setItem('caelum_token', jwtToken);
        console.log('[API] Registration and authentication successful.');
        return jwtToken;
      }
    }
  } catch (err) {
    console.warn('[API] Backend server unreachable during authentication. Fallback to offline mock mode allowed.', err);
  }

  return '';
}

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  if (typeof window === 'undefined') return null;
  let token = '';
  try {
    token = await ensureAuthenticated();
  } catch (err) {
    console.warn('Authentication token fetch failed, continuing without token.', err);
  }
  
  const makeRequest = async (authToken: string) => {
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

    return await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  };

  try {
    console.log(`[API] Sending request to ${endpoint}`);
    let response = await makeRequest(token);

    if (response.status === 401) {
      console.warn(`[API] Received 401 Unauthorized on ${endpoint}. Clearing credentials and retrying...`);
      token = await ensureAuthenticated(true);
      response = await makeRequest(token);
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[API] Received successful response from ${endpoint}`);
    return data;
  } catch (err: any) {
    console.error(`[API] Fetch operation failed for ${endpoint}:`, err);
    // Graceful error handling for offline backend:
    if (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
      throw new Error('Backend is unavailable. Please start the backend server.');
    }
    throw err;
  }
}

import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (socketInstance) return socketInstance;
  
  socketInstance = io(API_BASE, {
    transports: ['websocket'],
    autoConnect: true,
  });
  
  return socketInstance;
}
