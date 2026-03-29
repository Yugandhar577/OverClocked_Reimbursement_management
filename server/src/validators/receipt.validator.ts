import { z } from 'zod';

export const uploadReceiptSchema = z.object({
  params: z.object({
    expenseId: z.string().min(1, 'Expense ID is required'),
  }),
});

export const getReceiptSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Receipt ID is required'),
  }),
});

export const triggerOcrSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Receipt ID is required'),
  }),
});

export const deleteReceiptSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Receipt ID is required'),
  }),
});

export const listReceiptsSchema = z.object({
  params: z.object({
    expenseId: z.string().min(1, 'Expense ID is required'),
  }),
});
