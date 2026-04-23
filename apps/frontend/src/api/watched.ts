import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

export interface WatchedItem {
  refId: string;
  kind: 'FILM' | 'EPISODE';
  watchedAt: string;
}

export const watchedApi = {
  async getWatched(): Promise<WatchedItem[]> {
    const token = localStorage.getItem('rodflix_token');
    const response = await axios.get(`${API_URL}/watched`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.watched;
  },

  async toggleWatched(refId: string, kind: 'FILM' | 'EPISODE'): Promise<boolean> {
    const token = localStorage.getItem('rodflix_token');
    const response = await axios.post(`${API_URL}/watched/toggle`, 
      { refId, kind },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.watched;
  }
};
