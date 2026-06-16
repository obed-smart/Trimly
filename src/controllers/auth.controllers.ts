import { Request, Response } from 'express';
import { Types } from 'mongoose';

import userServices from '../services/auth.services.js';
import { ApiResponse } from '../utils/apiResponse.js';
import catchAsync from '../utils/catchAsync.js';
import { IUser } from '../model/user.model.js';
import { urlMigrationQueue } from '../queue/  queue.js';
import logger from '../utils/logger.js';

class UserController {
  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private urlGuestMigration(
    req: Request,
    res: Response,
    userId: Types.ObjectId,
  ) {
    if (req.cookies['anonymousId']) {
      const anonymousId = req.cookies['anonymousId'];

      urlMigrationQueue.add(
        'url-quest-migrations',
        {
          anonymousId,
          userId,
          createdByType: 'user',
        },
        {
          attempts: 3,
          backoff: 5000,
        },
      );
    }

    res.clearCookie('anonymousId', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }

  registerUser = catchAsync(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await userServices.registerUser(
      req.body,
    );

    this.setCookies(res, accessToken, refreshToken);

    this.urlGuestMigration(req, res, user.id);

    res
      .status(201)
      .json(ApiResponse.success({ id: user.id, email: user.email }));
  });

  login = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IUser;

    const { accessToken, refreshToken } = await userServices.login(user);

    this.setCookies(res, accessToken, refreshToken);

    this.urlGuestMigration(req, res, user.id);

    res
      .status(200)
      .json(ApiResponse.success({ id: user.id, email: user.email }));
  });

  refreshToken = catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json(ApiResponse.error('Unauthorized'));
    }

    const tokens = await userServices.refreshTokens(refreshToken);

    this.setCookies(res, tokens.accessToken, tokens.refreshToken);

    res.status(200).json(ApiResponse.success(null));
  });

  logOut = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(ApiResponse.error('Unauthorized'));
    }

    await userServices.logOut(String(userId));

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
    };

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    res.status(200).json(ApiResponse.success(null));
  });

  forgotPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;

    await userServices.requestpasswordReset(email);

    res
      .status(200)
      .json(
        ApiResponse.success(
          'If the email exists, a one time code has been sent.',
        ),
      );
  });

  resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { email, otp, newPassword: password } = req.body;

    await userServices.verifyOtpAndReset(email, otp, password);

    res.status(200).json(ApiResponse.success('Password reset successful'));
  });
}

export default new UserController();
