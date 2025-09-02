import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cycleApi } from '../services/api';
import { CurrentCycleData, CurrentCycleResponse, CycleConfig, CycleConfigResponse, UpdateCycleConfigRequest } from '../types';
import { useAuth } from './AuthContext';

interface CycleContextData {
  currentCycle: CurrentCycleData | null;
  cycleConfig: CycleConfig | null;
  loading: boolean;
  error: string | null;
  refreshCycle: () => Promise<void>;
  refreshConfig: () => Promise<void>;
  updateCycleConfig: (config: UpdateCycleConfigRequest) => Promise<boolean>;
  getCycleCharacteristics: (cycleDay: number, isPeriodDay: boolean, isOvulationPhase: boolean, isFertileDay: boolean, cycleLength?: number) => string;
  getCycleEmoji: (cycleDay: number, isPeriodDay: boolean, isOvulationPhase: boolean, isFertileDay: boolean, cycleLength?: number) => string;
  getCycleColor: (cycleDay: number, isPeriodDay: boolean, isOvulationPhase: boolean, isFertileDay: boolean, cycleLength?: number) => string;
  getPhaseApiKey: () => string | undefined;
}

const CycleContext = createContext<CycleContextData | undefined>(undefined);

interface CycleProviderProps {
  children: ReactNode;
}

export const CycleProvider = ({ children }: CycleProviderProps) => {
  const { user } = useAuth();
  const [currentCycle, setCurrentCycle] = useState<CurrentCycleData | null>(null);
  const [cycleConfig, setCycleConfig] = useState<CycleConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const fetchCurrentCycle = async () => {
    // Don't fetch if no user is logged in
    if (!user) {
      if (__DEV__) {
        console.log('CycleContext: Skipping fetch - no user logged in');
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response: CurrentCycleResponse = await cycleApi.getCurrentCycle();
      
      if (response.success) {
        if (__DEV__) {
          console.log('CycleContext: Current cycle data received from server:', response.data);
        }
        setCurrentCycle(response.data);
      } else {
        throw new Error('Réponse invalide du serveur');
      }
    } catch (err: any) {
      // Don't show error alert for session expiration - user will be redirected to login
      if (err?.name === 'SessionExpired') {
        console.log('Session expired during cycle fetch - user will be redirected to login');
        setError(null);
        setCurrentCycle(null);
        return;
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des informations du cycle';
      console.error('Error fetching current cycle:', err);
      
      // If it's a 400 or 404, the user probably doesn't have cycle tracking enabled
      if (err.response?.status === 400 || err.response?.status === 404) {
        console.log('Cycle tracking not enabled or no cycle data found');
        setError(null);
        setCurrentCycle(null);
        return;
      }
      
      setError(errorMessage);
      setCurrentCycle(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchCycleConfig = async () => {
    // Don't fetch if no user is logged in
    if (!user) {
      if (__DEV__) {
        console.log('CycleContext: Skipping config fetch - no user logged in');
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response: CycleConfigResponse = await cycleApi.getCycleConfig();
      setCycleConfig(response.config);
    } catch (err: any) {
      if (err?.name === 'SessionExpired') {
        console.log('Session expired during cycle config fetch - user will be redirected to login');
        setError(null);
        setCycleConfig(null);
        return;
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement de la configuration du cycle';
      console.error('Error fetching cycle config:', err);
      
      if (err.response?.status === 404) {
        console.log('Cycle config not found - user may need to set it up');
        setError(null);
        setCycleConfig(null);
        return;
      }
      
      setError(errorMessage);
      setCycleConfig(null);
    } finally {
      setLoading(false);
    }
  };

  const updateCycleConfig = async (config: UpdateCycleConfigRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response: CycleConfigResponse = await cycleApi.updateCycleConfig(config);
      setCycleConfig(response.config);
      
      // Refresh current cycle data after config update
      await fetchCurrentCycle();
      
      return true;
    } catch (err: any) {
      if (err?.name === 'SessionExpired') {
        console.log('Session expired during cycle config update - user will be redirected to login');
        return false;
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour de la configuration du cycle';
      setError(errorMessage);
      console.error('Error updating cycle config:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getCycleCharacteristics = (cycleDay: number, isPeriodDay: boolean, isOvulationPhase: boolean, isFertileDay: boolean, cycleLength: number = 28): string => {
    if (__DEV__) {
      console.log('CycleContext getCycleCharacteristics called with:', {
        cycleDay,
        isPeriodDay,
        isOvulationPhase,
        isFertileDay,
        cycleLength
      });
    }
    
    if (isPeriodDay) {
      return 'Phase Menstruelle';
    } else if (isOvulationPhase) {
      return 'Phase d\'Ovulation';
    } else if (isFertileDay) {
      return 'Phase Fertile';
    } else if (cycleDay <= 14) {
      return 'Phase Folliculaire';
    } else {
      return 'Phase Lutéale';
    }
  };

  const getCycleEmoji = (cycleDay: number, isPeriodDay: boolean, isOvulationPhase: boolean, isFertileDay: boolean, cycleLength: number = 28): string => {
    if (isPeriodDay) {
      return '🌙';
    } else if (isOvulationPhase) {
      return '🌻';
    } else if (isFertileDay) {
      return '✨';
    } else if (cycleDay <= 14) {
      return '🌱';
    } else {
      return '🍂';
    }
  };

  const getCycleColor = (cycleDay: number, isPeriodDay: boolean, isOvulationPhase: boolean, isFertileDay: boolean, cycleLength: number = 28): string => {
    if (isPeriodDay) {
      return 'bg-phase-menstrual-100';
    } else if (isOvulationPhase) {
      return 'bg-phase-ovulation-100';
    } else if (isFertileDay) {
      return 'bg-phase-follicular-100';
    } else if (cycleDay <= 14) {
      return 'bg-phase-follicular-100';
    } else {
      return 'bg-phase-luteal-100';
    }
  };

  const getPhaseApiKey = (): string | undefined => {
    if (!currentCycle) return undefined;
    if (currentCycle.isPeriodDay) return 'menstrual';
    if (currentCycle.isOvulationPhase) return 'ovulation'; 
    if (currentCycle.isFertileDay) return 'fertile';
    return currentCycle.cycleDay <= 14 ? 'follicular' : 'luteal';
  };

  // Global refresh function that updates data across all components with debouncing
  const refreshCycle = async () => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime;
    
    // Prevent multiple calls within 2 seconds
    if (timeSinceLastFetch < 2000) {
      if (__DEV__) {
        console.log('CycleContext: Refresh throttled - too soon since last fetch');
      }
      return;
    }
    
    if (loading) {
      if (__DEV__) {
        console.log('CycleContext: Refresh skipped - already loading');
      }
      return;
    }
    
    if (__DEV__) {
      console.log('CycleContext: Global refresh triggered');
    }
    setLastFetchTime(now);
    await fetchCurrentCycle();
  };

  const refreshConfig = async () => {
    await fetchCycleConfig();
  };

  // Fetch data when user logs in or changes, and clear data when user logs out
  useEffect(() => {
    if (user && user.onboardingCompleted) {
      if (__DEV__) {
        console.log('CycleContext: User logged in, fetching cycle data for:', user.email);
      }
      // Reset throttling when user changes
      setLastFetchTime(0);
      fetchCurrentCycle();
      fetchCycleConfig();
    } else if (!user) {
      // User logged out, clear data
      if (__DEV__) {
        console.log('CycleContext: User logged out, clearing cycle data');
      }
      setCurrentCycle(null);
      setCycleConfig(null);
      setError(null);
    }
  }, [user?.id, user?.onboardingCompleted]);

  // Add debug logging when cycle data changes
  useEffect(() => {
    if (__DEV__ && currentCycle) {
      console.log('CycleContext: Current cycle data updated:', {
        cycleDay: currentCycle.cycleDay,
        cycleLength: currentCycle.cycleLength,
        isPeriodDay: currentCycle.isPeriodDay,
        isOvulationPhase: currentCycle.isOvulationPhase,
        isFertileDay: currentCycle.isFertileDay
      });
    }
  }, [currentCycle]);

  const contextValue: CycleContextData = {
    currentCycle,
    cycleConfig,
    loading,
    error,
    refreshCycle,
    refreshConfig,
    updateCycleConfig,
    getCycleCharacteristics,
    getCycleEmoji,
    getCycleColor,
    getPhaseApiKey,
  };

  return (
    <CycleContext.Provider value={contextValue}>
      {children}
    </CycleContext.Provider>
  );
};

export const useCycleContext = () => {
  const context = useContext(CycleContext);
  if (context === undefined) {
    throw new Error('useCycleContext must be used within a CycleProvider');
  }
  return context;
};