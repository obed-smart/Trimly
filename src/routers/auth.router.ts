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
import authControllers from '../controllers/auth.controllers.js';

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

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
    session: false,
  }),
);


router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/auth/login',
  }),
  authControllers.googleCallback,
);

// router.get('/profile', authMiddleware, userController.getProfile);

export default router;
