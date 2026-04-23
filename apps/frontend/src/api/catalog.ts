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
} & (
  | { kind: 'film'; driveFileId: string }
  | { kind: 'series'; seasons: Season[] }
);

export const catalogApi = {
  getCatalog: async () => {
    const response = await axios.get<{ items: CatalogItem[] }>(`${API_URL}/catalog`, {
      headers: getAuthHeader(),
    });
    return response.data.items;
  },
};
