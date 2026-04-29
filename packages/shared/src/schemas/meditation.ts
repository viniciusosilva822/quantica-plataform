import { z } from 'zod';

export const meditationCategories = [
  'sono',
  'ansiedade',
  'foco',
  'gratidao',
  'energia',
  'cura',
  'manhã',
  'noite',
] as const;

export const meditationSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(800).optional(),
  category: z.enum(meditationCategories),
  durationSec: z.number().int().min(30),
  audioUrl: z.string().url(),
  coverUrl: z.string().url().optional(),
});

export const meditationLogSchema = z.object({
  meditationId: z.string().cuid().optional(),
  durationSec: z.number().int().min(30),
});

export type MeditationInput = z.infer<typeof meditationSchema>;
export type MeditationLogInput = z.infer<typeof meditationLogSchema>;
