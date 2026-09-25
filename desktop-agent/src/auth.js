const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const CAELUM_DIR = path.join(os.homedir(), '.caelum');
const TOKEN_FILE = path.join(CAELUM_DIR, 'connector-token.json');

let activeToken = '';

/**
 * Initializes or loads the pairing token from ~/.caelum/connector-token.json
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

  // Generate high-entropy 32-character pairing token
  activeToken = 'caelum_' + crypto.randomBytes(16).toString('hex');
  try {
    fs.writeFileSync(
      TOKEN_FILE,
      JSON.stringify(
        {
          token: activeToken,
          created: new Date().toISOString(),
          description: 'CaelumOS Local Infrastructure Connector Pairing Secret',
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
 * Returns current pairing token
 */
function getToken() {
  if (!activeToken) {
    return initToken();
  }
  return activeToken;
}

/**
 * Verifies request pairing token from headers or query
 */
function verifyToken(req) {
  const expected = getToken();
  if (!expected) return false;

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

  return false;
}

module.exports = {
  initToken,
  getToken,
  verifyToken,
  TOKEN_FILE,
};
