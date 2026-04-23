import type { ICatalogRepository } from '../../domain/repositories/ICatalogRepository';
import type { IDriveService } from '../../domain/services/IDriveService';
import type { Catalog, CatalogItem } from '../../domain/entities/Catalog';
import { MetadataService } from '../../infrastructure/services/MetadataService';

interface SyncCatalogInput {
  rootFolderId: string;
}

interface SyncCatalogOutput {
  catalog: Catalog;
  itemCount: number;
  newItems: number;   // titles that got a fresh .id marker written back
}

export class SyncCatalogFromDriveUseCase {
  constructor(
    private readonly driveService: IDriveService,
    private readonly catalogRepository: ICatalogRepository,
    private readonly metadataService: MetadataService = new MetadataService()
  ) {}

  async execute(input: SyncCatalogInput): Promise<SyncCatalogOutput> {
    // 1. Read the full folder structure from Drive
    const rawItems = await this.driveService.buildCatalog(input.rootFolderId);

    // 2. For every new title (no .id marker yet), write the marker back to Drive
    //    so future syncs reuse the same UUID.
    let newItems = 0;
    const items: CatalogItem[] = [];

    for (const item of rawItems) {
      // Enrichment with TMDb
      const metadata = await this.metadataService.getMetadata(item.title, item.kind);
      
      const enrichedItem = {
        ...item,
        posterUrl: metadata?.posterUrl,
        bannerUrl: metadata?.bannerUrl,
        description: metadata?.description,
        year: metadata?.year || item.year, // prefer TMDb year if found
      };

      if (!enrichedItem.existingId) {
        const { randomUUID } = await import('crypto');
        const uuid = randomUUID();
        await this.driveService.writeIdMarker(enrichedItem.driveFolderId, uuid);
        items.push({ ...enrichedItem, existingId: uuid });
        newItems++;
      } else {
        items.push(enrichedItem);
      }
    }

    // 3. Build the catalog domain object
    const catalog: Catalog = {
      items,
      syncedAt: new Date().toISOString(),
    };

    // 4. Persist to database
    await this.catalogRepository.save(catalog);

    return { catalog, itemCount: items.length, newItems };
  }
}
