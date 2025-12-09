const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2]
});
register.registerMetric(httpRequestDuration);

function middleware (req, res, next) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1e9; // seconds
    httpRequestDuration.observe({ method: req.method, route: req.path || req.route?.path || 'unknown', status_code: res.statusCode }, duration);
  });
  next();
}

function handler (req, res) {
  res.set('Content-Type', register.contentType);
  register.metrics()
    .then(metrics => res.end(metrics))
    .catch(err => {
      console.error('Error generating metrics:', err);
      res.status(500).end('Error generating metrics');
    });
}

module.exports = { middleware, handler };
