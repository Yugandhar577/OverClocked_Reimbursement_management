import { ApprovalType } from '@prisma/client';
import { z } from 'zod';

const approvalRuleApproverSchema = z.object({
  userId: z.string().cuid('Invalid approver user id'),
  sequence: z.coerce.number().int().positive('Sequence must be a positive integer'),
  isRequired: z.boolean().optional().default(false),
});

const amountSchema = z.number().nonnegative('Amount must be greater than or equal to 0');

const baseApprovalRuleSchema = z.object({
  name: z.string().trim().min(1, 'Rule name is required').max(255),
  description: z.string().trim().max(1000).optional().nullable(),
  departmentId: z.string().cuid().optional().nullable(),
  approvalType: z.nativeEnum(ApprovalType).optional().default(ApprovalType.SEQUENTIAL),
  percentageRequired: z.coerce.number().int().min(1).max(100).optional().nullable(),
  minAmount: amountSchema.optional().nullable(),
  maxAmount: amountSchema.optional().nullable(),
  priority: z.coerce.number().int().optional().default(0),
  approvers: z.array(approvalRuleApproverSchema).min(1, 'At least one approver is required'),
});

export const createApprovalRuleSchema = baseApprovalRuleSchema
  .refine((data) => {
    if (data.minAmount === undefined || data.minAmount === null) return true;
    if (data.maxAmount === undefined || data.maxAmount === null) return true;
    return data.maxAmount >= data.minAmount;
  }, {
    message: 'maxAmount must be greater than or equal to minAmount',
    path: ['maxAmount'],
  })
  .refine((data) => {
    if (data.approvalType !== ApprovalType.PERCENTAGE) return true;
    return data.percentageRequired !== undefined && data.percentageRequired !== null;
  }, {
    message: 'percentageRequired is mandatory for percentage-based rules',
    path: ['percentageRequired'],
  });

export const updateApprovalRuleSchema = baseApprovalRuleSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required to update an approval rule',
  })
  .refine((data) => {
    if (data.minAmount === undefined || data.minAmount === null) return true;
    if (data.maxAmount === undefined || data.maxAmount === null) return true;
    return data.maxAmount >= data.minAmount;
  }, {
    message: 'maxAmount must be greater than or equal to minAmount',
    path: ['maxAmount'],
  })
  .refine((data) => {
    if (data.approvalType && data.approvalType !== ApprovalType.PERCENTAGE) return true;
    if (data.approvalType === ApprovalType.PERCENTAGE) {
      return data.percentageRequired !== undefined && data.percentageRequired !== null;
    }
    return true;
  }, {
    message: 'percentageRequired is mandatory for percentage-based rules',
    path: ['percentageRequired'],
  });

export const approvalActionSchema = z.object({
  comment: z.string().trim().max(2000).optional().nullable(),
});

export const approvalRulesQuerySchema = z.object({
  includeInactive: z.coerce.boolean().optional().default(false),
  departmentId: z.string().cuid().optional(),
});

export const pendingApprovalsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateApprovalRuleInput = z.infer<typeof createApprovalRuleSchema>;
export type UpdateApprovalRuleInput = z.infer<typeof updateApprovalRuleSchema>;
export type ApprovalActionInput = z.infer<typeof approvalActionSchema>;
export type ApprovalRulesQueryInput = z.infer<typeof approvalRulesQuerySchema>;
export type PendingApprovalsQueryInput = z.infer<typeof pendingApprovalsQuerySchema>;
