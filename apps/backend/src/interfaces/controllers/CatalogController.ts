import { Request, Response } from 'express';
import { SyncCatalogFromDriveUseCase } from '../../application/usecases/SyncCatalogFromDriveUseCase';
import { GoogleDriveService } from '../../infrastructure/services/GoogleDriveService';
import { PrismaCatalogRepository } from '../../infrastructure/repositories/PrismaCatalogRepository';

export class CatalogController {
  async sync(req: Request, res: Response): Promise<void> {
    try {
      const rootFolderId = process.env.DRIVE_ROOT_FOLDER_ID;
      if (!rootFolderId) {
        res.status(500).json({ error: 'DRIVE_ROOT_FOLDER_ID not configured in .env' });
        return;
      }
      if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
        res.status(500).json({ error: 'GOOGLE_SERVICE_ACCOUNT_JSON not configured in .env' });
        return;
      }

      const driveService = new GoogleDriveService();
      const catalogRepository = new PrismaCatalogRepository();
      const useCase = new SyncCatalogFromDriveUseCase(driveService, catalogRepository);

      const result = await useCase.execute({ rootFolderId });

      res.status(200).json({
        message: 'Catalog synced successfully',
        itemCount: result.itemCount,
        newItems: result.newItems,
        syncedAt: result.catalog.syncedAt,
      });
    } catch (error: any) {
      console.error('[CatalogController.sync]', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getCatalog(req: Request, res: Response): Promise<void> {
    try {
      const catalogRepository = new PrismaCatalogRepository();
      const catalog = await catalogRepository.findLatest();

      if (!catalog) {
        res.status(404).json({
          error: 'No catalog available. Please run a sync first.',
        });
        return;
      }

      res.status(200).json(catalog);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
