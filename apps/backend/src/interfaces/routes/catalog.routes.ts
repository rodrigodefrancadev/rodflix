import { Router } from 'express';
import { CatalogController } from '../controllers/CatalogController';
import { authMiddleware, requireAdmin } from '../../infrastructure/middleware/authMiddleware';

const router = Router();
const controller = new CatalogController();

// GET /api/catalog — any authenticated user can fetch the catalog
router.get('/', authMiddleware, (req, res) => controller.getCatalog(req, res));

// GET /api/catalog/featured — get featured title
router.get('/featured', authMiddleware, (req, res) => controller.getFeatured(req, res));

// GET /api/catalog/:id — get title details
router.get('/:id', authMiddleware, (req, res) => controller.getDetails(req, res));

// GET /api/catalog/:id/similar — get similar titles
router.get('/:id/similar', authMiddleware, (req, res) => controller.getSimilar(req, res));

// POST /api/catalog/sync — ADMIN only
router.post('/sync', authMiddleware, requireAdmin, (req, res) => controller.sync(req, res));
router.get('/stream/:fileId', authMiddleware, (req, res) => controller.stream(req, res));

export { router as catalogRoutes };
