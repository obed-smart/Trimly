import { Queue } from 'bullmq';
import bullmqConnection from '../config/bullmq.connection.js';
import mongoose from 'mongoose';
import { ISendEmailPayload } from '../utils/emails.js';

export const analyticsQueue = new Queue('analytics', {
  connection: bullmqConnection,
});

export interface IurlMigrationJobData {
  anonymousId: string;
  userId: mongoose.Types.ObjectId;
  createdByType: 'anonymous' | 'user';
}

export const urlMigrationQueue = new Queue<IurlMigrationJobData>(
  'url-migration',
  {
    connection: bullmqConnection,
  },
);

export const emailQueue = new Queue<ISendEmailPayload>('email-queue', {
  connection: bullmqConnection,
});
