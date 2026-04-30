import type { ICatalogRepository } from '../../../domain/repositories/ICatalogRepository';
import type { CatalogItem } from '../../../domain/entities/Catalog';

export class GetFeaturedTitleUseCase {
  constructor(private readonly catalogRepository: ICatalogRepository) {}

  async execute(): Promise<CatalogItem | null> {
    const catalog = await this.catalogRepository.findLatest();
    if (!catalog || catalog.items.length === 0) return null;

    // For now, randomly pick a featured item. 
    // In a real scenario, this could be based on release date, most watched, etc.
    const randomIndex = Math.floor(Math.random() * catalog.items.length);
    return catalog.items[randomIndex];
  }
}
