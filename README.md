# FCORS - Cloudflare CORS Proxy Worker

A Cloudflare Worker that acts as a proxy for URLs with CORS support.

## Features

- 🔒 Proxy any HTTP/HTTPS URL
- 🌐 Full CORS support with credentials
- ⚡ Runs on Cloudflare's edge network
- 🛡️ Basic security validation
- 🔑 API key authentication via KV
- 📝 ESLint with Airbnb base configuration
- 🎨 Beautiful web interface with interactive form
- 📊 Headers inspection mode

## Installation

Install dependencies:

```bash
npm install
```

## Usage

### Development

Run the worker locally:

```bash
npm run dev
```

### Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

### Web Interface

Visit your worker URL without any parameters to access the interactive web form:

```
https://your-worker.workers.dev/
```

The form provides:
- Easy URL input with validation
- Reveal mode selector (proxy or headers)
- Live response preview
- One-click API URL copying

### Making Requests

Once deployed, make requests by passing the target URL as a query parameter:

```bash
# Basic usage
curl "https://your-worker.workers.dev/?url=https://api.example.com/data"

# With encoded URL
curl "https://your-worker.workers.dev/?url=https%3A%2F%2Fapi.example.com%2Fdata"

# Reveal headers only (get status and headers as JSON)
curl "https://your-worker.workers.dev/?url=https://api.example.com/data&reveal=headers"
```

### Example

```javascript
// From a web application - proxy the response
fetch('https://your-worker.workers.dev/?url=https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data));

// Get headers information
fetch('https://your-worker.workers.dev/?url=https://api.example.com/data&reveal=headers')
  .then(response => response.json())
  .then(data => {
    console.log('Status:', data.status);
    console.log('Headers:', data.headers);
    // Output: { status: "200", headers: [{name: "content-type", value: "application/json"}, ...] }
  });
```

## Query Parameters

- `url` (required): The target URL to proxy
- `key` (required): API key for authentication (or use `x-api-key` header)
- `reveal` (optional): Set to `headers` to return response status and headers as JSON instead of the response body

### Reveal Headers Response

When using `?reveal=headers`, the response will be a JSON object:

```json
{
  "status": "200",
  "headers": [
    { "name": "content-type", "value": "application/json" },
    { "name": "cache-control", "value": "no-cache" },
    ...
  ]
}
```

## API Key Authentication

The proxy requires a valid API key for all proxy requests (the web form is accessible without a key).

### Setting Up KV Namespace

1. Create the KV namespace:
   ```bash
   wrangler kv:namespace create "API_KEYS"
   ```

2. Copy the generated namespace ID and update `wrangler.toml`:
   ```toml
   [[kv_namespaces]]
   binding = "API_KEYS"
   id = "YOUR_ACTUAL_NAMESPACE_ID"
   ```

### Adding API Keys

Add API keys to the KV store. The value can be a simple identifier or a JSON config with restrictions:

```bash
# Simple key - no restrictions (allows all origins and URLs)
wrangler kv:key put --binding=API_KEYS "your-api-key-here" "user@example.com"

# Key with origin restrictions only
wrangler kv:key put --binding=API_KEYS "key-123" '{"origins":["https://mysite.com","https://*.mysite.com"]}'

# Key with target URL restrictions only
wrangler kv:key put --binding=API_KEYS "key-456" '{"urls":["https://api.example.com/*","https://*.myservice.com/*"]}'

# Key with both restrictions
wrangler kv:key put --binding=API_KEYS "key-789" '{"origins":["https://myapp.com"],"urls":["https://api.github.com/*"]}'

# List all keys
wrangler kv:key list --binding=API_KEYS
```

### Glob Patterns

Use `*` as a wildcard in patterns:

| Pattern | Matches |
|---------|---------|
| `https://example.com` | Exact match only |
| `https://*.example.com` | Any subdomain of example.com |
| `https://api.example.com/*` | Any path under api.example.com |
| `https://*.example.com/*` | Any subdomain and any path |
| `*` | Everything (use with caution) |

### Key Configuration Format

```json
{
  "origins": ["https://allowed-origin.com", "https://*.allowed-domain.com"],
  "urls": ["https://allowed-target.com/*", "https://*.api.com/*"]
}
```

- **origins**: Array of allowed request origins (where the request comes from)
- **urls**: Array of allowed target URLs (what URLs can be proxied)
- If an array is empty or missing, that restriction is not applied

### Using API Keys

Provide the API key via header or query parameter:

```bash
# Via header (recommended)
curl -H "x-api-key: your-api-key" "https://fcors.org/?url=https://api.example.com/data"

# Via query parameter
curl "https://fcors.org/?url=https://api.example.com/data&key=your-api-key"
```

```javascript
// JavaScript with header
fetch('https://fcors.org/?url=https://api.example.com/data', {
  headers: { 'x-api-key': 'your-api-key' }
})
```

## Security

- API key required for all proxy requests
- Only HTTP and HTTPS protocols are allowed
- URL validation is performed on all requests
- CORS headers are automatically added to all responses

## Linting

Run ESLint:

```bash
npm run lint
```

Auto-fix issues:

```bash
npm run lint:fix
```

## Configuration

Edit `wrangler.toml` to configure your worker:

- `name`: Worker name
- `compatibility_date`: Cloudflare compatibility date
- Add routes to configure custom domains

## License

MIT

