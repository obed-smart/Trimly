import { Request, Response } from 'express';

import userServices from '../services/auth.services.js';
import { ApiResponse } from '../utils/apiResponse.js';
import catchAsync from '../utils/catchAsync.js';
import { IUser } from '../model/user.model.js';

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

  registerUser = catchAsync(async (req: Request, res: Response) => {
    console.log('Creating user with data:', req.body);

    const { user, accessToken, refreshToken } = await userServices.registerUser(
      req.body,
    );

    this.setCookies(res, accessToken, refreshToken);

    res
      .status(201)
      .json(
        ApiResponse.success(
          { id: user.id, email: user.email },
          'User registered successfully',
        ),
      );
  });

  login = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IUser;

    const { accessToken, refreshToken } = await userServices.login(user);

    this.setCookies(res, accessToken, refreshToken);

    res
      .status(200)
      .json(
        ApiResponse.success(
          { id: user.id, email: user.email },
          'User logged in successfully',
        ),
      );
  });

  logOut = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(ApiResponse.error('Unauthorized', 401));
    }

    await userServices.logOut(String(userId));

   const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  };

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    res
      .status(200)
      .json(ApiResponse.success(null, 'User logged out successfully'));
  });
}

export default new UserController();
