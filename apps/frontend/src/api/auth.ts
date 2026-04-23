import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
  headers: { 'Content-Type': 'application/json' },
});

// Inject JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rodflix_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
    api.post<{ message: string }>('/api/auth/register', payload),

  login: (payload: LoginPayload) =>
    api.post<LoginResponse>('/api/auth/login', payload),
};

export default api;
