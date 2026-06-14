import { Request } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import userRepository from '../repository/auth.repository.js';

passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password', session: false },
    async (email: string, password: string, done: Function) => {
      try {
        const user = await userRepository.findByEmail(email);
        if (!user) return done(null, false, { message: 'invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch)
          return done(null, false, { message: 'invalid credentials' });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

const cookieExtractor = (req: Request): string | null => {
  let token = null;


  if (req && req.cookies) {
    token = req.cookies['accessToken'];
  }

  console.log('Extracted token:', token);
  return token;
};


const jwtOptions = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_ACCESS_SECRET || 'access_secret_key',
};

passport.use(
  new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
      const user = await userRepository.findById(jwtPayload.sub);
      if (!user) return done(null, false);
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }),
);
