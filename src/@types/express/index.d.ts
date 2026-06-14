import { Types } from 'mongoose';
import { IUser } from '../../model/user.model.ts';

declare global {
  namespace Express {
    interface User extends IUser {}

    interface Request {
      user?: {
        _id: Types.ObjectId;
      };

      anonymousId?: string;
    }
  }
}

export {};
