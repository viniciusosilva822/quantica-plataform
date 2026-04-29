import { z } from 'zod';

export const habitSchema = z.object({
  name: z.string().min(1).max(80),
  emoji: z.string().max(8).optional(),
  color: z.string().max(20).optional(),
});

export const habitToggleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type HabitInput = z.infer<typeof habitSchema>;
export type HabitToggleInput = z.infer<typeof habitToggleSchema>;
