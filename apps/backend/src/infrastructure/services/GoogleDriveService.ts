import { google, drive_v3 } from 'googleapis';
import type { IDriveService, DriveFolder, DriveFile } from '../../domain/services/IDriveService';
import type { CatalogItem, Film, Series, Season, Episode } from '../../domain/entities/Catalog';

const VIDEO_MIME_TYPES = new Set([
  'video/mp4',
  'video/x-matroska',   // mkv
  'video/x-msvideo',    // avi
  'video/quicktime',    // mov
  'video/webm',
  'video/mpeg',
  'video/x-ms-wmv',
]);

function createDriveClient(): drive_v3.Drive {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not set in environment');

  const credentials = JSON.parse(raw);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  return google.drive({ version: 'v3', auth });
}

export class GoogleDriveService implements IDriveService {
  private drive: drive_v3.Drive;

  constructor() {
    this.drive = createDriveClient();
  }

  // ── Public interface ──────────────────────────────────────────

  async listFolders(parentFolderId: string): Promise<DriveFolder[]> {
    const items = await this.listChildren(parentFolderId);
    return items
      .filter((f) => f.mimeType === 'application/vnd.google-apps.folder')
      .map((f) => ({ id: f.id!, name: f.name! }));
  }

  async listVideoFiles(folderId: string): Promise<DriveFile[]> {
    const items = await this.listChildren(folderId);
    return items
      .filter((f) => f.mimeType && VIDEO_MIME_TYPES.has(f.mimeType))
      .map((f) => ({ 
        id: f.id!, 
        name: f.name!, 
        mimeType: f.mimeType!, 
        thumbnailLink: f.thumbnailLink ?? undefined 
      }));
  }

  async buildCatalog(rootFolderId: string): Promise<CatalogItem[]> {
    const titleFolders = await this.listFolders(rootFolderId);
    const items: CatalogItem[] = [];

    for (const folder of titleFolders) {
      const item = await this.processTitleFolder(folder);
      if (item) items.push(item);
    }

    return items;
  }

  // ── Write-back: create the {uuid}.id marker file in Drive ────

  async writeIdMarker(folderId: string, uuid: string): Promise<void> {
    await this.drive.files.create({
      requestBody: {
        name: `${uuid}.id`,
        parents: [folderId],
        mimeType: 'text/plain',
      },
      media: {
        mimeType: 'text/plain',
        body: '',
      },
    });
  }

  async getFileStream(fileId: string): Promise<{ stream: NodeJS.ReadableStream; mimeType: string; size?: number }> {
    const res = await this.drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    const metadata = await this.drive.files.get({
      fileId,
      fields: 'mimeType, size',
    });

    return {
      stream: res.data as NodeJS.ReadableStream,
      mimeType: metadata.data.mimeType || 'video/mp4',
      size: metadata.data.size ? parseInt(metadata.data.size, 10) : undefined,
    };
  }

  async readFileContent(fileId: string): Promise<string> {
    const res = await this.drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'text' }
    );
    return res.data as string;
  }

  async writeFileContent(folderId: string, fileName: string, content: string, mimeType = 'application/json'): Promise<void> {
    await this.drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
        mimeType,
      },
      media: {
        mimeType,
        body: content,
      },
    });
  }

  // ── Private helpers ───────────────────────────────────────────

  private async listChildren(folderId: string): Promise<drive_v3.Schema$File[]> {
    const files: drive_v3.Schema$File[] = [];
    let pageToken: string | undefined;

    do {
      const res = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'nextPageToken, files(id, name, mimeType, thumbnailLink)',
        pageSize: 1000,
        pageToken,
      });
      files.push(...(res.data.files ?? []));
      pageToken = res.data.nextPageToken ?? undefined;
    } while (pageToken);

    return files;
  }

  /**
   * Reads metadata marker files from a folder:
   * - `{uuid}.id`   → existing database ID (skip re-indexing)
   * - `{year}.ano`  → release year
   * - `tmdb.json`   → TMDB metadata cache
   */
  private parseMarkers(files: drive_v3.Schema$File[]): { existingId?: string; year?: number; tmdbFileId?: string } {
    let existingId: string | undefined;
    let year: number | undefined;
    let tmdbFileId: string | undefined;

    for (const f of files) {
      const name = f.name ?? '';
      if (name.endsWith('.id')) {
        existingId = name.replace(/\.id$/, '').trim();
      } else if (name.endsWith('.ano')) {
        const parsed = parseInt(name.replace(/\.ano$/, '').trim(), 10);
        if (!isNaN(parsed) && parsed > 1800 && parsed <= new Date().getFullYear() + 5) {
          year = parsed;
        }
      } else if (name === 'tmdb.json') {
        tmdbFileId = f.id ?? undefined;
      }
    }

    return { existingId, year, tmdbFileId };
  }

  private async processTitleFolder(folder: DriveFolder): Promise<CatalogItem | null> {
    const allChildren = await this.listChildren(folder.id);
    const { existingId, year, tmdbFileId } = this.parseMarkers(allChildren);

    const subFolders = allChildren.filter(
      (f) => f.mimeType === 'application/vnd.google-apps.folder'
    );
    const videoFiles = allChildren.filter(
      (f) => f.mimeType && VIDEO_MIME_TYPES.has(f.mimeType)
    );

    const base = {
      title: folder.name,
      driveFolderId: folder.id,
      year,
      existingId,
      tmdbFileId,
    };

    // ── Series: has sub-folders (each = a season) ──────────────
    if (subFolders.length > 0) {
      const seasons = await this.buildSeasons(subFolders);
      if (seasons.length === 0) return null;

      const series: Series = { kind: 'series', ...base, seasons };
      return series;
    }

    // ── Film: has exactly one video file ───────────────────────
    if (videoFiles.length >= 1) {
      // Prefer the first video alphabetically
      const video = videoFiles.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))[0];
      const film: Film = { kind: 'film', ...base, driveFileId: video.id!, driveThumbnailUrl: video.thumbnailLink ?? undefined };
      return film;
    }

    // Folder exists but has no videos or seasons yet — skip
    return null;
  }

  private async buildSeasons(seasonFolders: drive_v3.Schema$File[]): Promise<Season[]> {
    const seasons: Season[] = [];

    // Sort by folder name (natural sort for "Temporada 1", "Season 2", etc.)
    const sorted = [...seasonFolders].sort((a, b) =>
      (a.name ?? '').localeCompare(b.name ?? '', undefined, { numeric: true })
    );

    for (let i = 0; i < sorted.length; i++) {
      const sf = sorted[i];
      const episodes = await this.buildEpisodes(sf.id!);
      if (episodes.length === 0) continue;

      seasons.push({
        number: i + 1,
        title: sf.name!,
        episodes,
      });
    }

    return seasons;
  }

  private async buildEpisodes(seasonFolderId: string): Promise<Episode[]> {
    const files = await this.listChildren(seasonFolderId);
    const videos = files.filter((f) => f.mimeType && VIDEO_MIME_TYPES.has(f.mimeType));

    // Sort by filename (natural numeric order: ep1, ep2, ep10...)
    const sorted = videos.sort((a, b) =>
      (a.name ?? '').localeCompare(b.name ?? '', undefined, { numeric: true })
    );

    return sorted.map((v, idx) => ({
      title: v.name!,
      driveFileId: v.id!,
      order: idx + 1,
      thumbnailLink: v.thumbnailLink ?? undefined,
    }));
  }
}
