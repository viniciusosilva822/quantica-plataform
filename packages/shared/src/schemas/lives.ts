import { z } from 'zod';

export const liveSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(2000).optional(),
  scheduledAt: z.string().datetime(),
  liveUrl: z.string().url().optional(),
  recordingUrl: z.string().url().optional(),
});

export type LiveInput = z.infer<typeof liveSchema>;
