import { Worker } from 'bullmq';

import { syncToDb } from '../services/flushAnalytics.js';
import logger from '../utils/logger.js';
import bullmqConnection from '../config/bullmq.connection.js';
import { jobsFailedCounter, jobsProcessedCounter } from '../config/matries.js';

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
  });

  jobsFailedCounter.inc({ job_type: 'analytics_flush_job' });
}
