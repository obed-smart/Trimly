import { z } from 'zod';
import { RESERVED_SHORTCODES } from '../utils/utils.js';
import mongoose from 'mongoose';


export const createUrlSchema = z.object({
  originalUrl: z
    .url({ message: 'originalUrl must be a valid http or https URL' })
    .min(1, 'originalUrl is required'),

  shortCode: z
    .string()
    .regex(
      /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/,
      'Must be alphanumeric and can contain hyphens in the middle',
    )
    .min(3, 'shortCode must be at least 3 characters')
    .max(20, 'shortCode must not exceed 20 characters')
    .refine((code) => !RESERVED_SHORTCODES.has(code.toLowerCase()), {
      message: 'shortCode is reserved and cannot be used',
    }).optional(),

  expireAt: z.date().nullable().optional(),

  createdByType: z
    .enum(['anonymous', 'user'])
    .optional(),

  anonymousId: z
    .string()
    .nullable()
    .optional(),

  userId: z
    .instanceof(mongoose.Types.ObjectId)
    .nullable()
    .optional(),

  clickCount: z
    .number()
    .int()
    .nonnegative()
    .optional(),
});

export const shortUrlSchema = z.object({
  shortCode: z
    .string()
    .regex(
      /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/,
      'Must be alphanumeric and can contain hyphens in the middle',
    )
    .min(3, 'shortCode must be at least 3 characters')
    .max(20, 'shortCode must not exceed 20 characters')
    .optional(),
});

export const updatedShortCodeSchema = z.object({
  shortCode: z
    .string()
    .regex(
      /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/,
      'Must be alphanumeric and can contain hyphens in the middle',
    )
    .min(3, 'customAlias must be at least 3 characters')
    .max(20, 'customAlias must not exceed 20 characters')
    .refine((code) => !RESERVED_SHORTCODES.has(code.toLowerCase()), {
      message: 'customAlias is reserved and cannot be used',
    }),
});

export type UpdateShortCodeDto = z.infer<typeof updatedShortCodeSchema>;

export type CreateUrlDto = z.infer<typeof createUrlSchema>;
