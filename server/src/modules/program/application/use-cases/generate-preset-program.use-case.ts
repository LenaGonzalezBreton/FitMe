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

export interface GeneratePresetProgramRequest {
  userId: string;
  programType: 'strength' | 'cardio' | 'flexibility' | 'mixed';
  duration?: number; // Durée de séance souhaitée en minutes (défaut: 30)
  focusZone?: MuscleZone; // Zone musculaire à privilégier
  title?: string; // Titre personnalisé
  goal?: string; // Objectif personnalisé
}

export interface GeneratePresetProgramResponse {
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
      sets?: number;
      reps?: string;
      restTime?: number;
      isUserExercise: boolean;
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

@Injectable()
export class GeneratePresetProgramUseCase {
  constructor(
    private readonly getCurrentCycleUseCase: GetCurrentCycleUseCase,
    private readonly getExercisesByPhaseUseCase: GetExercisesByPhaseUseCase,
    @Inject(PROGRAM_REPOSITORY_TOKEN)
    private readonly programRepository: IProgramRepository,
  ) {}

  async execute(
    request: GeneratePresetProgramRequest,
  ): Promise<GeneratePresetProgramResponse> {
    const { userId, programType, duration = 30, focusZone, title, goal } = request;

    console.log(`[GeneratePresetProgram] Starting generation for user ${userId}:`, {
      programType,
      duration,
      focusZone,
      title,
      goal
    });

    // 1. Récupérer le cycle actuel de l'utilisatrice
    const currentCycle = await this.getCurrentCycleUseCase.execute({ 
      userId,
      date: new Date(),
    });

    // 2. Déterminer la phase basée sur les caractéristiques du cycle
    const currentPhase = this.mapCycleToPhase(currentCycle);
    console.log(`[GeneratePresetProgram] Current phase determined:`, currentPhase);

    // 3. Déterminer les paramètres optimaux pour cette phase et ce type de programme
    const phaseConfig = this.getPhaseConfiguration(currentPhase.phase, programType);
    console.log(`[GeneratePresetProgram] Phase configuration:`, phaseConfig);

    // 4. Récupérer TOUS les exercices adaptés (publics + utilisateur)
    const exercisesResult = await this.getExercisesByPhaseUseCase.execute({
      userId, // Important: inclure l'userId pour récupérer les exercices utilisateur aussi
      phase: currentPhase.phase,
      intensity: phaseConfig.intensity,
      muscleZone: focusZone,
      limit: 50, // Plus d'exercices pour avoir plus de choix
    });

    console.log(`[GeneratePresetProgram] Found ${exercisesResult.exercises.length} exercises total`);

    // 5. Sélectionner et organiser les exercices intelligemment
    const selectedExercises = this.selectExercisesIntelligently(
      exercisesResult.exercises,
      programType,
      phaseConfig,
      focusZone,
      duration,
      userId,
    );

    console.log(`[GeneratePresetProgram] Selected ${selectedExercises.length} exercises for program`);

    // 6. Calculer la durée totale basée sur les exercices sélectionnés
    const totalDuration = this.calculateTotalDuration(selectedExercises);

    // 7. Créer le programme final
    const programData = this.createProgramData(
      selectedExercises,
      currentPhase,
      programType,
      totalDuration,
      userId,
      title,
      goal,
    );

    // 8. Sauvegarder le programme dans la base de données
    const savedProgram = await this.programRepository.create(programData);

    console.log(`[GeneratePresetProgram] Program saved successfully:`, {
      id: savedProgram.id,
      title: savedProgram.title,
      exerciseCount: savedProgram.exercises?.length || 0
    });

    // 9. Générer les adaptations et conseils
    const adaptations = this.generateAdaptations(currentPhase.phase, programType);

    return {
      program: {
        id: savedProgram.id!,
        title: savedProgram.title,
        description: savedProgram.goal || '',
        totalDuration: totalDuration,
        formattedTotalDuration: this.formatDuration(totalDuration),
        exercises: selectedExercises,
        phaseRecommendations: currentPhase.recommendations,
        tips: this.generateTips(currentPhase.phase, programType),
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

  private mapCycleToPhase(cycleData: any) {
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
    programType: string,
  ): PhaseConfiguration {
    const configs: PhaseConfigMap = {
      menstrual: {
        intensity: Intensity.LOW,
        preferredZones: [MuscleZone.FLEXIBILITY, MuscleZone.CORE],
        restMultiplier: 1.5,
      },
      follicular: {
        intensity: programType === 'cardio' ? Intensity.MODERATE : Intensity.LOW,
        preferredZones: [MuscleZone.LOWER_BODY, MuscleZone.CORE],
        restMultiplier: 1.2,
      },
      ovulation: {
        intensity: programType === 'flexibility' ? Intensity.MODERATE : Intensity.HIGH,
        preferredZones: [MuscleZone.FULL_BODY, MuscleZone.UPPER_BODY],
        restMultiplier: 1.0,
      },
      luteal: {
        intensity: Intensity.MODERATE,
        preferredZones: [MuscleZone.UPPER_BODY, MuscleZone.BALANCE],
        restMultiplier: 1.3,
      },
    };

    return configs[phase] || configs.follicular;
  }

  private selectExercisesIntelligently(
    allExercises: any[],
    programType: string,
    phaseConfig: PhaseConfiguration,
    focusZone?: MuscleZone,
    targetDuration?: number,
    userId?: string,
  ) {
    console.log(`[GeneratePresetProgram] Starting intelligent selection from ${allExercises.length} exercises`);

    // 1. Séparer les exercices utilisateur des exercices publics
    const userExercises = allExercises.filter(ex => ex.createdBy === userId);
    const publicExercises = allExercises.filter(ex => !ex.createdBy);

    console.log(`[GeneratePresetProgram] Exercise breakdown:`, {
      total: allExercises.length,
      userExercises: userExercises.length,
      publicExercises: publicExercises.length
    });

    // 2. Filtrer par type de programme
    let filteredExercises = this.filterByProgramType(allExercises, programType);
    console.log(`[GeneratePresetProgram] After program type filter: ${filteredExercises.length} exercises`);

    // 3. Prioriser la zone ciblée si spécifiée
    if (focusZone) {
      const focusExercises = filteredExercises.filter(ex => ex.muscleZone === focusZone);
      const otherExercises = filteredExercises.filter(ex => ex.muscleZone !== focusZone);
      filteredExercises = [...focusExercises, ...otherExercises];
      console.log(`[GeneratePresetProgram] After focus zone prioritization: ${focusExercises.length} focus + ${otherExercises.length} other`);
    }

    // 4. Mélanger intelligemment exercices utilisateur + publics (30% utilisateur max)
    const targetExerciseCount = this.calculateTargetExerciseCount(targetDuration);
    const maxUserExercises = Math.ceil(targetExerciseCount * 0.3);
    
    const selectedUserExercises = this.shuffleArray(userExercises.slice(0, maxUserExercises));
    const remainingSlots = targetExerciseCount - selectedUserExercises.length;
    const selectedPublicExercises = this.shuffleArray(publicExercises).slice(0, remainingSlots);

    const selectedExercises = [...selectedUserExercises, ...selectedPublicExercises];

    console.log(`[GeneratePresetProgram] Final selection:`, {
      targetCount: targetExerciseCount,
      userSelected: selectedUserExercises.length,
      publicSelected: selectedPublicExercises.length,
      totalSelected: selectedExercises.length
    });

    // 5. Mapper vers le format de sortie avec ordre et propriétés
    return selectedExercises.map((exercise, index) => ({
      id: exercise.id,
      title: exercise.title,
      description: exercise.description,
      imageUrl: exercise.imageUrl,
      duration: exercise.duration || this.getDefaultDurationForType(programType),
      formattedDuration: exercise.formattedDuration,
      intensity: exercise.intensity,
      intensityLabel: exercise.intensityLabel,
      muscleZone: exercise.muscleZone,
      muscleZoneLabel: exercise.muscleZoneLabel,
      order: index + 1,
      sets: this.getDefaultSetsForType(programType, exercise.intensity),
      reps: this.getDefaultRepsForType(programType, exercise.intensity),
      restTime: this.calculateRestTime(exercise.intensity, programType, phaseConfig.restMultiplier),
      isUserExercise: exercise.createdBy === userId,
    }));
  }

  private filterByProgramType(exercises: any[], programType: string): any[] {
    switch (programType) {
      case 'cardio':
        return exercises.filter(
          (e) =>
            e.muscleZone === 'CARDIO' ||
            e.intensity === 'HIGH' ||
            e.intensity === 'VERY_HIGH',
        );
      case 'strength':
        return exercises.filter(
          (e) =>
            e.muscleZone === 'UPPER_BODY' ||
            e.muscleZone === 'LOWER_BODY' ||
            e.muscleZone === 'CORE' ||
            e.muscleZone === 'FULL_BODY',
        );
      case 'flexibility':
        return exercises.filter(
          (e) =>
            e.muscleZone === 'FLEXIBILITY' ||
            e.intensity === 'LOW' ||
            e.intensity === 'VERY_LOW',
        );
      default: // mixed
        return exercises;
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private calculateTargetExerciseCount(targetDuration?: number): number {
    if (!targetDuration) return 8; // Défaut
    
    // Estimation: 1 exercice = ~5-7 minutes (exercice + repos)
    const avgTimePerExercise = 6;
    return Math.min(Math.max(Math.ceil(targetDuration / avgTimePerExercise), 4), 12);
  }

  private getDefaultDurationForType(programType: string): number {
    switch (programType) {
      case 'cardio': return 8; // 8 minutes
      case 'strength': return 5; // 5 minutes
      case 'flexibility': return 10; // 10 minutes
      default: return 6; // mixed
    }
  }

  private getDefaultSetsForType(programType: string, intensity?: string): number {
    switch (programType) {
      case 'cardio': return 1;
      case 'strength': return intensity === 'HIGH' || intensity === 'VERY_HIGH' ? 4 : 3;
      case 'flexibility': return 1;
      default: return 3; // mixed
    }
  }

  private getDefaultRepsForType(programType: string, intensity?: string): string {
    switch (programType) {
      case 'cardio': return ''; // Basé sur la durée
      case 'strength': return intensity === 'HIGH' || intensity === 'VERY_HIGH' ? '6-8' : '10-12';
      case 'flexibility': return ''; // Basé sur la durée
      default: return '8-10'; // mixed
    }
  }

  private calculateRestTime(
    intensity?: string,
    programType?: string,
    restMultiplier: number = 1.0,
  ): number {
    const baseRest: Record<string, number> = {
      'VERY_LOW': 30,
      'LOW': 45,
      'MODERATE': 60,
      'HIGH': 90,
      'VERY_HIGH': 120,
    };

    const rest = baseRest[intensity || 'MODERATE'];

    // Ajuster selon le type de séance
    let adjustedRest = rest;
    if (programType === 'cardio') adjustedRest = Math.floor(rest * 0.7);
    if (programType === 'strength') adjustedRest = Math.floor(rest * 1.3);
    if (programType === 'flexibility') adjustedRest = Math.floor(rest * 0.5);

    return Math.floor(adjustedRest * restMultiplier);
  }

  private calculateTotalDuration(exercises: any[]): number {
    let totalDuration = 0;
    
    for (const exercise of exercises) {
      totalDuration += exercise.duration || 6;
      if (exercise.restTime) {
        totalDuration += Math.floor(exercise.restTime / 60); // Convert seconds to minutes
      }
    }
    
    return totalDuration;
  }

  private createProgramData(
    exercises: any[],
    currentPhase: any,
    programType: string,
    duration: number,
    userId: string,
    customTitle?: string,
    customGoal?: string,
  ) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const programExercises = exercises.map((exercise, index) => 
      ProgramExercise.create({
        exerciseId: exercise.id,
        order: index + 1,
        sets: exercise.sets,
        reps: exercise.reps,
        duration: exercise.duration * 60, // Convert to seconds for database
        restTime: exercise.restTime,
        notes: exercise.isUserExercise ? 
          `Votre exercice adapté à la phase ${currentPhase.phase}` :
          `Exercice adapté à la phase ${currentPhase.phase}`,
      })
    );

    return Program.create({
      title: customTitle || this.generateProgramTitle(currentPhase.phase, programType, duration),
      goal: customGoal || this.generateProgramDescription(currentPhase.phase, programType),
      startDate,
      endDate,
      isActive: false,
      isTemplate: false,
      userId,
      type: programType,
      duration: 4, // 4 weeks by default
      cyclePhase: currentPhase.phase,
      exercises: programExercises,
    });
  }

  private generateProgramTitle(
    phase: string,
    programType: string,
    duration: number,
  ): string {
    const phaseNames: Record<string, string> = {
      menstrual: 'Récupération Douce',
      follicular: 'Énergie Croissante',
      ovulation: 'Haute Performance',
      luteal: 'Force & Endurance',
    };

    const typeNames: Record<string, string> = {
      cardio: 'Cardio',
      strength: 'Renforcement',
      flexibility: 'Souplesse',
      mixed: 'Complet',
    };

    return `${phaseNames[phase] || 'Équilibré'} - ${typeNames[programType] || 'Complet'} (${duration}min)`;
  }

  private generateProgramDescription(phase: string, programType: string): string {
    const baseDescriptions: Record<string, string> = {
      menstrual: 'Programme doux pour votre période de récupération',
      follicular: "Programme progressif pour accompagner votre regain d'énergie",
      ovulation: "Programme intensif pour profiter de votre pic d'énergie",
      luteal: "Programme équilibré pour maintenir votre forme",
    };

    const typeDescriptions: Record<string, string> = {
      cardio: 'avec focus sur l\'endurance cardiovasculaire',
      strength: 'avec focus sur le renforcement musculaire',
      flexibility: 'avec focus sur la mobilité et la flexibilité',
      mixed: 'avec un entraînement complet et varié',
    };

    return `${baseDescriptions[phase] || 'Programme équilibré'} ${typeDescriptions[programType] || ''}.`;
  }

  private generateTips(phase: string, programType: string): string[] {
    const baseTips = [
      "Écoutez votre corps et adaptez l'intensité si nécessaire",
      'Restez bien hydratée pendant toute la séance',
      "N'hésitez pas à faire des pauses supplémentaires si besoin",
    ];

    const phaseTips: Record<string, string[]> = {
      menstrual: [
        'Privilégiez les mouvements fluides et la respiration profonde',
        'Évitez les positions inversées si elles vous dérangent',
      ],
      follicular: [
        "C'est le moment idéal pour apprendre de nouveaux mouvements",
        "Augmentez progressivement l'intensité jour après jour",
      ],
      ovulation: [
        'Profitez de votre énergie pour vous surpasser',
        "C'est le moment parfait pour battre vos records personnels",
      ],
      luteal: [
        'Concentrez-vous sur la technique et la précision',
        'Les exercices de stabilité sont particulièrement bénéfiques',
      ],
    };

    const typeTips: Record<string, string[]> = {
      cardio: ['Maintenez un rythme constant', 'Respirez de façon régulière'],
      strength: ['Contrôlez le mouvement', 'Assurez-vous de la bonne forme'],
      flexibility: ['Respirez profondément dans les étirements', 'Ne forcez jamais'],
      mixed: ['Variez les intensités', 'Amusez-vous avec la diversité'],
    };

    return [...baseTips, ...(phaseTips[phase] || []), ...(typeTips[programType] || [])];
  }

  private generateAdaptations(phase: string, programType: string): string[] {
    const adaptations: Record<string, string[]> = {
      menstrual: [
        'Intensité réduite de 30-40% par rapport à votre niveau habituel',
        'Focus sur la récupération et la mobilité',
        "Écoutez votre corps et arrêtez si vous ressentez de l'inconfort",
      ],
      follicular: [
        "Augmentation progressive de l'intensité recommandée",
        'Bon moment pour essayer de nouveaux exercices',
        'Récupération généralement plus rapide',
      ],
      ovulation: [
        'Intensité maximale recommandée',
        'Idéal pour les entraînements intenses',
        'Profitez de votre pic de performance',
      ],
      luteal: [
        'Intensité modérée avec focus sur la technique',
        "Exercices de stabilité privilégiés",
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