import { Job, Worker } from 'bullmq';
import logger from '../utils/logger.js';
import bullmqConnection from '../config/bullmq.connection.js';
import { IurlMigrationJobData } from '../queue/  queue.js';
import urlRepository from '../repository/url.repository.js';
import { jobsFailedCounter, jobsProcessedCounter } from '../config/matries.js';

export async function startUrlMigrationWorker() {
  const worker = new Worker<IurlMigrationJobData>(
    'url-migration',
    async (job: Job<IurlMigrationJobData>) => {
      const { anonymousId, userId, createdByType } = job.data;

      logger.info(
        `[Url Migration Queue worker] starting migration for anonymouId: ${anonymousId}`,
      );

      await urlRepository.findAndUpdateAnonymousId(anonymousId, {
        anonymousId: null,
        userId: userId,
        createdByType: createdByType,
      });

      logger.info(
        `[Url Migration Queue Worker] Successfully finished migration for user: ${userId}`,
      );
    },
    {
      connection: bullmqConnection,
    },
  );

  worker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed successfully.`);
    jobsProcessedCounter.inc({ job_type: 'url_migration_job' });
  });

  worker.on('failed', (job, err: Error) => {
    logger.error(
      {
        error: err.message,
        stack: err.stack,
      },
      `[Queue Worker] for url migration ${job?.id} failed`,
    );

    jobsFailedCounter.inc({ job_type: 'url_migration_job' });
  });
}
