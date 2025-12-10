/**
 * CORS Proxy Cloudflare Worker
 * Proxies requests to URLs passed via the ?url= query parameter
 */

import faviconData from './favicon.ico';

/**
 * Generate HTML form for the landing page
 * @param {string} baseUrl - The base URL of the worker
 * @returns {string} HTML content
 */
function generateFormHTML(baseUrl) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FCORS - CORS Proxy</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 600px;
      width: 100%;
      padding: 40px;
    }
    h1 {
      color: #333;
      font-size: 2.5rem;
      margin-bottom: 10px;
      text-align: center;
    }
    .subtitle {
      color: #666;
      text-align: center;
      margin-bottom: 30px;
      font-size: 1.1rem;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      color: #444;
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 0.95rem;
    }
    input[type="url"], input[type="text"], select {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e1e8ed;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
      font-family: inherit;
    }
    input[type="url"]:focus, input[type="text"]:focus, select:focus {
      outline: none;
      border-color: #667eea;
    }
    .button-group {
      display: flex;
      gap: 10px;
      margin-top: 25px;
    }
    button {
      flex: 1;
      padding: 14px 24px;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      font-family: inherit;
    }
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }
    .btn-secondary {
      background: #f7f9fb;
      color: #667eea;
      border: 2px solid #667eea;
    }
    .btn-secondary:hover {
      background: #667eea;
      color: white;
    }
    .info-box {
      background: #f7f9fb;
      border-left: 4px solid #667eea;
      padding: 16px;
      margin-top: 25px;
      border-radius: 8px;
    }
    .info-box h3 {
      color: #333;
      font-size: 1rem;
      margin-bottom: 8px;
    }
    .info-box p {
      color: #666;
      font-size: 0.9rem;
      line-height: 1.6;
    }
    .info-box code {
      background: #e1e8ed;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.85rem;
      color: #d63384;
    }
    #result {
      margin-top: 20px;
      padding: 16px;
      border-radius: 8px;
      display: none;
      white-space: pre-wrap;
      word-wrap: break-word;
      max-height: 400px;
      overflow-y: auto;
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
    }
    #result.success {
      background: #d4edda;
      border: 1px solid #c3e6cb;
      color: #155724;
    }
    #result.error {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e1e8ed;
      text-align: center;
      color: #666;
      font-size: 0.9rem;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    .warning {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 12px 16px;
      margin-top: 20px;
      border-radius: 8px;
      font-size: 0.9rem;
      color: #856404;
    }
    .warning strong {
      display: block;
      margin-bottom: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 FCORS</h1>
    <p class="subtitle">CORS Proxy Worker</p>
    
    <form id="proxyForm">
      <div class="form-group">
        <label for="targetUrl">Target URL</label>
        <input 
          type="url" 
          id="targetUrl" 
          name="url" 
          placeholder="https://api.example.com/data"
          required
        >
      </div>
      
      <div class="form-group">
        <label for="apiKey">API Key</label>
        <input 
          type="text" 
          id="apiKey" 
          name="key" 
          placeholder="Your API key (if you need one, contact me)"
          required
        >
      </div>
      
      <div class="form-group">
        <label for="reveal">Reveal Mode</label>
        <select id="reveal" name="reveal">
          <option value="">Proxy Response (Default)</option>
          <option value="headers">Show Headers Only</option>
        </select>
      </div>
      
      <div class="button-group">
        <button type="submit" class="btn-primary">Submit Request</button>
        <button type="button" class="btn-secondary" onclick="copyApiUrl()">Copy API URL</button>
      </div>
    </form>
    
    <div id="result"></div>
    
    <div class="info-box">
      <h3>📖 API Usage</h3>
      <p>
        Use <code>?url=</code> to proxy any URL with CORS headers.<br>
        Add <code>&reveal=headers</code> to get response headers as JSON.
      </p>
    </div>
    
    <div class="warning">
      <strong>⚠️ Authorization Required</strong>
      You may only proxy URLs for which you have explicit authorization. Unauthorized access may be illegal.
    </div>
    
    <div class="footer">
      By using this service, you agree to the <a href="https://github.com/davidnuescheler/fcors/blob/main/TERMS.md" target="_blank">Terms of Use</a>
    </div>
  </div>
  
  <script>
    const form = document.getElementById('proxyForm');
    const resultDiv = document.getElementById('result');
    const baseUrl = '${baseUrl}';
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const url = formData.get('url');
      const key = formData.get('key');
      const reveal = formData.get('reveal');
      
      const params = new URLSearchParams({ url, key });
      if (reveal) params.append('reveal', reveal);
      
      const proxyUrl = \`\${baseUrl}?\${params.toString()}\`;
      
      resultDiv.style.display = 'block';
      resultDiv.className = '';
      resultDiv.textContent = 'Loading...';
      
      try {
        const response = await fetch(proxyUrl);
        const contentType = response.headers.get('content-type');
        
        let data;
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
          data = JSON.stringify(data, null, 2);
        } else {
          data = await response.text();
        }
        
        resultDiv.className = response.ok ? 'success' : 'error';
        resultDiv.textContent = data;
      } catch (error) {
        resultDiv.className = 'error';
        resultDiv.textContent = \`Error: \${error.message}\`;
      }
    });
    
    function copyApiUrl() {
      const formData = new FormData(form);
      const url = formData.get('url');
      const key = formData.get('key');
      const reveal = formData.get('reveal');
      
      if (!url) {
        alert('Please enter a URL first');
        return;
      }
      
      if (!key) {
        alert('Please enter an API key first');
        return;
      }
      
      const params = new URLSearchParams({ url, key });
      if (reveal) params.append('reveal', reveal);
      
      const proxyUrl = \`\${baseUrl}?\${params.toString()}\`;
      
      navigator.clipboard.writeText(proxyUrl).then(() => {
        alert('API URL copied to clipboard!');
      }).catch(err => {
        alert('Failed to copy: ' + err);
      });
    }
  </script>
</body>
</html>`;
}

/**
 * Match a string against a simple glob pattern using * as wildcard
 * @param {string} pattern - The glob pattern (e.g., "https://*.example.com/*")
 * @param {string} str - The string to match
 * @returns {boolean} Whether the string matches the pattern
 */
function matchGlob(pattern, str) {
  // Escape regex special chars except *, then convert * to .*
  const regexPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');
  const regex = new RegExp(`^${regexPattern}$`, 'i');
  return regex.test(str);
}

/**
 * Check if a string matches any pattern in the list
 * @param {string[]} patterns - Array of glob patterns
 * @param {string} str - The string to match
 * @returns {boolean} Whether the string matches any pattern
 */
function matchesAnyPattern(patterns, str) {
  if (!patterns || patterns.length === 0) return true;
  return patterns.some((pattern) => matchGlob(pattern, str));
}

/**
 * Validate API key against KV store and check restrictions
 * @param {string} apiKey - The API key to validate
 * @param {Object} env - Environment bindings
 * @param {string} origin - The request origin
 * @param {string} targetUrl - The target URL being proxied
 * @param {string} host - The request host (for localhost detection)
 * @returns {Promise<{valid: boolean, error?: string}>} Validation result
 */
async function validateApiKey(apiKey, env, origin, targetUrl, host) {
  if (!apiKey) {
    return { valid: false, error: 'Missing API key' };
  }

  try {
    const keyData = await env.API_KEYS.get(apiKey);
    if (keyData === null) {
      return { valid: false, error: 'Invalid API key' };
    }

    // Parse key configuration (JSON with origins and urls arrays)
    let config;
    try {
      config = JSON.parse(keyData);
    } catch (e) {
      // If not JSON, treat as simple identifier with no restrictions
      return { valid: true };
    }

    // Check origin restriction
    if (config.origins && config.origins.length > 0) {
      const requestOrigin = origin || '';
      // Allow same-origin requests (no origin header) for localhost or fcors.org
      const isSameOrigin = !origin && host && (
        host.includes('localhost')
        || host.includes('127.0.0.1')
        || host.includes('fcors.org')
      );
      if (!isSameOrigin && !matchesAnyPattern(config.origins, requestOrigin)) {
        return {
          valid: false,
          error: `Origin not allowed for this API key. Received origin: "${requestOrigin}"`,
        };
      }
    }

    // Check target URL restriction
    if (config.urls && config.urls.length > 0) {
      if (!matchesAnyPattern(config.urls, targetUrl)) {
        return {
          valid: false,
          error: `Target URL not allowed for this API key. Requested URL: "${targetUrl}"`,
        };
      }
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'API key validation failed' };
  }
}

/**
 * Handle incoming requests
 * @param {Request} request - The incoming request
 * @param {Object} env - Environment bindings
 * @returns {Promise<Response>} The proxied response or error response
 */
async function handleRequest(request, env) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');
  const reveal = url.searchParams.get('reveal');
  const requestOrigin = request.headers.get('origin');
  const corsOrigin = requestOrigin || '*';

  // Show form if no URL is provided (no API key required for form)
  if (!targetUrl) {
    const baseUrl = `${url.protocol}//${url.host}`;
    return new Response(generateFormHTML(baseUrl), {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': corsOrigin,
      },
    });
  }

  // Check API key (from header or query param)
  const apiKey = request.headers.get('x-api-key') || url.searchParams.get('key');
  const { host } = url;
  const keyValidation = await validateApiKey(apiKey, env, requestOrigin, targetUrl, host);

  if (!keyValidation.valid) {
    return new Response(
      JSON.stringify({
        error: 'Unauthorized',
        message: keyValidation.error || 'Invalid or missing API key',
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': corsOrigin,
          'Access-Control-Allow-Credentials': 'true',
        },
      },
    );
  }

  // Validate URL format
  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrl);
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Invalid URL format',
        message: error.message,
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': corsOrigin,
          'Access-Control-Allow-Credentials': 'true',
        },
      },
    );
  }

  // Security: Only allow HTTP and HTTPS protocols
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return new Response(
      JSON.stringify({
        error: 'Invalid protocol',
        message: 'Only http:// and https:// URLs are allowed',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': corsOrigin,
          'Access-Control-Allow-Credentials': 'true',
        },
      },
    );
  }

  try {
    // Process headers - handle x-cookie -> cookie conversion
    const proxyHeaders = new Headers(request.headers);
    const xCookie = proxyHeaders.get('x-cookie');
    if (xCookie) {
      proxyHeaders.set('cookie', xCookie);
      proxyHeaders.delete('x-cookie');
    }

    // Create a new request with the target URL
    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: proxyHeaders,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: reveal === 'headers' ? 'manual' : 'follow',
    });

    // Fetch the target URL
    const response = await fetch(proxyRequest);

    // Check if headers should be revealed
    if (reveal === 'headers') {
      // Extract headers into an array of {name, value} objects
      const headersArray = [];
      response.headers.forEach((value, name) => {
        headersArray.push({ name, value });
      });

      // Return JSON with status and headers
      return new Response(
        JSON.stringify({
          status: String(response.status),
          headers: headersArray,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': corsOrigin,
            'Access-Control-Allow-Credentials': 'true',
          },
        },
      );
    }

    // Clone the response so we can modify headers
    const modifiedResponse = new Response(response.body, response);

    // Collect all header names from the response to expose them
    const responseHeaders = [];
    response.headers.forEach((value, name) => {
      responseHeaders.push(name);
    });

    // Add CORS headers
    modifiedResponse.headers.set('Access-Control-Allow-Origin', corsOrigin);
    modifiedResponse.headers.set('Access-Control-Allow-Credentials', 'true');
    modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    modifiedResponse.headers.set('Access-Control-Allow-Headers', '*');
    modifiedResponse.headers.set('Access-Control-Expose-Headers', responseHeaders.join(', '));

    return modifiedResponse;
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Proxy request failed',
        message: error.message,
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': corsOrigin,
          'Access-Control-Allow-Credentials': 'true',
        },
      },
    );
  }
}

/**
 * Handle CORS preflight requests
 * @param {Request} request - The incoming request
 * @returns {Response} CORS preflight response
 */
function handleOptions(request) {
  const origin = request.headers.get('origin') || '*';
  const requestedHeaders = request.headers.get('access-control-request-headers');

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': requestedHeaders || '*',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * Handle favicon requests
 * @returns {Response} ICO favicon response
 */
function handleFavicon() {
  return new Response(faviconData, {
    status: 200,
    headers: {
      'Content-Type': 'image/x-icon',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}

export default {
  /**
   * Fetch event handler
   * @param {Request} request - The incoming request
   * @returns {Promise<Response>} The response
   */
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle favicon requests
    if (url.pathname === '/favicon.ico') {
      return handleFavicon();
    }

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    return handleRequest(request, env);
  },
};
