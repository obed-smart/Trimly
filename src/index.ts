import dotenv from 'dotenv';
dotenv.config();

import connectDb from './config/db.js';
import app from './server.js';
import logger from './utils/logger.js';
import { startAnalyticsWorker } from './worker/analytics.worker.js';

const startServer = async () => {
  await connectDb();

  await startAnalyticsWorker();

  const PORT = process.env.PORT || 3000;

  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} 🚀`);
  });
};

startServer();
