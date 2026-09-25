/**
 * CaelumOS Native Infrastructure Bridge
 * Compatibility layer delegating to the unified CaelumOS Native Runtime.
 */

import {
  CAELUM_RUNTIME_URL,
  checkCaelumRuntimeStatus,
  caelumRuntimeRequest,
  performSilentHandshake,
  getRuntimeSessionToken,
  setRuntimeSessionToken,
  RuntimeSystemInfo
} from './caelumRuntime';

export const LOCAL_CONNECTOR_URL = CAELUM_RUNTIME_URL;
export const TOKEN_STORAGE_KEY = 'caelum_runtime_session';

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
  git?: boolean;
  terraform?: boolean;
  aws?: boolean;
  azure?: boolean;
  pairingRequired: boolean;
}

export function getLocalPairingToken(): string {
  return getRuntimeSessionToken();
}

export function setLocalPairingToken(token: string): void {
  setRuntimeSessionToken(token);
}

export async function checkLocalConnectorHealth(timeoutMs = 3000): Promise<LocalConnectorHealth | null> {
  const sys = await checkCaelumRuntimeStatus();
  if (!sys) return null;

  return {
    status: 'ok',
    version: sys.runtime.version,
    platform: sys.runtime.platform,
    docker: sys.infrastructure.docker.status === 'connected',
    dockerVersion: sys.infrastructure.docker.version || undefined,
    dockerEngine: sys.infrastructure.docker.engine || undefined,
    kubernetes: sys.infrastructure.kubernetes.status === 'connected',
    kubernetesContext: sys.infrastructure.kubernetes.context || undefined,
    kubernetesVersion: sys.infrastructure.kubernetes.version || undefined,
    git: sys.infrastructure.git.status === 'ready',
    terraform: sys.infrastructure.terraform.status === 'ready',
    aws: sys.infrastructure.aws.status === 'authenticated',
    azure: sys.infrastructure.azure.status === 'authenticated',
    pairingRequired: false,
  };
}

export async function localConnectorRequest(endpoint: string, options: RequestInit = {}) {
  return caelumRuntimeRequest(endpoint, options);
}

export function isLocalConnectorRunning(): Promise<boolean> {
  return checkCaelumRuntimeStatus().then(res => !!res);
}

export {
  checkCaelumRuntimeStatus,
  caelumRuntimeRequest,
  performSilentHandshake,
};
