import React, { createContext, useContext, useState, useEffect } from 'react';
// @ts-ignore - AsyncStorage module resolution
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { setAuthToken } from '../lib/api';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  login: (token: string, userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: any) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user on app start
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userData = await AsyncStorage.getItem('user');
        if (token && userData) {
          setAuthToken(token);
          // Validate token by making a test API call
          try {
            await api.get('/auth/me');
            setUser(JSON.parse(userData));
          } catch (e) {
            // Token invalid or API unreachable; clear cache
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            setAuthToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.warn('Failed to load token', err);
      }
      setLoading(false);
    };
    loadToken();
  }, []);


  const login = async (token: string, userData: any) => {
    try {
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setAuthToken(token);
      setUser(userData);
    } catch (err) {
      console.warn('Failed to save token', err);
    }
  };

  // Update only user data, not token
  const updateUser = async (userData: any) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (err) {
      console.warn('Failed to update user', err);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setAuthToken(null);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
