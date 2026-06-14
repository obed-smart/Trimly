import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { IUser } from '../model/user.model.js';

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    'jwt',
    { session: false },
    (err: Error | null, user: IUser | false) => {
      if (err) return next(err);

      console.log('Authenticated user:', user);

      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      req.user = user;
      next();
    },
  )(req, res, next);
};

export default authenticate;
