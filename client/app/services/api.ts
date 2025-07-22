// client/app/services/api.ts
import axios, { InternalAxiosRequestConfig, AxiosError, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Config from 'react-native-config';
import { logout } from '../context/SessionManager';

const api = axios.create({
  baseURL: Config.API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Handle 401 → attempt silent refresh → retry original request
api.interceptors.response.use(
  res => res,
  async (err: AxiosError) => {
    const originalRequest = err.config as AxiosRequestConfig & { _retry?: boolean };
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(
          `${Config.API_URL}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        // Save new tokens
        await SecureStore.setItemAsync('accessToken', data.tokens.accessToken);
        await SecureStore.setItemAsync('refreshToken', data.tokens.refreshToken);

        // Update header and retry
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${data.tokens.accessToken}`,
        };
        return api(originalRequest);
      } catch {
        // refresh failed → force logout
        await logout();
      }
    }
    return Promise.reject(err);
  }
);

export default api;
