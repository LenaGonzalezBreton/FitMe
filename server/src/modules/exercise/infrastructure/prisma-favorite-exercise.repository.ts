/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/unbound-method */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';
import { FavoriteExercise } from '../domain/exercise.entity';
import { IFavoriteExerciseRepository } from '../domain/exercise.repository';

@Injectable()
export class PrismaFavoriteExerciseRepository
  implements IFavoriteExerciseRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<FavoriteExercise[]> {
    const favorites = await this.prisma.favoriteExercise.findMany({
      where: { userId },
      include: {
        exercise: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return favorites.map(this.mapToDomain);
  }

  async findByUserAndExercise(
    userId: string,
    exerciseId: string,
  ): Promise<FavoriteExercise | null> {
    const favorite = await this.prisma.favoriteExercise.findUnique({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId,
        },
      },
      include: {
        exercise: true,
      },
    });

    return favorite ? this.mapToDomain(favorite) : null;
  }

  async create(userId: string, exerciseId: string): Promise<FavoriteExercise> {
    const created = await this.prisma.favoriteExercise.create({
      data: {
        userId,
        exerciseId,
      },
      include: {
        exercise: true,
      },
    });

    return this.mapToDomain(created);
  }

  async delete(userId: string, exerciseId: string): Promise<void> {
    await this.prisma.favoriteExercise.delete({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId,
        },
      },
    });
  }

  async exists(userId: string, exerciseId: string): Promise<boolean> {
    const count = await this.prisma.favoriteExercise.count({
      where: {
        userId,
        exerciseId,
      },
    });

    return count > 0;
  }

  private mapToDomain(prismaFavoriteExercise: any): FavoriteExercise {
    return new FavoriteExercise({
      id: prismaFavoriteExercise.id,
      userId: prismaFavoriteExercise.userId,
      exerciseId: prismaFavoriteExercise.exerciseId,
      createdAt: prismaFavoriteExercise.createdAt,
    });
  }
}
