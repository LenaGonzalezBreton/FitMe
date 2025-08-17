import axios, { InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Resolve base URL robustly across Expo Go, dev clients, emulators, and real devices
function resolveApiBaseURL(): string {
  // Try to derive the Metro host from Expo constants
  // Supports various Expo SDKs (manifest, manifest2, expoConfig)
  const hostUri: string | undefined =
    (Constants as any)?.expoConfig?.hostUri ||
    (Constants as any)?.manifest?.debuggerHost ||
    (Constants as any)?.manifest2?.extra?.expoClient?.hostUri;

  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[API] Raw hostUri from Constants:', hostUri);
    // eslint-disable-next-line no-console
    console.log('[API] Full Constants object:', JSON.stringify(Constants, null, 2));
  }

  if (hostUri) {
    // Extract host from various formats:
    // - "192.168.1.42:19000" -> "192.168.1.42"
    // - "exp://192.168.1.42:19000" -> "192.168.1.42"
    // - "192.168.1.42" -> "192.168.1.42"
    let host = hostUri;
    
    // Remove protocol if present
    if (host.includes('://')) {
      host = host.split('://')[1];
    }
    
    // Extract just the IP/hostname part (before port)
    host = host.split(':')[0];

    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[API] Extracted host:', host);
    }

    // Only use if it's a real IP/hostname (not localhost)
    if (host && host !== 'localhost' && host !== '127.0.0.1' && host !== '') {
      const baseUrl = `http://${host}:3000`;
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('[API] Using derived base URL:', baseUrl);
      }
      return baseUrl;
    }
  }

  // Emulator/simulator fallbacks
  const fallback = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[API] Using fallback base URL:', fallback);
  }
  return fallback;
}

const apiBaseURL = resolveApiBaseURL();

const api = axios.create({
  baseURL: apiBaseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;
