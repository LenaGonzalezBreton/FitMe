import axios, { InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { UpdateCycleConfigRequest, LogPeriodRequest } from '../types';

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
    } else if (config.url !== '/auth/register' && config.url !== '/auth/login') {
      // Only warn for non-auth endpoints when no token is found
      console.warn('No access token found for API request:', config.url);
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
  async error => {
    // Don't log 400 errors for cycle tracking as they're expected when not enabled
    const isCycleTrackingError = error.config?.url?.includes('/cycle/') && error.response?.status === 400;
    
    if (__DEV__ && !isCycleTrackingError) {
      console.error(`[API] Error ${error.response?.status}:`, {
        url: error.config?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data
      });
    } else if (__DEV__ && isCycleTrackingError) {
      console.log(`[API] Cycle tracking not enabled (${error.response?.status}):`, error.config?.url);
    }
    
    // Handle 401 errors by clearing stored tokens and redirecting to login
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - clearing stored tokens and redirecting to login');
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('user');
      
      // Don't show error to user for 401 - they'll be redirected to login
      // Return a custom error that can be handled gracefully
      const customError = new Error('Session expired');
      customError.name = 'SessionExpired';
      return Promise.reject(customError);
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
    type?: string;
    trainingDays?: number[];
    duration?: number;
    focusZone?: string;
    cyclePhase?: number | null;
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

  // Get program types
  getProgramTypes: async () => {
    const response = await api.get('/programs/types');
    return response.data;
  },

  // Get training days
  getTrainingDays: async () => {
    const response = await api.get('/programs/training-days');
    return response.data;
  },
};

// Cycle API calls
export const cycleApi = {
  // Get current cycle
  getCurrentCycle: async () => {
    const response = await api.get('/cycle/current-cycle');
    return response.data;
  },

  // Get cycle config
  getCycleConfig: async () => {
    const response = await api.get('/cycle/config');
    return response.data;
  },

  // Update cycle config
  updateCycleConfig: async (config: UpdateCycleConfigRequest) => {
    const response = await api.put('/cycle/config', config);
    return response.data;
  },

  // Log period
  logPeriod: async (periodData: LogPeriodRequest) => {
    const response = await api.post('/cycle/periods', periodData);
    return response.data;
  },

  // Get periods history
  getPeriodsHistory: async (params?: {
    limit?: number;
    offset?: number;
    fromDate?: string;
    toDate?: string;
  }) => {
    const response = await api.get('/cycle/periods', { params });
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

// Workout History API calls
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

  // Get workout statistics
  getWorkoutStats: async (params?: {
    period?: 'week' | 'month' | 'year' | 'all';
    fromDate?: string;
    toDate?: string;
  }) => {
    const response = await api.get('/workouts/stats', { params });
    return response.data;
  },

  // Export workout data
  exportWorkoutData: async (params?: {
    format?: 'csv' | 'json' | 'pdf';
    fromDate?: string;
    toDate?: string;
  }) => {
    const response = await api.get('/workouts/export', { params });
    return response.data;
  },
};

// Workout API calls
export const workoutApi = {
  // Start a workout session
  startWorkoutSession: async (programId: string) => {
    const response = await api.post('/workouts/sessions', { programId });
    return response.data;
  },

  // Complete a workout session
  completeWorkoutSession: async (sessionId: string, data?: {
    completedExercises: string[];
    totalDuration: number;
    notes?: string;
    rating?: number;
  }) => {
    const response = await api.put(`/workouts/sessions/${sessionId}/complete`, data);
    return response.data;
  },

  // Get workout session details
  getWorkoutSession: async (sessionId: string) => {
    const response = await api.get(`/workouts/sessions/${sessionId}`);
    return response.data;
  },

  // Get user's workout sessions
  getUserWorkoutSessions: async (params?: {
    limit?: number;
    offset?: number;
    fromDate?: string;
    toDate?: string;
    programId?: string;
    completed?: boolean;
  }) => {
    const response = await api.get('/workouts/sessions', { params });
    return response.data;
  },

  // Log exercise completion within a session
  logExerciseCompletion: async (sessionId: string, exerciseId: string, data: {
    sets?: number;
    reps?: string;
    weight?: number;
    duration?: number;
    notes?: string;
  }) => {
    const response = await api.post(`/workouts/sessions/${sessionId}/exercises/${exerciseId}/complete`, data);
    return response.data;
  },

  // Pause workout session
  pauseWorkoutSession: async (sessionId: string) => {
    const response = await api.put(`/workouts/sessions/${sessionId}/pause`);
    return response.data;
  },

  // Resume workout session
  resumeWorkoutSession: async (sessionId: string) => {
    const response = await api.put(`/workouts/sessions/${sessionId}/resume`);
    return response.data;
  },
};

// Exercise API calls
export const exerciseApi = {
  // Get all exercises
  getExercises: async (params?: {
    category?: string;
    intensity?: 'LOW' | 'MODERATE' | 'HIGH';
    muscleZone?: string;
    phase?: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
    limit?: number;
    offset?: number;
  }) => {
    const response = await api.get('/exercises', { params });
    return response.data;
  },

  // Get exercise categories
  getCategories: async () => {
    const response = await api.get('/exercises/categories');
    return response.data;
  },

  // Get exercise by ID
  getExerciseById: async (id: string) => {
    const response = await api.get(`/exercises/${id}`);
    return response.data;
  },

  // Create custom exercise
  createExercise: async (exerciseData: {
    title: string;
    description: string;
    category: string;
    intensity: 'LOW' | 'MEDIUM' | 'HIGH';
    muscleGroups: string[];
    duration: number;
    instructions?: string;
    imageUrl?: string;
  }) => {
    const response = await api.post('/exercises', exerciseData);
    return response.data;
  },

  // Update exercise
  updateExercise: async (id: string, updates: Partial<{
    title: string;
    description: string;
    category: string;
    intensity: 'LOW' | 'MEDIUM' | 'HIGH';
    muscleGroups: string[];
    duration: number;
    instructions: string;
    imageUrl: string;
  }>) => {
    const response = await api.put(`/exercises/${id}`, updates);
    return response.data;
  },

  // Delete exercise
  deleteExercise: async (id: string) => {
    const response = await api.delete(`/exercises/${id}`);
    return response.data;
  },

  // Search exercises
  searchExercises: async (query: string, params?: {
    category?: string;
    intensity?: string;
    muscleGroup?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await api.get('/exercises/search', { 
      params: { query, ...params } 
    });
    return response.data;
  },

  // Get exercises by muscle group
  getExercisesByMuscleGroup: async (muscleGroup: string, params?: {
    limit?: number;
    offset?: number;
    intensity?: string;
  }) => {
    const response = await api.get(`/exercises/muscle-groups/${muscleGroup}`, { params });
    return response.data;
  },

  // Get exercises by category
  getExercisesByCategory: async (category: string, params?: {
    limit?: number;
    offset?: number;
    intensity?: string;
  }) => {
    const response = await api.get(`/exercises/categories/${category}`, { params });
    return response.data;
  },
};

// Streak API calls
export const streakApi = {
  // Get streak data
  getStreakData: async () => {
    const response = await api.get('/streak');
    return response.data;
  },

  // Log a workout
  logWorkout: async (data?: {
    duration?: number;
    intensity?: 'LOW' | 'MEDIUM' | 'HIGH';
    notes?: string;
  }) => {
    const response = await api.post('/streak/log-workout', data);
    return response.data;
  },

  // Get streak statistics
  getStreakStats: async (params?: {
    period?: 'week' | 'month' | 'year' | 'all';
    fromDate?: string;
    toDate?: string;
  }) => {
    const response = await api.get('/streak/stats', { params });
    return response.data;
  },

  // Get streak milestones
  getStreakMilestones: async () => {
    const response = await api.get('/streak/milestones');
    return response.data;
  },

  // Reset streak (for testing or corrections)
  resetStreak: async (reason?: string) => {
    const response = await api.post('/streak/reset', { reason });
    return response.data;
  },
};

// Notification API calls
export const notificationApi = {
  // Get user notifications
  getNotifications: async (params?: {
    limit?: number;
    offset?: number;
    read?: boolean;
  }) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId: string) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  // Update notification preferences
  updatePreferences: async (preferences: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    workoutReminders?: boolean;
    cycleReminders?: boolean;
    progressUpdates?: boolean;
  }) => {
    const response = await api.put('/notifications/preferences', preferences);
    return response.data;
  },
};

// Analytics API calls
export const analyticsApi = {
  // Get user analytics
  getUserAnalytics: async (params?: {
    period?: 'week' | 'month' | 'year' | 'all';
    fromDate?: string;
    toDate?: string;
  }) => {
    const response = await api.get('/analytics/user', { params });
    return response.data;
  },

  // Get workout analytics
  getWorkoutAnalytics: async (params?: {
    period?: 'week' | 'month' | 'year' | 'all';
    fromDate?: string;
    toDate?: string;
    programId?: string;
  }) => {
    const response = await api.get('/analytics/workouts', { params });
    return response.data;
  },

  // Get cycle analytics
  getCycleAnalytics: async (params?: {
    period?: 'week' | 'month' | 'year' | 'all';
    fromDate?: string;
    toDate?: string;
  }) => {
    const response = await api.get('/analytics/cycle', { params });
    return response.data;
  },

  // Get progress insights
  getProgressInsights: async () => {
    const response = await api.get('/analytics/progress-insights');
    return response.data;
  },
};

// User Preferences API calls
export const preferencesApi = {
  // Get user preferences
  getUserPreferences: async () => {
    const response = await api.get('/user/preferences');
    return response.data;
  },

  // Update user preferences
  updateUserPreferences: async (preferences: {
    theme?: 'light' | 'dark' | 'auto';
    language?: 'fr' | 'en';
    units?: 'metric' | 'imperial';
    privacy?: {
      shareProgress?: boolean;
      shareCycle?: boolean;
      allowAnalytics?: boolean;
    };
    notifications?: {
      workoutReminders?: boolean;
      cycleReminders?: boolean;
      progressUpdates?: boolean;
      weeklyReports?: boolean;
    };
  }) => {
    const response = await api.put('/user/preferences', preferences);
    return response.data;
  },

  // Get available themes
  getAvailableThemes: async () => {
    const response = await api.get('/user/preferences/themes');
    return response.data;
  },

  // Get available languages
  getAvailableLanguages: async () => {
    const response = await api.get('/user/preferences/languages');
    return response.data;
  },
};

export default api;
