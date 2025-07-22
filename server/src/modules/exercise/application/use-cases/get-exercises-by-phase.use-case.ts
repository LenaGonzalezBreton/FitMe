import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import {
  IExerciseRepository,
  IPhaseExerciseRepository,
  ExerciseFilters,
} from '../../domain/exercise.repository';
import { Intensity, MuscleZone } from '../../domain/exercise.entity';
import { CyclePhase } from '../../../cycle/domain/cycle.entity';
import {
  EXERCISE_REPOSITORY_TOKEN,
  PHASE_EXERCISE_REPOSITORY_TOKEN,
} from '../../tokens';

export interface GetExercisesByPhaseRequest {
  phase: CyclePhase | string;
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
  durationMinutes?: number;
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
    phase: CyclePhase | string;
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
    @Inject(PHASE_EXERCISE_REPOSITORY_TOKEN)
    private readonly phaseExerciseRepository: IPhaseExerciseRepository,
  ) {}

  async execute(
    request: GetExercisesByPhaseRequest,
  ): Promise<GetExercisesByPhaseResponse> {
    const { phase, intensity, muscleZone, maxDuration, limit = 20 } = request;

    // Valider la phase
    if (!this.isValidPhase(phase)) {
      throw new BadRequestException('Phase de cycle invalide');
    }

    // Obtenir les exercices spécifiquement associés à cette phase
    const phaseExercises = await this.phaseExerciseRepository.findByPhaseName(
      phase.toString(),
    );
    const phaseExerciseIds = phaseExercises.map((pe) => pe.exerciseId);

    // Obtenir l'intensité recommandée pour cette phase
    const recommendedIntensity = this.getRecommendedIntensityForPhase(phase);

    // Construire les filtres
    const filters: ExerciseFilters = {
      phaseName: phase.toString(),
      intensity: intensity || recommendedIntensity,
      muscleZone,
      maxDuration,
    };

    // Récupérer les exercices avec filtres
    let exercises = await this.exerciseRepository.findWithFilters(filters);

    // Si pas assez d'exercices spécifiques à la phase, ajouter des exercices généraux
    if (exercises.length < limit) {
      const generalFilters: ExerciseFilters = {
        intensity: intensity || recommendedIntensity,
        muscleZone,
        maxDuration,
      };
      const generalExercises =
        await this.exerciseRepository.findWithFilters(generalFilters);

      // Ajouter les exercices généraux qui ne sont pas déjà dans la liste
      const existingIds = new Set(exercises.map((e) => e.id));
      const additionalExercises = generalExercises.filter(
        (e) => !existingIds.has(e.id),
      );

      exercises = [...exercises, ...additionalExercises];
    }

    // Limiter le nombre d'exercices
    exercises = exercises.slice(0, limit);

    // Mapper les exercices vers la réponse
    const exerciseResponses: ExerciseResponse[] = exercises.map((exercise) => ({
      id: exercise.id,
      title: exercise.title,
      description: exercise.description,
      imageUrl: exercise.imageUrl,
      durationMinutes: exercise.durationMinutes,
      formattedDuration: exercise.getFormattedDuration(),
      intensity: exercise.intensity,
      intensityLabel: this.getIntensityLabel(exercise.intensity),
      muscleZone: exercise.muscleZone,
      muscleZoneLabel: this.getMuscleZoneLabel(exercise.muscleZone),
      isRecommendedForPhase: phaseExerciseIds.includes(exercise.id),
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

  private isValidPhase(phase: CyclePhase | string): boolean {
    const validPhases = Object.values(CyclePhase);
    return validPhases.includes(phase as CyclePhase);
  }

  private getRecommendedIntensityForPhase(
    phase: CyclePhase | string,
  ): Intensity {
    const phaseStr = phase.toString();
    switch (phaseStr) {
      case 'MENSTRUAL':
        return Intensity.LOW;
      case 'FOLLICULAR':
        return Intensity.MODERATE;
      case 'OVULATION':
        return Intensity.HIGH;
      case 'LUTEAL':
        return Intensity.MODERATE;
      default:
        return Intensity.MODERATE;
    }
  }

  private getPhaseLabel(phase: CyclePhase | string): string {
    const phaseStr = phase.toString();
    switch (phaseStr) {
      case 'MENSTRUAL':
        return 'Phase Menstruelle';
      case 'FOLLICULAR':
        return 'Phase Folliculaire';
      case 'OVULATION':
        return "Phase d'Ovulation";
      case 'LUTEAL':
        return 'Phase Lutéale';
      default:
        return 'Phase Inconnue';
    }
  }

  private getPhaseDescription(phase: CyclePhase | string): string {
    const phaseStr = phase.toString();
    switch (phaseStr) {
      case 'MENSTRUAL':
        return 'Période de repos et de récupération. Privilégiez les exercices doux.';
      case 'FOLLICULAR':
        return "Énergie croissante. Moment idéal pour augmenter progressivement l'intensité.";
      case 'OVULATION':
        return "Pic d'énergie. Parfait pour les entraînements intenses et les défis.";
      case 'LUTEAL':
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
}
