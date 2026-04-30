import apiClient from './apiClient';

// ---- Types ----
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// ---- Auth API ----
export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient.post<{ message: string }>('/auth/register', payload),

  login: (payload: LoginPayload) =>
    apiClient.post<LoginResponse>('/auth/login', payload),
};

export default apiClient;
