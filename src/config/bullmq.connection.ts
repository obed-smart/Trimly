import Redis from 'ioredis';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

// const bullmqConnection = new Redis(
//   process.env.REDIS_URL!,
//   {
//     maxRetriesPerRequest: null,
//   }
// );

const bullmqConnection = new Redis(
  {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
  },
  {
    maxRetriesPerRequest: null,
  },
);

bullmqConnection.on('connect', () => {
  logger.info('BullMQ Redis connected');
});

bullmqConnection.on('error', (err: Error) => {
  logger.error({
    error: err.message,
  });
});

export default bullmqConnection;
