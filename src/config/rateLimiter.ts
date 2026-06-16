import {Request, Response} from 'express';
import { ipKeyGenerator, rateLimit } from 'express-rate-limit';
import { type RedisReply, RedisStore } from 'rate-limit-redis';
import redis from './redis.config.js';
import { IUser } from '../model/user.model.js';

const createLimiter = (options: {
  windowMs: number;
  max: number;
  message: string;
}) =>
  rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (command: string, ...args: string[]) =>
        redis.call(command, ...args) as Promise<RedisReply>,
    }),

    keyGenerator: (req: Request, res: Response) => {
      if (req.user) return `rl:user:${(req.user as IUser).id.toString()}`;
      if (req.cookies.anonymousId) {
        return `rl:anonymous:${req.cookies.anonymousId}`;
      }

      return ipKeyGenerator(req, res);
    },
    handler: (req: Request, res: Response) => {
      res.status(429).json({ message: options.message });
    },
  });

export const anonymousLimiter = createLimiter({
  windowMs: 24 * 60 * 60 * 1000,
  max: 5,
  message:
    'Anonymous user can create a maximum of 5 URLs per day. Please sign up for more',
});

export const authenticatedLimiter = createLimiter({
  windowMs: 24 * 60 * 60 * 1000,
  max: 100,
  message:
    'Authenticated user can create a maximum of 100 URLs per day. Please contact support for more',
});

export const globalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many requests , slow down',
});

export const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later',
});

export const passwordResetLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many password reset attempts, please try again later',
});

export const refereshTokenLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many password reset attempts, please try again later',
});
