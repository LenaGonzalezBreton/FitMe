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
}

export const useProfile = (): UseProfileReturn => {
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    email: '',
  });
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement du profil';
      setError(errorMessage);
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkoutHistory = async () => {
    try {
      // For now, use mock data since the API doesn't exist yet
      const mockSessions: WorkoutSession[] = [
        {
          id: '1',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          programTitle: 'Programme Folliculaire',
          phase: 'FOLLICULAR',
          phaseLabel: 'Folliculaire',
          duration: 45,
          exerciseCount: 8,
          completed: true,
        },
        {
          id: '2',
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
          programTitle: 'Récupération Douce',
          phase: 'MENSTRUAL',
          phaseLabel: 'Menstruelle',
          duration: 30,
          exerciseCount: 5,
          completed: true,
        },
        {
          id: '3',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
          programTitle: 'HIIT Intensif',
          phase: 'OVULATION',
          phaseLabel: 'Ovulatoire',
          duration: 35,
          exerciseCount: 6,
          completed: false,
        },
      ];
      setWorkoutHistory(mockSessions);

      // Future implementation with real API:
      // const response = await workoutHistoryApi.getWorkoutSessions({
      //   limit: 10,
      //   offset: 0,
      // });
      // setWorkoutHistory(response.sessions);
    } catch (err: any) {
      console.error('Error fetching workout history:', err);
      // Don't set error for workout history as it's not critical
    }
  };

  const refreshProfile = async () => {
    await Promise.all([fetchProfileData(), fetchWorkoutHistory()]);
  };

  const updateProfile = async (data: Partial<ProfileData>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await profileApi.updateProfile(data);
      
      // Update local state
      setProfileData(prev => ({ ...prev, ...data }));
      
      return true;
    } catch (err: any) {
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
  };
};
