import { Router } from 'express';
import { SocialController } from '../controllers/SocialController';
import { authMiddleware } from '../../infrastructure/middleware/authMiddleware';

const socialRoutes = Router();
const socialController = new SocialController();

socialRoutes.use(authMiddleware);

socialRoutes.get('/members', socialController.getMembers);
socialRoutes.get('/profile/:userId', socialController.getProfile);

export { socialRoutes };
