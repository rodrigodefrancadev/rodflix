import type { ISocialRepository, UserProfile } from '../../../domain/repositories/ISocialRepository';

export class GetUserProfileUseCase {
  constructor(private readonly socialRepository: ISocialRepository) {}

  async execute(userId: string): Promise<UserProfile | null> {
    return this.socialRepository.getUserProfile(userId);
  }
}
