import express from 'express';
import userControllers from '../controllers/auth.controllers.js';
import validate from '../middlewares/validate.middleware.js';
import passport from 'passport';
import { LoginSchema } from '../dtos/auth.dto.js';
import authenticate from '../middlewares/authenticate.middleware.js';

const router = express.Router();

router.post('/register', userControllers.registerUser);
router.post(
  '/login',
  validate(LoginSchema),
  passport.authenticate('local', { session: false }),
  userControllers.login,
);

router.post('/logout', authenticate, userControllers.logOut);

// router.get('/profile', authMiddleware, userController.getProfile);

export default router;
