import { z } from 'zod';

export const breathingTechniques = ['4-7-8', 'cardiaca', 'quadrada', 'energizante'] as const;
export type BreathingTechnique = (typeof breathingTechniques)[number];

export const breathingLogSchema = z.object({
  technique: z.enum(breathingTechniques),
  cycles: z.number().int().min(1).max(200),
  durationSec: z.number().int().min(10),
});

export type BreathingLogInput = z.infer<typeof breathingLogSchema>;

export const breathingPatterns: Record<
  BreathingTechnique,
  { name: string; phases: { label: string; sec: number }[] }
> = {
  '4-7-8': {
    name: '4-7-8',
    phases: [
      { label: 'Inspire', sec: 4 },
      { label: 'Segure', sec: 7 },
      { label: 'Expire', sec: 8 },
    ],
  },
  cardiaca: {
    name: 'Coerência cardíaca',
    phases: [
      { label: 'Inspire', sec: 5 },
      { label: 'Expire', sec: 5 },
    ],
  },
  quadrada: {
    name: 'Respiração quadrada',
    phases: [
      { label: 'Inspire', sec: 4 },
      { label: 'Segure', sec: 4 },
      { label: 'Expire', sec: 4 },
      { label: 'Segure', sec: 4 },
    ],
  },
  energizante: {
    name: 'Energização',
    phases: [
      { label: 'Inspire', sec: 2 },
      { label: 'Expire', sec: 2 },
    ],
  },
};
