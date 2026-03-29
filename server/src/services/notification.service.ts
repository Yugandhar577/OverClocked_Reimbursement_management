import { NotificationType, Prisma } from '@prisma/client';
import prisma from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

type DbClient = Prisma.TransactionClient | typeof prisma;

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Prisma.InputJsonValue | null;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export class NotificationService {
  async createNotification(payload: NotificationPayload, db: DbClient = prisma) {
    const data = payload.data === undefined
      ? undefined
      : payload.data === null
        ? Prisma.JsonNull
        : payload.data;

    return db.notification.create({
      data: {
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        ...(data !== undefined && { data }),
      },
    });
  }

  async createBulkNotifications(payloads: NotificationPayload[], db: DbClient = prisma) {
    if (payloads.length === 0) {
      return { count: 0 };
    }

    return db.notification.createMany({
      data: payloads.map((payload) => ({
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        ...(payload.data !== undefined && {
          data: payload.data === null ? Prisma.JsonNull : payload.data,
        }),
      })),
    });
  }

  async getMyNotifications(
    userId: string,
    companyId: string,
    filters: NotificationFilters = {}
  ) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const unreadOnly = filters.unreadOnly ?? false;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      userId,
      user: { companyId },
      ...(unreadOnly && { isRead: false }),
    };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId,
          user: { companyId },
          isRead: false,
        },
      }),
    ]);

    return {
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    };
  }

  async markAsRead(notificationId: string, userId: string, companyId: string) {
    const existing = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
        user: { companyId },
      },
      select: {
        id: true,
        isRead: true,
      },
    });

    if (!existing) {
      throw new NotFoundError('Notification not found');
    }

    if (existing.isRead) {
      return prisma.notification.findUnique({ where: { id: notificationId } });
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string, companyId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        user: { companyId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { updatedCount: result.count };
  }
}

export const notificationService = new NotificationService();
