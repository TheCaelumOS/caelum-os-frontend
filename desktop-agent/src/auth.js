const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const CAELUM_DIR = path.join(os.homedir(), '.caelum');
const TOKEN_FILE = path.join(CAELUM_DIR, 'connector-token.json');

let activeToken = '';

/**
 * Initializes or loads the session token from ~/.caelum/connector-token.json
 */
function initToken() {
  try {
    if (!fs.existsSync(CAELUM_DIR)) {
      fs.mkdirSync(CAELUM_DIR, { recursive: true });
    }

    if (fs.existsSync(TOKEN_FILE)) {
      const raw = fs.readFileSync(TOKEN_FILE, 'utf8');
      const data = JSON.parse(raw);
      if (data && data.token && typeof data.token === 'string') {
        activeToken = data.token;
        return activeToken;
      }
    }
  } catch (err) {
    console.warn('[Auth] Could not read existing token file, generating new token:', err.message);
  }

  // Generate high-entropy 32-character local session token
  activeToken = 'caelum_' + crypto.randomBytes(16).toString('hex');
  try {
    fs.writeFileSync(
      TOKEN_FILE,
      JSON.stringify(
        {
          token: activeToken,
          created: new Date().toISOString(),
          description: 'CaelumOS Local Infrastructure Runtime Session Secret',
        },
        null,
        2
      ),
      'utf8'
    );
  } catch (err) {
    console.warn('[Auth] Warning: Could not write token to disk:', err.message);
  }

  return activeToken;
}

/**
 * Returns current session token
 */
function getToken() {
  if (!activeToken) {
    return initToken();
  }
  return activeToken;
}

/**
 * Checks whether an origin is an authorized CaelumOS client origin
 */
function isAllowedOrigin(origin) {
  if (!origin) return true; // Direct loopback tool, curl, or native desktop shell
  const allowed = [
    'https://caleum.me',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://localhost:3000',
  ];
  if (allowed.includes(origin)) return true;
  if (/^https:\/\/[a-zA-Z0-9-]+\.caleum\.me$/.test(origin)) return true;
  if (/^http:\/\/localhost:\d+$/.test(origin)) return true;
  if (/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) return true;
  return false;
}

/**
 * Verifies request authorization.
 * Seamless OS Model:
 * 1. Checks X-Caelum-Token or Authorization Bearer header.
 * 2. If token is missing, automatically verifies trusted loopback origin from allowed CaelumOS apps.
 */
function verifyToken(req) {
  const expected = getToken();

  // 1. Explicit token check
  const headerToken = req.headers['x-caelum-token'] || req.headers['x-pairing-token'];
  if (headerToken && headerToken === expected) {
    return true;
  }

  const authHeader = req.headers['authorization'];
  if (authHeader && typeof authHeader === 'string') {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      if (parts[1] === expected) {
        return true;
      }
    }
  }

  // 2. Seamless local handshake: Loopback request from verified CaelumOS origins
  const origin = req.headers.origin || '';
  const clientIp = req.socket.remoteAddress || '127.0.0.1';
  const isLoopbackIp = clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === '::ffff:127.0.0.1';

  if (isLoopbackIp && isAllowedOrigin(origin)) {
    return true;
  }

  return false;
}

module.exports = {
  initToken,
  getToken,
  verifyToken,
  isAllowedOrigin,
  TOKEN_FILE,
};
