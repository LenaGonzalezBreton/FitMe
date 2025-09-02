import { useState, useEffect } from 'react';
import { cycleApi } from '../services/api';
import { CurrentCycleData, CurrentCycleResponse, CycleConfig, CycleConfigResponse, UpdateCycleConfigRequest } from '../types';

export interface UseCycleReturn {
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
}

export const useCycle = (): UseCycleReturn => {
  const [currentCycle, setCurrentCycle] = useState<CurrentCycleData | null>(null);
  const [cycleConfig, setCycleConfig] = useState<CycleConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentCycle = async () => {
    try {
      setLoading(true);
      setError(null);

      const response: CurrentCycleResponse = await cycleApi.getCurrentCycle();
      
      if (response.success) {
        setCurrentCycle(response.data);
      } else {
        throw new Error('Réponse invalide du serveur');
      }
    } catch (err: any) {
      // Don't show error alert for session expiration - user will be redirected to login
      if (err?.name === 'SessionExpired') {
        console.log('Session expired during cycle fetch - user will be redirected to login');
        setError(null); // Clear any previous errors
        setCurrentCycle(null);
        return;
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des informations du cycle';
      console.error('Error fetching current cycle:', err);
      
      // If it's a 400 or 404, the user probably doesn't have cycle tracking enabled
      if (err.response?.status === 400 || err.response?.status === 404) {
        console.log('Cycle tracking not enabled or no cycle data found');
        setError(null); // Don't show error for this normal case
        
        // Check if user is menopausal - if so, don't set any cycle data
        // This will be handled by the components that use this hook
        setCurrentCycle(null);
        return; // Don't treat as an error
      }
      
      // For other errors, set the error message
      setError(errorMessage);
      setCurrentCycle(null);
    } finally {
      setLoading(false);
    }
  };

  const getCycleCharacteristics = (cycleDay: number, isPeriodDay: boolean, isOvulationPhase: boolean, isFertileDay: boolean, cycleLength: number = 28): string => {
    const midPoint = Math.ceil(cycleLength / 2);
    if (isPeriodDay) {
      return 'Phase Menstruelle';
    } else if (isOvulationPhase) {
      return 'Phase d\'Ovulation';
    } else if (isFertileDay) {
      return 'Phase Fertile';
    } else if (cycleDay <= midPoint) {
      return 'Phase Folliculaire';
    } else {
      return 'Phase Lutéale';
    }
  };

  const getCycleEmoji = (cycleDay: number, isPeriodDay: boolean, isOvulationPhase: boolean, isFertileDay: boolean, cycleLength: number = 28): string => {
    const midPoint = Math.ceil(cycleLength / 2);
    if (isPeriodDay) {
      return '🌙';
    } else if (isOvulationPhase) {
      return '🌻';
    } else if (isFertileDay) {
      return '✨';
    } else if (cycleDay <= midPoint) {
      return '🌱';
    } else {
      return '🍂';
    }
  };

  const getCycleColor = (cycleDay: number, isPeriodDay: boolean, isOvulationPhase: boolean, isFertileDay: boolean, cycleLength: number = 28): string => {
    const midPoint = Math.ceil(cycleLength / 2);
    if (isPeriodDay) {
      return 'bg-phase-menstrual-100';
    } else if (isOvulationPhase) {
      return 'bg-phase-ovulation-100';
    } else if (isFertileDay) {
      return 'bg-phase-follicular-100';
    } else if (cycleDay <= midPoint) {
      return 'bg-phase-follicular-100';
    } else {
      return 'bg-phase-luteal-100';
    }
  };

  const fetchCycleConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      const response: CycleConfigResponse = await cycleApi.getCycleConfig();
      setCycleConfig(response.config);
    } catch (err: any) {
      // Don't show error alert for session expiration - user will be redirected to login
      if (err?.name === 'SessionExpired') {
        console.log('Session expired during cycle config fetch - user will be redirected to login');
        setError(null);
        setCycleConfig(null);
        return;
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement de la configuration du cycle';
      console.error('Error fetching cycle config:', err);
      
      // If it's a 404, the user probably doesn't have cycle config yet
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
      // Don't show error alert for session expiration - user will be redirected to login
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

  useEffect(() => {
    fetchCurrentCycle();
    fetchCycleConfig();
  }, []);

  return {
    currentCycle,
    cycleConfig,
    loading,
    error,
    refreshCycle: fetchCurrentCycle,
    refreshConfig: fetchCycleConfig,
    updateCycleConfig,
    getCycleCharacteristics,
    getCycleEmoji,
    getCycleColor,
  };
};
