import { z } from 'zod';

export const wheelAreas = [
  'saude',
  'carreira',
  'financas',
  'relacionamentos',
  'familia',
  'lazer',
  'espiritualidade',
  'desenvolvimento',
] as const;

export const wheelLabels: Record<(typeof wheelAreas)[number], string> = {
  saude: 'Saúde',
  carreira: 'Carreira',
  financas: 'Finanças',
  relacionamentos: 'Relacionamentos',
  familia: 'Família',
  lazer: 'Lazer',
  espiritualidade: 'Espiritualidade',
  desenvolvimento: 'Desenvolvimento',
};

export const wheelEntrySchema = z.object({
  scores: z.object({
    saude: z.number().int().min(0).max(10),
    carreira: z.number().int().min(0).max(10),
    financas: z.number().int().min(0).max(10),
    relacionamentos: z.number().int().min(0).max(10),
    familia: z.number().int().min(0).max(10),
    lazer: z.number().int().min(0).max(10),
    espiritualidade: z.number().int().min(0).max(10),
    desenvolvimento: z.number().int().min(0).max(10),
  }),
});

export type WheelEntryInput = z.infer<typeof wheelEntrySchema>;
