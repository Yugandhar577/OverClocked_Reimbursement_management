import { z } from 'zod';

export const notificationListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  unreadOnly: z.coerce.boolean().optional().default(false),
});

export type NotificationListQueryInput = z.infer<typeof notificationListQuerySchema>;
