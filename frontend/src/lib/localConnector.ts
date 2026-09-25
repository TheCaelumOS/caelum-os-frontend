/**
 * CaelumOS Local Infrastructure Connector Client
 * 
 * Bridges public CaelumOS (e.g. https://caleum.me/os) directly to the
 * user's own local Docker Desktop and Minikube / Kubernetes daemon.
 * 
 * Security:
 * - Binds and connects strictly to loopback: http://127.0.0.1:48721
 * - Never transmits Docker or Kubernetes credentials to the CaelumOS cloud backend.
 * - Authenticates requests via local random pairing secret.
 */

export const LOCAL_CONNECTOR_URL = 'http://127.0.0.1:48721';
export const TOKEN_STORAGE_KEY = 'caelum_local_token';

export interface LocalConnectorHealth {
  status: 'ok' | 'error';
  version?: string;
  platform?: string;
  docker: boolean;
  dockerVersion?: string;
  dockerEngine?: string;
  kubernetes: boolean;
  kubernetesContext?: string;
  kubernetesVersion?: string;
  pairingRequired: boolean;
}

export function getLocalPairingToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
}

export function setLocalPairingToken(token: string): void {
  if (typeof window === 'undefined') return;
  if (!token) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } else {
    localStorage.setItem(TOKEN_STORAGE_KEY, token.trim());
  }
}

/**
 * Checks if the Local Infrastructure Connector is running on loopback
 */
export async function checkLocalConnectorHealth(timeoutMs = 3000): Promise<LocalConnectorHealth | null> {
  if (typeof window === 'undefined') return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(`${LOCAL_CONNECTOR_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return data as LocalConnectorHealth;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Executes a request against the local infrastructure connector (Docker / Kubernetes)
 */
export async function localConnectorRequest(endpoint: string, options: RequestInit = {}) {
  if (typeof window === 'undefined') return null;

  const token = getLocalPairingToken();
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

  const signal = options.signal || AbortSignal.timeout(20000);

  try {
    const response = await fetch(`${LOCAL_CONNECTOR_URL}${endpoint}`, {
      ...options,
      headers,
      signal,
    });

    if (response.status === 401) {
      const err: any = new Error('PAIRING_REQUIRED');
      err.code = 'PAIRING_REQUIRED';
      err.status = 401;
      throw err;
    }

    if (!response.ok) {
      let msg = `Connector Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData?.error) msg = errorData.error;
      } catch {}
      const err: any = new Error(msg);
      err.status = response.status;
      throw err;
    }

    return await response.json();
  } catch (err: any) {
    if (err.code === 'PAIRING_REQUIRED' || err.message === 'PAIRING_REQUIRED') {
      throw err;
    }
    if (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
      const connErr: any = new Error('Local CaelumOS Connector is not running. Please start the connector on your machine.');
      connErr.code = 'CONNECTOR_UNAVAILABLE';
      throw connErr;
    }
    throw err;
  }
}
