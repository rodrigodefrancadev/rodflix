import apiClient from './apiClient';

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  approved: boolean;
  createdAt: string;
};

export const adminApi = {
  getUsers: async () => {
    const response = await apiClient.get<{ users: User[] }>('/admin/users');
    return response.data.users;
  },

  approveUser: async (id: string) => {
    const response = await apiClient.patch(`/admin/users/${id}/approve`);
    return response.data;
  },

  blockUser: async (id: string) => {
    const response = await apiClient.patch(`/admin/users/${id}/block`);
    return response.data;
  },

  setRole: async (id: string, role: string) => {
    const response = await apiClient.patch(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  syncCatalog: async () => {
    const response = await apiClient.post('/catalog/sync');
    return response.data;
  },
};
