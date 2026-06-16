import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { hashToken } from '../utils/utils.js';

export interface IUser extends Document {
  id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password?: string;
  googleId?: string;
  avatarUrl?: string;
  refreshToken: string;
  passwordResetOtp: string | null;
  passwordResetOtpExpiry: Date | null;
  passwordResetAttempts: number;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createPasswordResetOtp(): Promise<string>;
}

const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    avatarUrl: { type: String },
    refreshToken: String,
    passwordResetOtp: {
      type: String,
      default: null,
    },
    passwordResetOtpExpiry: {
      type: Date,
      default: null,
    },
    passwordResetAttempts: {
      type: Number,
      default: 0,
    },
  },

  {
    timestamps: true,
  },
);

UserSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password') || !this.password) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.createPasswordResetOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 999999)
    .toString()
    .padStart(6, '0');

  const hashedOtp = hashToken(otp);

  this.passwordResetOtp = hashedOtp;
  this.passwordResetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  this.passwordResetAttempts = 0;

  return otp;
};

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
