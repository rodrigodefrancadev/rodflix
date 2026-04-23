import axios from 'axios';

export interface ExternalMetadata {
  posterUrl?: string;
  bannerUrl?: string;
  description?: string;
  year?: number;
}

export class MetadataService {
  private readonly apiKey = process.env.TMDB_API_KEY;
  // Using the provided Read Access Token for better reliability
  private readonly token = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiZjljNDAwZWRlZjBhMGZlN2JiODQyZGU4ZTI1NThkNiIsIm5iZiI6MTc3NjkxNDY1MC4yMjIwMDAxLCJzdWIiOiI2OWU5OTBkYWYxY2FjNTY1OTIzMzQyN2MiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.Yvw1EDk5G2eDeLq_o4ENx7h3PHWzpIsKvZ6bT8Tdzc0';
  private readonly baseUrl = 'https://api.themoviedb.org/3';

  async getMetadata(title: string, type: 'film' | 'series'): Promise<{ mapped: ExternalMetadata; raw: any } | null> {
    try {
      // Sanitize title: remove year markers like [2010] or (2010)
      const cleanTitle = title.replace(/[\[\(]\d{4}[\]\)]/g, '').trim();

      console.log(`[MetadataService] Fetching metadata for ${type}: "${cleanTitle}" (original: "${title}")`);

      const endpoint = type === 'film' ? '/search/movie' : '/search/tv';
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          accept: 'application/json',
        },
        params: {
          query: cleanTitle,
          language: 'pt-BR',
        },
      });

      const result = response.data.results?.[0];
      if (!result) {
        console.log(`[MetadataService] No results found for "${cleanTitle}"`);
        return null;
      }

      console.log(`[MetadataService] Found result: ${result.title || result.name} (id: ${result.id})`);

      // Fetch full details with credits, genres and runtime
      const detailEndpoint = type === 'film' ? `/movie/${result.id}` : `/tv/${result.id}`;
      const detailResponse = await axios.get(`${this.baseUrl}${detailEndpoint}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          accept: 'application/json',
        },
        params: {
          language: 'pt-BR',
          append_to_response: type === 'film' ? 'credits,release_dates' : 'credits,content_ratings',
        },
      });

      const fullResult = { ...result, ...detailResponse.data };

      return {
        mapped: this.mapExternalMetadata(fullResult, type),
        raw: fullResult,
      };
    } catch (error: any) {
      console.error(`[MetadataService] Error fetching metadata for ${title}:`, error?.response?.data || error.message);
      return null;
    }
  }

  mapExternalMetadata(result: any, type: 'film' | 'series'): ExternalMetadata {
    return {
      posterUrl: result.poster_path ? `https://image.tmdb.org/t/p/w500${result.poster_path}` : undefined,
      bannerUrl: result.backdrop_path ? `https://image.tmdb.org/t/p/original${result.backdrop_path}` : undefined,
      description: result.overview,
      year: type === 'film'
        ? (result.release_date ? new Date(result.release_date).getFullYear() : undefined)
        : (result.first_air_date ? new Date(result.first_air_date).getFullYear() : undefined),
    };
  }
}
