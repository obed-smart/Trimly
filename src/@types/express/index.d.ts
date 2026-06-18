import { Types } from 'mongoose';
import { IUser } from '../../model/user.model.ts'; // Ensure this path is correct

declare global {
  namespace Express {
    interface PassportCustomUser {
      user: IUser;
      isNewUser: boolean;
    }

    interface User extends Partial<IUser>, Partial<PassportCustomUser> {}

    interface Request {
      anonymousId?: string;
    }
  }
}

export {};
