import mongoose, { Document, Model } from 'mongoose';

export interface IUrlShorten extends Document {
  originalUrl: string;
  shortCode: string;
  clickCount: number;
  expireAt: Date | null;
  createdByType: 'anonymous' | 'user';
  anonymousId: string | null;
  userId: mongoose.Types.ObjectId | null;
}

const urlShortenSchema = new mongoose.Schema<IUrlShorten>(
  {
    originalUrl: {
      type: String,
      required: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    expireAt: {
      type: Date,
      default: null,
    },
    createdByType: {
      type: String,
      enum: ['anonymous', 'user'],
      default: 'anonymous',
    },
    anonymousId: {
      type: String,
      default: null,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },

    clickCount: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

urlShortenSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const UrlShorten: Model<IUrlShorten> = mongoose.model(
  'UrlShorten',
  urlShortenSchema,
);

export default UrlShorten;
