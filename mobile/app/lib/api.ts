import axios, { AxiosInstance } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Prefer Expo extra apiUrl; fallbacks cover SDK 54 manifest/manifest2 and a LAN IP.
const explicitUrl = (Constants.expoConfig?.extra?.apiUrl as string)
  || (Constants.manifest2 as any)?.extra?.apiUrl
  || (Constants.manifest as any)?.extra?.apiUrl;

// Android emulator can reach host machine via 10.0.2.2 when LAN IP fails.
const emulatorHost = Platform.OS === 'android' ? 'http://10.0.2.2:4000/api' : undefined;

const apiUrl = explicitUrl || emulatorHost || 'http://192.168.10.7:4000/api';

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
