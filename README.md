# Mock API Server

This is a simple mock API server built with Express.js. It serves as a placeholder for API endpoints during development and testing.

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

### How it works:

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

> Read more about the *test-mocks* directory structure in the [test-mocks README](tests/test-mocks/README.md).

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
