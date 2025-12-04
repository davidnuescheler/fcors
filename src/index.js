/**
 * CORS Proxy Cloudflare Worker
 * Proxies requests to URLs passed via the ?url= query parameter
 */

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
    input[type="url"], select {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e1e8ed;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
      font-family: inherit;
    }
    input[type="url"]:focus, select:focus {
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
  </div>
  
  <script>
    const form = document.getElementById('proxyForm');
    const resultDiv = document.getElementById('result');
    const baseUrl = '${baseUrl}';
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const url = formData.get('url');
      const reveal = formData.get('reveal');
      
      const params = new URLSearchParams({ url });
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
      const reveal = formData.get('reveal');
      
      if (!url) {
        alert('Please enter a URL first');
        return;
      }
      
      const params = new URLSearchParams({ url });
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
 * Handle incoming requests
 * @param {Request} request - The incoming request
 * @returns {Promise<Response>} The proxied response or error response
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');
  const reveal = url.searchParams.get('reveal');

  // Show form if no URL is provided
  if (!targetUrl) {
    const baseUrl = `${url.protocol}//${url.host}`;
    return new Response(generateFormHTML(baseUrl), {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
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
          'Access-Control-Allow-Origin': '*',
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
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  }

  try {
    // Create a new request with the target URL
    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
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
            'Access-Control-Allow-Origin': '*',
          },
        },
      );
    }

    // Clone the response so we can modify headers
    const modifiedResponse = new Response(response.body, response);

    // Add CORS headers
    modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
    modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    modifiedResponse.headers.set('Access-Control-Allow-Headers', '*');

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
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  }
}

/**
 * Handle CORS preflight requests
 * @returns {Response} CORS preflight response
 */
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export default {
  /**
   * Fetch event handler
   * @param {Request} request - The incoming request
   * @returns {Promise<Response>} The response
   */
  async fetch(request) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    return handleRequest(request);
  },
};
