import axios from 'axios';

const API_URL = 'http://localhost:3333/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('rodflix_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface MemberSummary {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  avatarUrl: string | null;
  watchedCount: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  kind: 'film' | 'series';
  catalogItemId: string;
  watchedAt: string;
  posterUrl?: string | null;
  episodesWatched?: number;
  totalEpisodes?: number;
  rating?: 'LIKE' | 'LOVE' | 'DISLIKE' | null;
}

export interface UserProfile extends MemberSummary {
  bio: string | null;
  activity: ActivityItem[];
}

export const socialApi = {
  getMembers: async () => {
    const response = await axios.get<MemberSummary[]>(`${API_URL}/social/members`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getProfile: async (userId: string) => {
    const response = await axios.get<UserProfile>(`${API_URL}/social/profile/${userId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  }
};
