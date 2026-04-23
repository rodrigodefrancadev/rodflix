import type { IDriveService, DriveFolder, DriveFile } from '../../domain/services/IDriveService';
import type { CatalogItem } from '../../domain/entities/Catalog';

/**
 * MockDriveService — used as a placeholder until real Google Drive
 * Service Account credentials are configured.
 *
 * Returns a hardcoded catalog structure that mirrors the real Drive rules:
 * - Sub-folder with single video file → Film
 * - Sub-folder with child folders → Series
 */
export class MockDriveService implements IDriveService {
  async listFolders(_parentFolderId: string): Promise<DriveFolder[]> {
    return [
      { id: 'mock-folder-1', name: 'O Poderoso Chefão' },
      { id: 'mock-folder-2', name: 'Breaking Bad' },
    ];
  }

  async listVideoFiles(_folderId: string): Promise<DriveFile[]> {
    return [
      { id: 'mock-file-1', name: 'video.mp4', mimeType: 'video/mp4' },
    ];
  }

  async buildCatalog(_rootFolderId: string): Promise<CatalogItem[]> {
    return [
      {
        kind: 'film',
        title: 'O Poderoso Chefão',
        driveFolderId: 'mock-folder-1',
        driveFileId: 'mock-file-godfather',
        year: 1972,
        existingId: 'mock-id-godfather',
      },
      {
        kind: 'film',
        title: 'Interstellar',
        driveFolderId: 'mock-folder-2',
        driveFileId: 'mock-file-interstellar',
        year: 2014,
        existingId: 'mock-id-interstellar',
      },
      {
        kind: 'series',
        title: 'Breaking Bad',
        driveFolderId: 'mock-folder-3',
        year: 2008,
        existingId: 'mock-id-breaking-bad',
        seasons: [
          {
            number: 1,
            title: 'Temporada 1',
            episodes: [
              { title: 'Pilot', driveFileId: 'mock-ep-1-1', order: 1 },
              { title: "Cat's in the Bag", driveFileId: 'mock-ep-1-2', order: 2 },
            ],
          },
          {
            number: 2,
            title: 'Temporada 2',
            episodes: [
              { title: 'Seven Thirty-Seven', driveFileId: 'mock-ep-2-1', order: 1 },
            ],
          },
        ],
      },
    ];
  }

  // No-op in mock mode — real implementation writes a file back to Drive
  async writeIdMarker(_folderId: string, _uuid: string): Promise<void> {}
}
