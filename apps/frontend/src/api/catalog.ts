import axios from 'axios';

const API_URL = 'http://localhost:3333/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('rodflix_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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
    let url = `${API_URL}/catalog`;
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.kind && params.kind !== 'all') queryParams.append('kind', params.kind);
      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;
    }
    const response = await axios.get<{ items: CatalogItem[] }>(url, {
      headers: getAuthHeader(),
    });
    return response.data.items;
  },

  getFeatured: async () => {
    const response = await axios.get<CatalogItem>(`${API_URL}/catalog/featured`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getDetails: async (id: string) => {
    const response = await axios.get<TitleDetails>(`${API_URL}/catalog/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getSimilar: async (id: string) => {
    const response = await axios.get<CatalogItem[]>(`${API_URL}/catalog/${id}/similar`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};
