import User, { IUser } from '../model/user.model.js';

class AuthRepository {
  async create(userData: Partial<IUser>) {
    return await User.create(userData);
  }

  async userExist(email: string, username: string) {
    return await User.findOne({
      $or: [{ email }, { username }],
    });
  }

  async findByEmail(email: string) {
    return await User.findOne({ email });
  }

  async findById(id: string) {
    return await User.findById(id);
  }

  // async findByIdAnUpdate(userId: string, refreshToken: string) {
  //   return await User.findByIdAndUpdate(userId);
  // }

  async save(user: IUser, validate = true) {
    return user.save({ validateBeforeSave: validate });
  }

  async findByRefreshToken(refreshToken: string) {
    return await User.findOne({ refreshToken });
  }

  async findByOtp(otp: string) {
    return await User.findOne({
      passwordResetOtp: otp,
      passwordResetOtpExpiry: { $gt: new Date() },
    });
  }

  async incrementResetAttempts(userId: string): Promise<void> {
  await User.updateOne(
    { _id: userId },
    { $inc: { passwordResetAttempts: 1 } }
  );
}
}

export default new AuthRepository();
