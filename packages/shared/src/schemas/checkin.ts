import { z } from 'zod';

export const checkinSchema = z.object({
  mood: z.number().int().min(1).max(5),
  energy: z.number().int().min(1).max(5),
  note: z.string().max(500).optional(),
});

export type CheckinInput = z.infer<typeof checkinSchema>;
