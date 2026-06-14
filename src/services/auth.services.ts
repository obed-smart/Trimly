import passport from 'passport';
import { IUser } from '../model/user.model.js';
import authRepository from '../repository/auth.repository.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from '../utils/utils.js';
import AppError from '../utils/appErros.js';

export interface ITokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthService extends ITokenResponse {
  user: IUser;
}

class AuthService {
  private generateToken(user: IUser) {
    const accessToken = hashToken(generateAccessToken(user));
    const refreshToken = hashToken(generateRefreshToken());

    return {
      accessToken,
      refreshToken,
    };
  }

  // Implement user-related business logic here
  async registerUser(userData: Partial<IUser>): Promise<IAuthService> {
    let user = await authRepository.userExist(
      userData.email!,
      userData.username!,
    );

    if (user) {
      throw new AppError(
        'Registration failed. Please try a different email or username.',
        409,
      );
    }

    user = await authRepository.create(userData);

    const { accessToken, refreshToken } = this.generateToken(user);

    user.refreshToken = refreshToken;
    await authRepository.save(user, false);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(user: IUser): Promise<ITokenResponse> {
    const { accessToken, refreshToken } = this.generateToken(user);

    user.refreshToken = refreshToken;
    await authRepository.save(user, false);

    return {
      accessToken,
      refreshToken,
    };
  }

  async logOut(userId: string): Promise<void> {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.refreshToken = '';
    await authRepository.save(user, false);
  }
  
}

export default new AuthService();
