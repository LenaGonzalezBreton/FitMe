import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { profileApi, workoutHistoryApi } from '../services/api';

export interface ProfileData {
  firstName: string;
  email: string;
  profileImageUrl?: string;
  birthDate?: string;
  objective?: string;
  experienceLevel?: string;
  profileType?: string;
  contextType?: string;
  sportFrequency?: string;
  isMenopausal?: boolean;
}

export interface WorkoutSession {
  id: string;
  date: string;
  programTitle: string;
  phase: string;
  phaseLabel: string;
  duration: number;
  exerciseCount: number;
  completed: boolean;
}

export interface UseProfileReturn {
  profileData: ProfileData;
  workoutHistory: WorkoutSession[];
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  uploadProfileImage: (imageUri: string) => Promise<boolean>;
  loadMoreWorkoutHistory: () => Promise<void>;
  hasMoreWorkouts: boolean;
}

export const useProfile = (): UseProfileReturn => {
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    email: '',
  });
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workoutOffset, setWorkoutOffset] = useState(0);
  const [workoutLimit] = useState(10);
  const [hasMoreWorkouts, setHasMoreWorkouts] = useState(true);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await profileApi.getProfile();
      setProfileData({
        firstName: response.user.firstName || '',
        email: response.user.email || '',
        profileImageUrl: response.user.profileImageUrl,
        birthDate: response.user.birthDate,
        objective: response.user.objective,
        experienceLevel: response.user.experienceLevel,
        profileType: response.user.profileType,
        contextType: response.user.contextType,
        sportFrequency: response.user.sportFrequency,
        isMenopausal: response.user.isMenopausal,
      });
    } catch (err: any) {
      // Don't show error alert for session expiration - user will be redirected to login
      if (err?.name === 'SessionExpired') {
        console.log('Session expired during profile fetch - user will be redirected to login');
        setError(null); // Clear any previous errors
        return;
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement du profil';
      setError(errorMessage);
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkoutHistory = async (opts?: { append?: boolean; reset?: boolean }) => {
    try {
      const response = await workoutHistoryApi.getWorkoutSessions({
        limit: workoutLimit,
        offset: workoutOffset,
      });
      const sessions = response.sessions || [];
      setHasMoreWorkouts(sessions.length === workoutLimit);
      if (opts?.append) {
        setWorkoutHistory(prev => [...prev, ...sessions]);
      } else {
        setWorkoutHistory(sessions);
      }
    } catch (err: any) {
      console.error('Error fetching workout history:', err);
      // Don't set error for workout history as it's not critical
      setWorkoutHistory([]);
    }
  };

  const refreshProfile = async () => {
    setWorkoutOffset(0);
    await Promise.all([fetchProfileData(), fetchWorkoutHistory({ reset: true })]);
  };

  const loadMoreWorkoutHistory = async () => {
    if (!hasMoreWorkouts) return;
    const nextOffset = workoutOffset + workoutLimit;
    setWorkoutOffset(nextOffset);
    await fetchWorkoutHistory({ append: true });
  };

  const updateProfile = async (data: Partial<ProfileData>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await profileApi.updateProfile(data);
      
      // Update local state
      setProfileData(prev => ({ ...prev, ...data }));
      
      // Refresh profile data to ensure consistency
      await fetchProfileData();
      
      return true;
    } catch (err: any) {
      // Don't show error alert for session expiration - user will be redirected to login
      if (err?.name === 'SessionExpired') {
        console.log('Session expired during profile update - user will be redirected to login');
        return false;
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour du profil';
      setError(errorMessage);
      Alert.alert('Erreur', errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await profileApi.changePassword({
        currentPassword,
        newPassword,
      });

      return true;
    } catch (err: any) {
      // Don't show error alert for session expiration - user will be redirected to login
      if (err?.name === 'SessionExpired') {
        console.log('Session expired during password change - user will be redirected to login');
        return false;
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du changement de mot de passe';
      setError(errorMessage);
      Alert.alert('Erreur', errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const uploadProfileImage = async (imageUri: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Try to upload to server, fallback to local state if needed
      try {
        const response = await profileApi.uploadProfileImage(imageUri);
        setProfileData(prev => ({ ...prev, profileImageUrl: response.imageUrl || imageUri }));
      } catch (uploadError) {
        console.log('Server upload failed, using local image:', uploadError);
        // Fallback: just update local state for now
        setProfileData(prev => ({ ...prev, profileImageUrl: imageUri }));
      }

      return true;
    } catch (err: any) {
      // Don't show error alert for session expiration - user will be redirected to login
      if (err?.name === 'SessionExpired') {
        console.log('Session expired during image upload - user will be redirected to login');
        return false;
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du téléchargement de l\'image';
      setError(errorMessage);
      Alert.alert('Erreur', errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  return {
    profileData,
    workoutHistory,
    loading,
    error,
    refreshProfile,
    updateProfile,
    changePassword,
    uploadProfileImage,
    loadMoreWorkoutHistory,
    hasMoreWorkouts,
  };
};
