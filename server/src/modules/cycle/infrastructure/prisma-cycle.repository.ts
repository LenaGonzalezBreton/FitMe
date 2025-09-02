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

    // Trouver le cycle le plus récent qui pourrait être actuel
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
      console.log(`No cycles found for user ${userId}`);
      return null;
    }

    const cycle = this.toDomainEntity(prismaData);

    // Debug logging
    const daysSinceStart = Math.floor((currentDate.getTime() - cycle.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const cycleLength = cycle.cycleLength || 28;

    // Vérifier si c'est vraiment le cycle actuel
    if (cycle.isCurrentCycle(currentDate)) {
      console.log(`Returning current cycle for user ${userId}`);
      return cycle;
    }

    // If the most recent cycle is not current, check if we should still use it
    // This handles cases where the user is in a longer cycle than expected
    
    // Handle same-day cycles (when daysSinceStart is 0 or slightly negative due to time differences)
    // Also handle cycles within 1.5x the cycle length for longer cycles
    if (daysSinceStart >= -1 && daysSinceStart <= (cycleLength * 1.5)) {
      return cycle;
    }

    return null;
  }

  async findByUserId(userId: string): Promise<Cycle[]> {
    const prismaData = await this.prisma.cycle.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });

    return prismaData.map((data: any) => this.toDomainEntity(data));
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
