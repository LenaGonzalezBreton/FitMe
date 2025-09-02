import { Injectable, Inject } from '@nestjs/common';
import { GetCurrentCycleUseCase } from '../../../cycle/application/use-cases/get-current-cycle.use-case';
import { GetExercisesByPhaseUseCase } from '../../../exercise/application/use-cases/get-exercises-by-phase.use-case';
import {
  Intensity,
  MuscleZone,
} from '../../../exercise/domain/exercise.entity';
import { IProgramRepository } from '../../domain/program.repository';
import { PROGRAM_REPOSITORY_TOKEN } from '../../tokens';
import { Program, ProgramExercise } from '../../domain/program.entity';

export interface GenerateProgramRequest {
  userId: string;
  duration?: number; // Durée de séance souhaitée en minutes (défaut: 30)
  focusZone?: MuscleZone; // Zone musculaire à privilégier
  sessionType?: 'cardio' | 'strength' | 'flexibility' | 'mixed'; // Type de séance
}

export interface GenerateProgramResponse {
  program: {
    id: string;
    title: string;
    description: string;
    totalDuration: number;
    formattedTotalDuration: string;
    exercises: Array<{
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
      order: number;
      restTime?: number;
    }>;
    phaseRecommendations: string[];
    tips: string[];
  };
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
  duration?: number;
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
    private readonly getCurrentCycleUseCase: GetCurrentCycleUseCase,
    private readonly getExercisesByPhaseUseCase: GetExercisesByPhaseUseCase,
    @Inject(PROGRAM_REPOSITORY_TOKEN)
    private readonly programRepository: IProgramRepository,
  ) {}

  async execute(
    request: GenerateProgramRequest,
  ): Promise<GenerateProgramResponse> {
    const { userId, duration = 30, focusZone, sessionType = 'mixed' } = request;

    // 1. Récupérer le cycle actuel de l'utilisatrice
    const currentCycle = await this.getCurrentCycleUseCase.execute({ 
      userId,
      date: new Date(),
    });

    // 2. Déterminer la phase basée sur les caractéristiques du cycle
    const currentPhase = this.mapCycleToPhase(currentCycle);

    // 3. Déterminer les paramètres optimaux pour cette phase
    const phaseConfig = this.getPhaseConfiguration(
      currentPhase.phase,
      sessionType,
    );

    // 4. Récupérer les exercices adaptés
    const exercisesResult = await this.getExercisesByPhaseUseCase.execute({
      phase: currentPhase.phase,
      intensity: phaseConfig.intensity,
      muscleZone: focusZone,
      maxDuration: Math.floor(duration / 3), // Exercices individuels pas trop longs
      limit: 15,
    });

    // 5. Sélectionner et organiser les exercices
    const selectedExercises = this.selectAndOrganizeExercises(
      exercisesResult.exercises,
      duration,
      sessionType,
      focusZone,
    );

    // 6. Créer le programme final
    const programData = this.createProgramData(
      selectedExercises,
      
      currentPhase,
      sessionType,
      duration,
      userId,
    );

    // 7. Sauvegarder le programme dans la base de données
    const savedProgram = await this.programRepository.create(programData);

    // 8. Générer les adaptations et conseils
    const adaptations = this.generateAdaptations(currentPhase.phase);

    return {
      program: {
        id: savedProgram.id!,
        title: savedProgram.title,
        description: savedProgram.goal || '',
        totalDuration: duration,
        formattedTotalDuration: this.formatDuration(duration),
        exercises: selectedExercises,
        phaseRecommendations: currentPhase.recommendations,
        tips: this.generateTips(currentPhase.phase),
      },
      userPhase: {
        phase: currentPhase.phase,
        phaseLabel: currentPhase.phaseDescription,
        cycleDay: currentPhase.cycleDay,
        recommendations: currentPhase.recommendations,
      },
      adaptations,
    };
  }

  private mapCycleToPhase(cycleData: any): CurrentPhaseData {
    let phase = 'follicular';
    
    if (cycleData.isPeriodDay) {
      phase = 'menstrual';
    } else if (cycleData.isOvulationPhase) {
      phase = 'ovulation';
    } else if (cycleData.cycleDay > 14) {
      phase = 'luteal';
    }

    return {
      phase,
      phaseDescription: cycleData.cycleDescription,
      cycleDay: cycleData.cycleDay,
      recommendations: cycleData.recommendations,
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
  ): Array<{
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
    order: number;
    restTime?: number;
  }> {
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
    const finalExercises: Array<{
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
      order: number;
      restTime?: number;
    }> = [];
    let currentDuration = 0;
    let order = 1;

    for (const exercise of selectedExercises) {
      const exerciseDuration = exercise.duration || 10;
      const restTime = this.calculateRestTime(exercise.intensity, sessionType);

      if (currentDuration + exerciseDuration <= targetDuration) {
        finalExercises.push({
          ...exercise,
          order,
          restTime,
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

  private createProgramData(
    exercises: Array<{
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
      order: number;
      restTime?: number;
    }>,
    currentPhase: CurrentPhaseData,
    sessionType: string,
    duration: number,
    userId: string,
  ) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const programExercises = exercises.map((exercise, index) => 
      ProgramExercise.create({
        exerciseId: exercise.id!,
        order: index + 1,
        sets: 3,
        reps: '10-12',
        duration: exercise.duration!,
        restTime: exercise.restTime!,
        notes: `Exercice adapté à la phase ${currentPhase.phase}`,
      })
    );

    return Program.create({
      title: this.generateProgramTitle(currentPhase.phase, sessionType, duration),
      goal: this.generateProgramDescription(currentPhase.phase),
      startDate,
      endDate,
      isActive: false,
      isTemplate: false,
      userId,
      exercises: programExercises,
    });
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
