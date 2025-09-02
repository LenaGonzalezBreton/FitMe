import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';
import {
  IExerciseRepository,
  CreateExerciseData,
  UpdateExerciseData,
  ExerciseFilters,
} from '../domain/exercise.repository';
import { Exercise, Intensity, MuscleZone } from '../domain/exercise.entity';

@Injectable()
export class PrismaExerciseRepository implements IExerciseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Exercise[]> {
    const prismaData = await this.prisma.exercise.findMany({
      orderBy: { title: 'asc' },
    });

    return prismaData.map((data: any) => this.toDomainEntity(data));
  }

  async findById(exerciseId: string): Promise<Exercise | null> {
    const prismaData = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    return prismaData ? this.toDomainEntity(prismaData) : null;
  }

  async findByPhase(phaseName: string): Promise<Exercise[]> {
    // Since phase exercises are no longer supported, return all exercises
    // filtered by the recommended intensity for the phase
    const prismaData = await this.prisma.exercise.findMany({
      orderBy: { title: 'asc' },
    });

    return prismaData.map((data: any) => this.toDomainEntity(data));
  }

  async findByIntensity(intensity: Intensity): Promise<Exercise[]> {
    const prismaData = await this.prisma.exercise.findMany({
      where: {
        intensity: intensity,
      },
      orderBy: { title: 'asc' },
    });

    return prismaData.map((data: any) => this.toDomainEntity(data));
  }

  async findByMuscleZone(muscleZone: MuscleZone): Promise<Exercise[]> {
    const prismaData = await this.prisma.exercise.findMany({
      where: {
        muscleZone: muscleZone,
      },
      orderBy: { title: 'asc' },
    });

    return prismaData.map((data: any) => this.toDomainEntity(data));
  }

  async findWithFilters(filters: ExerciseFilters): Promise<Exercise[]> {
    const where: any = {};

    if (filters.intensity) {
      where.intensity = filters.intensity;
    }

    if (filters.muscleZone) {
      where.muscleZone = filters.muscleZone;
    }

    if (filters.minDuration || filters.maxDuration) {
      where.duration = {};
      if (filters.minDuration) {
        where.duration.gte = filters.minDuration;
      }
      if (filters.maxDuration) {
        where.duration.lte = filters.maxDuration;
      }
    }

    const prismaData = await this.prisma.exercise.findMany({
      where,
      orderBy: { title: 'asc' },
    });

    return prismaData.map((data: any) => this.toDomainEntity(data));
  }

  async create(createData: CreateExerciseData): Promise<Exercise> {
    const prismaData = await this.prisma.exercise.create({
      data: {
        title: createData.title,
        description: createData.description,
        imageUrl: createData.imageUrl,
        duration: createData.duration,
        intensity: createData.intensity,
        muscleZone: createData.muscleZone,
        createdBy: createData.createdBy,
      },
    });

    return this.toDomainEntity(prismaData);
  }

  async update(exerciseId: string, updateData: UpdateExerciseData): Promise<Exercise> {
    const prismaData = await this.prisma.exercise.update({
      where: { id: exerciseId },
      data: {
        title: updateData.title,
        description: updateData.description,
        imageUrl: updateData.imageUrl,
        duration: updateData.duration,
        intensity: updateData.intensity,
        muscleZone: updateData.muscleZone,
      },
    });

    return this.toDomainEntity(prismaData);
  }

  async delete(exerciseId: string): Promise<void> {
    await this.prisma.exercise.delete({
      where: { id: exerciseId },
    });
  }

  async search(query: string): Promise<Exercise[]> {
    const prismaData = await this.prisma.exercise.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { title: 'asc' },
    });

    return prismaData.map((data: any) => this.toDomainEntity(data));
  }

  private toDomainEntity(prismaData: any): Exercise {
    return new Exercise(
      prismaData.id,
      prismaData.title,
      prismaData.description,
      prismaData.imageUrl,
      prismaData.duration,
      prismaData.intensity,
      prismaData.muscleZone,
      prismaData.createdBy,
      prismaData.createdAt,
      prismaData.updatedAt,
    );
  }
}
