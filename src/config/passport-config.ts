import { Request } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import userRepository from '../repository/auth.repository.js';
import authRepository from '../repository/auth.repository.js';
import { ifError } from 'node:assert';
import { generateUniqueUsername } from '../utils/utils.js';

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

// passport.use(
//   new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process,
//     callbackURL: 'http://localhost:3000/auth/google/callback',
//   }),
// );

passport.use(
  'google',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:3000/api/v1/auth/google/callback',
    },
    async (accessToken, refereshToken, profile, done: Function) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(null, false);

        let user = await authRepository.findByGoogleId(profile.id);
        let isNewUser = false;

        if (!user) {
          const username = await generateUniqueUsername(profile.displayName);

          user = await authRepository.create({
            email,
            username,
            googleId: profile.id,
            password: '',
          });

          isNewUser = true;
        }

        return done(null, { user, isNewUser });
      } catch (error) {
        return done(error);
      }
    },
  ),
);
