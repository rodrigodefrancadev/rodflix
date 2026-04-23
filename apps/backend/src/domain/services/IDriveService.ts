import type { CatalogItem } from '../entities/Catalog';

export interface DriveFolder {
  id: string;
  name: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

export interface IDriveService {
  /**
   * List all sub-folders inside a given Drive folder.
   */
  listFolders(parentFolderId: string): Promise<DriveFolder[]>;

  /**
   * List video files inside a folder.
   */
  listVideoFiles(folderId: string): Promise<DriveFile[]>;

  /**
   * Build the full catalog structure from the root Drive folder.
   * Rules:
   * - Sub-folder with a single video file → Film
   * - Sub-folder with child folders → Series (each child = season)
   * - `{year}.ano` file in folder → sets the release year
   * - `{uuid}.id` file in folder → reuses the existing DB uuid
   */
  buildCatalog(rootFolderId: string): Promise<CatalogItem[]>;

  /**
   * Write a `{uuid}.id` marker file inside a Drive folder.
   * Called after a title is first indexed so future syncs reuse the same ID.
   */
  writeIdMarker(folderId: string, uuid: string): Promise<void>;
}
