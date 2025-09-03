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
  duration?: number;
  formattedDuration: string;
  intensity?: string;
  intensityLabel: string;
  muscleZone?: string;
  muscleZoneLabel: string;
  order: number;
  restTime?: number; // Changed from restTimeSeconds to match backend
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

export interface CurrentCycleResponse {
  success: boolean;
  data: CurrentCycleData;
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

// Cycle types
export interface CurrentCycleData {
  cycleDay: number;
  cycleLength: number;
  periodLength: number;
  isPeriodDay: boolean;
  isOvulationPhase: boolean;
  isFertileDay: boolean;
  daysUntilNextCycle: number;
  cycleDescription: string;
  recommendations: string[];
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
  startDate?: string; // Optionnel quand isNewCycle = false
  endDate?: string;
  flowIntensity?: number;
  notes?: string;
  isNewCycle?: boolean; // true = nouveau cycle, false = continuer cycle actuel
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

// Cycle Predictions types
export interface CyclePredictions {
  nextPeriodStart: string;
  nextOvulation: string;
  confidence: number;
  currentCycleDay: number;
  currentCycleCharacteristics: string;
  daysUntilNextPeriod: number;
  daysUntilOvulation: number;
}

export interface CyclePredictionsResponse {
  predictions: CyclePredictions;
  message: string;
}

// Cycle Comparison types
export interface CycleComparisonData {
  cycleNumber: number;
  startDate: string;
  cycleLength: number;
  periodLength: number;
  isRegular: boolean;
  flowIntensity?: number;
  notes?: string;
}

export interface CycleTrend {
  metric: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  change: number;
  changePercentage: number;
  description: string;
}

export interface CycleComparisonAverages {
  cycleLength: number;
  periodLength: number;
  regularityRate: number;
}

export interface CycleComparisonPeriod {
  startDate: string;
  endDate: string;
  totalCycles: number;
}

export interface CycleComparisonResponse {
  cycles: CycleComparisonData[];
  trends: CycleTrend[];
  insights: string[];
  averages: CycleComparisonAverages;
  comparedPeriod: CycleComparisonPeriod;
  message: string;
}

// Cycle Calendar types
export interface CalendarDay {
  date: string;
  phase: string;
  cycleDay: number;
  dayType: string;
  events: string[];
  isPredicted: boolean;
}

export interface CycleCalendarResponse {
  calendar: CalendarDay[];
  startDate: string;
  endDate: string;
  monthsCount: number;
  message: string;
}