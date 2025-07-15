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
