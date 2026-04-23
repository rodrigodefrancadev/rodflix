import axios from 'axios';

const API_URL = 'http://localhost:3333/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('rodflix_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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
    const response = await axios.get<{ users: User[] }>(`${API_URL}/admin/users`, {
      headers: getAuthHeader(),
    });
    return response.data.users;
  },

  approveUser: async (id: string) => {
    const response = await axios.patch(`${API_URL}/admin/users/${id}/approve`, {}, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  blockUser: async (id: string) => {
    const response = await axios.patch(`${API_URL}/admin/users/${id}/block`, {}, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  setRole: async (id: string, role: string) => {
    const response = await axios.patch(`${API_URL}/admin/users/${id}/role`, { role }, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  syncCatalog: async () => {
    const response = await axios.post(`${API_URL}/catalog/sync`, {}, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};
