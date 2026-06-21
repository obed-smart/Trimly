import { Redis } from 'ioredis';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

// const redis = new Redis(
//   process.env.NODE_ENV === 'production'
//     ? process.env.REDIS_URL
//     : {
//         host: process.env.REDIS_HOST,
//         port: Number(process.env.REDIS_PORT),
//         password: process.env.REDIS_PASSWORD,
//       },
// );

const redis =
  process.env.NODE_ENV === 'production'
    ? new Redis(
        process.env.REDIS_URL as string,
        {
          maxRetriesPerRequest: null,
        } as any,
      )
    : new Redis({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: null,
      });

redis.on('connect', () => {
  logger.info('Connected to Redis successfully');
});

redis.on('error', (err: Error) => {
  logger.error({ error: err }, 'Redis connection error');
});

export default redis;
