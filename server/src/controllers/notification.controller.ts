import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { notificationService } from '../services/notification.service.js';
import { notificationListQuerySchema } from '../validators/notification.validator.js';

export const getMyNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters = notificationListQuerySchema.parse(req.query);
    const result = await notificationService.getMyNotifications(
      req.user!.userId,
      req.user!.companyId,
      filters
    );

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      unreadCount: result.unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user!.userId,
      req.user!.companyId
    );

    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as read',
    });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await notificationService.markAllAsRead(
      req.user!.userId,
      req.user!.companyId
    );

    res.json({
      success: true,
      data: result,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};
