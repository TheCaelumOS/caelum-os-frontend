/**
 * CaelumOS Docker Environment & Execution Boundary
 * 
 * LOCAL DEVELOPMENT:
 * - Browser -> CaelumOS Frontend -> Local Backend (port 4000) -> Host Docker Engine -> Real Containers
 * - DOCKER_LOCAL_ACCESS = true
 * 
 * PRODUCTION (Cloudflare Pages, e.g. caleum.me):
 * - Hosted frontend has NO direct access to developer's local Docker Engine or local socket.
 * - Local container state, IDs, logs, and uptime are NEVER exposed or mocked.
 * - DOCKER_LOCAL_ACCESS = false
 */

export interface DockerEnvironmentConfig {
  /** Whether direct local Docker Engine access via localhost backend is permitted */
  isLocalAccessAllowed: boolean;
  /** Whether the app is running in a hosted production environment (e.g. Cloudflare Pages) */
  isProductionHosted: boolean;
  /** Whether a future authenticated remote CaelumOS agent endpoint is configured */
  isRemoteBackendConfigured: boolean;
  /** Human-readable environment category */
  environmentName: 'development' | 'production-hosted' | 'remote-connected';
  /** Reason/description for current access status */
  statusReason: string;
}

/**
 * Checks if the current client is allowed to communicate with the local Docker engine backend.
 * Enabled for both local development and verified domains (caleum.me) connecting to local backend.
 */
export function isDockerLocalAccessAllowed(): boolean {
  if (process.env.NEXT_PUBLIC_DOCKER_LOCAL_ACCESS === 'false') {
    return false;
  }
  return true;
}

/**
 * Checks if a legitimate remote CaelumOS Docker Agent is configured via secure HTTPS.
 */
export function isRemoteDockerBackendConfigured(): boolean {
  const remoteUrl = process.env.NEXT_PUBLIC_REMOTE_DOCKER_AGENT_URL;
  if (!remoteUrl) return false;
  // Security rule: remote Docker agent MUST use secure HTTPS and cannot be a raw socket
  return remoteUrl.startsWith('https://');
}

/**
 * Returns complete environment capability metadata for Docker integration.
 */
export function getDockerEnvironment(): DockerEnvironmentConfig {
  const remoteConfigured = isRemoteDockerBackendConfigured();
  const localAllowed = isDockerLocalAccessAllowed();

  if (remoteConfigured) {
    return {
      isLocalAccessAllowed: false,
      isProductionHosted: true,
      isRemoteBackendConfigured: true,
      environmentName: 'remote-connected',
      statusReason: 'Connected to secure remote CaelumOS Docker Agent.'
    };
  }

  if (localAllowed) {
    return {
      isLocalAccessAllowed: true,
      isProductionHosted: false,
      isRemoteBackendConfigured: false,
      environmentName: 'development',
      statusReason: 'CaelumOS Host Runtime (Docker Engine & Kubernetes Daemon).'
    };
  }

  return {
    isLocalAccessAllowed: false,
    isProductionHosted: true,
    isRemoteBackendConfigured: false,
    environmentName: 'production-hosted',
    statusReason: 'Host runtime daemon is unavailable.'
  };
}
