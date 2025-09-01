// barrel for global types
export * from './navigation';

// Program types
export interface ProgramExercise {
  id?: string;
  programId?: string;
  exerciseId: string;
  order: number;
  sets?: number;
  reps?: string;
  duration?: number;
  restTime?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Program {
  id: string;
  title: string;
  goal?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
  exerciseCount: number;
  exercises?: ProgramExercise[];
}

export interface ProgramListResponse {
  programs: Program[];
  total: number;
  offset: number;
  limit: number;
}

export interface GeneratedProgramExercise {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  durationMinutes?: number;
  formattedDuration: string;
  intensity?: string;
  intensityLabel: string;
  muscleZone?: string;
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
  exercises: GeneratedProgramExercise[];
  phaseRecommendations: string[];
  tips: string[];
}

export interface UserPhase {
  phase: string;
  phaseLabel: string;
  cycleDay: number;
  recommendations: string[];
}

export interface GeneratedProgramResponse {
  success: boolean;
  data: {
    program: GeneratedProgram;
    userPhase: UserPhase;
    adaptations: string[];
  };
  message: string;
}

// Cycle types
export enum CyclePhase {
  MENSTRUAL = 'MENSTRUAL',
  FOLLICULAR = 'FOLLICULAR',
  OVULATION = 'OVULATION',
  LUTEAL = 'LUTEAL',
}

export interface CurrentPhaseData {
  phase: CyclePhase;
  cycleDay: number;
  cycleLength: number;
  periodLength: number;
  daysUntilNextPhase: number;
  phaseDescription: string;
  recommendations: string[];
}

export interface CurrentPhaseResponse {
  success: boolean;
  data: CurrentPhaseData;
  message: string;
}

// Cycle Configuration types
export interface CycleConfig {
  userId: string;
  isCycleTrackingEnabled: boolean;
  usesExternalProvider: boolean;
  useMenopauseMode: boolean;
  averageCycleLength: number;
  averagePeriodLength: number;
  prefersManualInput: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CycleConfigResponse {
  config: CycleConfig;
  message: string;
}

export interface UpdateCycleConfigRequest {
  isCycleTrackingEnabled?: boolean;
  usesExternalProvider?: boolean;
  useMenopauseMode?: boolean;
  averageCycleLength?: number;
  averagePeriodLength?: number;
  prefersManualInput?: boolean;
}

// Period tracking types
export interface LogPeriodRequest {
  startDate: string;
  endDate?: string;
  flowIntensity?: number;
  notes?: string;
}

export interface Period {
  id: string;
  startDate: string;
  endDate?: string;
  flowIntensity?: number;
  notes?: string;
  cycleId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogPeriodResponse {
  period: {
    id: string;
    startDate: string;
    periodLength?: number;
    cycleLength?: number;
    isRegular: boolean;
    flowIntensity?: number;
    notes?: string;
  };
  message: string;
  isNewCycle: boolean;
}

export interface PeriodsHistoryResponse {
  periods: {
    id: string;
    startDate: string;
    periodLength?: number;
    cycleLength?: number;
    isRegular: boolean;
    flowIntensity?: number;
    notes?: string;
  }[];
  total: number;
  averageCycleLength: number;
  averagePeriodLength: number;
  regularityPercentage: number;
}