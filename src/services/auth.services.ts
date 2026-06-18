import passport from 'passport';
import { IUser } from '../model/user.model.js';
import authRepository from '../repository/auth.repository.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from '../utils/utils.js';
import AppError from '../utils/appErros.js';
import logger from '../utils/logger.js';
import { emailQueue, urlMigrationQueue } from '../queue/  queue.js';
import { Types } from 'mongoose';

export interface ITokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthService extends ITokenResponse {
  user: IUser;
}

class AuthService {
  private generateToken(user: IUser) {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    return {
      accessToken,
      refreshToken,
    };
  }

  private urlGuestMigration(anonymousId: string, userId: Types.ObjectId) {
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

  // Implement user-related business logic here
  async registerUser(
    userData: Partial<IUser>,
    anonymousId?: string,
  ): Promise<IAuthService> {
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

    user.refreshToken = hashToken(refreshToken);
    await authRepository.save(user, false);

    if (anonymousId) {
      this.urlGuestMigration(anonymousId, user.id);
    }

    await this.addWelcomeEmailJob(user.email, user.username);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(user: IUser, anonymousId?: string): Promise<ITokenResponse> {
    const { accessToken, refreshToken } = this.generateToken(user);

    user.refreshToken = hashToken(refreshToken);
    await authRepository.save(user, false);

    if (anonymousId) {
      this.urlGuestMigration(anonymousId, user.id);
    }

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string): Promise<ITokenResponse> {
    const user = await authRepository.findByRefreshToken(
      hashToken(refreshToken),
    );

    if (!user) {
      throw new AppError('Invalid refresh token', 401);
    }

    const { accessToken, refreshToken: newRefreshToken } =
      this.generateToken(user);

    user.refreshToken = hashToken(newRefreshToken);
    await authRepository.save(user, false);

    return {
      accessToken,
      refreshToken: newRefreshToken,
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

  async requestpasswordReset(email: string) {
    const user = await authRepository.findByEmail(email);

    if (!user) return;
    const otp = await user.createPasswordResetOtp();

    await authRepository.save(user, false);

    // add the email to  background job

    await this.addPasswordResetJob(email, otp);
  }

  async verifyOtpAndReset(email: string, otp: string, newPassword: string) {
    const hashedOtp = hashToken(otp);

    const user = await authRepository.findByEmail(email);

    logger.debug(user?.password || null);

    if (!user) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    if (user.passwordResetAttempts >= 5) {
      throw new AppError(
        'Too many password reset attempts. Please try again later.',
        429,
      );
    }

    if (
      !user.passwordResetOtpExpiry ||
      user.passwordResetOtpExpiry < new Date()
    ) {
      throw new AppError('OTP has expired', 400);
    }

    if (hashedOtp !== user.passwordResetOtp) {
      await authRepository.incrementResetAttempts(String(user.id));

      throw new AppError('invalid Otp', 400);
    }

    logger.debug(user.password || null);

    logger.debug(newPassword || null);

    user.password = newPassword;
    user.passwordResetOtp = '';
    user.passwordResetOtpExpiry = null;
    user.passwordResetAttempts = 0;

    await authRepository.save(user, true);

    await this.addSuccessMailJob(user);
  }

  async addSuccessMailJob(user: IUser): Promise<void> {
    await emailQueue.add(
      'send-security-email',
      {
        to: user.email,
        subject: 'Security Alert: Password Changed Successfully 🔒',
        html: `
      <div style="font-family: sans-serif; max-width: 480px; color: #1a1a1a; line-height: 1.6;">
        <h2 style="color: #000000; margin-bottom: 24px;">Password Updated Successfully</h2>
        <p>Hello,</p>
        <p>The password for your Trimly account (<strong>${user.email}</strong>) was changed successfully on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.</p>
        
        <div style="background-color: #f9f9f9; border-left: 4px solid #e11d48; padding: 16px; margin: 24px 0; border-radius: 4px;">
          <p style="margin: 0; font-weight: 600; color: #e11d48;">Didn't make this change?</p>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #4b5563;">
            If you did not request this password modification, please secure your account immediately by contacting our support team or triggering a fresh password recovery run.
          </p>
        </div>

        <p style="font-size: 13px; color: #6b7280; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          This is an automated security notification from Trimly. Do not reply directly to this message.
        </p>
      </div>
    `,
        idempotencyKey: `password-change-success/${user.id}-${Date.now()}`,
      },
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
      },
    );
  }

  async addPasswordResetJob(email: string, otp: string) {
    emailQueue.add(
      'password-reset',
      {
        to: email,
        subject: 'Your Password Reset Code 🔒',
        html: `
      <div style="font-family: sans-serif; max-width: 480px; color: #1a1a1a; line-height: 1.6;">
        <p style="margin: 0 0 16px 0; font-size: 16px;">You requested a password reset. Your verification code is:</p>
        <h1 style="letter-spacing: 8px; font-size: 32px; font-weight: 700; margin: 24px 0; color: #000000; text-align: center;">${otp}</h1>
        <p style="margin: 16px 0 0 0; font-size: 14px; color: #6b7280;">Expires in 10 minutes. Do not share this code with anyone.</p>
      </div>
    `,

        idempotencyKey: `password-reset/${email}`,
      },
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );
  }

  async addWelcomeEmailJob(email: string, username: string) {
    emailQueue.add(
      'welcome',
      {
        to: email,
        subject: 'Welcome to Trimly! 🚀 Your account is ready',
        html: `
    <div style="font-family: sans-serif; max-width: 480px; color: #1a1a1a; line-height: 1.6; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #000000;">Welcome to Trimly, @${username}! 👋</h2>
      <p style="margin: 0 0 16px 0; font-size: 15px; color: #374151;">We're excited to have you on board. Your account has been securely created and you're ready to get started.</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="http://localhost:5173/dashboard" style="background-color: #000000; color: #ffffff; padding: 12px 24px; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 6px; display: inline-block;">Go to Your Dashboard</a>
      </div>

      <p style="margin: 16px 0 0 0; font-size: 13px; color: #6b7280; border-top: 1px solid #f3f4f6; padding-top: 16px;">If you didn't create this account, please disregard this email or contact support.</p>
    </div>
  `,
        // Guarantees each new sign-up only gets exactly one welcome email processed
        idempotencyKey: `welcome/${email}`,
      },
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );
  }

  async googleCallback(user: IUser, isNewUser: boolean) {
    const { accessToken, refreshToken } = this.generateToken(user);

    user.refreshToken = hashToken(refreshToken);
    await authRepository.save(user, false);

    if (isNewUser) {
      await this.addWelcomeEmailJob(user.email, user.username);
    }

    return {
      accessToken,
      refreshToken,
    };
  }
}

export default new AuthService();
