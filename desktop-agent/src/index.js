const http = require('http');
const url = require('url');
const os = require('os');
const { initToken, getToken, verifyToken, TOKEN_FILE } = require('./auth');
const docker = require('./docker');
const k8s = require('./kubernetes');

const PORT = 48721;
const HOST = '127.0.0.1';

// Rate limiting: simple in-memory tracker
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 min
const MAX_REQUESTS = 300;

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
      if (body.length > 1024 * 1024) {
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

function isOriginAllowed(origin) {
  if (!origin) return true; // Direct loopback tool / curl
  const allowed = [
    'https://caleum.me',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://localhost:3000',
  ];
  if (allowed.includes(origin)) return true;
  if (/^https:\/\/[a-zA-Z0-9-]+\.caleum\.me$/.test(origin)) return true;
  return false;
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || '';
  const clientIp = req.socket.remoteAddress || '127.0.0.1';

  // Strict CORS & Private Network Access (Chrome PNA)
  if (isOriginAllowed(origin)) {
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
    // 1. PUBLIC HEALTH ENDPOINT
    if (pathname === '/health' && method === 'GET') {
      const dockerHealth = await docker.getHealth();
      const k8sSummary = await k8s.getClusterSummary();
      return sendJson(res, 200, {
        status: 'ok',
        version: '1.0.0',
        platform: os.platform(),
        docker: dockerHealth.connected,
        dockerVersion: dockerHealth.version,
        dockerEngine: dockerHealth.engine,
        kubernetes: k8sSummary.connected,
        kubernetesContext: k8sSummary.context,
        kubernetesVersion: k8sSummary.version,
        pairingRequired: true,
      });
    }

    // 2. PAIRING ENDPOINT
    if (pathname === '/pair' && method === 'POST') {
      const body = await parseBody(req);
      const incomingToken = body.token || req.headers['x-caelum-token'];
      const realToken = getToken();

      if (incomingToken && incomingToken === realToken) {
        return sendJson(res, 200, { success: true, message: 'Paired successfully', token: realToken });
      } else {
        return sendError(res, 401, 'Invalid pairing token provided.');
      }
    }

    // 3. TOKEN VALIDATION (All protected routes require valid token)
    if (!verifyToken(req)) {
      return sendJson(res, 401, {
        error: 'Unauthorized: CaelumOS pairing token is missing or invalid.',
        code: 'PAIRING_REQUIRED',
        success: false,
      });
    }

    // ==========================================
    // DOCKER ROUTES
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

    // GET /docker/container/:id/logs
    const containerLogsMatch = pathname.match(/^\/docker\/container\/([a-zA-Z0-9_.-]+)\/logs$/);
    if (containerLogsMatch && method === 'GET') {
      const containerId = containerLogsMatch[1];
      const logs = await docker.getContainerLogs(containerId, parsedUrl.query.tail);
      return sendJson(res, 200, { containerId, logs });
    }

    // POST /docker/container/:id/action
    const containerActionMatch = pathname.match(/^\/docker\/container\/([a-zA-Z0-9_.-]+)\/action$/);
    if (containerActionMatch && method === 'POST') {
      const containerId = containerActionMatch[1];
      const body = await parseBody(req);
      const action = body.action;
      const result = await docker.controlContainer(containerId, action);
      return sendJson(res, 200, result);
    }

    // ==========================================
    // KUBERNETES ROUTES
    // ==========================================
    if (pathname === '/kubernetes/cluster-info' && method === 'GET') {
      const data = await k8s.getClusterSummary();
      return sendJson(res, 200, data);
    }

    if (pathname === '/kubernetes/status' && method === 'GET') {
      const data = await k8s.getClusterSummary();
      return sendJson(res, 200, data);
    }

    if (pathname === '/kubernetes/contexts' && method === 'GET') {
      const data = await k8s.getContexts();
      return sendJson(res, 200, data);
    }

    if (pathname === '/kubernetes/context' && method === 'POST') {
      const body = await parseBody(req);
      const result = await k8s.switchContext(body.context);
      return sendJson(res, 200, result);
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

    // Pod logs: GET /kubernetes/pods/:namespace/:name/logs
    const podLogsMatch = pathname.match(/^\/kubernetes\/pods\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/logs$/);
    if (podLogsMatch && method === 'GET') {
      const [, ns, name] = podLogsMatch;
      const logs = await k8s.getPodLogs(ns, name, parsedUrl.query.container);
      return sendJson(res, 200, { namespace: ns, name, logs });
    }

    // Restart pod: POST /kubernetes/pods/:namespace/:name/restart
    const podRestartMatch = pathname.match(/^\/kubernetes\/pods\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/restart$/);
    if (podRestartMatch && method === 'POST') {
      const [, ns, name] = podRestartMatch;
      const result = await k8s.restartPod(ns, name);
      return sendJson(res, 200, result);
    }

    // Delete pod: DELETE /kubernetes/pods/:namespace/:name
    const podDeleteMatch = pathname.match(/^\/kubernetes\/pods\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
    if (podDeleteMatch && method === 'DELETE') {
      const [, ns, name] = podDeleteMatch;
      const result = await k8s.deletePod(ns, name);
      return sendJson(res, 200, result);
    }

    if (pathname === '/kubernetes/deployments' && method === 'GET') {
      const ns = parsedUrl.query.namespace || 'all';
      const data = await k8s.listDeployments(ns);
      return sendJson(res, 200, data);
    }

    if (pathname === '/kubernetes/deployments' && method === 'POST') {
      const body = await parseBody(req);
      const result = await k8s.createDeployment(body);
      return sendJson(res, 200, result);
    }

    // Scale deployment: POST /kubernetes/deployments/:namespace/:name/scale
    const depScaleMatch = pathname.match(/^\/kubernetes\/deployments\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/scale$/);
    if (depScaleMatch && method === 'POST') {
      const [, ns, name] = depScaleMatch;
      const body = await parseBody(req);
      const result = await k8s.scaleDeployment(ns, name, body.replicas);
      return sendJson(res, 200, result);
    }

    // Delete deployment: DELETE /kubernetes/deployments/:namespace/:name
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

    // Delete service: DELETE /kubernetes/services/:namespace/:name
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

    return sendError(res, 404, `Endpoint ${pathname} not found on local connector.`);
  } catch (err) {
    return sendError(res, 500, err.message || 'Internal connector error.');
  }
});

const token = initToken();

server.listen(PORT, HOST, () => {
  console.log('\n================================================================');
  console.log('⚡ CaelumOS Local Infrastructure Connector');
  console.log('================================================================');
  console.log(`📡 Status:       Active & Listening`);
  console.log(`🔒 Local Host:   http://${HOST}:${PORT}`);
  console.log(`🌐 Bound To:     127.0.0.1 (Strict Loopback Isolation)`);
  console.log(`🔑 Pairing Key:  ${token}`);
  console.log(`📁 Config File:  ${TOKEN_FILE}`);
  console.log(`🌍 Permitted:    https://caleum.me & localhost:3000`);
  console.log('================================================================\n');
});
