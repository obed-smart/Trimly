import { Worker } from 'bullmq';

import { syncToDb } from '../services/flushAnalytics.js';
import redis from '../config/redis.config.js';
import { worker } from 'node:cluster';
import logger from '../utils/logger.js';
import bullmqConnection from '../config/bullmq.connection.js';

export async function startAnalyticsWorker() {
  const worker = new Worker(
    'analytics',

    async () => {
      await syncToDb();
    },

    {
      connection: bullmqConnection,
    },
  );

  worker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed successfully.`);
  });

  worker.on('failed', (job, err: Error) => {
    logger.error(
      {
        error: err.message,
        stack: err.stack,
      },
      'BullMQ worker failed',
    );
  });
}
