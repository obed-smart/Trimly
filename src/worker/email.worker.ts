import { Job, Worker } from 'bullmq';
import logger from '../utils/logger.js';
import bullmqConnection from '../config/bullmq.connection.js';
import { ISendEmailPayload, sendMail } from '../utils/emails.js';

export const worker = new Worker(
  'email-queue',
  async (job: Job<ISendEmailPayload>) => {

    logger.info(`[Email Worker] proccessing message dispatch to Job ${job.id}`);

    await sendMail(job.data);

    logger.info(`[Email Worker] Successfully sent email to ${job.data.to}`);
  },
  {
    connection: bullmqConnection,
  },
);

worker.on('completed', (job) => {
  logger.info(
    ` [Email Worker success] Email Job ${job.id} completed successfully.`,
  );
});

worker.on('failed', (job, err: Error) => {
  logger.error(
    {
      error: err.message,
      stack: err.stack,
    },
    ` [Email Worker failed] Email Job ${job?.id} failed.`,
  );
});
