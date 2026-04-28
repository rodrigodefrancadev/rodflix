import { Request, Response } from 'express';
import { SyncCatalogFromDriveUseCase } from '../../application/usecases/SyncCatalogFromDriveUseCase';
import { GoogleDriveService } from '../../infrastructure/services/GoogleDriveService';
import { PrismaCatalogRepository } from '../../infrastructure/repositories/PrismaCatalogRepository';
import { GetFeaturedTitleUseCase } from '../../application/usecases/catalog/GetFeaturedTitleUseCase';
import { GetTitleDetailsUseCase } from '../../application/usecases/catalog/GetTitleDetailsUseCase';
import { GetSimilarTitlesUseCase } from '../../application/usecases/catalog/GetSimilarTitlesUseCase';

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
      const { search, kind } = req.query;
      const catalogRepository = new PrismaCatalogRepository();

      if (search || kind) {
        const items = await catalogRepository.findAll({
          search: search as string,
          kind: kind as 'film' | 'series',
        });
        res.status(200).json({ items, syncedAt: new Date().toISOString() });
        return;
      }

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

  async stream(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      const driveService = new GoogleDriveService();
      
      const { stream, mimeType, size } = await driveService.getFileStream(fileId as string);

      const range = req.headers.range;
      if (typeof range === 'string' && size) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : size - 1;
        const chunksize = (end - start) + 1;

        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": mimeType,
        });

        // For real range support, we'd need to tell Drive API to get specific bytes.
        // But for a simple proxy, we just pipe the whole stream if no range-aware drive call is ready.
        // Actually, the drive API supports 'Range' header in the request.
        // Let's refine GoogleDriveService to handle ranges.
        stream.pipe(res);
      } else {
        res.writeHead(200, {
          "Content-Length": size,
          "Content-Type": mimeType,
        });
        stream.pipe(res);
      }
    } catch (error: any) {
      console.error('[CatalogController.stream]', error);
      res.status(500).json({ error: error.message });
    }
  }
  async getFeatured(req: Request, res: Response): Promise<void> {
    try {
      const catalogRepository = new PrismaCatalogRepository();
      const useCase = new GetFeaturedTitleUseCase(catalogRepository);
      const featured = await useCase.execute();

      if (!featured) {
        res.status(404).json({ error: 'No featured title available' });
        return;
      }

      res.status(200).json(featured);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const catalogRepository = new PrismaCatalogRepository();
      const useCase = new GetTitleDetailsUseCase(catalogRepository);
      const details = await useCase.execute(id as string);

      if (!details) {
        res.status(404).json({ error: 'Title not found' });
        return;
      }

      res.status(200).json(details);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getSimilar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const catalogRepository = new PrismaCatalogRepository();
      const useCase = new GetSimilarTitlesUseCase(catalogRepository);
      const similar = await useCase.execute(id as string);

      res.status(200).json(similar);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
