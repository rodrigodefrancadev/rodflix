import type { ICatalogRepository } from '../../../domain/repositories/ICatalogRepository';
import type { CatalogItem } from '../../../domain/entities/Catalog';

export class GetSimilarTitlesUseCase {
  constructor(private readonly catalogRepository: ICatalogRepository) {}

  async execute(id: string): Promise<CatalogItem[]> {
    const catalog = await this.catalogRepository.findLatest();
    if (!catalog) return [];

    const targetItem = catalog.items.find(i => i.existingId === id);
    if (!targetItem) return [];

    const targetGenreIds = this.getGenreIds(targetItem.tmdbRaw);

    if (targetGenreIds.length === 0) {
      // If no genres, just return random items of the same kind
      return catalog.items
        .filter(i => i.existingId !== id && i.kind === targetItem.kind)
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
    }

    const similar = catalog.items
      .filter(i => i.existingId !== id)
      .map(item => {
        const itemGenreIds = this.getGenreIds(item.tmdbRaw);
        const score = itemGenreIds.reduce((acc: number, genreId: number) => {
          return acc + (targetGenreIds.includes(genreId) ? 1 : 0);
        }, 0);
        return { item, score };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(x => x.item);

    return similar;
  }

  private getGenreIds(tmdbData: any): number[] {
    if (!tmdbData) return [];
    if (Array.isArray(tmdbData.genre_ids)) return tmdbData.genre_ids;
    if (Array.isArray(tmdbData.genres)) return tmdbData.genres.map((g: any) => g.id);
    return [];
  }
}
