import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import {
  IExerciseRepository,
  ExerciseFilters,
} from '../../domain/exercise.repository';
import { Exercise, Intensity, MuscleZone } from '../../domain/exercise.entity';
import {
  EXERCISE_REPOSITORY_TOKEN,
} from '../../tokens';

export interface GetExercisesByPhaseRequest {
  userId?: string;
  phase: string;
  intensity?: Intensity;
  muscleZone?: MuscleZone;
  maxDuration?: number;
  limit?: number;
  offset?: number;
}

export interface ExerciseResponse {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  duration?: number;
  formattedDuration: string;
  intensity?: Intensity;
  intensityLabel: string;
  muscleZone?: MuscleZone;
  muscleZoneLabel: string;
  isRecommendedForPhase: boolean;
}

export interface GetExercisesByPhaseResponse {
  exercises: ExerciseResponse[];
  phaseInfo: {
    phase: string;
    phaseLabel: string;
    recommendedIntensity: Intensity;
    description: string;
  };
  totalCount: number;
}

@Injectable()
export class GetExercisesByPhaseUseCase {
  constructor(
    @Inject(EXERCISE_REPOSITORY_TOKEN)
    private readonly exerciseRepository: IExerciseRepository,
  ) {}

  async execute(
    request: GetExercisesByPhaseRequest,
  ): Promise<GetExercisesByPhaseResponse> {
    const { userId, phase, intensity, muscleZone, maxDuration, limit = 20, offset = 0 } = request;

    // Valider la phase
    if (!this.isValidPhase(phase)) {
      throw new BadRequestException('Phase de cycle invalide');
    }

    // Obtenir l'intensité recommandée pour cette phase
    const recommendedIntensity = this.getRecommendedIntensityForPhase(phase);

    // Récupérer les exercices publics avec intensité recommandée
    const publicExerciseFilters: ExerciseFilters = {
      intensity: intensity || recommendedIntensity,
      muscleZone,
      maxDuration,
    };
    const publicExercises = await this.exerciseRepository.findWithFilters(publicExerciseFilters);

    // Récupérer tous les exercices de l'utilisateur (sans filtre d'intensité)
    let userExercises: Exercise[] = [];
    if (userId) {
      const userExerciseFilters: ExerciseFilters = {
        userId,
        muscleZone,
        maxDuration,
      };
      const allUserExercises = await this.exerciseRepository.findWithFilters(userExerciseFilters);
      // Ne garder que les exercices créés par l'utilisateur (pas les publics)
      userExercises = allUserExercises.filter(ex => ex.createdBy === userId);
    }

    // Combiner les exercices (éviter les doublons si l'utilisateur a des exercices publics)
    const combinedExercises = [...publicExercises, ...userExercises];
    let exercises = combinedExercises.filter((exercise, index, self) => 
      index === self.findIndex(ex => ex.id === exercise.id)
    );

    // Pagination simple en mémoire (repo ne pagine pas encore)
    exercises = exercises.slice(offset, offset + limit);

    // Convertir en format de réponse
    const exerciseResponses: ExerciseResponse[] = exercises.map((exercise) => {
      // Vérifier si l'exercice est recommandé pour cette phase
      const isRecommendedIntensity = exercise.intensity === (intensity || recommendedIntensity);
      const isUserExercise = exercise.createdBy === userId;
      
      return {
        id: exercise.id,
        title: exercise.title,
        description: exercise.description,
        imageUrl: exercise.imageUrl,
        duration: exercise.duration,
        formattedDuration: this.formatDuration(exercise.duration),
        intensity: exercise.intensity,
        intensityLabel: this.getIntensityLabel(exercise.intensity),
        muscleZone: exercise.muscleZone,
        muscleZoneLabel: this.getMuscleZoneLabel(exercise.muscleZone),
        // Les exercices publics sont toujours recommandés (pré-filtrés par intensité)
        // Les exercices utilisateur sont recommandés seulement si l'intensité correspond
        isRecommendedForPhase: !isUserExercise || isRecommendedIntensity,
      };
    });

    return {
      exercises: exerciseResponses,
      phaseInfo: {
        phase,
        phaseLabel: this.getPhaseLabel(phase),
        recommendedIntensity,
        description: this.getPhaseDescription(phase),
      },
      totalCount: exerciseResponses.length,
    };
  }

  private isValidPhase(phase: string): boolean {
    const validPhases = ['menstrual', 'follicular', 'ovulation', 'luteal'];
    return validPhases.includes(phase.toLowerCase());
  }

  private getRecommendedIntensityForPhase(phase: string): Intensity {
    const phaseStr = phase.toLowerCase();
    switch (phaseStr) {
      case 'menstrual':
        return Intensity.LOW;
      case 'follicular':
        return Intensity.MODERATE;
      case 'ovulation':
        return Intensity.HIGH;
      case 'luteal':
        return Intensity.MODERATE;
      default:
        return Intensity.MODERATE;
    }
  }

  private getPhaseLabel(phase: string): string {
    const phaseStr = phase.toLowerCase();
    switch (phaseStr) {
      case 'menstrual':
        return 'Phase Menstruelle';
      case 'follicular':
        return 'Phase Folliculaire';
      case 'ovulation':
        return "Phase d'Ovulation";
      case 'luteal':
        return 'Phase Lutéale';
      default:
        return 'Phase Inconnue';
    }
  }

  private getPhaseDescription(phase: string): string {
    const phaseStr = phase.toLowerCase();
    switch (phaseStr) {
      case 'menstrual':
        return 'Période de repos et de récupération. Privilégiez les exercices doux.';
      case 'follicular':
        return "Énergie croissante. Moment idéal pour augmenter progressivement l'intensité.";
      case 'ovulation':
        return "Pic d'énergie. Parfait pour les entraînements intenses et les défis.";
      case 'luteal':
        return "Focus sur la force et l'endurance modérée. Maintenez la régularité.";
      default:
        return 'Phase non définie.';
    }
  }

  private getIntensityLabel(intensity?: Intensity): string {
    if (!intensity) return 'Non spécifiée';

    switch (intensity) {
      case Intensity.VERY_LOW:
        return 'Très faible';
      case Intensity.LOW:
        return 'Faible';
      case Intensity.MODERATE:
        return 'Modérée';
      case Intensity.HIGH:
        return 'Élevée';
      case Intensity.VERY_HIGH:
        return 'Très élevée';
      default:
        return 'Non spécifiée';
    }
  }

  private getMuscleZoneLabel(muscleZone?: MuscleZone): string {
    if (!muscleZone) return 'Non spécifiée';

    switch (muscleZone) {
      case MuscleZone.UPPER_BODY:
        return 'Haut du corps';
      case MuscleZone.LOWER_BODY:
        return 'Bas du corps';
      case MuscleZone.CORE:
        return 'Centre/Abdos';
      case MuscleZone.FULL_BODY:
        return 'Corps entier';
      case MuscleZone.CARDIO:
        return 'Cardio';
      case MuscleZone.FLEXIBILITY:
        return 'Flexibilité';
      case MuscleZone.BALANCE:
        return 'Équilibre';
      default:
        return 'Non spécifiée';
    }
  }

  private formatDuration(minutes?: number): string {
    if (!minutes) return 'Non spécifiée';

    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h${remainingMinutes}min`;
  }
}
