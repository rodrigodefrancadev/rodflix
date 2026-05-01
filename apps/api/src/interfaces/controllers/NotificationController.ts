import { Request, Response } from 'express';
import { prisma } from '../../infrastructure/prisma';
import { z } from 'zod';

const createNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
});

export const NotificationController = {
  async create(req: Request, res: Response) {
    try {
      const data = createNotificationSchema.parse(req.body);
      const notification = await prisma.notification.create({
        data,
      });
      res.status(201).json(notification);
    } catch (error) {
      res.status(400).json({ error: 'Invalid data' });
    }
  },

  async getActive(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get the latest notification
      const latestNotification = await prisma.notification.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      if (!latestNotification) {
        return res.json(null);
      }

      // Check if user has seen it
      const hasSeen = await prisma.userNotification.findUnique({
        where: {
          userId_notificationId: {
            userId,
            notificationId: latestNotification.id,
          },
        },
      });

      if (hasSeen) {
        return res.json(null);
      }

      return res.json(latestNotification);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  async markSeen(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id: notificationId } = req.params;

      const userNotification = await prisma.userNotification.upsert({
        where: {
          userId_notificationId: {
            userId,
            notificationId,
          },
        },
        update: {},
        create: {
          userId,
          notificationId,
        },
      });

      res.json(userNotification);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },
};
