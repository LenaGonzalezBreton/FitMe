import { useState, useEffect } from 'react';
import { cycleApi } from '../services/api';
import { CurrentPhaseData, CurrentPhaseResponse, CyclePhase } from '../types';

export interface UseCycleReturn {
  currentPhase: CurrentPhaseData | null;
  loading: boolean;
  error: string | null;
  refreshPhase: () => Promise<void>;
  getPhaseLabel: (phase: CyclePhase) => string;
  getPhaseEmoji: (phase: CyclePhase) => string;
  getPhaseColor: (phase: CyclePhase) => string;
}

export const useCycle = (): UseCycleReturn => {
  const [currentPhase, setCurrentPhase] = useState<CurrentPhaseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentPhase = async () => {
    try {
      setLoading(true);
      setError(null);

      const response: CurrentPhaseResponse = await cycleApi.getCurrentPhase();
      
      if (response.success) {
        setCurrentPhase(response.data);
      } else {
        throw new Error('Réponse invalide du serveur');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement de la phase du cycle';
      setError(errorMessage);
      console.error('Error fetching current phase:', err);
      
      // If it's a 404, the user probably doesn't have cycle tracking enabled
      if (err.response?.status === 404) {
        console.log('Cycle tracking not enabled or no cycle data found');
        setError(null); // Ne pas afficher d'erreur pour ce cas normal
        // Définir une phase par défaut pour les nouveaux utilisateurs
        setCurrentPhase({
          phase: 'FOLLICULAR' as any,
          cycleDay: 8,
          cycleLength: 28,
          periodLength: 5,
          daysUntilNextPhase: 6,
          phaseDescription: 'Phase folliculaire - Période idéale pour commencer votre parcours fitness',
          recommendations: [
            'Commencez par des exercices modérés',
            'Établissez une routine d\'entraînement',
            'Enregistrez vos règles pour un suivi personnalisé'
          ]
        });
        return; // Ne pas traiter comme une erreur
      }
      
      // Set a fallback phase if API fails
      setCurrentPhase(null);
    } finally {
      setLoading(false);
    }
  };

  const getPhaseLabel = (phase: CyclePhase): string => {
    switch (phase) {
      case CyclePhase.MENSTRUAL:
        return 'Menstruelle';
      case CyclePhase.FOLLICULAR:
        return 'Folliculaire';
      case CyclePhase.OVULATION:
        return 'Ovulatoire';
      case CyclePhase.LUTEAL:
        return 'Lutéale';
      default:
        return 'Inconnue';
    }
  };

  const getPhaseEmoji = (phase: CyclePhase): string => {
    switch (phase) {
      case CyclePhase.MENSTRUAL:
        return '🌙';
      case CyclePhase.FOLLICULAR:
        return '🌱';
      case CyclePhase.OVULATION:
        return '🌻';
      case CyclePhase.LUTEAL:
        return '🍂';
      default:
        return '💪';
    }
  };

  const getPhaseColor = (phase: CyclePhase): string => {
    switch (phase) {
      case CyclePhase.MENSTRUAL:
        return 'bg-phase-menstrual-100';
      case CyclePhase.FOLLICULAR:
        return 'bg-phase-follicular-100';
      case CyclePhase.OVULATION:
        return 'bg-phase-ovulation-100';
      case CyclePhase.LUTEAL:
        return 'bg-phase-luteal-100';
      default:
        return 'bg-primary-100';
    }
  };

  useEffect(() => {
    fetchCurrentPhase();
  }, []);

  return {
    currentPhase,
    loading,
    error,
    refreshPhase: fetchCurrentPhase,
    getPhaseLabel,
    getPhaseEmoji,
    getPhaseColor,
  };
};
