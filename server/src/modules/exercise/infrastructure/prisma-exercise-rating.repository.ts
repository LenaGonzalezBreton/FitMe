/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/unbound-method */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';
import { ExerciseRating } from '../domain/exercise.entity';
import { IExerciseRatingRepository } from '../domain/exercise.repository';

@Injectable()
export class PrismaExerciseRatingRepository
  implements IExerciseRatingRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findByExerciseId(exerciseId: string): Promise<ExerciseRating[]> {
    const ratings = await this.prisma.exerciseRating.findMany({
      where: { exerciseId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
          },
        },
        exercise: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return ratings.map(this.mapToDomain);
  }

  async findByUserAndExercise(
    userId: string,
    exerciseId: string,
  ): Promise<ExerciseRating | null> {
    const rating = await this.prisma.exerciseRating.findUnique({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
          },
        },
        exercise: true,
      },
    });

    return rating ? this.mapToDomain(rating) : null;
  }

  async findByUserId(userId: string): Promise<ExerciseRating[]> {
    const ratings = await this.prisma.exerciseRating.findMany({
      where: { userId },
      include: {
        exercise: true,
        user: {
          select: {
            id: true,
            firstName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return ratings.map(this.mapToDomain);
  }

  async create(
    userId: string,
    exerciseId: string,
    rating: number,
    comment?: string,
  ): Promise<ExerciseRating> {
    const created = await this.prisma.exerciseRating.create({
      data: {
        userId,
        exerciseId,
        rating,
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
          },
        },
        exercise: true,
      },
    });

    return this.mapToDomain(created);
  }

  async update(
    userId: string,
    exerciseId: string,
    rating: number,
    comment?: string,
  ): Promise<ExerciseRating> {
    const updated = await this.prisma.exerciseRating.update({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId,
        },
      },
      data: {
        rating,
        comment,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
          },
        },
        exercise: true,
      },
    });

    return this.mapToDomain(updated);
  }

  async delete(userId: string, exerciseId: string): Promise<void> {
    await this.prisma.exerciseRating.delete({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId,
        },
      },
    });
  }

  async getAverageRating(exerciseId: string): Promise<number> {
    const result = await this.prisma.exerciseRating.aggregate({
      where: { exerciseId },
      _avg: {
        rating: true,
      },
    });

    return result._avg.rating || 0;
  }

  async countRatingsByExercise(exerciseId: string): Promise<number> {
    return this.prisma.exerciseRating.count({
      where: { exerciseId },
    });
  }

  private mapToDomain(prismaExerciseRating: any): ExerciseRating {
    return new ExerciseRating({
      id: prismaExerciseRating.id,
      userId: prismaExerciseRating.userId,
      exerciseId: prismaExerciseRating.exerciseId,
      rating: prismaExerciseRating.rating,
      comment: prismaExerciseRating.comment,
      createdAt: prismaExerciseRating.createdAt,
      updatedAt: prismaExerciseRating.updatedAt,
    });
  }
}
