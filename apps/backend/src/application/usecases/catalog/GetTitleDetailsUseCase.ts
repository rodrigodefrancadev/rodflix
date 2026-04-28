import type { ICatalogRepository } from '../../../domain/repositories/ICatalogRepository';

export interface TitleDetailsDTO {
  id: string;
  title: string;
  description: string | null;
  year: number | null;
  posterUrl: string | null;
  bannerUrl: string | null;
  ageRating: string | null;
  duration: string | null;
  genres: string | null;
  director: string | null;
  cast: string | null;
  tmdbRating: string | null;
  seasons?: any[];
  kind: 'film' | 'series';
  driveFileId?: string;
}

export class GetTitleDetailsUseCase {
  constructor(private readonly catalogRepository: ICatalogRepository) { }

  async execute(id: string): Promise<TitleDetailsDTO | null> {
    const item = await this.catalogRepository.findById(id);
    if (!item) return null;

    const fullTmdb = item.tmdbRaw;

    const cast = fullTmdb?.credits?.cast?.slice(0, 5).map((c: any) => c.name).join(', ') || null;
    const director = fullTmdb?.credits?.crew?.find((c: any) => c.job === 'Director')?.name
      || fullTmdb?.created_by?.[0]?.name
      || null;
    const genres = fullTmdb?.genres?.map((g: any) => g.name).join(' • ') || null;
    const tmdbRating = fullTmdb?.vote_average ? fullTmdb.vote_average.toFixed(1) : null;
    const duration = fullTmdb?.runtime
      ? `${Math.floor(fullTmdb.runtime / 60)}h ${fullTmdb.runtime % 60}m`
      : null;

    let ageCert: string | null = null;
    if (item.kind === 'film') {
      const results = fullTmdb?.release_dates?.results ?? [];
      const brEntry = results.find((r: any) => r.iso_3166_1 === 'BR');
      const usEntry = results.find((r: any) => r.iso_3166_1 === 'US');
      const raw = brEntry?.release_dates?.[0]?.certification
        || usEntry?.release_dates?.[0]?.certification
        || null;
      ageCert = this.normalizeCertification(raw);
    } else {
      const results = fullTmdb?.content_ratings?.results ?? [];
      const brEntry = results.find((r: any) => r.iso_3166_1 === 'BR');
      const usEntry = results.find((r: any) => r.iso_3166_1 === 'US');
      const raw = brEntry?.rating || usEntry?.rating || null;
      ageCert = this.normalizeCertification(raw);
    }

    const dto: TitleDetailsDTO = {
      id: item.existingId!,
      title: item.title,
      description: item.description ?? null,
      year: item.year ?? null,
      posterUrl: item.posterUrl ?? null,
      bannerUrl: item.bannerUrl ?? null,
      ageRating: ageCert,
      duration,
      genres,
      director,
      cast,
      tmdbRating,
      kind: item.kind,
    };

    if (item.kind === 'film') {
      dto.driveFileId = item.driveFileId;
    } else {
      dto.seasons = item.seasons;
    }

    return dto;
  }

  private normalizeCertification(cert: string | null): string | null {
    if (!cert) return null;

    const classind = ['L', '10', '12', '14', '16', '18'];
    if (classind.includes(cert)) return cert;

    const map: Record<string, string> = {
      'G': 'L', 'PG': '10', 'PG-13': '12', 'R': '16', 'NC-17': '18', 'NR': 'L', 'UR': 'L',
      'U': 'L', '12A': '12', '15': '14', 'R18': '18',
      '0': 'L', '6': 'L', '7': 'L', '8': '10', '9': '10', '11': '12', '13': '12', '17': '16',
    };

    return map[cert] ?? cert;
  }
}
