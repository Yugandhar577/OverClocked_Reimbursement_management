import { z } from 'zod';

export const createPaymentOrderSchema = z.object({
  expenseId: z.string().cuid('Invalid expense id'),
});

export const verifyPaymentSchema = z.object({
  expenseId: z.string().cuid('Invalid expense id'),
  razorpayOrderId: z.string().trim().min(1, 'razorpayOrderId is required'),
  razorpayPaymentId: z.string().trim().min(1, 'razorpayPaymentId is required'),
  razorpaySignature: z.string().trim().min(1, 'razorpaySignature is required'),
});

export type CreatePaymentOrderInput = z.infer<typeof createPaymentOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
