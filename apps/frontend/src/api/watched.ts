import apiClient from './apiClient';

export interface WatchedItem {
  refId: string;
  kind: 'FILM' | 'EPISODE';
  watchedAt: string;
}

export const watchedApi = {
  async getWatched(): Promise<WatchedItem[]> {
    const response = await apiClient.get('/watched');
    return response.data.watched;
  },

  async toggleWatched(refId: string, kind: 'FILM' | 'EPISODE'): Promise<boolean> {
    const response = await apiClient.post('/watched/toggle', { refId, kind });
    return response.data.watched;
  }
};
