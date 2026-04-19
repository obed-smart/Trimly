import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema(
  {
    urlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UrlShorten',
      required: true,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    referrer: {
      type: String,
      default: null,
    },
    country: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null,
    },
    device: {
      type: String,
      default: null,
    },
    browser: {
      type: String,
      default: null,
    },
    os: {
      type: String,
      default: null,
    },
    clickedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

const Analysis = mongoose.model('Analysis', analysisSchema);

export default Analysis;
