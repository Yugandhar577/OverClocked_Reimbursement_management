import { z } from 'zod';
import { ExpenseStatus } from '@prisma/client';

export const createExpenseSchema = z.object({
  categoryId: z.string().cuid().optional().nullable(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  totalAmount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be a 3-letter code').default('USD'),
  expenseDate: z.string().datetime().or(z.date()),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const submitExpenseSchema = z.object({
  expenseIds: z.array(z.string().cuid()).min(1, 'At least one expense is required'),
});

export const expenseLineSchema = z.object({
  categoryId: z.string().cuid().optional().nullable(),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be a 3-letter code').default('USD'),
  vendor: z.string().optional().nullable(),
  lineDate: z.string().datetime().or(z.date()),
});

export const updateExpenseLineSchema = expenseLineSchema.partial();

export const expenseFilterSchema = z.object({
  status: z.nativeEnum(ExpenseStatus).optional(),
  creatorId: z.string().cuid().optional(),
  categoryId: z.string().cuid().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'expenseDate', 'totalAmount', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type SubmitExpenseInput = z.infer<typeof submitExpenseSchema>;
export type ExpenseLineInput = z.infer<typeof expenseLineSchema>;
export type UpdateExpenseLineInput = z.infer<typeof updateExpenseLineSchema>;
export type ExpenseFilterInput = z.infer<typeof expenseFilterSchema>;
