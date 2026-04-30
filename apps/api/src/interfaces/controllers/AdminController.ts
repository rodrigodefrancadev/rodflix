import { Request, Response } from 'express';
import { prisma } from '../../infrastructure/prisma';

export class AdminController {
  /** GET /api/admin/users — list all users with their status */
  async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          approved: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json({ users });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /** PATCH /api/admin/users/:id/approve — approve a user */
  async approveUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const user = await prisma.user.update({
        where: { id },
        data: { approved: true },
        select: { id: true, name: true, email: true, approved: true },
      });
      res.status(200).json({ message: 'User approved', user });
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  /** PATCH /api/admin/users/:id/block — revoke access */
  async blockUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const user = await prisma.user.update({
        where: { id },
        data: { approved: false },
        select: { id: true, name: true, email: true, approved: true },
      });
      res.status(200).json({ message: 'User blocked', user });
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  /** PATCH /api/admin/users/:id/role — promote/demote role */
  async setRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const { role } = req.body as { role: any };

      if (!['USER', 'ADMIN', 'MODERATOR'].includes(role)) {
        res.status(400).json({ error: 'Invalid role. Must be USER, ADMIN, or MODERATOR.' });
        return;
      }

      const user = await prisma.user.update({
        where: { id },
        data: { role },
        select: { id: true, name: true, email: true, role: true },
      });
      res.status(200).json({ message: 'Role updated', user });
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
  /** GET /api/admin/sync/logs — Stream sync logs via SSE */
  async streamSyncLogs(req: Request, res: Response): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const { syncLogService } = await import('../../infrastructure/services/SyncLogService');

    const logHandler = (log: any) => {
      res.write(`data: ${JSON.stringify(log)}\n\n`);
    };

    syncLogService.on('log', logHandler);

    req.on('close', () => {
      syncLogService.off('log', logHandler);
      res.end();
    });
  }
}
