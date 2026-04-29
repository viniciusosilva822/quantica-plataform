import { z } from 'zod';

export const hotmartEvents = [
  'PURCHASE_APPROVED',
  'PURCHASE_COMPLETE',
  'PURCHASE_REFUNDED',
  'PURCHASE_CANCELED',
  'PURCHASE_CHARGEBACK',
] as const;

export const hotmartWebhookSchema = z.object({
  event: z.enum(hotmartEvents),
  data: z.object({
    buyer: z.object({
      email: z.string().email(),
      name: z.string().optional(),
    }),
    purchase: z
      .object({
        transaction: z.string().optional(),
        status: z.string().optional(),
      })
      .optional(),
    product: z
      .object({
        id: z.union([z.number(), z.string()]).optional(),
        name: z.string().optional(),
      })
      .optional(),
  }),
});

export type HotmartWebhookInput = z.infer<typeof hotmartWebhookSchema>;
