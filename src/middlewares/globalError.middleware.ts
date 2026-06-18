import type { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appErros.js';
import { ApiResponse } from '../utils/apiResponse.js';

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

const sendErrorProd = (err: any | string, res: Response) => {
  if (err.isOperational) {
    return res
      .status(err.statusCode)
      .json(ApiResponse.error({ status: err.status, message: err.message }));
  }
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
    sendErrorProd(error, res);
  }
};

export default errorMiddleware;
