import { AuditAction, Prisma } from '@prisma/client';
import prisma from '../config/database.js';

type DbClient = Prisma.TransactionClient | typeof prisma;

export interface AuditLogInput {
  companyId: string;
  userId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string;
  oldData?: Prisma.InputJsonValue | null;
  newData?: Prisma.InputJsonValue | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export class AuditService {
  async log(input: AuditLogInput, db: DbClient = prisma) {
    const oldData = input.oldData === undefined
      ? undefined
      : input.oldData === null
        ? Prisma.JsonNull
        : input.oldData;
    const newData = input.newData === undefined
      ? undefined
      : input.newData === null
        ? Prisma.JsonNull
        : input.newData;

    return db.auditLog.create({
      data: {
        companyId: input.companyId,
        userId: input.userId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        oldData,
        newData,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    });
  }
}

export const auditService = new AuditService();
