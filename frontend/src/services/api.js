import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Automatically detect the local IP address if running via Expo Go
const debuggerHost = Constants.expoConfig?.hostUri;
const localIp = debuggerHost?.split(':')[0];

// Use dynamic local IP for physical devices testing on the same network
const API_BASE_URL = localIp 
  ? `http://${localIp}:5000/api` 
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true', // Required to bypass localtunnel's warning page
  },
});

api.interceptors.request.use(async (config) => {
  let token = null;
  if (Platform.OS === 'web') {
    token = localStorage.getItem('authToken');
  } else {
    token = await SecureStore.getItemAsync('authToken');
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
