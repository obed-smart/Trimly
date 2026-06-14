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
    return await User.findOne({ email }).select('+password');
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
}

export default new AuthRepository();
