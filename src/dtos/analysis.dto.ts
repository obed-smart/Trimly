import { z } from 'zod';
import { Types } from 'mongoose';

export const analysisZodSchema = z.object({
  // Validates that the string is a valid MongoDB ObjectId
  urlId: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId',
  }),

  // .nullable() allows the 'null' default from your Mongoose schema
  ipAddress: z.union([z.ipv4(), z.ipv6()]).nullable().optional(),

  referrer: z.url().or(z.string().length(0)).nullable().optional(),

  country: z.string().nullable().optional(),
  city: z.string().nullable().optional(),

  // Coordinates validation
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),

  device: z.string().nullable().optional(),
  browser: z.string().nullable().optional(),
  os: z.string().nullable().optional(),

  clickedAt: z.date().default(() => new Date()),
});

// Create a TypeScript type from the schema
export type AnalysisInput = z.infer<typeof analysisZodSchema>;
