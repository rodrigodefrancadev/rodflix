import { Request, Response } from 'express';
import { prisma } from '../../infrastructure/prisma';

export class WatchedController {
  /** GET /api/watched — list all watched items for the current user */
  async getWatched(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const items = await prisma.watchedItem.findMany({
        where: { userId },
        select: { refId: true, kind: true, watchedAt: true },
      });
      res.status(200).json({ watched: items });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /** POST /api/watched/toggle — toggle watched status for an item */
  async toggleWatched(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { refId, kind } = req.body as { refId: string; kind: 'FILM' | 'EPISODE' };

      if (!refId || !kind) {
        res.status(400).json({ error: 'refId and kind are required' });
        return;
      }

      const existing = await prisma.watchedItem.findUnique({
        where: { userId_refId: { userId, refId } },
      });

      if (existing) {
        await prisma.watchedItem.delete({
          where: { userId_refId: { userId, refId } },
        });
        res.status(200).json({ watched: false });
      } else {
        await prisma.watchedItem.create({
          data: { userId, refId, kind },
        });
        res.status(200).json({ watched: true });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
