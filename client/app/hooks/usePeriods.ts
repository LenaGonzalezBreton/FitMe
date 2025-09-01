import { useState, useEffect } from 'react';
import { cycleApi } from '../services/api';
import { Period, LogPeriodRequest, LogPeriodResponse, PeriodsHistoryResponse } from '../types';

export interface UsePeriodsReturn {
  periods: any[];
  loading: boolean;
  error: string | null;
  logPeriod: (periodData: LogPeriodRequest) => Promise<boolean>;
  refreshPeriods: () => Promise<void>;
  getPeriodsForMonth: (year: number, month: number) => any[];
}

export const usePeriods = (): UsePeriodsReturn => {
  const [periods, setPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      setError(null);

      const response: PeriodsHistoryResponse = await cycleApi.getPeriodsHistory({
        limit: 50, // Get last 50 periods
        offset: 0,
      });

      // Backend returns data directly, not wrapped in success field
      setPeriods(response.periods || []);
    } catch (err: any) {
      // Don't show error alert for session expiration - user will be redirected to login
      if (err?.name === 'SessionExpired') {
        console.log('Session expired during periods fetch - user will be redirected to login');
        setError(null);
        setPeriods([]);
        return;
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement de l\'historique des règles';
      console.error('Error fetching periods:', err);
      
      // If it's a 404, the user probably doesn't have any periods logged yet
      if (err.response?.status === 404) {
        console.log('No periods found - user may not have logged any yet');
        setError(null);
        setPeriods([]);
        return;
      }
      
      setError(errorMessage);
      setPeriods([]);
    } finally {
      setLoading(false);
    }
  };

  const logPeriod = async (periodData: LogPeriodRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response: LogPeriodResponse = await cycleApi.logPeriod(periodData);
      
      // Backend returns data directly, not wrapped in success field
      // The response.message contains the success message
      console.log('Period logged successfully:', response.message);
      
      // Refresh periods list after logging
      await fetchPeriods();
      return true;
    } catch (err: any) {
      // Don't show error alert for session expiration - user will be redirected to login
      if (err?.name === 'SessionExpired') {
        console.log('Session expired during period logging - user will be redirected to login');
        return false;
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de l\'enregistrement des règles';
      setError(errorMessage);
      console.error('Error logging period:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getPeriodsForMonth = (year: number, month: number): any[] => {
    return periods.filter(period => {
      const periodDate = new Date(period.startDate);
      return periodDate.getFullYear() === year && periodDate.getMonth() === month;
    });
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  return {
    periods,
    loading,
    error,
    logPeriod,
    refreshPeriods: fetchPeriods,
    getPeriodsForMonth,
  };
};
