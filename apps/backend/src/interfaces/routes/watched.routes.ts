import { Router } from 'express';
import { WatchedController } from '../controllers/WatchedController';
import { authMiddleware } from '../../infrastructure/middleware/authMiddleware';

const router = Router();
const controller = new WatchedController();

// All watched routes require JWT
router.use(authMiddleware);

router.get('/', (req, res) => controller.getWatched(req, res));
router.post('/toggle', (req, res) => controller.toggleWatched(req, res));

export { router as watchedRoutes };
