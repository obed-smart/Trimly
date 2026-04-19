import { z } from 'zod';
export const createAnalysisSchema = z.object({
  urlId: z.string().min(1, 'urlId is required'),
  referrer: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  device: z.string().nullable().optional(),
  ipAddress: z
    .ipv4({ message: 'ipAddress must be a valid IPv4 address' })
    .nullable()
    .optional(),
});

export type CreateAnalysisDto = z.infer<typeof createAnalysisSchema>;
