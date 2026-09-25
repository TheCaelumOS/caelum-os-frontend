const os = require('os');
const docker = require('./docker');
const k8s = require('./kubernetes');
const git = require('./git');
const terraform = require('./terraform');
const aws = require('./aws');
const azure = require('./azure');

let cachedStatus = null;
let lastStatusFetch = 0;
const CACHE_TTL_MS = 6000; // 6s cache

async function getSystemStatus(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedStatus && (now - lastStatusFetch < CACHE_TTL_MS)) {
    return cachedStatus;
  }

  const [dockerHealth, k8sSummary, gitStatus, terraformStatus, awsStatus, azureStatus] = await Promise.all([
    docker.getHealth().catch(e => ({ connected: false, error: e.message })),
    k8s.getClusterSummary().catch(e => ({ connected: false, error: e.message })),
    git.getGitStatus().catch(e => ({ status: 'not_installed', error: e.message })),
    terraform.getTerraformStatus().catch(e => ({ status: 'not_installed', error: e.message })),
    aws.getAwsStatus().catch(e => ({ status: 'not_installed', error: e.message })),
    azure.getAzureStatus().catch(e => ({ status: 'not_installed', error: e.message })),
  ]);

  // Format Docker status
  let dockerState = 'not_installed';
  if (dockerHealth.connected) {
    dockerState = 'connected';
  } else if (dockerHealth.version && !dockerHealth.version.includes('not found')) {
    dockerState = 'offline';
  }

  // Format Kubernetes status
  let k8sState = 'not_installed';
  if (k8sSummary.connected) {
    k8sState = 'connected';
  } else if (k8sSummary.context) {
    k8sState = 'offline';
  } else if (k8sSummary.version && !k8sSummary.version.includes('not found')) {
    k8sState = 'not_configured';
  }

  cachedStatus = {
    runtime: {
      status: 'running',
      version: '1.0.0',
      name: 'CaelumOS Native Runtime',
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      uptime: Math.floor(os.uptime()),
      timestamp: new Date().toISOString(),
    },
    infrastructure: {
      docker: {
        status: dockerState, // 'connected' | 'offline' | 'not_installed'
        installed: dockerState !== 'not_installed',
        version: dockerHealth.version || null,
        engine: dockerHealth.engine || null,
        error: dockerHealth.error || null,
      },
      kubernetes: {
        status: k8sState, // 'connected' | 'offline' | 'not_configured' | 'not_installed'
        installed: k8sState !== 'not_installed',
        context: k8sSummary.context || null,
        version: k8sSummary.version || null,
        server: k8sSummary.server || null,
        error: k8sSummary.error || null,
      },
      git: {
        status: gitStatus.status, // 'ready' | 'not_installed'
        installed: gitStatus.installed,
        version: gitStatus.version,
        userName: gitStatus.userName,
        userEmail: gitStatus.userEmail,
      },
      terraform: {
        status: terraformStatus.status, // 'ready' | 'not_installed'
        installed: terraformStatus.installed,
        version: terraformStatus.version,
      },
      aws: {
        status: awsStatus.status, // 'authenticated' | 'not_authenticated' | 'not_installed'
        installed: awsStatus.installed,
        version: awsStatus.version,
        account: awsStatus.account,
        arn: awsStatus.arn,
        userId: awsStatus.userId,
      },
      azure: {
        status: azureStatus.status, // 'authenticated' | 'not_authenticated' | 'not_installed'
        installed: azureStatus.installed,
        version: azureStatus.version,
        user: azureStatus.user,
        subscription: azureStatus.subscription,
        tenantId: azureStatus.tenantId,
      },
    },
  };

  lastStatusFetch = now;
  return cachedStatus;
}

module.exports = {
  getSystemStatus,
};
