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
 */
export function isDockerLocalAccessAllowed(): boolean {
  // If explicitly disabled via build-time or runtime environment configuration
  if (process.env.NEXT_PUBLIC_DOCKER_LOCAL_ACCESS === 'false') {
    return false;
  }

  // Client-side browser runtime check
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname.toLowerCase();
    
    // Explicit public production domains: NEVER allow local Docker engine access
    if (
      hostname === 'caleum.me' ||
      hostname.endsWith('.caleum.me') ||
      hostname.endsWith('.pages.dev') ||
      hostname.endsWith('.workers.dev') ||
      hostname.endsWith('.vercel.app')
    ) {
      return false;
    }

    // Local loopback hostnames are permitted for local development
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1'
    ) {
      return true;
    }

    // Any other external domain accessed over HTTPS is treated as hosted production
    if (window.location.protocol === 'https:') {
      return false;
    }
  }

  // Server-side / Build-time check: only development allows local access
  return process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DOCKER_LOCAL_ACCESS !== 'false';
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
      statusReason: 'Local CaelumOS Runtime (Host Docker Engine).'
    };
  }

  return {
    isLocalAccessAllowed: false,
    isProductionHosted: true,
    isRemoteBackendConfigured: false,
    environmentName: 'production-hosted',
    statusReason: 'Local Docker access is unavailable from the hosted website.'
  };
}
