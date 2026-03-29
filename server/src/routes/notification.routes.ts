import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as notificationController from '../controllers/notification.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', notificationController.getMyNotifications);
router.patch('/read-all', notificationController.markAllNotificationsAsRead);
router.patch('/:id/read', notificationController.markNotificationAsRead);

export default router;
