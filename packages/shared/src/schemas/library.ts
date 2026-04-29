import { z } from 'zod';

export const libraryKinds = ['ebook', 'audio', 'video', 'artigo'] as const;

export const libraryItemSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(1000).optional(),
  kind: z.enum(libraryKinds),
  url: z.string().url(),
  coverUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
});

export type LibraryItemInput = z.infer<typeof libraryItemSchema>;
