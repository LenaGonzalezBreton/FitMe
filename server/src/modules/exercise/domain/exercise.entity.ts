export enum Intensity {
  VERY_LOW = 'VERY_LOW',
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
}

export enum MuscleZone {
  UPPER_BODY = 'UPPER_BODY',
  LOWER_BODY = 'LOWER_BODY',
  CORE = 'CORE',
  FULL_BODY = 'FULL_BODY',
  CARDIO = 'CARDIO',
  FLEXIBILITY = 'FLEXIBILITY',
  BALANCE = 'BALANCE',
}

export enum TagType {
  DIFFICULTY = 'DIFFICULTY',
  EQUIPMENT = 'EQUIPMENT',
  MUSCLE_GROUP = 'MUSCLE_GROUP',
  OBJECTIVE = 'OBJECTIVE',
  DURATION = 'DURATION',
  STYLE = 'STYLE',
}

export class Exercise {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description?: string,
    public readonly imageUrl?: string,
    public readonly durationMinutes?: number,
    public readonly intensity?: Intensity,
    public readonly muscleZone?: MuscleZone,
    public readonly createdBy?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  /**
   * Vérifie si l'exercice est adapté à une intensité donnée
   */
  isAdaptedForIntensity(targetIntensity: Intensity): boolean {
    if (!this.intensity) return true; // Si pas d'intensité définie, adapté à tout

    const intensityLevels = {
      [Intensity.VERY_LOW]: 1,
      [Intensity.LOW]: 2,
      [Intensity.MODERATE]: 3,
      [Intensity.HIGH]: 4,
      [Intensity.VERY_HIGH]: 5,
    };

    const exerciseLevel = intensityLevels[this.intensity];
    const targetLevel = intensityLevels[targetIntensity];

    // Tolérance de ±1 niveau
    return Math.abs(exerciseLevel - targetLevel) <= 1;
  }

  /**
   * Retourne la durée formatée
   */
  getFormattedDuration(): string {
    if (!this.durationMinutes) return 'Durée non spécifiée';

    const hours = Math.floor(this.durationMinutes / 60);
    const minutes = this.durationMinutes % 60;

    if (hours > 0) {
      return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
    }
    return `${minutes}min`;
  }

  /**
   * Vérifie si l'exercice a été créé par un utilisateur
   */
  isUserCreated(): boolean {
    return this.createdBy !== null && this.createdBy !== undefined;
  }

  /**
   * Vérifie si l'exercice a été créé par un utilisateur spécifique
   */
  isCreatedBy(userId: string): boolean {
    return this.createdBy === userId;
  }
}

export class Tag {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: TagType,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}

export class ExerciseTag {
  constructor(
    public readonly id: string,
    public readonly exerciseId: string,
    public readonly tagId: string,
    public readonly createdAt?: Date,
  ) {}
}

export class PhaseExercise {
  constructor(
    public readonly id: string,
    public readonly phaseName: string, // CyclePhase as string
    public readonly exerciseId: string,
    public readonly createdAt?: Date,
  ) {}
}

export interface FavoriteExerciseProps {
  id?: string;
  userId: string;
  exerciseId: string;
  createdAt?: Date;
}

export class FavoriteExercise {
  readonly id?: string;
  readonly userId: string;
  readonly exerciseId: string;
  readonly createdAt?: Date;

  constructor(props: FavoriteExerciseProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.exerciseId = props.exerciseId;
    this.createdAt = props.createdAt;
  }

  public static create(props: FavoriteExerciseProps): FavoriteExercise {
    if (!props.userId?.trim()) {
      throw new Error('User ID is required');
    }
    if (!props.exerciseId?.trim()) {
      throw new Error('Exercise ID is required');
    }

    return new FavoriteExercise({
      ...props,
      createdAt: props.createdAt || new Date(),
    });
  }
}

export interface ExerciseRatingProps {
  id?: string;
  userId: string;
  exerciseId: string;
  rating: number;
  comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ExerciseRating {
  readonly id?: string;
  readonly userId: string;
  readonly exerciseId: string;
  readonly rating: number;
  readonly comment?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: ExerciseRatingProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.exerciseId = props.exerciseId;
    this.rating = props.rating;
    this.comment = props.comment;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public static create(props: ExerciseRatingProps): ExerciseRating {
    if (!props.userId?.trim()) {
      throw new Error('User ID is required');
    }
    if (!props.exerciseId?.trim()) {
      throw new Error('Exercise ID is required');
    }
    if (!props.rating || props.rating < 1 || props.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    return new ExerciseRating({
      ...props,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    });
  }

  public update(props: Partial<ExerciseRatingProps>): ExerciseRating {
    if (props.rating && (props.rating < 1 || props.rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    return new ExerciseRating({
      id: this.id,
      userId: this.userId,
      exerciseId: this.exerciseId,
      rating: props.rating ?? this.rating,
      comment: props.comment !== undefined ? props.comment : this.comment,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  public isValidRating(): boolean {
    return this.rating >= 1 && this.rating <= 5;
  }
}
