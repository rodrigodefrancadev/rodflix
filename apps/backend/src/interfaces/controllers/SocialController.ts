import { Request, Response } from 'express';
import { PrismaSocialRepository } from '../../infrastructure/repositories/PrismaSocialRepository';
import { GetMembersUseCase } from '../../application/usecases/social/GetMembersUseCase';
import { GetUserProfileUseCase } from '../../application/usecases/social/GetUserProfileUseCase';

export class SocialController {
  async getMembers(req: Request, res: Response): Promise<void> {
    try {
      const socialRepository = new PrismaSocialRepository();
      const useCase = new GetMembersUseCase(socialRepository);
      const members = await useCase.execute();

      res.status(200).json(members);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params as { userId: string };
      const socialRepository = new PrismaSocialRepository();
      const useCase = new GetUserProfileUseCase(socialRepository);
      const profile = await useCase.execute(userId);

      if (!profile) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
