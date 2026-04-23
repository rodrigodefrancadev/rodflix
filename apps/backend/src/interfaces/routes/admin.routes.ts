import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authMiddleware, requireAdmin } from '../../infrastructure/middleware/authMiddleware';

const router = Router();
const controller = new AdminController();

// All admin routes require JWT + ADMIN role
router.use(authMiddleware, requireAdmin);

router.get('/users', (req, res) => controller.listUsers(req, res));
router.patch('/users/:id/approve', (req, res) => controller.approveUser(req, res));
router.patch('/users/:id/block', (req, res) => controller.blockUser(req, res));
router.patch('/users/:id/role', (req, res) => controller.setRole(req, res));

export { router as adminRoutes };
