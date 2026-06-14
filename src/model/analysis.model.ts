import mongoose, { Document, Model } from 'mongoose';

export interface IAnalysis extends Document {
  shortCode: string;
  ipAddress: string | null;
  referrer: string | null;
  country: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  clickedAt: Date;
}

const analysisSchema = new mongoose.Schema<IAnalysis>(
  {
    shortCode: {
      type: String,
      required: true,
      index: true,
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

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
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
    timestamps: false,
  },
);

const Analysis: Model<IAnalysis> = mongoose.model('Analysis', analysisSchema);

export default Analysis;
