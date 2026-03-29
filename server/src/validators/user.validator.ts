import { z } from 'zod';
import { UserRole, UserStatus } from '@prisma/client';

const userRoleEnum = z.enum([
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.FINANCE,
  UserRole.MANAGER,
  UserRole.EMPLOYEE,
]);

const userStatusEnum = z.enum([
  UserStatus.ACTIVE,
  UserStatus.INACTIVE,
  UserStatus.PENDING,
]);

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    role: userRoleEnum.optional().default(UserRole.EMPLOYEE),
    departmentId: z.string().optional(),
    reportsToId: z.string().optional(),
    phone: z.string().optional(),
    approvalLimit: z.number().positive().optional(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    role: userRoleEnum.optional(),
    status: userStatusEnum.optional(),
    departmentId: z.string().nullable().optional(),
    reportsToId: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    approvalLimit: z.number().positive().nullable().optional(),
    isVipApprover: z.boolean().optional(),
    isRequiredApprover: z.boolean().optional(),
  }),
});

export const getUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
});

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().positive().optional().default(1),
    limit: z.coerce.number().positive().max(100).optional().default(20),
    search: z.string().optional(),
    role: userRoleEnum.optional(),
    status: userStatusEnum.optional(),
    departmentId: z.string().optional(),
  }),
});

export const updateApprovalLimitSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
  body: z.object({
    approvalLimit: z.number().positive('Approval limit must be positive'),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
export type ListUsersQuery = z.infer<typeof listUsersSchema>['query'];
