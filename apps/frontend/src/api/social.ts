import apiClient from './apiClient';

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
    const response = await apiClient.get<MemberSummary[]>('/social/members');
    return response.data;
  },

  getProfile: async (userId: string) => {
    const response = await apiClient.get<UserProfile>(`/social/profile/${userId}`);
    return response.data;
  }
};
