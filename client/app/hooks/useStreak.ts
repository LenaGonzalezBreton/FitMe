import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

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

const STREAK_STORAGE_KEY = 'workout_streak_data';

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

  const loadStreakData = async (): Promise<StreakData> => {
    try {
      const stored = await SecureStore.getItemAsync(STREAK_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.warn('Failed to load streak data:', err);
    }
    
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastWorkoutDate: null,
      totalWorkouts: 0,
      thisWeekWorkouts: 0,
      thisMonthWorkouts: 0,
    };
  };

  const saveStreakData = async (data: StreakData): Promise<void> => {
    try {
      await SecureStore.setItemAsync(STREAK_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('Failed to save streak data:', err);
    }
  };

  const calculateStreak = (lastWorkoutDate: string | null): number => {
    if (!lastWorkoutDate) return 0;
    
    const lastWorkout = new Date(lastWorkoutDate);
    const today = new Date();
    const diffTime = today.getTime() - lastWorkout.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // If last workout was today or yesterday, continue streak
    if (diffDays <= 1) {
      return 1; // We'll calculate the full streak by checking consecutive days
    }
    
    return 0; // Streak broken
  };

  const calculateWorkoutStats = (lastWorkoutDate: string | null): {
    thisWeekWorkouts: number;
    thisMonthWorkouts: number;
  } => {
    if (!lastWorkoutDate) return { thisWeekWorkouts: 0, thisMonthWorkouts: 0 };
    
    const lastWorkout = new Date(lastWorkoutDate);
    const today = new Date();
    
    // Calculate this week (Monday to Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Calculate this month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const thisWeekWorkouts = lastWorkout >= startOfWeek ? 1 : 0;
    const thisMonthWorkouts = lastWorkout >= startOfMonth ? 1 : 0;
    
    return { thisWeekWorkouts, thisMonthWorkouts };
  };

  const refreshStreak = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await loadStreakData();
      
      // Recalculate current streak based on last workout
      const currentStreak = calculateStreak(data.lastWorkoutDate);
      const workoutStats = calculateWorkoutStats(data.lastWorkoutDate);
      
      const updatedData: StreakData = {
        ...data,
        currentStreak,
        thisWeekWorkouts: workoutStats.thisWeekWorkouts,
        thisMonthWorkouts: workoutStats.thisMonthWorkouts,
      };
      
      setStreakData(updatedData);
      await saveStreakData(updatedData);
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
      
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const currentData = await loadStreakData();
      
      // Don't log if already logged today
      if (currentData.lastWorkoutDate === today) {
        return;
      }
      
      const newCurrentStreak = currentData.currentStreak + 1;
      const newLongestStreak = Math.max(currentData.longestStreak, newCurrentStreak);
      const workoutStats = calculateWorkoutStats(today);
      
      const updatedData: StreakData = {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastWorkoutDate: today,
        totalWorkouts: currentData.totalWorkouts + 1,
        thisWeekWorkouts: workoutStats.thisWeekWorkouts,
        thisMonthWorkouts: workoutStats.thisMonthWorkouts,
      };
      
      setStreakData(updatedData);
      await saveStreakData(updatedData);
      
      if (__DEV__) {
        console.log('Workout logged successfully:', updatedData);
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
