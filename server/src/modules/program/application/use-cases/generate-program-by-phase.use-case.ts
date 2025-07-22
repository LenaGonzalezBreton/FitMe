import { Injectable } from '@nestjs/common';
import { GetCurrentPhaseUseCase } from '../../../cycle/application/use-cases/get-current-phase.use-case';
import { GetExercisesByPhaseUseCase } from '../../../exercise/application/use-cases/get-exercises-by-phase.use-case';
import {
  Intensity,
  MuscleZone,
} from '../../../exercise/domain/exercise.entity';

export interface GenerateProgramRequest {
  userId: string;
  duration?: number; // Durée de séance souhaitée en minutes (défaut: 30)
  focusZone?: MuscleZone; // Zone musculaire à privilégier
  sessionType?: 'cardio' | 'strength' | 'flexibility' | 'mixed'; // Type de séance
}

export interface ProgramExercise {
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
  order: number;
  restTimeSeconds?: number;
}

export interface GeneratedProgram {
  id: string;
  title: string;
  description: string;
  totalDuration: number;
  formattedTotalDuration: string;
  exercises: ProgramExercise[];
  phaseRecommendations: string[];
  tips: string[];
}

export interface GenerateProgramResponse {
  program: GeneratedProgram;
  userPhase: {
    phase: string;
    phaseLabel: string;
    cycleDay: number;
    recommendations: string[];
  };
  adaptations: string[];
}

interface PhaseConfiguration {
  intensity: Intensity;
  preferredZones: MuscleZone[];
  restMultiplier: number;
}

interface PhaseConfigMap {
  [key: string]: PhaseConfiguration;
}

interface ExerciseData {
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

interface CurrentPhaseData {
  phase: string;
  phaseDescription: string;
  cycleDay: number;
  recommendations: string[];
}

@Injectable()
export class GenerateProgramByPhaseUseCase {
  constructor(
    private readonly getCurrentPhaseUseCase: GetCurrentPhaseUseCase,
    private readonly getExercisesByPhaseUseCase: GetExercisesByPhaseUseCase,
  ) {}

  async execute(
    request: GenerateProgramRequest,
  ): Promise<GenerateProgramResponse> {
    const { userId, duration = 30, focusZone, sessionType = 'mixed' } = request;

    // 1. Récupérer la phase actuelle de l'utilisatrice
    const currentPhase = await this.getCurrentPhaseUseCase.execute({ userId });

    // 2. Déterminer les paramètres optimaux pour cette phase
    const phaseConfig = this.getPhaseConfiguration(
      currentPhase.phase,
      sessionType,
    );

    // 3. Récupérer les exercices adaptés
    const exercisesResult = await this.getExercisesByPhaseUseCase.execute({
      phase: currentPhase.phase,
      intensity: phaseConfig.intensity,
      muscleZone: focusZone,
      maxDuration: Math.floor(duration / 3), // Exercices individuels pas trop longs
      limit: 15,
    });

    // 4. Sélectionner et organiser les exercices
    const selectedExercises = this.selectAndOrganizeExercises(
      exercisesResult.exercises,
      duration,
      sessionType,
      focusZone,
    );

    // 5. Créer le programme final
    const program = this.createProgram(
      selectedExercises,
      currentPhase,
      sessionType,
      duration,
    );

    // 6. Générer les adaptations et conseils
    const adaptations = this.generateAdaptations(currentPhase.phase);

    return {
      program,
      userPhase: {
        phase: currentPhase.phase,
        phaseLabel: currentPhase.phaseDescription,
        cycleDay: currentPhase.cycleDay,
        recommendations: currentPhase.recommendations,
      },
      adaptations,
    };
  }

  private getPhaseConfiguration(
    phase: string,
    sessionType: string,
  ): PhaseConfiguration {
    const configs: PhaseConfigMap = {
      MENSTRUAL: {
        intensity:
          sessionType === 'strength' ? Intensity.LOW : Intensity.VERY_LOW,
        preferredZones: [MuscleZone.FLEXIBILITY, MuscleZone.CORE],
        restMultiplier: 1.5,
      },
      FOLLICULAR: {
        intensity:
          sessionType === 'cardio' ? Intensity.MODERATE : Intensity.LOW,
        preferredZones: [MuscleZone.LOWER_BODY, MuscleZone.CORE],
        restMultiplier: 1.2,
      },
      OVULATION: {
        intensity:
          sessionType === 'flexibility' ? Intensity.MODERATE : Intensity.HIGH,
        preferredZones: [MuscleZone.FULL_BODY, MuscleZone.UPPER_BODY],
        restMultiplier: 1.0,
      },
      LUTEAL: {
        intensity: Intensity.MODERATE,
        preferredZones: [MuscleZone.UPPER_BODY, MuscleZone.BALANCE],
        restMultiplier: 1.3,
      },
    };

    return configs[phase] || configs.FOLLICULAR;
  }

  private selectAndOrganizeExercises(
    exercises: ExerciseData[],
    targetDuration: number,
    sessionType: string,
    focusZone?: MuscleZone,
  ): ProgramExercise[] {
    let selectedExercises = [...exercises];

    // Filtrer par type de séance si spécifié
    if (sessionType !== 'mixed') {
      selectedExercises = this.filterBySessionType(
        selectedExercises,
        sessionType,
      );
    }

    // Prioriser la zone ciblée si spécifiée
    if (focusZone) {
      selectedExercises = this.prioritizeByZone(selectedExercises, focusZone);
    }

    // Sélectionner les exercices pour remplir la durée cible
    const finalExercises: ProgramExercise[] = [];
    let currentDuration = 0;
    let order = 1;

    for (const exercise of selectedExercises) {
      const exerciseDuration = exercise.durationMinutes || 10;
      const restTime = this.calculateRestTime(exercise.intensity, sessionType);

      if (currentDuration + exerciseDuration <= targetDuration) {
        finalExercises.push({
          ...exercise,
          order,
          restTimeSeconds: restTime,
        });
        currentDuration += exerciseDuration;
        order++;
      }

      if (currentDuration >= targetDuration * 0.9) break; // 90% de la durée cible
    }

    return finalExercises;
  }

  private filterBySessionType(
    exercises: ExerciseData[],
    sessionType: string,
  ): ExerciseData[] {
    switch (sessionType) {
      case 'cardio':
        return exercises.filter(
          (e) =>
            e.muscleZone === MuscleZone.CARDIO ||
            e.intensity === Intensity.HIGH ||
            e.intensity === Intensity.VERY_HIGH,
        );
      case 'strength':
        return exercises.filter(
          (e) =>
            e.muscleZone === MuscleZone.UPPER_BODY ||
            e.muscleZone === MuscleZone.LOWER_BODY ||
            e.muscleZone === MuscleZone.CORE ||
            e.muscleZone === MuscleZone.FULL_BODY,
        );
      case 'flexibility':
        return exercises.filter(
          (e) =>
            e.muscleZone === MuscleZone.FLEXIBILITY ||
            e.intensity === Intensity.LOW ||
            e.intensity === Intensity.VERY_LOW,
        );
      default:
        return exercises;
    }
  }

  private prioritizeByZone(
    exercises: ExerciseData[],
    focusZone: MuscleZone,
  ): ExerciseData[] {
    const prioritized = exercises.filter((e) => e.muscleZone === focusZone);
    const others = exercises.filter((e) => e.muscleZone !== focusZone);
    return [...prioritized, ...others];
  }

  private calculateRestTime(
    intensity?: Intensity,
    sessionType?: string,
  ): number {
    const baseRest: Record<Intensity, number> = {
      [Intensity.VERY_LOW]: 30,
      [Intensity.LOW]: 45,
      [Intensity.MODERATE]: 60,
      [Intensity.HIGH]: 90,
      [Intensity.VERY_HIGH]: 120,
    };

    const rest = baseRest[intensity || Intensity.MODERATE];

    // Ajuster selon le type de séance
    if (sessionType === 'cardio') return Math.floor(rest * 0.7);
    if (sessionType === 'strength') return Math.floor(rest * 1.3);
    if (sessionType === 'flexibility') return Math.floor(rest * 0.5);

    return rest;
  }

  private createProgram(
    exercises: ProgramExercise[],
    currentPhase: CurrentPhaseData,
    sessionType: string,
    targetDuration: number,
  ): GeneratedProgram {
    const totalDuration = exercises.reduce(
      (sum, ex) => sum + (ex.durationMinutes || 10),
      0,
    );

    const programId = `prog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const title = this.generateProgramTitle(
      currentPhase.phase,
      sessionType,
      targetDuration,
    );
    const description = this.generateProgramDescription(currentPhase.phase);

    return {
      id: programId,
      title,
      description,
      totalDuration,
      formattedTotalDuration: this.formatDuration(totalDuration),
      exercises,
      phaseRecommendations: currentPhase.recommendations,
      tips: this.generateTips(currentPhase.phase),
    };
  }

  private generateProgramTitle(
    phase: string,
    sessionType: string,
    duration: number,
  ): string {
    const phaseNames: Record<string, string> = {
      MENSTRUAL: 'Récupération',
      FOLLICULAR: 'Énergie Croissante',
      OVULATION: 'Haute Performance',
      LUTEAL: 'Force & Endurance',
    };

    const sessionNames: Record<string, string> = {
      cardio: 'Cardio',
      strength: 'Renforcement',
      flexibility: 'Souplesse',
      mixed: 'Complet',
    };

    return `${phaseNames[phase] || 'Équilibré'} - ${sessionNames[sessionType] || 'Complet'} ${duration}min`;
  }

  private generateProgramDescription(phase: string): string {
    const descriptions: Record<string, string> = {
      MENSTRUAL:
        'Programme doux adapté à votre période de récupération. Focus sur la relaxation et les mouvements apaisants.',
      FOLLICULAR:
        "Programme progressif pour accompagner votre regain d'énergie. Idéal pour reprendre en douceur.",
      OVULATION:
        "Programme intensif pour profiter de votre pic d'énergie. C'est le moment des défis !",
      LUTEAL:
        "Programme équilibré pour maintenir votre force. Focus sur la stabilité et l'endurance.",
    };

    return (
      descriptions[phase] || 'Programme équilibré adapté à vos besoins actuels.'
    );
  }

  private generateTips(phase: string): string[] {
    const baseTips = [
      "Écoutez votre corps et adaptez l'intensité si nécessaire",
      'Restez bien hydratée pendant toute la séance',
      "N'hésitez pas à faire des pauses supplémentaires si besoin",
    ];

    const phaseTips: Record<string, string[]> = {
      MENSTRUAL: [
        'Privilégiez les mouvements fluides et la respiration profonde',
        'Évitez les positions inversées si elles vous dérangent',
      ],
      FOLLICULAR: [
        "C'est le moment idéal pour apprendre de nouveaux mouvements",
        "Augmentez progressivement l'intensité jour après jour",
      ],
      OVULATION: [
        'Profitez de votre énergie pour vous surpasser',
        "C'est le moment parfait pour battre vos records personnels",
      ],
      LUTEAL: [
        'Concentrez-vous sur la technique et la précision',
        'Les exercices de stabilité sont particulièrement bénéfiques',
      ],
    };

    return [...baseTips, ...(phaseTips[phase] || [])];
  }

  private generateAdaptations(phase: string): string[] {
    const adaptations: Record<string, string[]> = {
      MENSTRUAL: [
        'Intensité réduite de 30-40% par rapport à votre niveau habituel',
        'Focus sur la récupération et la mobilité',
        "Écoutez votre corps et arrêtez si vous ressentez de l'inconfort",
      ],
      FOLLICULAR: [
        "Augmentation progressive de l'intensité recommandée",
        'Bon moment pour essayer de nouveaux exercices',
        'Récupération généralement plus rapide',
      ],
      OVULATION: [
        'Intensité maximale recommandée',
        'Idéal pour les entraînements HIIT et les charges lourdes',
        'Profitez de votre pic de performance',
      ],
      LUTEAL: [
        'Intensité modérée avec focus sur la technique',
        "Exercices de stabilité et d'équilibre privilégiés",
        'Temps de récupération légèrement allongé',
      ],
    };

    return adaptations[phase] || [];
  }

  private formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
    }
    return `${mins}min`;
  }
}
