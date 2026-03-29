import { CommentType } from '@prisma/client';
import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, 'Comment content is required').max(2000),
  parentId: z.string().cuid().optional().nullable(),
  commentType: z.nativeEnum(CommentType).optional().default(CommentType.MESSAGE),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
