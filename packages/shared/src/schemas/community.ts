import { z } from 'zod';

export const postKinds = ['gratidao', 'conquista', 'reflexao'] as const;
export const reactionKinds = ['coracao', 'estrela', 'oracao', 'forca'] as const;

export const postSchema = z.object({
  kind: z.enum(postKinds),
  content: z.string().min(1).max(1000),
});

export const reactionSchema = z.object({
  kind: z.enum(reactionKinds),
});

export type PostInput = z.infer<typeof postSchema>;
export type ReactionInput = z.infer<typeof reactionSchema>;
