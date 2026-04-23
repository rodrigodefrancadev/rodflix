import type { ICatalogRepository } from '../../domain/repositories/ICatalogRepository';
import type { IDriveService } from '../../domain/services/IDriveService';
import type { Catalog, CatalogItem } from '../../domain/entities/Catalog';
import { MetadataService, type ExternalMetadata } from '../../infrastructure/services/MetadataService';
import { syncLogService } from '../../infrastructure/services/SyncLogService';

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
    syncLogService.log('Iniciando sincronização do catálogo...', 'info');
    
    // 0. Load existing catalog to use as local metadata cache
    const existingCatalog = await this.catalogRepository.findLatest();
    const dbCache = new Map<string, any>();
    existingCatalog?.items.forEach(item => {
      if (item.tmdbRaw) {
        dbCache.set(item.driveFolderId, item.tmdbRaw);
      }
    });

    // 1. Read the full folder structure from Drive
    syncLogService.log('Escaneando pastas no Google Drive...', 'info');
    const rawItems = await this.driveService.buildCatalog(input.rootFolderId);
    syncLogService.log(`Escaneamento concluído. ${rawItems.length} títulos encontrados.`, 'success');

    // 2. Process each item
    let newItemsCount = 0;
    const items: CatalogItem[] = [];

    for (let i = 0; i < rawItems.length; i++) {
      const item = rawItems[i];
      const progress = `[${i + 1}/${rawItems.length}]`;
      
      syncLogService.log(`${progress} Processando: "${item.title}"...`, 'info');
      
      let metadata: ExternalMetadata | null = null;
      let tmdbRaw: any = null;

      // 1. Try to read from DB cache
      const cachedRawInDb = dbCache.get(item.driveFolderId);
      if (cachedRawInDb) {
        syncLogService.log(`${progress} Usando metadados em cache (Banco de Dados).`, 'success');
        tmdbRaw = cachedRawInDb;
        metadata = this.metadataService.mapExternalMetadata(tmdbRaw, item.kind);
      }

      // 2. Fallback: Try to read from tmdb.json on Drive (if present)
      if (!metadata && item.tmdbFileId) {
        try {
          syncLogService.log(`${progress} Usando metadados em cache (Drive: tmdb.json).`, 'success');
          const cachedRawOnDrive = await this.driveService.readFileContent(item.tmdbFileId);
          tmdbRaw = JSON.parse(cachedRawOnDrive);
          metadata = this.metadataService.mapExternalMetadata(tmdbRaw, item.kind);
        } catch (err) {
          syncLogService.log(`${progress} Erro ao ler tmdb.json no Drive.`, 'warn');
        }
      }

      // 3. Fallback: Fetch from TMDB
      if (!metadata) {
        syncLogService.log(`${progress} Buscando metadados no TMDB para "${item.title}"...`, 'info');
        const result = await this.metadataService.getMetadata(item.title, item.kind);
        if (result) {
          metadata = result.mapped;
          tmdbRaw = result.raw;
          syncLogService.log(`${progress} Metadados encontrados no TMDB.`, 'success');
        } else {
          syncLogService.log(`${progress} Nenhum metadado encontrado no TMDB para "${item.title}".`, 'warn');
        }
      }
      
      const enrichedItem = {
        ...item,
        posterUrl: metadata?.posterUrl,
        bannerUrl: metadata?.bannerUrl,
        description: metadata?.description,
        year: metadata?.year || item.year, // prefer TMDb year if found
        tmdbRaw: tmdbRaw, // Persist back to DB
      };

      if (!enrichedItem.existingId) {
        const { randomUUID } = await import('crypto');
        const uuid = randomUUID();
        syncLogService.log(`${progress} Novo título detectado. Gerando ID e gravando marcador...`, 'info');
        await this.driveService.writeIdMarker(enrichedItem.driveFolderId, uuid);
        items.push({ ...enrichedItem, existingId: uuid });
        newItemsCount++;
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
    syncLogService.log('Persistindo catálogo no banco de dados...', 'info');
    await this.catalogRepository.save(catalog);
    syncLogService.log('Catálogo salvo com sucesso!', 'success');

    syncLogService.log(`Sincronização finalizada: ${items.length} itens processados (${newItemsCount} novos).`, 'success');

    return { catalog, itemCount: items.length, newItems: newItemsCount };
  }
}
