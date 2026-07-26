export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

let jwtToken = '';

if (typeof window !== 'undefined') {
  jwtToken = localStorage.getItem('caelum_token') || '';
}

// Auto-authenticate developer account on start
export async function ensureAuthenticated() {
  if (jwtToken) return jwtToken;

  const credentials = {
    email: 'dev@caelum-os.io',
    password: 'CaelumDeveloper123!',
  };

  try {
    // Attempt Login
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (loginRes.ok) {
      const data = await loginRes.json();
      jwtToken = data.accessToken;
      localStorage.setItem('caelum_token', jwtToken);
      return jwtToken;
    }

    // If login fails (user doesn't exist), Register
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (regRes.ok) {
      // Re-attempt Login
      const retryRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (retryRes.ok) {
        const data = await retryRes.json();
        jwtToken = data.accessToken;
        localStorage.setItem('caelum_token', jwtToken);
        return jwtToken;
      }
    }
  } catch (err) {
    console.warn('Backend server unreachable. Running applications in fallback mock mode.', err);
  }

  return '';
}

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = await ensureAuthenticated();
  
  const headers: Record<string, string> = {};

  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, options.headers);
    }
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
