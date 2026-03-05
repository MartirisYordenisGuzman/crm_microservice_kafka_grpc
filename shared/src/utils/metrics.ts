import client from 'prom-client';

// Create a Registry
export const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'service'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'service'],
});

export const grpcRequestDuration = new client.Histogram({
  name: 'grpc_request_duration_seconds',
  help: 'Duration of gRPC requests in seconds',
  labelNames: ['method', 'service', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5],
});

export const databaseQueryDuration = new client.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table', 'service'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3],
});

// Register metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(grpcRequestDuration);
register.registerMetric(databaseQueryDuration);