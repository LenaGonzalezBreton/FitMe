import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { programApi } from '../services/api';
import { Program, ProgramListResponse, GeneratedProgramResponse } from '../types';

export interface UseProgramsOptions {
  isActive?: boolean;
  isTemplate?: boolean;
  autoFetch?: boolean;
}

export interface UseProgramsReturn {
  programs: Program[];
  activeProgram: Program | null;
  loading: boolean;
  error: string | null;
  total: number;
  refreshPrograms: () => Promise<void>;
  loadMorePrograms: () => Promise<void>;
  hasMorePrograms: boolean;
  generateProgram: (params?: {
    duration?: number;
    focusZone?: string;
    sessionType?: 'cardio' | 'strength' | 'flexibility' | 'mixed';
    phase?: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
    trainingType?: string;
    randomSeed?: number;
  }) => Promise<GeneratedProgramResponse | null>;
  generatePresetProgram: (params: {
    programType: 'cardio' | 'strength' | 'flexibility' | 'mixed';
    duration?: number;
    focusZone?: 'UPPER_BODY' | 'LOWER_BODY' | 'CORE' | 'FULL_BODY' | 'CARDIO' | 'FLEXIBILITY' | 'BALANCE';
    title?: string;
    goal?: string;
  }) => Promise<GeneratedProgramResponse | null>;
  startProgram: (programId: string) => Promise<boolean>;
  deleteProgram: (programId: string) => Promise<boolean>;
}

export const usePrograms = (options: UseProgramsOptions = {}): UseProgramsReturn => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [activeProgram, setActiveProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [programOffset, setProgramOffset] = useState(0);
  const [programLimit] = useState(10);
  const [hasMorePrograms, setHasMorePrograms] = useState(true);

  const { isActive, isTemplate, autoFetch = true } = options;

  const fetchPrograms = async (opts?: { append?: boolean; reset?: boolean }) => {
    try {
      setLoading(true);
      setError(null);

      const response: ProgramListResponse = await programApi.getUserPrograms({
        isActive,
        isTemplate,
        limit: programLimit,
        offset: programOffset,
      });

      setHasMorePrograms(response.programs.length === programLimit);
      if (opts?.append) {
        setPrograms(prev => [...prev, ...response.programs]);
      } else {
        setPrograms(response.programs);
      }
      setTotal(response.total);

      // Find active program
      const active = response.programs.find(program => program.isActive);
      setActiveProgram(active || null);

    } catch (err: any) {
      // Don't show error alert for session expiration - user will be redirected to login
      if (err?.name === 'SessionExpired') {
        console.log('Session expired during programs fetch - user will be redirected to login');
        setError(null); // Clear any previous errors
        setPrograms([]);
        setTotal(0);
        setActiveProgram(null);
        setHasMorePrograms(false);
        return;
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des programmes';
      setError(errorMessage);
      console.error('Error fetching programs:', err);
      
      // If it's an auth error, provide more context
      if (err.response?.status === 401) {
        setError('Problème d\'authentification. Veuillez vous reconnecter.');
      } else if (err.response?.status === 500) {
        setError('Erreur serveur. Les services pourraient être temporairement indisponibles.');
        // Pour un utilisateur sans programmes, on peut ignorer l'erreur 500 et afficher un état vide
        setPrograms([]);
        setTotal(0);
        setActiveProgram(null);
        setHasMorePrograms(false);
      } else if (err.response?.status === 404) {
        // Pas de programmes trouvés - c'est normal pour un nouvel utilisateur
        setError(null);
        setPrograms([]);
        setTotal(0);
        setActiveProgram(null);
        setHasMorePrograms(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateProgram = async (params?: {
    duration?: number;
    focusZone?: string;
    sessionType?: 'cardio' | 'strength' | 'flexibility' | 'mixed';
  }): Promise<GeneratedProgramResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const response: GeneratedProgramResponse = await programApi.generateProgram(params);
      
      console.log('[usePrograms] Raw API response:', response);
      console.log('[usePrograms] Response data:', response.data);
      console.log('[usePrograms] Program in response:', response.data?.program);
      console.log('[usePrograms] Exercises in program:', response.data?.program?.exercises);
      
      // Refresh programs list after generating
      // reset and refetch after generation
      setProgramOffset(0);
      await fetchPrograms({ reset: true });
      
      return response;
    } catch (err: any) {
      // Don't show error alert for session expiration - user will be redirected to login
      if (err?.name === 'SessionExpired') {
        console.log('Session expired during program generation - user will be redirected to login');
        return null;
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la génération du programme';
      setError(errorMessage);
      Alert.alert('Erreur', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generatePresetProgram = async (params: {
    programType: 'cardio' | 'strength' | 'flexibility' | 'mixed';
    duration?: number;
    focusZone?: 'UPPER_BODY' | 'LOWER_BODY' | 'CORE' | 'FULL_BODY' | 'CARDIO' | 'FLEXIBILITY' | 'BALANCE';
    title?: string;
    goal?: string;
  }): Promise<GeneratedProgramResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log('[usePrograms] Generating preset program with params:', params);

      const response: GeneratedProgramResponse = await programApi.generatePresetProgram(params);
      
      console.log('[usePrograms] Preset program generated successfully:', response);
      console.log('[usePrograms] Program exercises:', response.data?.program?.exercises);

      // Refresh programs list after generating
      setProgramOffset(0);
      await fetchPrograms({ reset: true });
      
      return response;
    } catch (err: any) {
      // Don't show error alert for session expiration - user will be redirected to login
      if (err?.name === 'SessionExpired') {
        console.log('Session expired during preset program generation - user will be redirected to login');
        return null;
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la génération du programme préconfiguré';
      setError(errorMessage);
      Alert.alert('Erreur', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const startProgram = async (programId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await programApi.startProgram(programId);
      
      // Refresh programs list to update active status
      setProgramOffset(0);
      await fetchPrograms({ reset: true });
      
      Alert.alert('Succès', 'Programme démarré avec succès !');
      return true;
    } catch (err: any) {
      // Don't show error alert for session expiration - user will be redirected to login
      if (err?.name === 'SessionExpired') {
        console.log('Session expired during program start - user will be redirected to login');
        return false;
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du démarrage du programme';
      setError(errorMessage);
      Alert.alert('Erreur', errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteProgram = async (programId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await programApi.deleteProgram(programId);
      
      // Refresh programs list
      setProgramOffset(0);
      await fetchPrograms({ reset: true });
      
      Alert.alert('Succès', 'Programme supprimé avec succès !');
      return true;
    } catch (err: any) {
      // Don't show error alert for session expiration - user will be redirected to login
      if (err?.name === 'SessionExpired') {
        console.log('Session expired during program deletion - user will be redirected to login');
        return false;
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la suppression du programme';
      setError(errorMessage);
      Alert.alert('Erreur', errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      setProgramOffset(0);
      fetchPrograms({ reset: true });
    }
  }, [isActive, isTemplate, autoFetch]);

  const refreshPrograms = async () => {
    setProgramOffset(0);
    await fetchPrograms({ reset: true });
  };

  const loadMorePrograms = async () => {
    if (!hasMorePrograms || loading) return;
    const nextOffset = programOffset + programLimit;
    setProgramOffset(nextOffset);
    await fetchPrograms({ append: true });
  };

  return {
    programs,
    activeProgram,
    loading,
    error,
    total,
    refreshPrograms,
    loadMorePrograms,
    hasMorePrograms,
    generateProgram,
    generatePresetProgram,
    startProgram,
    deleteProgram,
  };
};
