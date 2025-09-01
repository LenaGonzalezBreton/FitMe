import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';
import {
  IPhaseExerciseRepository,
  CreatePhaseExerciseData,
} from '../domain/exercise.repository';
import { PhaseExercise } from '../domain/exercise.entity';
import {
  PhaseExercise as PrismaPhaseExercise,
  CyclePhase as PrismaCyclePhase,
} from '../../../../generated/prisma';

@Injectable()
export class PrismaPhaseExerciseRepository implements IPhaseExerciseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByPhaseName(phaseName: string): Promise<PhaseExercise[]> {
    const prismaData = await this.prisma.phaseExercise.findMany({
      where: {
        phaseName: phaseName as PrismaCyclePhase,
      },
      orderBy: { createdAt: 'asc' },
    });

    return prismaData.map((data) => this.toDomainEntity(data));
  }

  async create(
    phaseExerciseData: CreatePhaseExerciseData,
  ): Promise<PhaseExercise> {
    const prismaData = await this.prisma.phaseExercise.create({
      data: {
        phaseName: phaseExerciseData.phaseName as PrismaCyclePhase,
        exerciseId: phaseExerciseData.exerciseId,
      },
    });

    return this.toDomainEntity(prismaData);
  }

  async delete(phaseExerciseId: string): Promise<void> {
    await this.prisma.phaseExercise.delete({
      where: { id: phaseExerciseId },
    });
  }

  private toDomainEntity(prismaData: PrismaPhaseExercise): PhaseExercise {
    return new PhaseExercise(
      prismaData.id,
      prismaData.phaseName,
      prismaData.exerciseId,
      prismaData.createdAt,
    );
  }
}
