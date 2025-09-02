import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';

export interface WorkoutSessionEntity {
  id: string;
  userId: string;
  programId?: string;
  title?: string;
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
  status: string;
  notes?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorkoutSessionData {
  userId: string;
  programId?: string;
  title?: string;
  startTime: Date;
  status: string;
}

export interface UpdateWorkoutSessionData {
  endTime?: Date;
  totalDuration?: number;
  status?: string;
  notes?: string;
  rating?: number;
}

export interface WorkoutSessionFilters {
  userId: string;
  limit?: number;
  offset?: number;
  fromDate?: Date;
  toDate?: Date;
  status?: string;
}

@Injectable()
export class PrismaWorkoutSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateWorkoutSessionData): Promise<WorkoutSessionEntity> {
    const workoutSession = await this.prisma.workoutSession.create({
      data: {
        userId: data.userId,
        programId: data.programId,
        title: data.title,
        startTime: data.startTime,
        status: data.status as any, // Cast to any to avoid type issues
      },
    });

    return this.toDomainEntity(workoutSession);
  }

  async findById(id: string): Promise<WorkoutSessionEntity | null> {
    const workoutSession = await this.prisma.workoutSession.findUnique({
      where: { id },
    });

    return workoutSession ? this.toDomainEntity(workoutSession) : null;
  }

  async findByIdWithExercises(id: string): Promise<WorkoutSessionEntity | null> {
    const workoutSession = await this.prisma.workoutSession.findUnique({
      where: { id },
      include: {
        workoutExercises: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!workoutSession) return null;

    const domainEntity = this.toDomainEntity(workoutSession);
    return {
      ...domainEntity,
      exercises: workoutSession.workoutExercises.map(exercise => ({
        id: exercise.id,
        exerciseId: exercise.exerciseId,
        order: exercise.order,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
        duration: exercise.duration,
        restTime: exercise.restTime,
        notes: exercise.notes,
        completed: exercise.completed,
      })),
    } as any;
  }

  async findByUserId(filters: WorkoutSessionFilters): Promise<{
    sessions: WorkoutSessionEntity[];
    total: number;
  }> {
    const where: any = {
      userId: filters.userId,
    };

    if (filters.fromDate || filters.toDate) {
      where.startTime = {};
      if (filters.fromDate) where.startTime.gte = filters.fromDate;
      if (filters.toDate) where.startTime.lte = filters.toDate;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const [sessions, total] = await Promise.all([
      this.prisma.workoutSession.findMany({
        where,
        orderBy: { startTime: 'desc' },
        take: filters.limit || 20,
        skip: filters.offset || 0,
        include: {
          _count: {
            select: { workoutExercises: true },
          },
        },
      }),
      this.prisma.workoutSession.count({ where }),
    ]);

    const domainSessions = sessions.map(session => ({
      ...this.toDomainEntity(session),
      exerciseCount: session._count.workoutExercises,
    }));

    return {
      sessions: domainSessions,
      total,
    };
  }

  async update(id: string, data: UpdateWorkoutSessionData): Promise<WorkoutSessionEntity> {
    const workoutSession = await this.prisma.workoutSession.update({
      where: { id },
      data: data as any, // Cast to any to avoid type issues
    });

    return this.toDomainEntity(workoutSession);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.workoutSession.delete({
      where: { id },
    });
  }

  private toDomainEntity(prismaData: any): WorkoutSessionEntity {
    return {
      id: prismaData.id,
      userId: prismaData.userId,
      programId: prismaData.programId,
      title: prismaData.title,
      startTime: prismaData.startTime,
      endTime: prismaData.endTime,
      totalDuration: prismaData.totalDuration,
      status: prismaData.status,
      notes: prismaData.notes,
      rating: prismaData.rating,
      createdAt: prismaData.createdAt,
      updatedAt: prismaData.updatedAt,
    };
  }
}

