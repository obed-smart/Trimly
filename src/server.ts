import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import morgan from 'morgan';
import helmet from 'helmet';
import passport from 'passport';

import GlobalEroorHandler from './middlewares/globalError.middleware.js';
import AppError from './utils/appErros.js';
import logger from './utils/logger.js';
import { ApiResponse } from './utils/apiResponse.js';
import urlRouter from './routers/url.routers.js';
import analysisRouter from './routers/analysis.routers.js';
import userRouter from './routers/auth.router.js';

import './config/passport-config.js';

const app = express();

app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('trust proxy', true);

app.use(passport.initialize());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/health/live', (req, res) => {
  const start = Date.now();

  res.status(200).json(
    ApiResponse.success({
      status: 'alive',
      uptime: Math.round(process.uptime()),
      responseTime: `${Date.now() - start}ms`,
      timestamp: new Date().toISOString(),
    }),
  );
});

app.get('/health/ready', async (req, res) => {
  const start = Date.now();

  try {
    if (!mongoose.connection.db) {
      throw new AppError('MongoDB not initialized', 503);
    }

    await mongoose.connection.db.admin().ping();

    res.status(200).json(
      ApiResponse.success({
        status: 'ready',
        database:
          mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        uptime: Math.round(process.uptime()),
        responseTime: `${Date.now() - start}ms`,
        timestamp: new Date().toISOString(),
      }),
    );
  } catch (error) {
    logger.error({ error }, 'Health check failed');

    return res.status(503).json(ApiResponse.error('Trimly is not ready'));
  }
});

app.use('/api/v1/urls', urlRouter);
app.use('/api/v1/analysis', analysisRouter);
app.use('/api/v1/auth', userRouter);

app.use((req, res, next) => {
  throw new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
});

app.use(GlobalEroorHandler);

export default app;
