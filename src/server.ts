import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import GlobalEroorHandler from './middlewares/globalError.middleware.js';
import AppError from './utils/appErros.js';
import logger from './utils/logger.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  logger.info('Get endpoint Hit');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
  });
});

app.use('/api/v1/', (req, res) => {
  res.send('Hello World');
});

app.use((req, res, next) => {
  throw new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
});

app.use(GlobalEroorHandler);

export default app;
