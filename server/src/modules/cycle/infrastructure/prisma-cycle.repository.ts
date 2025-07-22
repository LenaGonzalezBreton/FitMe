import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';
import {
  ICycleRepository,
  CreateCycleData,
  UpdateCycleData,
} from '../domain/cycle.repository';
import { Cycle } from '../domain/cycle.entity';
import { Cycle as PrismaCycle } from '../../../../generated/prisma';

@Injectable()
export class PrismaCycleRepository implements ICycleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findCurrentCycleByUserId(userId: string): Promise<Cycle | null> {
    const currentDate = new Date();

    // Trouver le cycle le plus récent qui inclut la date actuelle
    const prismaData = await this.prisma.cycle.findFirst({
      where: {
        userId,
        startDate: {
          lte: currentDate,
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    if (!prismaData) {
      return null;
    }

    const cycle = this.toDomainEntity(prismaData);

    // Vérifier si c'est vraiment le cycle actuel
    if (cycle.isCurrentCycle(currentDate)) {
      return cycle;
    }

    return null;
  }

  async findByUserId(userId: string): Promise<Cycle[]> {
    const prismaData = await this.prisma.cycle.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });

    return prismaData.map((data) => this.toDomainEntity(data));
  }

  async findById(cycleId: string): Promise<Cycle | null> {
    const prismaData = await this.prisma.cycle.findUnique({
      where: { id: cycleId },
    });

    return prismaData ? this.toDomainEntity(prismaData) : null;
  }

  async create(cycleData: CreateCycleData): Promise<Cycle> {
    const prismaData = await this.prisma.cycle.create({
      data: {
        userId: cycleData.userId,
        startDate: cycleData.startDate,
        cycleLength: cycleData.cycleLength,
        periodLength: cycleData.periodLength,
        isRegular: cycleData.isRegular ?? true,
        providerId: cycleData.providerId,
        externalCycleId: cycleData.externalCycleId,
      },
    });

    return this.toDomainEntity(prismaData);
  }

  async update(cycleId: string, updateData: UpdateCycleData): Promise<Cycle> {
    const prismaData = await this.prisma.cycle.update({
      where: { id: cycleId },
      data: {
        startDate: updateData.startDate,
        cycleLength: updateData.cycleLength,
        periodLength: updateData.periodLength,
        isRegular: updateData.isRegular,
        providerId: updateData.providerId,
        externalCycleId: updateData.externalCycleId,
      },
    });

    return this.toDomainEntity(prismaData);
  }

  async delete(cycleId: string): Promise<void> {
    await this.prisma.cycle.delete({
      where: { id: cycleId },
    });
  }

  private toDomainEntity(prismaData: PrismaCycle): Cycle {
    return new Cycle(
      prismaData.id,
      prismaData.userId,
      prismaData.startDate,
      prismaData.cycleLength ?? undefined,
      prismaData.periodLength ?? undefined,
      prismaData.isRegular,
      prismaData.providerId ?? undefined,
      prismaData.externalCycleId ?? undefined,
      prismaData.createdAt,
      prismaData.updatedAt,
    );
  }
}
