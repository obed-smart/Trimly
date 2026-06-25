import { Worker } from 'bullmq';

import { syncToDb } from '../services/flushAnalytics.js';
import logger from '../utils/logger.js';
import bullmqConnection from '../config/bullmq.connection.js';
import { jobsFailedCounter, jobsProcessedCounter } from '../config/matries.js';

export async function startAnalyticsWorker() {
  const worker = new Worker(
    'analytics',

    async (job: any) => {
      if (job.name === 'flush-analytics') {
        logger.info(`Starting background database sync [Job ID: ${job.id}] 🚚`);
        await syncToDb();
        logger.info(`Analytics batch sync complete [Job ID: ${job.id}] ✅`);
      }
    },

    {
      connection: bullmqConnection,
      concurrency: 1,
    },
  );

  worker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed successfully.`);
    jobsProcessedCounter.inc({ job_type: 'analytics_flush_job' });
  });

  worker.on('failed', (job, err: Error) => {
    logger.error(
      {
        error: err.message,
        stack: err.stack,
      },
      'BullMQ worker failed',
    );
    jobsFailedCounter.inc({ job_type: 'analytics_flush_job' });
  });

  worker.on('error', (err: Error) => {
    logger.error({ err }, 'Critical BullMQ Worker error:');
  });
}
