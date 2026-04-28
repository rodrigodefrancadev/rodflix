import type { ICatalogRepository } from '../../domain/repositories/ICatalogRepository';
import type { Catalog, CatalogItem } from '../../domain/entities/Catalog';
import { prisma } from '../prisma';

export class PrismaCatalogRepository implements ICatalogRepository {
  async save(catalog: Catalog): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Full replace strategy — wipe and re-insert
      await tx.episode.deleteMany();
      await tx.season.deleteMany();
      await tx.catalogItem.deleteMany();

      for (const item of catalog.items) {
        const id = item.existingId; // guaranteed by the use case

        if (item.kind === 'film') {
          await tx.catalogItem.create({
            data: {
              id,
              title: item.title,
              type: 'FILM',
              folderId: item.driveFolderId,
              fileUrl: item.driveFileId,
              year: item.year ?? null,
              posterUrl: item.posterUrl ?? null,
              bannerUrl: item.bannerUrl ?? null,
              description: item.description ?? null,
              tmdbRaw: item.tmdbRaw ?? null,
            },
          });
        } else {
          // Series
          await tx.catalogItem.create({
            data: {
              id,
              title: item.title,
              type: 'SERIES',
              folderId: item.driveFolderId,
              year: item.year ?? null,
              posterUrl: item.posterUrl ?? null,
              bannerUrl: item.bannerUrl ?? null,
              description: item.description ?? null,
              tmdbRaw: item.tmdbRaw ?? null,
              seasons: {
                create: item.seasons.map((season) => ({
                  number: season.number,
                  title: season.title,
                  // Stable folderId key: title_folderId + season number
                  folderId: `${item.driveFolderId}_s${season.number}`,
                  episodes: {
                    create: season.episodes.map((ep) => ({
                      number: ep.order,
                      title: ep.title,
                      fileUrl: ep.driveFileId,
                    })),
                  },
                })),
              },
            },
          });
        }
      }
    });
  }

  async findLatest(): Promise<Catalog | null> {
    const dbItems = await prisma.catalogItem.findMany({
      include: {
        seasons: {
          include: {
            episodes: { orderBy: { number: 'asc' } },
          },
          orderBy: { number: 'asc' },
        },
      },
    });

    if (dbItems.length === 0) return null;

    const items: CatalogItem[] = dbItems.map((dbItem) => {
      const base = {
        title: dbItem.title,
        driveFolderId: dbItem.folderId,
        existingId: dbItem.id,
        year: dbItem.year ?? undefined,
        posterUrl: dbItem.posterUrl ?? undefined,
        bannerUrl: dbItem.bannerUrl ?? undefined,
        description: dbItem.description ?? undefined,
        tmdbRaw: dbItem.tmdbRaw ?? undefined,
      };

      if (dbItem.type === 'FILM') {
        return {
          kind: 'film' as const,
          ...base,
          driveFileId: dbItem.fileUrl ?? '',
        };
      }

      return {
        kind: 'series' as const,
        ...base,
        seasons: dbItem.seasons.map((s) => ({
          number: s.number,
          title: s.title ?? `Temporada ${s.number}`,
          episodes: s.episodes.map((e) => ({
            title: e.title ?? `Episódio ${e.number}`,
            driveFileId: e.fileUrl,
            order: e.number,
          })),
        })),
      };
    });

    return { items, syncedAt: new Date().toISOString() };
  }

  async findById(id: string): Promise<CatalogItem | null> {
    const dbItem = await prisma.catalogItem.findUnique({
      where: { id },
      include: {
        seasons: {
          include: {
            episodes: { orderBy: { number: 'asc' } },
          },
          orderBy: { number: 'asc' },
        },
      },
    });

    if (!dbItem) return null;

    const base = {
      title: dbItem.title,
      driveFolderId: dbItem.folderId,
      existingId: dbItem.id,
      year: dbItem.year ?? undefined,
      posterUrl: dbItem.posterUrl ?? undefined,
      bannerUrl: dbItem.bannerUrl ?? undefined,
      description: dbItem.description ?? undefined,
      tmdbRaw: dbItem.tmdbRaw ?? undefined,
    };

    if (dbItem.type === 'FILM') {
      return {
        kind: 'film' as const,
        ...base,
        driveFileId: dbItem.fileUrl ?? '',
      };
    }

    return {
      kind: 'series' as const,
      ...base,
      seasons: dbItem.seasons.map((s) => ({
        number: s.number,
        title: s.title ?? `Temporada ${s.number}`,
        episodes: s.episodes.map((e) => ({
          title: e.title ?? `Episódio ${e.number}`,
          driveFileId: e.fileUrl,
          order: e.number,
        })),
      })),
    };
  }
}
