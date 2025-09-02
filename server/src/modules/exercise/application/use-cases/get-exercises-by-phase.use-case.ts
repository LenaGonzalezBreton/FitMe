import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import {
  IExerciseRepository,
  ExerciseFilters,
} from '../../domain/exercise.repository';
import { Intensity, MuscleZone } from '../../domain/exercise.entity';
import {
  EXERCISE_REPOSITORY_TOKEN,
} from '../../tokens';

export interface GetExercisesByPhaseRequest {
  phase: string;
  intensity?: Intensity;
  muscleZone?: MuscleZone;
  maxDuration?: number;
  limit?: number;
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
    const { phase, intensity, muscleZone, maxDuration, limit = 20 } = request;

    // Valider la phase
    if (!this.isValidPhase(phase)) {
      throw new BadRequestException('Phase de cycle invalide');
    }

    // Obtenir l'intensité recommandée pour cette phase
    const recommendedIntensity = this.getRecommendedIntensityForPhase(phase);

    // Construire les filtres
    const filters: ExerciseFilters = {
      intensity: intensity || recommendedIntensity,
      muscleZone,
      maxDuration,
    };

    // Récupérer les exercices avec filtres
    let exercises = await this.exerciseRepository.findWithFilters(filters);

    // Limiter le nombre total d'exercices
    exercises = exercises.slice(0, limit);

    // Convertir en format de réponse
    const exerciseResponses: ExerciseResponse[] = exercises.map((exercise) => ({
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
      isRecommendedForPhase: true, // Tous les exercices sont maintenant recommandés pour la phase
    }));

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
