import { Request, Response } from 'express';
import { prisma } from '../../infrastructure/prisma';
import { RatingType } from '@prisma/client';

export class RatingController {
  async getRatings(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const ratings = await prisma.rating.findMany({
        where: { userId },
        select: { catalogItemId: true, type: true },
      });
      res.status(200).json({ ratings });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async setRating(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { catalogItemId, type } = req.body as { catalogItemId: string; type: RatingType | null };

      if (!catalogItemId) {
        res.status(400).json({ error: 'catalogItemId is required' });
        return;
      }

      if (!type) {
        await prisma.rating.deleteMany({
          where: { userId, catalogItemId },
        });
        res.status(200).json({ rating: null });
        return;
      }

      const rating = await prisma.rating.upsert({
        where: { userId_catalogItemId: { userId, catalogItemId } },
        update: { type },
        create: { userId, catalogItemId, type },
      });

      res.status(200).json({ rating: rating.type });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
