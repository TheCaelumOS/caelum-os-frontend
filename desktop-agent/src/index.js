const http = require('http');
const url = require('url');
const os = require('os');
const { initToken, getToken, verifyToken, isAllowedOrigin, TOKEN_FILE } = require('./auth');
const docker = require('./docker');
const k8s = require('./kubernetes');
const git = require('./git');
const terraform = require('./terraform');
const aws = require('./aws');
const azure = require('./azure');
const system = require('./system');

const PORT = 48721;
const HOST = '127.0.0.1';

// Rate limiting: simple in-memory tracker
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 min
const MAX_REQUESTS = 600;

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, reset: now + RATE_LIMIT_WINDOW };
  if (now > record.reset) {
    record.count = 1;
    record.reset = now + RATE_LIMIT_WINDOW;
  } else {
    record.count++;
  }
  rateLimitMap.set(ip, record);
  return record.count <= MAX_REQUESTS;
}

// Clean up rate limit tracker periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of rateLimitMap.entries()) {
    if (now > rec.reset) rateLimitMap.delete(ip);
  }
}, 120000);

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 2 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function sendError(res, statusCode, message) {
  sendJson(res, statusCode, { error: message, success: false });
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || '';
  const clientIp = req.socket.remoteAddress || '127.0.0.1';

  // Strict CORS & Private Network Access (Chrome PNA)
  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://caleum.me');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Caelum-Token, x-caelum-token, access-control-request-private-network'
  );
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (!checkRateLimit(clientIp)) {
    return sendError(res, 429, 'Rate limit exceeded. Please wait.');
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname || '/';
  const method = req.method;

  try {
    // ==========================================
    // 1. PUBLIC HEALTH & SYSTEM DISCOVERY
    // ==========================================
    if (pathname === '/health' && method === 'GET') {
      const sys = await system.getSystemStatus(parsedUrl.query.refresh === 'true');
      return sendJson(res, 200, {
        status: 'ok',
        version: '1.0.0',
        platform: os.platform(),
        runtimeRunning: true,
        docker: sys.infrastructure.docker.status === 'connected',
        dockerVersion: sys.infrastructure.docker.version,
        dockerEngine: sys.infrastructure.docker.engine,
        kubernetes: sys.infrastructure.kubernetes.status === 'connected',
        kubernetesContext: sys.infrastructure.kubernetes.context,
        kubernetesVersion: sys.infrastructure.kubernetes.version,
        git: sys.infrastructure.git.status === 'ready',
        terraform: sys.infrastructure.terraform.status === 'ready',
        aws: sys.infrastructure.aws.status === 'authenticated',
        azure: sys.infrastructure.azure.status === 'authenticated',
        pairingRequired: false,
      });
    }

    // Comprehensive OS runtime status
    if ((pathname === '/runtime/status' || pathname === '/system/status') && method === 'GET') {
      const sys = await system.getSystemStatus(parsedUrl.query.refresh === 'true');
      return sendJson(res, 200, sys);
    }

    // Zero-friction handshake endpoint for CaelumOS Desktop
    if (pathname === '/runtime/handshake' && method === 'GET') {
      const sessionToken = getToken();
      const sys = await system.getSystemStatus();
      return sendJson(res, 200, {
        status: 'ok',
        authenticated: true,
        version: '1.0.0',
        token: sessionToken,
        runtime: sys.runtime,
        infrastructure: sys.infrastructure,
      });
    }

    // Individual tool status checks
    if (pathname === '/git/status' && method === 'GET') {
      const data = await git.getGitStatus();
      return sendJson(res, 200, data);
    }

    if (pathname === '/terraform/status' && method === 'GET') {
      const data = await terraform.getTerraformStatus();
      return sendJson(res, 200, data);
    }

    if (pathname === '/aws/status' && method === 'GET') {
      const data = await aws.getAwsStatus();
      return sendJson(res, 200, data);
    }

    if (pathname === '/azure/status' && method === 'GET') {
      const data = await azure.getAzureStatus();
      return sendJson(res, 200, data);
    }

    // ==========================================
    // 2. AUTHORIZATION VERIFICATION
    // ==========================================
    if (!verifyToken(req)) {
      return sendJson(res, 401, {
        error: 'Unauthorized: CaelumOS runtime session invalid or rejected by origin policy.',
        code: 'UNAUTHORIZED_ORIGIN',
        success: false,
      });
    }

    // ==========================================
    // 3. DOCKER ROUTES
    // ==========================================
    if (pathname === '/docker/health' && method === 'GET') {
      const data = await docker.getHealth();
      return sendJson(res, 200, data);
    }

    if (pathname === '/docker/status' && method === 'GET') {
      const data = await docker.getStatus();
      return sendJson(res, 200, data);
    }

    if (pathname === '/docker/containers' && method === 'GET') {
      const data = await docker.listContainers();
      return sendJson(res, 200, data);
    }

    if (pathname === '/docker/images' && method === 'GET') {
      const data = await docker.listImages();
      return sendJson(res, 200, data);
    }

    if (pathname === '/docker/networks' && method === 'GET') {
      const data = await docker.listNetworks();
      return sendJson(res, 200, data);
    }

    if (pathname === '/docker/volumes' && method === 'GET') {
      const data = await docker.listVolumes();
      return sendJson(res, 200, data);
    }

    if (pathname === '/docker/compose' && method === 'GET') {
      const data = await docker.listCompose();
      return sendJson(res, 200, data);
    }

    if (pathname === '/docker/daemon-logs' && method === 'GET') {
      const data = await docker.getDaemonLogs();
      return sendJson(res, 200, data);
    }

    const actionMatch = pathname.match(/^\/docker\/container(?:s)?\/([a-zA-Z0-9_-]+)\/action$/);
    if ((actionMatch || pathname === '/docker/action') && method === 'POST') {
      const body = await parseBody(req);
      const containerId = actionMatch ? actionMatch[1] : body.containerId;
      const action = body.action;
      const result = await docker.controlContainer(containerId, action);
      return sendJson(res, 200, result);
    }

    const logsMatch = pathname.match(/^\/docker\/container(?:s)?\/([a-zA-Z0-9_-]+)\/logs$/);
    if (logsMatch && method === 'GET') {
      const containerId = logsMatch[1];
      const tail = parseInt(parsedUrl.query.tail, 10) || 200;
      const result = await docker.getContainerLogs(containerId, tail);
      return sendJson(res, 200, { logs: result, containerId });
    }

    // ==========================================
    // 4. KUBERNETES ROUTES
    // ==========================================
    if (pathname === '/kubernetes/health' && method === 'GET') {
      const data = await k8s.getClusterSummary();
      return sendJson(res, 200, data);
    }

    if (pathname === '/kubernetes/cluster-info' && method === 'GET') {
      const data = await k8s.getClusterSummary();
      return sendJson(res, 200, data);
    }

    if (pathname === '/kubernetes/contexts' && method === 'GET') {
      const data = await k8s.getContexts();
      return sendJson(res, 200, data);
    }

    if (pathname === '/kubernetes/nodes' && method === 'GET') {
      const data = await k8s.listNodes();
      return sendJson(res, 200, data);
    }

    if (pathname === '/kubernetes/namespaces' && method === 'GET') {
      const data = await k8s.listNamespaces();
      return sendJson(res, 200, data);
    }

    if (pathname === '/kubernetes/pods' && method === 'GET') {
      const ns = parsedUrl.query.namespace || 'all';
      const data = await k8s.listPods(ns);
      return sendJson(res, 200, data);
    }

    const podLogsMatch = pathname.match(/^\/kubernetes\/pods\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/logs$/);
    if (podLogsMatch && method === 'GET') {
      const [, ns, podName] = podLogsMatch;
      const container = parsedUrl.query.container;
      const tail = parseInt(parsedUrl.query.tail, 10) || 100;
      const result = await k8s.getPodLogs(ns, podName, container, tail);
      return sendJson(res, 200, result);
    }

    const podDeleteMatch = pathname.match(/^\/kubernetes\/pods\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
    if (podDeleteMatch && method === 'DELETE') {
      const [, ns, podName] = podDeleteMatch;
      const result = await k8s.deletePod(ns, podName);
      return sendJson(res, 200, result);
    }

    if (pathname === '/kubernetes/deployments' && method === 'GET') {
      const ns = parsedUrl.query.namespace || 'all';
      const data = await k8s.listDeployments(ns);
      return sendJson(res, 200, data);
    }

    const depScaleMatch = pathname.match(/^\/kubernetes\/deployments\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/scale$/);
    if (depScaleMatch && method === 'POST') {
      const [, ns, name] = depScaleMatch;
      const body = await parseBody(req);
      const replicas = parseInt(body.replicas, 10) || 1;
      const result = await k8s.scaleDeployment(ns, name, replicas);
      return sendJson(res, 200, result);
    }

    const depDeleteMatch = pathname.match(/^\/kubernetes\/deployments\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
    if (depDeleteMatch && method === 'DELETE') {
      const [, ns, name] = depDeleteMatch;
      const result = await k8s.deleteDeployment(ns, name);
      return sendJson(res, 200, result);
    }

    if (pathname === '/kubernetes/services' && method === 'GET') {
      const ns = parsedUrl.query.namespace || 'all';
      const data = await k8s.listServices(ns);
      return sendJson(res, 200, data);
    }

    if (pathname === '/kubernetes/services' && method === 'POST') {
      const body = await parseBody(req);
      const result = await k8s.createService(body);
      return sendJson(res, 200, result);
    }

    const svcDeleteMatch = pathname.match(/^\/kubernetes\/services\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
    if (svcDeleteMatch && method === 'DELETE') {
      const [, ns, name] = svcDeleteMatch;
      const result = await k8s.deleteService(ns, name);
      return sendJson(res, 200, result);
    }

    if (pathname === '/kubernetes/configmaps' && method === 'GET') {
      const ns = parsedUrl.query.namespace || 'all';
      const data = await k8s.listConfigMaps(ns);
      return sendJson(res, 200, data);
    }

    if (pathname === '/kubernetes/secrets' && method === 'GET') {
      const ns = parsedUrl.query.namespace || 'all';
      const data = await k8s.listSecrets(ns);
      return sendJson(res, 200, data);
    }

    if (pathname === '/kubernetes/events' && method === 'GET') {
      const ns = parsedUrl.query.namespace || 'all';
      const data = await k8s.listEvents(ns);
      return sendJson(res, 200, data);
    }

    return sendError(res, 404, `Endpoint ${pathname} not found on local runtime.`);
  } catch (err) {
    return sendError(res, 500, err.message || 'Internal runtime error.');
  }
});

const token = initToken();

server.listen(PORT, HOST, () => {
  console.log('\n================================================================');
  console.log('⚡ CaelumOS Native Runtime Daemon');
  console.log('================================================================');
  console.log(`📡 Status:       Active & Running`);
  console.log(`🔒 Local Host:   http://${HOST}:${PORT}`);
  console.log(`🌐 Bound To:     127.0.0.1 (Strict Loopback Isolation)`);
  console.log(`📁 Config File:  ${TOKEN_FILE}`);
  console.log(`🌍 Permitted:    https://caleum.me & localhost:3000`);
  console.log('================================================================\n');
});
