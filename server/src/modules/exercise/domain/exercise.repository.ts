import {
  Exercise,
  Tag,
  PhaseExercise,
  FavoriteExercise,
  ExerciseRating,
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
  createdBy?: string; // User ID for user-created exercises, null for system exercises
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

export interface IFavoriteExerciseRepository {
  /**
   * Trouve tous les exercices favoris d'un utilisateur
   */
  findByUserId(userId: string): Promise<FavoriteExercise[]>;

  /**
   * Vérifie si un exercice est dans les favoris d'un utilisateur
   */
  findByUserAndExercise(
    userId: string,
    exerciseId: string,
  ): Promise<FavoriteExercise | null>;

  /**
   * Ajoute un exercice aux favoris
   */
  create(userId: string, exerciseId: string): Promise<FavoriteExercise>;

  /**
   * Retire un exercice des favoris
   */
  delete(userId: string, exerciseId: string): Promise<void>;

  /**
   * Vérifie si un exercice est favori pour un utilisateur
   */
  exists(userId: string, exerciseId: string): Promise<boolean>;
}

export interface IExerciseRatingRepository {
  /**
   * Trouve toutes les évaluations d'un exercice
   */
  findByExerciseId(exerciseId: string): Promise<ExerciseRating[]>;

  /**
   * Trouve l'évaluation d'un exercice par un utilisateur
   */
  findByUserAndExercise(
    userId: string,
    exerciseId: string,
  ): Promise<ExerciseRating | null>;

  /**
   * Trouve toutes les évaluations d'un utilisateur
   */
  findByUserId(userId: string): Promise<ExerciseRating[]>;

  /**
   * Crée une nouvelle évaluation
   */
  create(
    userId: string,
    exerciseId: string,
    rating: number,
    comment?: string,
  ): Promise<ExerciseRating>;

  /**
   * Met à jour une évaluation existante
   */
  update(
    userId: string,
    exerciseId: string,
    rating: number,
    comment?: string,
  ): Promise<ExerciseRating>;

  /**
   * Supprime une évaluation
   */
  delete(userId: string, exerciseId: string): Promise<void>;

  /**
   * Calcule la moyenne des évaluations pour un exercice
   */
  getAverageRating(exerciseId: string): Promise<number>;

  /**
   * Compte le nombre d'évaluations pour un exercice
   */
  countRatingsByExercise(exerciseId: string): Promise<number>;
}
