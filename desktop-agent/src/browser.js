const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const os = require('os');

/**
 * Detects locally installed web rendering engine binaries (Edge / Chrome / Chromium)
 */
function detectSystemEngine() {
  const isWin = os.platform() === 'win32';
  const isMac = os.platform() === 'darwin';
  
  if (isWin) {
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const chromeUserPath = pathJoin(os.homedir(), 'AppData\\Local\\Google\\Chrome\\Application\\chrome.exe');
    if (fs.existsSync(edgePath)) return { name: 'Microsoft Edge (Chromium Blink)', path: edgePath, type: 'chromium' };
    if (fs.existsSync(chromePath)) return { name: 'Google Chrome (Chromium Blink)', path: chromePath, type: 'chromium' };
    if (fs.existsSync(chromeUserPath)) return { name: 'Google Chrome (User)', path: chromeUserPath, type: 'chromium' };
  } else if (isMac) {
    const chromeMac = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    const edgeMac = '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge';
    if (fs.existsSync(chromeMac)) return { name: 'Google Chrome (Chromium Blink)', path: chromeMac, type: 'chromium' };
    if (fs.existsSync(edgeMac)) return { name: 'Microsoft Edge (Chromium Blink)', path: edgeMac, type: 'chromium' };
  } else {
    // Linux
    const candidates = ['/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/microsoft-edge'];
    for (const c of candidates) {
      if (fs.existsSync(c)) return { name: 'Chromium Engine', path: c, type: 'chromium' };
    }
  }
  return { name: 'System WebEngine Runtime', path: null, type: 'standard' };
}

function pathJoin(...parts) {
  return parts.join(os.platform() === 'win32' ? '\\' : '/');
}

/**
 * Returns Browser Runtime status
 */
function getBrowserRuntimeStatus() {
  const engine = detectSystemEngine();
  return {
    status: 'active',
    runtime: 'CaelumOS Isolated Web Runtime',
    version: '2.4.0',
    engine: engine.name,
    hasNativeEngine: !!engine.path,
    capabilities: [
      'in-os-frame-inspection',
      'security-policy-negotiator',
      'tab-session-isolation',
      'reader-mode',
      'zero-external-popups'
    ]
  };
}

/**
 * Inspects a target URL to check headers (X-Frame-Options, CSP frame-ancestors, title)
 */
function inspectUrl(targetUrl, maxRedirects = 3) {
  return new Promise((resolve) => {
    let currentUrl = targetUrl;
    if (!/^https?:\/\//i.test(currentUrl)) {
      currentUrl = 'https://' + currentUrl;
    }

    try {
      const parsed = new URL(currentUrl);
      const isHttps = parsed.protocol === 'https:';
      const lib = isHttps ? https : http;

      const reqOptions = {
        hostname: parsed.hostname,
        port: parsed.port || (isHttps ? 443 : 80),
        path: parsed.pathname + (parsed.search || ''),
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 CaelumOS/2.4',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: 5000
      };

      let isDone = false;
      function finish(data) {
        if (isDone) return;
        isDone = true;
        resolve(data);
      }

      const req = lib.request(reqOptions, (res) => {
        // Handle Redirects
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && maxRedirects > 0) {
          const nextUrl = url.resolve(currentUrl, res.headers.location);
          return finish(inspectUrl(nextUrl, maxRedirects - 1));
        }

        const xFrameOptions = res.headers['x-frame-options'] || null;
        const csp = res.headers['content-security-policy'] || null;
        const contentType = res.headers['content-type'] || '';

        let canEmbed = true;
        let blockReason = null;

        if (xFrameOptions) {
          const xfoLower = xFrameOptions.toLowerCase();
          if (xfoLower.includes('deny') || xfoLower.includes('sameorigin')) {
            canEmbed = false;
            blockReason = `X-Frame-Options: ${xFrameOptions}`;
          }
        }

        if (canEmbed && csp) {
          const cspLower = csp.toLowerCase();
          if (cspLower.includes("frame-ancestors 'none'") || cspLower.includes("frame-ancestors 'self'")) {
            canEmbed = false;
            blockReason = 'Content-Security-Policy: frame-ancestors restricts third-party embedding';
          }
        }

        let bodyChunk = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          bodyChunk += chunk;
          if (bodyChunk.length > 32768) {
            let title = null;
            const titleMatch = bodyChunk.match(/<title[^>]*>([^<]+)<\/title>/i);
            if (titleMatch && titleMatch[1]) {
              title = titleMatch[1].trim();
            }
            finish({
              url: currentUrl,
              status: res.statusCode,
              canEmbed,
              blockReason,
              xFrameOptions,
              csp: csp ? csp.substring(0, 160) : null,
              contentType,
              title,
              error: null
            });
            req.destroy();
          }
        });

        res.on('end', () => {
          let title = null;
          const titleMatch = bodyChunk.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (titleMatch && titleMatch[1]) {
            title = titleMatch[1].trim();
          }

          finish({
            url: currentUrl,
            status: res.statusCode,
            canEmbed,
            blockReason,
            xFrameOptions,
            csp: csp ? csp.substring(0, 160) : null,
            contentType,
            title,
            error: null
          });
        });

        res.on('error', (err) => {
          finish({
            url: currentUrl,
            status: res.statusCode || 500,
            canEmbed,
            blockReason,
            xFrameOptions,
            csp,
            contentType,
            title: null,
            error: isDone ? null : err.message
          });
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          url: currentUrl,
          status: 408,
          canEmbed: true,
          blockReason: null,
          xFrameOptions: null,
          csp: null,
          contentType: '',
          title: null,
          error: 'Connection timeout'
        });
      });

      req.on('error', (err) => {
        resolve({
          url: currentUrl,
          status: 500,
          canEmbed: false,
          blockReason: err.message,
          xFrameOptions: null,
          csp: null,
          contentType: '',
          title: null,
          error: err.message
        });
      });

      req.end();
    } catch (err) {
      resolve({
        url: currentUrl,
        status: 500,
        canEmbed: false,
        blockReason: err.message,
        xFrameOptions: null,
        csp: null,
        contentType: '',
        title: null,
        error: err.message
      });
    }
  });
}

/**
 * Fetches text content / reader-mode for a page
 */
function fetchReader(targetUrl) {
  return new Promise((resolve) => {
    let currentUrl = targetUrl;
    if (!/^https?:\/\//i.test(currentUrl)) {
      currentUrl = 'https://' + currentUrl;
    }

    try {
      const parsed = new URL(currentUrl);
      const isHttps = parsed.protocol === 'https:';
      const lib = isHttps ? https : http;

      const req = lib.get(currentUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CaelumOSReader/2.4; +https://caleum.me)'
        },
        timeout: 6000
      }, (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', chunk => {
          if (data.length < 500000) data += chunk;
        });
        res.on('end', () => {
          // Extract title and text
          let title = '';
          const titleMatch = data.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (titleMatch) title = titleMatch[1].trim();

          // Simple clean text extraction
          const bodyMatch = data.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
          let rawBody = bodyMatch ? bodyMatch[1] : data;
          
          // Remove scripts and styles
          rawBody = rawBody.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
          rawBody = rawBody.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
          rawBody = rawBody.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '');
          rawBody = rawBody.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '');
          
          resolve({
            success: true,
            url: currentUrl,
            status: res.statusCode,
            title: title || parsed.hostname,
            htmlPreview: rawBody.slice(0, 100000)
          });
        });
      });

      req.on('error', (err) => {
        resolve({ success: false, error: err.message, url: currentUrl });
      });
      req.on('timeout', () => {
        req.destroy();
        resolve({ success: false, error: 'Reader fetch timeout', url: currentUrl });
      });
    } catch (err) {
      resolve({ success: false, error: err.message, url: currentUrl });
    }
  });
}

module.exports = {
  getBrowserRuntimeStatus,
  inspectUrl,
  fetchReader
};
