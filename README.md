# Mock API Server

This is a simple mock API server built with Express.js. It serves as a placeholder for API endpoints during development and testing.

## Configuration (`mock_config.json`)

The server behavior is driven by a JSONC (JSON with comments) configuration file named `mock_config.json` located at the project root. It supports three top‑level keys:

- `default_response` – Fallback HTTP response when no mock or proxy route matches
  - `status` (number) – HTTP status code to return (default: `500` if unspecified)
  - `body` (object) – JSON payload returned. If omitted: `{ "error": "No route matched" }`
- `mocks` – Object mapping a base URL path (key) to a relative filesystem directory (value) that contains mock handlers / static JSON. Each mapped directory is mounted at the normalized path (leading slash enforced, trailing slash trimmed).
  - Example: `"/test": "tests/test-mocks"` mounts the content of `tests/test-mocks` at `http://localhost:<port>/test`
- `proxies` – Array of proxy definitions forwarding selected incoming request paths to external targets (optionally rewriting the path segment).
  - `target` (string) – Base target URL (trailing slash trimmed)
  - `changeOrigin` (boolean, optional) – If true, replaces `Host` header with target host
  - `paths` (array) – Per-path proxy rules
    - `path` (string) – Incoming path prefix to match (normalized: leading slash ensured, trailing slash trimmed)
    - `rewrite` (string, optional) – Replacement prefix for the forwarded request path (use `/` to drop the matched prefix)

### Example

```jsonc
{
  "default_response": {
    "status": 404,
    "body": { "error": "Requested path not found" },
  },
  "mocks": {
    "/test": "tests/test-mocks",
  },
  "proxies": [
    {
      "target": "https://other-example.com",
      "changeOrigin": true,
      "paths": [{ "path": "/cheats", "rewrite": "/" }],
    },
    {
      "target": "https://example.com",
      "paths": [{ "path": "/joke", "rewrite": "/some/other/path" }],
    },
  ],
}
```

### Mock Directory Structure Rules

Within each mapped mock directory:

- Files named after HTTP methods (e.g., `GET.json`, `POST.js`) are served/executed when the corresponding method and path match.
- `ANY.js` or `ANY.json` are fallbacks when a specific method file does not exist.
- Dynamic path segments are created with double‑underscore directory names, e.g. `__id__` → becomes `:id` and is available at `req.params.id`.
- For JavaScript handlers, export either a default function or a named `handler` function: `export default (req, res) => { ... }`.

### Proxy Behavior

For each proxy rule:

- Incoming request path is matched against `paths[].path`.
- If `rewrite` is provided, the matched prefix is replaced; if `rewrite` is `/`, the prefix is removed.
- Headers are forwarded as-is unless `changeOrigin` is set (then the `Host` header is adjusted to the target host).
- Request bodies for `POST`, `PUT`, and `PATCH` are JSON‑stringified if present.

### Order of Resolution

1. Incoming request is first checked against configured mock mount points.
2. If no mock file matches the traversed filesystem path, the request falls through.
3. Proxies are applied based on their mounted middleware order (declared order in config). (In current implementation proxies are configured before mocks.)
4. If neither a mock nor proxy handles the request, `default_response` is returned.

### Updating Configuration During Development

`nodemon` watches `mock_config.json`. Saving changes restarts the server automatically when running with `yarn dev`.

### Minimal Config Template

```jsonc
{
  "default_response": { "status": 404, "body": { "error": "Not Found" } },
  "mocks": {},
  "proxies": [],
}
```

If `default_response` is omitted, status defaults to 500 and body to `{ "error": "No route matched" }`.

### Selecting an Alternate Configuration File

You can point the server at a different configuration file without renaming `mock_config.json`.

Precedence (highest wins):

1. CLI flag `--config <file>` or `-c <file>`
2. Environment variable `MOCK_CONFIG=<file>`
3. Default: `mock_config.json` in project root

Examples:

```bash
# Use a relative path
node src/app.js --config alt_config.mock.json

# Using short flag
node src/app.js -c alt.json

# Absolute path
node src/app.js --config /abs/path/to/local.jsonc

# Via environment variable
MOCK_CONFIG=team.mock.json node src/app.js

# With yarn dev (nodemon will restart on changes to common *config/mock* patterns)
MOCK_CONFIG=staging.config.json yarn dev
```

If the specified file is missing or cannot be parsed as JSON/JSONC the process exits with an error message.

> Note: If you use `yarn dev`, to start the server in development mode with auto-restart on file changes, use the `-c` flag rather than `--config` due to `nodemon` limitations.

## HTTPS Support

The server supports HTTPS by using a self-signed certificate. This is useful for local development environments where you want to test secure connections.
Store certificates in the `certs` directory.

### Generating a Self-Signed SSL Certificate

To generate a self-signed SSL certificate, you can use tools like OpenSSL. Here's a basic example:

1. Generate a private key:

   ```bash
   openssl genpkey -algorithm RSA -out private-key.pem
   ```

2. Generate a certificate signing request (CSR):

   ```bash
   openssl req -new -key private-key.pem -out csr.pem
   ```

3. Generate a self-signed certificate:

   ```bash
   openssl x509 -req -days 365 -in csr.pem -signkey private-key.pem -out certificate.pem
   ```

Keep in mind that using a self-signed certificate will result in browser warnings, as the certificate is not signed by a trusted certificate authority (CA). To avoid these warnings, you can use a certificate signed by a trusted CA. You can also use a self-signed certificate and add it to the trusted CA store of your browser.

## Named Parameters

The mock server supports named parameters in directory structures. Directory names wrapped in double underscores (`__name__`) are treated as named parameters that can be accessed in your handler functions.

### How it works

1. **Directory Structure**: Create directories with names like `__name__`, `__id__`, `__category__`, etc.
2. **URL Mapping**: When a request is made, the server maps URL segments to these parameter directories
3. **Parameter Access**: Handler functions can access these parameters via `request.params`

## Testing

This project uses **Vitest** as the primary testing framework with **Supertest** for HTTP endpoint testing.

### Available Test Commands

```bash
yarn test              # Run all tests
yarn test:watch        # Run tests in watch mode
yarn test:coverage     # Run tests with coverage
yarn test:ui           # Run tests with UI dashboard
```

### Test Structure

```text
tests/
├── setup.js              # Global test setup and teardown
├── mocker.test.js         # Integration tests for the main API
├── mocker-units.test.js   # Unit tests for utility functions
├── integration.test.js    # End-to-end integration tests
└── test-mocks/            # Mock data and handlers for testing
    ├── wild/              # Wildcard route handlers
    ├── products/          # Product catalog mock handlers
    ├── users/             # User management mock handlers
    └── api/v1/health/     # Nested API structure mock handlers
```

> Read more about the _test-mocks_ directory structure in the [test-mocks README](tests/test-mocks/README.md).

### Test Categories

1. **Unit Tests** (`mocker-units.test.js`)
   - Test individual functions like `findMatchingDir` and `useDynamicHandler`
   - Fast, isolated tests for core logic

2. **Integration Tests** (`mocker.test.js`)
   - Test the complete Express router functionality
   - Test file system routing, parameter extraction, handler loading

3. **End-to-End Tests** (`integration.test.js`)
   - Test complex scenarios with nested routes
   - Test HTTP method prioritization and fallbacks

### Running Individual Test Suites

```bash
# Run only unit tests
yarn test tests/mocker-units.test.js

# Run only integration tests
yarn test tests/mocker.test.js

# Run with verbose output
yarn test --reporter=verbose
```

### Coverage Reports

Coverage reports are generated in the `coverage/` directory and include:

- **Text summary** in the terminal
- **HTML report** for detailed analysis
- **JSON data** for CI/CD integration
