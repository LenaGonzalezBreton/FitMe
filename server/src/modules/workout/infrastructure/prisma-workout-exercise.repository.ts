import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';

export interface WorkoutExerciseEntity {
  id: string;
  workoutSessionId: string;
  exerciseId: string;
  order: number;
  sets?: number;
  reps?: string;
  weight?: number;
  duration?: number;
  restTime?: number;
  notes?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorkoutExerciseData {
  workoutSessionId: string;
  exerciseId: string;
  userId: string; // Add this missing field
  order: number;
  sets?: number;
  reps?: string;
  weight?: number;
  duration?: number;
  notes?: string;
  completed?: boolean;
}

export interface UpdateWorkoutExerciseData {
  sets?: number;
  reps?: string;
  weight?: number;
  duration?: number;
  restTime?: number;
  notes?: string;
  completed?: boolean;
}

@Injectable()
export class PrismaWorkoutExerciseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateWorkoutExerciseData): Promise<WorkoutExerciseEntity> {
    const workoutExercise = await this.prisma.workoutExercise.create({
      data: {
        workoutSessionId: data.workoutSessionId,
        exerciseId: data.exerciseId,
        userId: data.userId,
        order: data.order,
        sets: data.sets,
        reps: data.reps,
        weight: data.weight,
        duration: data.duration,
        notes: data.notes,
        completed: data.completed,
      },
    });

    return this.toDomainEntity(workoutExercise);
  }

  async findById(id: string): Promise<WorkoutExerciseEntity | null> {
    const workoutExercise = await this.prisma.workoutExercise.findUnique({
      where: { id },
    });

    return workoutExercise ? this.toDomainEntity(workoutExercise) : null;
  }

  async findBySessionId(sessionId: string): Promise<WorkoutExerciseEntity[]> {
    const workoutExercises = await this.prisma.workoutExercise.findMany({
      where: { workoutSessionId: sessionId },
      orderBy: { order: 'asc' },
    });

    return workoutExercises.map(exercise => this.toDomainEntity(exercise));
  }

  async update(id: string, data: UpdateWorkoutExerciseData): Promise<WorkoutExerciseEntity> {
    const workoutExercise = await this.prisma.workoutExercise.update({
      where: { id },
      data,
    });

    return this.toDomainEntity(workoutExercise);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.workoutExercise.delete({
      where: { id },
    });
  }

  async deleteBySessionId(sessionId: string): Promise<void> {
    await this.prisma.workoutExercise.deleteMany({
      where: { workoutSessionId: sessionId },
    });
  }

  private toDomainEntity(prismaData: any): WorkoutExerciseEntity {
    return {
      id: prismaData.id,
      workoutSessionId: prismaData.workoutSessionId,
      exerciseId: prismaData.exerciseId,
      order: prismaData.order,
      sets: prismaData.sets,
      reps: prismaData.reps,
      weight: prismaData.weight,
      duration: prismaData.duration,
      restTime: prismaData.restTime,
      notes: prismaData.notes,
      completed: prismaData.completed,
      createdAt: prismaData.createdAt,
      updatedAt: prismaData.updatedAt,
    };
  }
}

