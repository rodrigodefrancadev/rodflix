import type { ISocialRepository, MemberSummary } from '../../../domain/repositories/ISocialRepository';

export class GetMembersUseCase {
  constructor(private readonly socialRepository: ISocialRepository) {}

  async execute(): Promise<MemberSummary[]> {
    return this.socialRepository.findAllMembers();
  }
}
