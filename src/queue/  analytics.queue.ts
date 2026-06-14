import { Queue } from 'bullmq';
import bullmqConnection from '../config/bullmq.connection.js';

export const analyticsQueue = new Queue('analytics', {
  connection: bullmqConnection,
});

