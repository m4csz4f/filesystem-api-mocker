// Example wildcard handler - handles any HTTP method
// Useful for prototyping or catch-all endpoints
export default function (req, res) {
  const { method, baseUrl, query, body } = req;

  // Log request details (useful for debugging)
  console.log(`${method} ${baseUrl} - Wildcard handler`);

  // Different responses based on method
  switch (method) {
    case 'GET':
      return res.json({
        message: `GET request to ${baseUrl}`,
        method,
        baseUrl,
        query,
        timestamp: new Date().toISOString(),
      });

    case 'POST':
      return res.status(201).json({
        message: `Created resource at ${baseUrl}`,
        method,
        baseUrl,
        body,
        timestamp: new Date().toISOString(),
      });

    case 'PUT':
    case 'PATCH':
      return res.json({
        message: `Updated resource at ${baseUrl}`,
        method,
        baseUrl,
        body,
        timestamp: new Date().toISOString(),
      });

    case 'DELETE':
      return res.status(204).send(); // No content

    default:
      return res.status(200).end();
  }
}
