import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Update this to your backend URL (use your machine's LAN IP for physical devices)
const API_BASE_URL = 'http://10.40.188.3:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach auth token to every request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
