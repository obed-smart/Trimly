import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const dbUrl =
  process.env.NODE_ENV === 'production'
    ? (process.env.DATABASE_PROD as string)
    : (process.env.DATABASE_LOCAL as string);

const connectDb = async () => {
  logger.info('connecting to the Database....');
  try {
    await mongoose.connect(dbUrl);
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error('Database not initialized');
    }

    await db.admin().command({ ping: 1 });

    logger.info('Database connected successfully');
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error({ error: err }, 'Database connection failed');
    } else {
      logger.error({ error: err }, 'An unknown error occurred');
    }
    process.exit(1);
  }
};

export default connectDb;
