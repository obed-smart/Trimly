import { z } from 'zod';
import { Types } from 'mongoose';

export const analysisZodSchema = z.object({
  urlId: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId',
  }),

  shortCode: z.string(),

  ipAddress: z.union([z.ipv4(), z.ipv6()]).nullish(),

  referrer: z.url().or(z.literal('')).nullish(),

  country: z.string().nullish(),

  city: z.string().nullish(),

  latitude: z.number().min(-90).max(90).nullish(),

  longitude: z.number().min(-180).max(180).nullish(),

  device: z.string().nullish(),

  browser: z.string().nullish(),

  os: z.string().nullish(),

  clickedAt: z.date().default(() => new Date()),
});

export type AnalysisInput = z.infer<typeof analysisZodSchema>;