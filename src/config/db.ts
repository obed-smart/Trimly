import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const dbUrl = process.env.DATABASE_LOCAL as string;

console.log('Database URL:', dbUrl);

const connectDb = async () => {
  logger.info('connecting to the Database....');
  try {
    await mongoose.connect(dbUrl, { serverSelectionTimeoutMS: 5000 });
    logger.info('Database connected successfully');
  } catch (err: string | any) {
    console.error('Database connection error:', err);
    logger.error({ error: err }, 'Database connection failed');
    process.exit(1);
  }
};

export default connectDb;
