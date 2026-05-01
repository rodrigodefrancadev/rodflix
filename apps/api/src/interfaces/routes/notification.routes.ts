import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { authMiddleware, requireAdmin } from '../../infrastructure/middleware/authMiddleware';

export const notificationRoutes = Router();

notificationRoutes.use(authMiddleware);

// Admin routes
notificationRoutes.post('/', requireAdmin, NotificationController.create);

// User routes
notificationRoutes.get('/active', NotificationController.getActive);
notificationRoutes.post('/:id/seen', NotificationController.markSeen);
