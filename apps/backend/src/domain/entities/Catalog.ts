// ── Episode ──────────────────────────────────────────────────
export interface Episode {
  title: string;
  /** Google Drive file ID of the video */
  driveFileId: string;
  /** Sequential number within the season */
  order: number;
  thumbnailLink?: string;
}

// ── Season ───────────────────────────────────────────────────
export interface Season {
  title: string;
  episodes: Episode[];
  number: number;
}

// ── Catalog items ─────────────────────────────────────────────
interface CatalogItemBase {
  title: string;
  /** Drive folder that holds this title */
  driveFolderId: string;
  /** Release year — read from a `{year}.ano` file in the folder, if present */
  year?: number;
  /**
   * If a `{uuid}.id` marker file already exists in the Drive folder,
   * this contains that UUID so the repository can reuse the same DB id
   * instead of generating a new one.
   */
  existingId?: string;
  posterUrl?: string;
  bannerUrl?: string;
  description?: string;
  driveThumbnailUrl?: string;
  /** Google Drive file ID of the tmdb.json file, if present */
  tmdbFileId?: string;
}

export interface Film extends CatalogItemBase {
  kind: 'film';
  /** Drive file ID of the video */
  driveFileId: string;
}

export interface Series extends CatalogItemBase {
  kind: 'series';
  seasons: Season[];
}

export type CatalogItem = Film | Series;

// ── Catalog root ──────────────────────────────────────────────
export interface Catalog {
  items: CatalogItem[];
  /** ISO timestamp of the last successful sync */
  syncedAt: string;
}
