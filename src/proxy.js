import https from 'https';

/**
 * Configures proxy routes for an Express application based on the provided configuration.
 * Sets up middleware to forward requests to specified target URLs with optional path rewriting.
 *
 * @param {Object} app - Express application instance to configure proxies on
 * @param {Object} config - Configuration object containing proxy settings
 * @param {Array} config.proxies - Array of proxy configuration objects
 * @param {Array} config.proxies[].paths - Array of path configuration objects for each proxy
 * @param {string} config.proxies[].paths[].path - The path pattern to match for proxying
 * @param {string} config.proxies[].paths[].rewrite - Optional path rewrite pattern for the target URL
 * @param {string} config.proxies[].target - The target URL to proxy requests to
 *
 * @example
 * const config = {
 *   proxies: [{
 *     target: 'https://api.example.com',
 *     paths: [
 *       { path: '/api/v1', rewrite: '/v1' },
 *       { path: '/health', rewrite: '/' }
 *     ]
 *   }]
 * };
 * configureProxy(app, config);
 */
export const configureProxy = (app, config) => {
  config.proxies.forEach(proxy => {
    if (proxy.paths) {
      proxy.paths.forEach(({ path, rewrite }) => {
        path = path.startsWith('/') ? path : `/${path}`;
        path = path.endsWith('/') ? path.slice(0, -1) : path;
        proxy.target = proxy.target.endsWith('/')
          ? proxy.target.slice(0, -1)
          : proxy.target;
        if (rewrite === '/') rewrite = '';
        console.log(
          `Setting up proxy for path: ${path} to target: ${proxy.target}`,
        );
        app.use(path, (req, res) => {
          const options = {
            method: req.method,
            headers: { ...req.headers, host: new URL(proxy.target).host },
            rejectUnauthorized: false, // Bypass SSL certificate verification
          };
          const proxyUrl = new URL(
            `${proxy.target}${
              rewrite ? req.originalUrl.replace(path, rewrite) : req.originalUrl
            }`,
          );
          console.log(`Proxying request to: ${proxyUrl.href}`);
          const proxyRequest = https.request(proxyUrl, options, proxyRes => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
          });
          proxyRequest.on('error', err => {
            console.error(`Error in proxy request: ${err.message}`);
            res.status(500).json({ error: 'Proxy request failed' });
          });
          req.pipe(proxyRequest, { end: true });
        });
      });
    }
  });
};
