import { z } from 'zod';

export const grantAccessSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).optional(),
});

export const mantraSchema = z.object({
  text: z.string().min(1).max(280),
  author: z.string().max(80).optional(),
});

export const promptSchema = z.object({
  text: z.string().min(3).max(280),
});

export type GrantAccessInput = z.infer<typeof grantAccessSchema>;
export type MantraInput = z.infer<typeof mantraSchema>;
export type PromptInput = z.infer<typeof promptSchema>;
