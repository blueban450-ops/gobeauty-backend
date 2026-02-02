
import axios, { AxiosInstance } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Use apiUrl from app.json extra if available, fallback to Render backend
const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'https://gobeauty-backend.onrender.com/api';

const api: AxiosInstance = axios.create({ baseURL: apiUrl });

// Debug helper: log the base URL once
console.log('API base URL:', apiUrl);

// Token will be set via setAuthToken helper
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

api.interceptors.request.use(config => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

// Fetch customer bookings
export async function getCustomerBookings() {
  try {
    const response = await api.get('/bookings/customer/me');
    return response.data;
  } catch (error) {
    console.log('getCustomerBookings error:', error);
    throw error;
  }
}

export default api;
