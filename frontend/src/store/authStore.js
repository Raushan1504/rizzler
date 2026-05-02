import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';
import { Platform } from 'react-native';

const setToken = async (token) => {
  if (Platform.OS === 'web') {
    localStorage.setItem('authToken', token);
  } else {
    await SecureStore.setItemAsync('authToken', token);
  }
};

const getToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('authToken');
  } else {
    return await SecureStore.getItemAsync('authToken');
  }
};

const removeToken = async () => {
  if (Platform.OS === 'web') {
    localStorage.removeItem('authToken');
  } else {
    await SecureStore.deleteItemAsync('authToken');
  }
};

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: true,
  error: null,

  init: async () => {
    try {
      const token = await getToken();
      if (token) {
        try {
          const res = await api.get('/users/profile');
          set({ token, user: res.data.data, isLoading: false });
        } catch (error) {
          // Token is likely invalid or expired
          await removeToken();
          set({ token: null, user: null, isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.error('Auth init error:', err);
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const res = await api.post('/auth/login', { email, password });
      
      const token = res.data.token;
      const user = res.data.data;
      
      await setToken(token);
      
      set({ token, user, isLoading: false });
      return true;
    } catch (err) {
      set({ 
        error: err.response?.data?.message || 'Login failed', 
        isLoading: false 
      });
      return false;
    }
  },

  register: async (name, email, password) => {
    try {
      set({ isLoading: true, error: null });
      const res = await api.post('/auth/signup', { name, email, password });
      
      const token = res.data.token;
      const user = res.data.data;
      
      await setToken(token);
      
      set({ token, user, isLoading: false });
      return true;
    } catch (err) {
      console.error('Registration error:', err);
      set({ 
        error: err.response?.data?.message || err.message || 'Registration failed', 
        isLoading: false 
      });
      return false;
    }
  },

  logout: async () => {
    try {
      await removeToken();
      set({ token: null, user: null });
    } catch (err) {
      console.error('Logout error:', err);
    }
  },
  
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
