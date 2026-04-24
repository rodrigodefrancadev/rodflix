import { Router } from 'express';
import { RatingController } from '../controllers/RatingController';
import { authMiddleware } from '../../infrastructure/middleware/authMiddleware';

const router = Router();
const ratingController = new RatingController();

router.use(authMiddleware);

router.get('/', ratingController.getRatings.bind(ratingController));
router.post('/', ratingController.setRating.bind(ratingController));

export { router as ratingRoutes };
