# FCORS - Cloudflare CORS Proxy Worker

A Cloudflare Worker that acts as a proxy for URLs with CORS support.

## Features

- 🔒 Proxy any HTTP/HTTPS URL
- 🌐 Full CORS support
- ⚡ Runs on Cloudflare's edge network
- 🛡️ Basic security validation
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

## Security

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

