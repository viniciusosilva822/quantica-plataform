import { z } from 'zod';

export const diaryEntrySchema = z.object({
  promptId: z.string().cuid().optional(),
  content: z.string().min(1).max(5000),
});

export type DiaryEntryInput = z.infer<typeof diaryEntrySchema>;
