const { execFile } = require('child_process');
const fs = require('fs');

/**
 * Resiliently locate the docker executable on Windows, macOS, or Linux
 */
function getDockerBinary() {
  const candidates = [
    'docker',
    'docker.exe',
    'C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe',
    'C:\\Users\\karth\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe',
    '/usr/local/bin/docker',
    '/usr/bin/docker',
  ];
  for (const c of candidates) {
    if (c.includes('\\') || c.includes('/')) {
      if (fs.existsSync(c)) {
        return c;
      }
    }
  }
  return 'docker';
}

/**
 * Run safe non-blocking docker CLI commands with argument array
 */
function runDocker(args, timeoutMs = 12000) {
  const bin = getDockerBinary();
  return new Promise((resolve, reject) => {
    execFile(
      bin,
      args,
      {
        encoding: 'utf8',
        timeout: timeoutMs,
        maxBuffer: 10 * 1024 * 1024,
        windowsHide: true,
      },
      (err, stdout, stderr) => {
        if (err) {
          err.stdout = stdout;
          err.stderr = stderr;
          return reject(err);
        }
        resolve(stdout);
      }
    );
  });
}

async function checkConnection() {
  try {
    const output = await runDocker(['version'], 5000);
    return output.includes('Server:');
  } catch {
    return false;
  }
}

function extractClientVersion(rawOutput) {
  try {
    const clientMatch = rawOutput.match(/Client:\s*[\r\n]+(?:\s*Cloud integration:[^\r\n]+[\r\n]+)?\s*Version:\s*([0-9.]+)/i);
    if (clientMatch) return clientMatch[1];
    const generalMatch = rawOutput.match(/Version:\s*([0-9.]+)/i);
    return generalMatch ? generalMatch[1] : '';
  } catch {
    return '';
  }
}

async function getHealth() {
  try {
    const output = await runDocker(['version'], 6000);
    const connected = output.includes('Server:');

    let version = '29.8.0';
    const engineVersionMatch = output.match(/Server:[\s\S]*?Engine:[\s\S]*?Version:\s*([0-9.]+)/i);
    if (engineVersionMatch) {
      version = engineVersionMatch[1];
    } else {
      const clientVersionMatch = output.match(/Client:[\s\S]*?Version:\s*([0-9.]+)/i);
      if (clientVersionMatch) {
        version = clientVersionMatch[1];
      }
    }

    let context = 'desktop-linux';
    try {
      const ctxOut = (await runDocker(['context', 'show'], 3000)).trim();
      if (ctxOut) context = ctxOut;
    } catch {}

    const engine = output.includes('Docker Desktop') ? 'Docker Desktop' : 'Docker Engine';

    if (connected) {
      return {
        connected: true,
        version,
        context,
        engine,
        status: 'healthy',
      };
    } else {
      return {
        connected: false,
        version,
        context,
        engine,
        status: 'unavailable',
        error: 'Docker daemon is not running. Please start Docker Desktop.',
      };
    }
  } catch (err) {
    const stdout = err.stdout ? err.stdout.toString() : '';
    const clientVer = extractClientVersion(stdout);
    return {
      connected: false,
      version: clientVer ? `Client v${clientVer}` : '',
      context: '',
      engine: '',
      status: 'unavailable',
      error: 'Docker daemon is not running or unreachable. Please start Docker Desktop.',
    };
  }
}

async function getStatus() {
  const health = await getHealth();
  if (!health.connected) {
    return {
      connected: false,
      version: health.version || 'Unknown',
      status: 'unavailable',
      context: health.context || '',
      engine: health.engine || '',
      containers: [],
      images: [],
      volumes: [],
      networks: [],
      error: health.error,
    };
  }

  let containers = [];
  let images = [];
  let volumes = [];
  let networks = [];

  try {
    [containers, images, volumes, networks] = await Promise.all([
      listContainers().catch(() => []),
      listImages().catch(() => []),
      listVolumes().catch(() => []),
      listNetworks().catch(() => []),
    ]);
  } catch {}

  return {
    connected: true,
    version: health.version,
    status: health.status,
    context: health.context,
    engine: health.engine,
    containers,
    images,
    volumes,
    networks,
  };
}

async function listContainers() {
  const isUp = await checkConnection();
  if (!isUp) {
    throw new Error('Cannot connect to Docker daemon. Please verify Docker Desktop is running.');
  }
  const output = await runDocker(['ps', '-a', '--format', '{{json .}}'], 10000);
  if (!output || !output.trim()) return [];

  return output
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      try {
        const item = JSON.parse(line);
        return {
          id: item.ID || '',
          name: item.Names || item.ID || 'unnamed',
          image: item.Image || 'unknown',
          status: item.Status || '',
          state: (item.State || (item.Status && item.Status.toLowerCase().startsWith('up') ? 'running' : 'exited')).toLowerCase(),
          ports: item.Ports || '',
          created: item.CreatedAt || '',
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

async function listImages() {
  const isUp = await checkConnection();
  if (!isUp) {
    throw new Error('Cannot connect to Docker daemon. Please verify Docker Desktop is running.');
  }
  const output = await runDocker(['images', '--format', '{{json .}}'], 10000);
  if (!output || !output.trim()) return [];

  return output
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      try {
        const item = JSON.parse(line);
        return {
          repository: item.Repository || '<none>',
          tag: item.Tag || '<none>',
          size: item.Size || '0B',
          id: item.ID || '',
          created: item.CreatedAt || '',
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

async function listNetworks() {
  const isUp = await checkConnection();
  if (!isUp) {
    throw new Error('Cannot connect to Docker daemon. Please verify Docker Desktop is running.');
  }
  const output = await runDocker(['network', 'ls', '--format', '{{json .}}'], 10000);
  if (!output || !output.trim()) return [];

  return output
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      try {
        const item = JSON.parse(line);
        return {
          id: item.ID || '',
          name: item.Name || '',
          driver: item.Driver || '',
          scope: item.Scope || '',
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

async function listVolumes() {
  const isUp = await checkConnection();
  if (!isUp) {
    throw new Error('Cannot connect to Docker daemon. Please verify Docker Desktop is running.');
  }
  const output = await runDocker(['volume', 'ls', '--format', '{{json .}}'], 10000);
  if (!output || !output.trim()) return [];

  return output
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      try {
        const item = JSON.parse(line);
        return {
          name: item.Name || '',
          driver: item.Driver || 'local',
          scope: item.Scope || 'local',
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

async function listCompose() {
  const isUp = await checkConnection();
  if (!isUp) return [];
  try {
    const output = await runDocker(['compose', 'ls', '--format', 'json'], 10000);
    if (!output || !output.trim()) return [];
    const parsed = JSON.parse(output.trim());
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

async function getDaemonLogs() {
  const isUp = await checkConnection();
  if (!isUp) {
    throw new Error('Cannot connect to Docker daemon. Please verify Docker Desktop is running.');
  }
  try {
    const output = await runDocker(['events', '--since', '1h', '--until', '0s'], 6000);
    return output.trim() || 'No recent Docker events recorded in the last 60 minutes.';
  } catch {
    return 'No recent Docker events recorded in the last 60 minutes.';
  }
}

async function controlContainer(containerId, action) {
  const isUp = await checkConnection();
  if (!isUp) {
    throw new Error('Cannot connect to Docker daemon. Please verify Docker Desktop is running.');
  }

  const containerIdRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!containerId || !containerIdRegex.test(containerId)) {
    throw new Error('Invalid container ID or name format.');
  }

  const allowedActions = ['start', 'stop', 'restart', 'remove'];
  if (!allowedActions.includes(action)) {
    throw new Error(`Invalid container control action: ${action}`);
  }

  try {
    if (action === 'remove') {
      await runDocker(['rm', '-f', containerId], 12000);
    } else {
      await runDocker([action, containerId], 12000);
    }
    return { containerId, action, success: true };
  } catch (err) {
    const errMsg = (err.stderr ? err.stderr.toString() : err.message) || 'Action failed.';
    throw new Error(`Failed to ${action} container '${containerId}': ${errMsg.trim()}`);
  }
}

async function getContainerLogs(containerId, tail = 200) {
  const isUp = await checkConnection();
  if (!isUp) {
    throw new Error('Cannot connect to Docker daemon. Please verify Docker Desktop is running.');
  }

  const containerIdRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!containerId || !containerIdRegex.test(containerId)) {
    throw new Error('Invalid container ID or name format.');
  }

  const safeTail = Math.min(Math.max(1, Number(tail) || 200), 1000);
  try {
    const output = await runDocker(['logs', '--tail', String(safeTail), containerId], 8000);
    return output || `No log output found for container '${containerId}'.`;
  } catch (err) {
    const errMsg = (err.stderr ? err.stderr.toString() : err.message) || 'Failed to retrieve logs.';
    return `Error fetching logs: ${errMsg.trim()}`;
  }
}

module.exports = {
  getHealth,
  getStatus,
  listContainers,
  listImages,
  listNetworks,
  listVolumes,
  listCompose,
  getDaemonLogs,
  controlContainer,
  getContainerLogs,
};
