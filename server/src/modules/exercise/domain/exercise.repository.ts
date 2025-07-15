import {
  Exercise,
  Tag,
  PhaseExercise,
  Intensity,
  MuscleZone,
  TagType,
} from './exercise.entity';

export interface IExerciseRepository {
  /**
   * Trouve tous les exercices
   */
  findAll(): Promise<Exercise[]>;

  /**
   * Trouve un exercice par son ID
   */
  findById(exerciseId: string): Promise<Exercise | null>;

  /**
   * Trouve les exercices par phase de cycle
   */
  findByPhase(phaseName: string): Promise<Exercise[]>;

  /**
   * Trouve les exercices par intensité
   */
  findByIntensity(intensity: Intensity): Promise<Exercise[]>;

  /**
   * Trouve les exercices par zone musculaire
   */
  findByMuscleZone(muscleZone: MuscleZone): Promise<Exercise[]>;

  /**
   * Trouve les exercices avec filtres combinés
   */
  findWithFilters(filters: ExerciseFilters): Promise<Exercise[]>;

  /**
   * Crée un nouvel exercice
   */
  create(exerciseData: CreateExerciseData): Promise<Exercise>;

  /**
   * Met à jour un exercice
   */
  update(exerciseId: string, updateData: UpdateExerciseData): Promise<Exercise>;

  /**
   * Supprime un exercice
   */
  delete(exerciseId: string): Promise<void>;
}

export interface ITagRepository {
  /**
   * Trouve tous les tags
   */
  findAll(): Promise<Tag[]>;

  /**
   * Trouve les tags par type
   */
  findByType(type: TagType): Promise<Tag[]>;

  /**
   * Trouve un tag par son nom
   */
  findByName(name: string): Promise<Tag | null>;

  /**
   * Crée un nouveau tag
   */
  create(tagData: CreateTagData): Promise<Tag>;
}

export interface IPhaseExerciseRepository {
  /**
   * Trouve les exercices associés à une phase
   */
  findByPhaseName(phaseName: string): Promise<PhaseExercise[]>;

  /**
   * Associe un exercice à une phase
   */
  create(phaseExerciseData: CreatePhaseExerciseData): Promise<PhaseExercise>;

  /**
   * Supprime l'association entre un exercice et une phase
   */
  delete(phaseExerciseId: string): Promise<void>;
}

// Types de filtres et données
export interface ExerciseFilters {
  phaseName?: string;
  intensity?: Intensity;
  muscleZone?: MuscleZone;
  minDuration?: number;
  maxDuration?: number;
  tags?: string[];
}

export interface CreateExerciseData {
  title: string;
  description?: string;
  imageUrl?: string;
  durationMinutes?: number;
  intensity?: Intensity;
  muscleZone?: MuscleZone;
}

export interface UpdateExerciseData {
  title?: string;
  description?: string;
  imageUrl?: string;
  durationMinutes?: number;
  intensity?: Intensity;
  muscleZone?: MuscleZone;
}

export interface CreateTagData {
  name: string;
  type: TagType;
}

export interface CreatePhaseExerciseData {
  phaseName: string;
  exerciseId: string;
}
