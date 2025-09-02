import { ApiProperty } from '@nestjs/swagger';

export interface ProgramExerciseProps {
  id?: string;
  programId?: string;
  exerciseId: string;
  order: number;
  sets?: number;
  reps?: string;
  duration?: number;
  restTime?: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ProgramExercise {
  @ApiProperty({
    description: 'Unique identifier for the program exercise',
    example: 'clh123456789',
  })
  readonly id?: string;

  @ApiProperty({
    description: 'Program identifier this exercise belongs to',
    example: 'clh987654321',
  })
  readonly programId?: string;

  @ApiProperty({
    description: 'Exercise identifier',
    example: 'clh456789123',
  })
  readonly exerciseId: string;

  @ApiProperty({
    description: 'Order of this exercise in the program',
    example: 1,
  })
  readonly order: number;

  @ApiProperty({
    description: 'Number of sets',
    example: 3,
    required: false,
  })
  readonly sets?: number;

  @ApiProperty({
    description: 'Number of repetitions (can be range like "8-12")',
    example: '10-15',
    required: false,
  })
  readonly reps?: string;

  @ApiProperty({
    description: 'Duration in seconds for time-based exercises',
    example: 30,
    required: false,
  })
  readonly duration?: number;

  @ApiProperty({
    description: 'Rest time in seconds between sets',
    example: 60,
    required: false,
  })
  readonly restTime?: number;

  @ApiProperty({
    description: 'Additional notes for this exercise',
    example: 'Focus on form over speed',
    required: false,
  })
  readonly notes?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  readonly createdAt?: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  readonly updatedAt?: Date;

  constructor(props: ProgramExerciseProps) {
    this.id = props.id;
    this.programId = props.programId;
    this.exerciseId = props.exerciseId;
    this.order = props.order;
    this.sets = props.sets;
    this.reps = props.reps;
    this.duration = props.duration;
    this.restTime = props.restTime;
    this.notes = props.notes;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public static create(props: ProgramExerciseProps): ProgramExercise {
    return new ProgramExercise({
      ...props,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    });
  }

  public update(props: Partial<ProgramExerciseProps>): ProgramExercise {
    return new ProgramExercise({
      id: this.id,
      programId: this.programId,
      exerciseId: this.exerciseId,
      order: props.order ?? this.order,
      sets: props.sets ?? this.sets,
      reps: props.reps ?? this.reps,
      duration: props.duration ?? this.duration,
      restTime: props.restTime ?? this.restTime,
      notes: props.notes ?? this.notes,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}

export interface ProgramProps {
  id?: string;
  userId: string;
  title: string;
  goal?: string;
  startDate: Date;
  endDate?: Date;
  isActive?: boolean;
  isTemplate?: boolean;
  type?: string;
  trainingDays?: number[];
  duration?: number;
  focusZone?: string;
  cyclePhase?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  exercises?: ProgramExercise[];
}

export class Program {
  @ApiProperty({
    description: 'Unique identifier for the program',
    example: 'clh123456789',
  })
  readonly id?: string;

  @ApiProperty({
    description: 'User identifier who owns this program',
    example: 'clh987654321',
  })
  readonly userId: string;

  @ApiProperty({
    description: 'Program title',
    example: 'Follicular Phase Strength Training',
  })
  readonly title: string;

  @ApiProperty({
    description: 'Program goal description',
    example: 'Build strength during follicular phase with progressive overload',
    required: false,
  })
  readonly goal?: string;

  @ApiProperty({
    description: 'Program start date',
    example: '2024-01-15T00:00:00.000Z',
  })
  readonly startDate: Date;

  @ApiProperty({
    description: 'Program end date',
    example: '2024-02-15T00:00:00.000Z',
    required: false,
  })
  readonly endDate?: Date;

  @ApiProperty({
    description: 'Whether the program is currently active',
    example: true,
    default: false,
  })
  readonly isActive?: boolean;

  @ApiProperty({
    description: 'Whether this program is a template that can be reused',
    example: false,
    default: false,
  })
  readonly isTemplate?: boolean;

  @ApiProperty({
    description: 'Program type (strength, cardio, flexibility, mixed)',
    example: 'strength',
    required: false,
  })
  readonly type?: string;

  @ApiProperty({
    description: 'Training days as array of weekday numbers (0=Sunday, 1=Monday, etc.)',
    example: [1, 3, 5],
    required: false,
  })
  readonly trainingDays?: number[];

  @ApiProperty({
    description: 'Program duration in weeks',
    example: 4,
    required: false,
  })
  readonly duration?: number;

  @ApiProperty({
    description: 'Focus zone for muscle targeting (comma-separated if multiple)',
    example: 'FULL_BODY,CORE',
    required: false,
  })
  readonly focusZone?: string;

  @ApiProperty({
    description: 'Cycle phase when program was created',
    example: 'follicular',
    required: false,
  })
  readonly cyclePhase?: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  readonly createdAt?: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  readonly updatedAt?: Date;

  @ApiProperty({
    description: 'List of exercises in this program',
    type: [ProgramExercise],
  })
  readonly exercises?: ProgramExercise[];

  constructor(props: ProgramProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.title = props.title;
    this.goal = props.goal;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.isActive = props.isActive ?? false;
    this.isTemplate = props.isTemplate ?? false;
    this.type = props.type;
    this.trainingDays = props.trainingDays;
    this.duration = props.duration;
    this.focusZone = props.focusZone;
    this.cyclePhase = props.cyclePhase;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.exercises = props.exercises;
  }

  public static create(props: ProgramProps): Program {
    if (!props.title?.trim()) {
      throw new Error('Program title is required');
    }

    if (!props.userId?.trim()) {
      throw new Error('User ID is required');
    }

    return new Program({
      ...props,
      title: props.title.trim(),
      goal: props.goal?.trim(),
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    });
  }

  public update(props: Partial<ProgramProps>): Program {
    const updatedProps = {
      ...props,
    };

    if (props.title !== undefined) {
      if (!props.title?.trim()) {
        throw new Error('Program title cannot be empty');
      }
      updatedProps.title = props.title.trim();
    }

    if (props.goal !== undefined) {
      updatedProps.goal = props.goal?.trim();
    }

    return new Program({
      id: this.id,
      userId: this.userId,
      title: updatedProps.title ?? this.title,
      goal: updatedProps.goal ?? this.goal,
      startDate: props.startDate ?? this.startDate,
      endDate: props.endDate ?? this.endDate,
      isActive: props.isActive ?? this.isActive,
      isTemplate: props.isTemplate ?? this.isTemplate,
      type: props.type ?? this.type,
      trainingDays: props.trainingDays ?? this.trainingDays,
      duration: props.duration ?? this.duration,
      focusZone: props.focusZone ?? this.focusZone,
      cyclePhase: props.cyclePhase ?? this.cyclePhase,
      createdAt: this.createdAt,
      updatedAt: new Date(),
      exercises: props.exercises ?? this.exercises,
    });
  }

  public activate(): Program {
    return this.update({ isActive: true });
  }

  public deactivate(): Program {
    return this.update({ isActive: false });
  }

  public makeTemplate(): Program {
    return this.update({ isTemplate: true });
  }

  public isExpired(): boolean {
    if (!this.endDate) return false;
    return new Date() > this.endDate;
  }

  public getDurationInDays(): number {
    if (!this.endDate) return 0;
    const diffTime = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
