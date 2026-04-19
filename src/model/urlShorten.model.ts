import mongoose from 'mongoose';
import { url } from 'node:inspector';

const urlShortenSchema = new mongoose.Schema(
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
    clickCount: {
      type: Number,
      default: 0,
    },
    expireAt: {
      type: Date,
      default: null,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

urlShortenSchema.index({ shortCode: 1 });
urlShortenSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const UrlShorten = mongoose.model('UrlShorten', urlShortenSchema);

export default UrlShorten;
