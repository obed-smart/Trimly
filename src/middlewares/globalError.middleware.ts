import type { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appErros.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { errorCounter } from '../config/matries.js';

type ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => void;

const sendErrorDev = (err: any, res: Response) => {
  res.status(err.statusCode).json({
    ...ApiResponse.error({ status: err.status, message: err.message }),
    stack: err.stack,
  });
};

const sendErrorProd = (err: any | string, req: Request, res: Response) => {
  const route = req.route?.path || req.path;

  if (err.isOperational) {
    errorCounter.inc({
      method: req.method,
      route,
      status_code: String(err.statusCode),
      type: 'operational',
    });

    return res
      .status(err.statusCode)
      .json(ApiResponse.error({ status: err.status, message: err.message }));
  }

  errorCounter.inc({
    method: req.method,
    route,
    status_code: String(err.statusCode),
    type: 'programming',
  });
};

const errorMiddleware: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = err;

  // if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  // if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  // if (error.name === 'JsonWebTokenError') error = handleJWTError();
  // if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, req, res);
  }
};

export default errorMiddleware;
