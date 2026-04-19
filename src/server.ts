import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import morgan from 'morgan';



import GlobalEroorHandler from './middlewares/globalError.middleware.js';
import AppError from './utils/appErros.js';
import logger from './utils/logger.js';
import { ApiResponse } from './utils/apiResponse.js';
import urlRouter from './routers/url.routers.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/health/live', (req, res) => {
  const t = Date.now();

  res.status(200).json(
    ApiResponse.success(
      {
        status: 'alive',
        uptime: Math.round(process.uptime()),
        responseTime: `${Date.now() - t}ms`,
        timestamp: new Date().toISOString(),
      },
      'Trimly is live',
    ),
  );
});

app.get('/health/ready', async(req, res) => {
  const start = Date.now();

  try {
    if (!mongoose.connection.db) {
      throw new AppError('MongoDB not initialized', 503);
    }

    await mongoose.connection.db.admin().ping();

    res.status(200).json(
      ApiResponse.success(
        {
          status: 'ready',
          database:
            mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
          uptime: Math.round(process.uptime()),
          responseTime: `${Date.now() - start}ms`,
          timestamp: new Date().toISOString(),
        },
        'Trimly is ready',
      ),
    );
  } catch (error) {
    logger.error({ error }, 'Health check failed');

    return res.status(503).json(ApiResponse.error('Trimly is not ready', 503));
  }
});

app.use('/api/v1/urls', urlRouter);

app.use((req, res, next) => {
  throw new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
});

app.use(GlobalEroorHandler);

export default app;
