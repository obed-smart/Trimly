import express from 'express';
import userControllers from '../controllers/auth.controllers.js';
import validate from '../middlewares/validate.middleware.js';
import passport from 'passport';
import { LoginSchema } from '../dtos/auth.dto.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';
import {
  loginLimiter,
  passwordResetLimiter,
  refereshTokenLimiter,
} from '../config/rateLimiter.js';

const router = express.Router();

router.post('/register', userControllers.registerUser);
router.post(
  '/login',
  loginLimiter,
  validate(LoginSchema),
  passport.authenticate('local', { session: false }),
  userControllers.login,
);

router.post(
  '/refresh-token',
  refereshTokenLimiter,
  userControllers.refreshToken,
);

router.post('/logout', authenticate, userControllers.logOut);

router.post(
  '/forgot-password',
  passwordResetLimiter,
  userControllers.forgotPassword,
);
router.post(
  '/reset-password',
  passwordResetLimiter,
  userControllers.resetPassword,
);

// router.get('/profile', authMiddleware, userController.getProfile);

export default router;
