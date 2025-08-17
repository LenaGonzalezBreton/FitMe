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
    const token = await SecureStore.getItemAsync('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No access token found for API request');
    }
    
    if (__DEV__) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
        hasToken: !!token,
        params: config.params,
        data: config.data
      });
    }
    
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => {
    if (__DEV__) {
      console.log(`[API] Response ${response.status}:`, response.config.url);
    }
    return response;
  },
  error => {
    if (__DEV__) {
      console.error(`[API] Error ${error.response?.status}:`, {
        url: error.config?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data
      });
    }
    return Promise.reject(error);
  }
);

// Program API calls
export const programApi = {
  // Get user programs
  getUserPrograms: async (params?: {
    isActive?: boolean;
    isTemplate?: boolean;
    startDateFrom?: string;
    startDateTo?: string;
    limit?: number;
    offset?: number;
  }) => {
    // Ensure limit and offset are properly typed as numbers
    const cleanParams = {
      ...params,
      limit: params?.limit ? Number(params.limit) : 50,
      offset: params?.offset ? Number(params.offset) : 0,
    };
    
    const response = await api.get('/programs', { params: cleanParams });
    return response.data;
  },

  // Get program by ID
  getProgramById: async (programId: string) => {
    const response = await api.get(`/programs/${programId}`);
    return response.data;
  },

  // Generate program
  generateProgram: async (params?: {
    duration?: number;
    focusZone?: string;
    sessionType?: 'cardio' | 'strength' | 'flexibility' | 'mixed';
  }) => {
    const response = await api.post('/programs/generate', params);
    return response.data;
  },

  // Create program
  createProgram: async (programData: {
    title: string;
    goal?: string;
    startDate: string;
    endDate?: string;
    isTemplate?: boolean;
    exercises?: Array<{
      exerciseId: string;
      order: number;
      sets?: number;
      reps?: string;
      duration?: number;
      restTime?: number;
      notes?: string;
    }>;
  }) => {
    const response = await api.post('/programs', programData);
    return response.data;
  },

  // Start program
  startProgram: async (programId: string) => {
    const response = await api.post(`/programs/${programId}/start`);
    return response.data;
  },

  // Update program
  updateProgram: async (programId: string, updates: {
    title?: string;
    goal?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    isTemplate?: boolean;
  }) => {
    const response = await api.put(`/programs/${programId}`, updates);
    return response.data;
  },

  // Delete program
  deleteProgram: async (programId: string) => {
    const response = await api.delete(`/programs/${programId}`);
    return response.data;
  },
};

// Cycle API calls
export const cycleApi = {
  // Get current phase
  getCurrentPhase: async () => {
    const response = await api.get('/cycle/current-phase');
    return response.data;
  },

  // Get cycle config
  getCycleConfig: async () => {
    const response = await api.get('/cycle/config');
    return response.data;
  },

  // Update cycle config
  updateCycleConfig: async (config: {
    isCycleTrackingEnabled?: boolean;
    usesExternalProvider?: boolean;
    useMenopauseMode?: boolean;
    averageCycleLength?: number;
    averagePeriodLength?: number;
    prefersManualInput?: boolean;
  }) => {
    const response = await api.put('/cycle/config', config);
    return response.data;
  },
};

// Profile API calls
export const profileApi = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData: {
    firstName?: string;
    email?: string;
    birthDate?: string;
    profileType?: string;
    contextType?: string;
    objective?: string;
    sportFrequency?: string;
    isMenopausal?: boolean;
  }) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await api.post('/auth/change-password', passwordData);
    return response.data;
  },

  // Upload profile image
  uploadProfileImage: async (imageUri: string) => {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      const response = await api.post('/auth/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds timeout for image upload
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  },
};

// Workout History API calls (placeholder for future implementation)
export const workoutHistoryApi = {
  // Get user workout sessions
  getWorkoutSessions: async (params?: {
    limit?: number;
    offset?: number;
    fromDate?: string;
    toDate?: string;
  }) => {
    const response = await api.get('/workouts/sessions', { params });
    return response.data;
  },

  // Get workout session details
  getSessionDetails: async (sessionId: string) => {
    const response = await api.get(`/workouts/sessions/${sessionId}`);
    return response.data;
  },
};

export default api;
