import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';
import {
  IExerciseRepository,
  CreateExerciseData,
  UpdateExerciseData,
  ExerciseFilters,
} from '../domain/exercise.repository';
import { Exercise, Intensity, MuscleZone } from '../domain/exercise.entity';
import {
  Exercise as PrismaExercise,
  Intensity as PrismaIntensity,
  MuscleZone as PrismaMuscleZone,
  CyclePhase as PrismaCyclePhase,
  Prisma,
} from '@prisma/client';

@Injectable()
export class PrismaExerciseRepository implements IExerciseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Exercise[]> {
    const prismaData = await this.prisma.exercise.findMany({
      orderBy: { title: 'asc' },
    });

    return prismaData.map((data) => this.toDomainEntity(data));
  }

  async findById(exerciseId: string): Promise<Exercise | null> {
    const prismaData = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    return prismaData ? this.toDomainEntity(prismaData) : null;
  }

  async findByPhase(phaseName: string): Promise<Exercise[]> {
    const prismaData = await this.prisma.exercise.findMany({
      where: {
        phaseExercises: {
          some: {
            phaseName: phaseName as PrismaCyclePhase,
          },
        },
      },
      orderBy: { title: 'asc' },
    });

    return prismaData.map((data) => this.toDomainEntity(data));
  }

  async findByIntensity(intensity: Intensity): Promise<Exercise[]> {
    const prismaData = await this.prisma.exercise.findMany({
      where: {
        intensity: intensity as PrismaIntensity,
      },
      orderBy: { title: 'asc' },
    });

    return prismaData.map((data) => this.toDomainEntity(data));
  }

  async findByMuscleZone(muscleZone: MuscleZone): Promise<Exercise[]> {
    const prismaData = await this.prisma.exercise.findMany({
      where: {
        muscleZone: muscleZone as PrismaMuscleZone,
      },
      orderBy: { title: 'asc' },
    });

    return prismaData.map((data) => this.toDomainEntity(data));
  }

  async findWithFilters(filters: ExerciseFilters): Promise<Exercise[]> {
    const where: Prisma.ExerciseWhereInput = {};

    if (filters.intensity) {
      where.intensity = filters.intensity as PrismaIntensity;
    }

    if (filters.muscleZone) {
      where.muscleZone = filters.muscleZone as PrismaMuscleZone;
    }

    if (filters.minDuration || filters.maxDuration) {
      where.durationMinutes = {};
      if (filters.minDuration) {
        where.durationMinutes.gte = filters.minDuration;
      }
      if (filters.maxDuration) {
        where.durationMinutes.lte = filters.maxDuration;
      }
    }

    if (filters.phaseName) {
      where.phaseExercises = {
        some: {
          phaseName: filters.phaseName as PrismaCyclePhase,
        },
      };
    }

    const prismaData = await this.prisma.exercise.findMany({
      where,
      orderBy: { title: 'asc' },
    });

    return prismaData.map((data) => this.toDomainEntity(data));
  }

  async create(exerciseData: CreateExerciseData): Promise<Exercise> {
    const prismaData = await this.prisma.exercise.create({
      data: {
        title: exerciseData.title,
        description: exerciseData.description,
        imageUrl: exerciseData.imageUrl,
        durationMinutes: exerciseData.durationMinutes,
        intensity: exerciseData.intensity as PrismaIntensity,
        muscleZone: exerciseData.muscleZone as PrismaMuscleZone,
        createdBy: exerciseData.createdBy,
      },
    });

    return this.toDomainEntity(prismaData);
  }

  async update(
    exerciseId: string,
    updateData: UpdateExerciseData,
  ): Promise<Exercise> {
    const prismaData = await this.prisma.exercise.update({
      where: { id: exerciseId },
      data: {
        title: updateData.title,
        description: updateData.description,
        imageUrl: updateData.imageUrl,
        durationMinutes: updateData.durationMinutes,
        intensity: updateData.intensity as PrismaIntensity,
        muscleZone: updateData.muscleZone as PrismaMuscleZone,
      },
    });

    return this.toDomainEntity(prismaData);
  }

  async delete(exerciseId: string): Promise<void> {
    await this.prisma.exercise.delete({
      where: { id: exerciseId },
    });
  }

  private toDomainEntity(prismaData: PrismaExercise): Exercise {
    return new Exercise(
      prismaData.id,
      prismaData.title,
      prismaData.description ?? undefined,
      prismaData.imageUrl ?? undefined,
      prismaData.durationMinutes ?? undefined,
      prismaData.intensity as Intensity | undefined,
      prismaData.muscleZone as MuscleZone | undefined,
      prismaData.createdBy ?? undefined,
      prismaData.createdAt,
      prismaData.updatedAt,
    );
  }
}
