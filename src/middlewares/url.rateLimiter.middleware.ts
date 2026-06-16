import { Response, Request, NextFunction } from 'express';
import {
  anonymousLimiter,
  authenticatedLimiter,
} from '../config/rateLimiter.js';

export const urlRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.user) return authenticatedLimiter(req, res, next);
  return anonymousLimiter(req, res, next);
};
