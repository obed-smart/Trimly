import client from 'prom-client';
import {
  analyticsQueue,
  emailQueue,
  urlMigrationQueue,
} from '../queue/  queue.js';
import UrlShorten from '../model/urlShorten.model.js';
import User from '../model/user.model.js';

export const register = new client.Registry();

register.setDefaultLabels({ app: 'Trimly' });
client.collectDefaultMetrics({ register });

export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const errorCounter = new client.Counter({
  name: 'Trimly_errors_total',
  help: 'The total number of errors that happened in the app',
  labelNames: ['method', 'route', 'status_code', 'type'],
  registers: [register],
});

export const totalUsersGauge = new client.Gauge({
  name: 'Trimly_db_users_total',
  help: 'Total number of registered users in the database',
  registers: [register],
  async collect() {
    this.set(await User.countDocuments());
  },
});

export const totalUrlsGauge = new client.Gauge({
  name: 'Trimly_db_urls_total',
  help: 'Total number of short URLs created in the database',
  registers: [register],
  async collect() {
    this.set(await UrlShorten.countDocuments());
  },
});


export const queueWaitingJobsGauge = new client.Gauge({
  name: 'Trimly_queue_waiting_jobs',
  help: 'Number of jobs currently waiting in the queue',
  labelNames: ['queue'],
  registers: [register],
  async collect() {
    for await (const [name, queue] of Object.entries(queues)) {
      const waitingCount = await queue.getWaitingCount();
      this.set({ queue: name }, waitingCount);
    }
  },
});


export const createdUserCounter = new client.Counter({
  name: 'new_users_total',
  help: 'Total number of user registered from set up',
  labelNames: ['auth_method'],
  registers: [register],
});

export const createdUrlLinks = new client.Counter({
  name: 'links_created_total',
  help: 'Total short links created',
  registers: [register],
});

export const redirectRequestCounter = new client.Counter({
  name: 'redirect_requests_total',
  help: 'Total redirect requests',
  labelNames: ['status'],
  registers: [register],
});

export const redisErrorCounter = new client.Counter({
  name: 'redis_errors_total',
  help: 'Total redis errors',
  labelNames: ['operation'],
  registers: [register],
});

const queues = {
  analytics_flush_queue: analyticsQueue,
  email_queue: emailQueue,
  url_migration_queue: urlMigrationQueue,
};


export const jobsProcessedCounter = new client.Counter({
  name: 'jobs_processed_total',
  help: 'Total jobs processed',
  labelNames: ['job_type'],
  registers: [register],
  async collect() {},
});

export const jobsFailedCounter = new client.Counter({
  name: 'jobs_failed_total',
  help: 'Total jobs failed',
  labelNames: ['job_type'],
  registers: [register],
});

export const cacheHitsCounter = new client.Counter({
  name: 'cache_hits_total',
  help: 'Total cache hits',
  registers: [register],
});

export const cacheMissesCounter = new client.Counter({
  name: 'cache_misses_total',
  help: 'Total cache misses',
  registers: [register],
});
