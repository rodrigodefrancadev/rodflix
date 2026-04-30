import apiClient from './apiClient';

export type Episode = {
  title: string;
  driveFileId: string;
  order: number;
};

export type Season = {
  title: string;
  number: number;
  episodes: Episode[];
};

export type CatalogItem = {
  title: string;
  driveFolderId: string;
  year?: number;
  existingId: string; // The UUID in the database
  posterUrl?: string;
  bannerUrl?: string;
  description?: string;
  tmdbRaw?: any;
} & (
  | { kind: 'film'; driveFileId: string }
  | { kind: 'series'; seasons: Season[] }
);

export interface TitleDetails {
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
  seasons?: Season[];
  kind: 'film' | 'series';
  driveFileId?: string;
}

export const catalogApi = {
  getCatalog: async (params?: { search?: string; kind?: string }) => {
    let url = '/catalog';
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.kind && params.kind !== 'all') queryParams.append('kind', params.kind);
      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;
    }
    const response = await apiClient.get<{ items: CatalogItem[] }>(url);
    return response.data.items;
  },

  getFeatured: async () => {
    const response = await apiClient.get<CatalogItem>('/catalog/featured');
    return response.data;
  },

  getDetails: async (id: string) => {
    const response = await apiClient.get<TitleDetails>(`/catalog/${id}`);
    return response.data;
  },

  getSimilar: async (id: string) => {
    const response = await apiClient.get<CatalogItem[]>(`/catalog/${id}/similar`);
    return response.data;
  },
};
