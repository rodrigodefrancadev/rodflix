import apiClient from "./apiClient";


export interface Notification {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export const notificationApi = {
  create: async (data: { title: string; content: string }): Promise<Notification> => {
    const response = await apiClient.post('/notifications', data);
    return response.data;
  },

  getActive: async (): Promise<Notification | null> => {
    const response = await apiClient.get('/notifications/active');
    return response.data;
  },

  markSeen: async (id: string): Promise<void> => {
    await apiClient.post(`/notifications/${id}/seen`);
  },
};
