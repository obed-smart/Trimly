import mongoose from 'mongoose';

const urlShortenSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
    },
    shortUrl: {
      type: String,
      required: true,
      unique: true,
    },
    customAlias: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  },
);

urlShortenSchema.index({ originalUrl: 1, shortUrl: 1 });

const UrlShorten = mongoose.model('UrlShorten', urlShortenSchema);

export default UrlShorten;
