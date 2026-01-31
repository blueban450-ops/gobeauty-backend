import axios, { AxiosInstance } from 'axios';

export const apiBaseUrl = (import.meta.env.VITE_API_URL as string) || 'http://192.168.10.7:4000/api';

const api: AxiosInstance = axios.create({ baseURL: apiBaseUrl, timeout: 10000 });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
