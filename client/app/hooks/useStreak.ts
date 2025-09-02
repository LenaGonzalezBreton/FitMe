import { useState, useEffect } from 'react';
import { streakApi } from '../services/api';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
  totalWorkouts: number;
  thisWeekWorkouts: number;
  thisMonthWorkouts: number;
}

export interface UseStreakReturn {
  streakData: StreakData;
  loading: boolean;
  error: string | null;
  logWorkout: () => Promise<void>;
  refreshStreak: () => Promise<void>;
}

export const useStreak = (): UseStreakReturn => {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastWorkoutDate: null,
    totalWorkouts: 0,
    thisWeekWorkouts: 0,
    thisMonthWorkouts: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStreak = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await streakApi.getStreakData();
      setStreakData(response.data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des statistiques');
      console.error('Error refreshing streak:', err);
    } finally {
      setLoading(false);
    }
  };

  const logWorkout = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await streakApi.logWorkout();
      
      // Refresh streak data after logging
      await refreshStreak();
      
      if (__DEV__) {
        console.log('Workout logged successfully via API');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement de l\'entraînement');
      console.error('Error logging workout:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStreak();
  }, []);

  return {
    streakData,
    loading,
    error,
    logWorkout,
    refreshStreak,
  };
};
