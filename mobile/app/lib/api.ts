import axios, { AxiosInstance } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Auto-logout on 401 error
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response && error.response.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setAuthToken(null);
      // Optionally, you can trigger a reload or navigation to login
      // For now, just reload the JS bundle (works in Expo)
      if (typeof global !== 'undefined' && global.location && global.location.reload) {
        global.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

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
