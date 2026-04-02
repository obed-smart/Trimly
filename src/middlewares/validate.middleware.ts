import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ObjectSchema } from 'joi';

import AppError from '../utils/appErros.js';

type RequestProperty = 'body' | 'query' | 'params';
const validate =
  (schema: ObjectSchema, property: RequestProperty = 'body'): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
    });

    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ');
      return next(new AppError(message, 400));
    }

    if (property === 'body') {
      (req as Request & { body: unknown }).body = value;
    } else {
      Object.assign(req[property], value);
    }

    next();
  };

export default validate;
