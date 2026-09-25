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

async function getContainerStats() {
  const isUp = await checkConnection();
  if (!isUp) return [];
  try {
    const output = await runDocker(['stats', '--no-stream', '--format', '{{json .}}'], 4000);
    if (!output || !output.trim()) return [];
    return output
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        try {
          const item = JSON.parse(line);
          return {
            id: item.ID || item.Container || '',
            name: item.Name || '',
            cpu: item.CPUPerc || '0%',
            memory: item.MemUsage || '',
            memPerc: item.MemPerc || '0%',
            netIO: item.NetIO || '',
            blockIO: item.BlockIO || '',
            pids: item.PIDs || '0',
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function listContainers() {
  const isUp = await checkConnection();
  if (!isUp) {
    throw new Error('Cannot connect to Docker daemon. Please verify Docker Desktop is running.');
  }
  const [output, statsList] = await Promise.all([
    runDocker(['ps', '-a', '--format', '{{json .}}'], 10000),
    getContainerStats().catch(() => []),
  ]);
  if (!output || !output.trim()) return [];

  const statsMap = new Map();
  for (const s of statsList) {
    if (s.id) {
      statsMap.set(s.id, s);
      if (s.id.length >= 12) statsMap.set(s.id.substring(0, 12), s);
    }
    if (s.name) statsMap.set(s.name, s);
  }

  return output
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      try {
        const item = JSON.parse(line);
        const id = item.ID || '';
        const name = item.Names || item.ID || 'unnamed';
        const isRunning = (item.State || (item.Status && item.Status.toLowerCase().startsWith('up') ? 'running' : 'exited')).toLowerCase() === 'running';
        const stat = statsMap.get(id) || statsMap.get(id.substring(0, 12)) || statsMap.get(name) || null;

        return {
          id,
          name,
          image: item.Image || 'unknown',
          status: item.Status || '',
          state: isRunning ? 'running' : (item.State ? item.State.toLowerCase() : 'exited'),
          ports: item.Ports || '',
          created: item.CreatedAt || '',
          cpu: stat ? stat.cpu : (isRunning ? '0%' : '-'),
          memory: stat ? stat.memory : (isRunning ? '-' : '-'),
          memPerc: stat ? stat.memPerc : '',
          netIO: stat ? stat.netIO : '',
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

async function inspectContainer(containerId) {
  const isUp = await checkConnection();
  if (!isUp) {
    throw new Error('Cannot connect to Docker daemon. Please verify Docker Desktop is running.');
  }

  const containerIdRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!containerId || !containerIdRegex.test(containerId)) {
    throw new Error('Invalid container ID or name format.');
  }

  try {
    const output = await runDocker(['inspect', containerId], 8000);
    const parsed = JSON.parse(output);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : parsed;
  } catch (err) {
    throw new Error(`Failed to inspect container '${containerId}': ${err.message}`);
  }
}

async function pruneResources(type = 'all') {
  const isUp = await checkConnection();
  if (!isUp) {
    throw new Error('Cannot connect to Docker daemon. Please verify Docker Desktop is running.');
  }

  let args = ['system', 'prune', '-f'];
  if (type === 'containers') args = ['container', 'prune', '-f'];
  else if (type === 'images') args = ['image', 'prune', '-f'];
  else if (type === 'volumes') args = ['volume', 'prune', '-f'];
  else if (type === 'networks') args = ['network', 'prune', '-f'];

  try {
    const output = await runDocker(args, 20000);
    return { success: true, type, output: output.trim() };
  } catch (err) {
    throw new Error(`Failed to prune ${type}: ${err.message}`);
  }
}

module.exports = {
  getHealth,
  getStatus,
  listContainers,
  getContainerStats,
  listImages,
  listNetworks,
  listVolumes,
  listCompose,
  getDaemonLogs,
  controlContainer,
  getContainerLogs,
  inspectContainer,
  pruneResources,
};
