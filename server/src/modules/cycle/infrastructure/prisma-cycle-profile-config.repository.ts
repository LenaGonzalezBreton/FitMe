import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';
import {
  ICycleProfileConfigRepository,
  CreateCycleProfileConfigData,
  UpdateCycleProfileConfigData,
} from '../domain/cycle.repository';
import { CycleProfileConfig } from '../domain/cycle.entity';
import { CycleProfileConfig as PrismaCycleProfileConfig } from '../../../../generated/prisma';

@Injectable()
export class PrismaCycleProfileConfigRepository
  implements ICycleProfileConfigRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<CycleProfileConfig | null> {
    const prismaData = await this.prisma.cycleProfileConfig.findUnique({
      where: { userId },
    });

    return prismaData ? this.toDomainEntity(prismaData) : null;
  }

  async create(
    configData: CreateCycleProfileConfigData,
  ): Promise<CycleProfileConfig> {
    const prismaData = await this.prisma.cycleProfileConfig.create({
      data: {
        userId: configData.userId,
        isCycleTrackingEnabled: configData.isCycleTrackingEnabled ?? true,
        usesExternalProvider: configData.usesExternalProvider ?? false,
        useMenopauseMode: configData.useMenopauseMode ?? false,
        averageCycleLength: configData.averageCycleLength ?? 28,
        averagePeriodLength: configData.averagePeriodLength ?? 5,
        prefersManualInput: configData.prefersManualInput ?? false,
      },
    });

    return this.toDomainEntity(prismaData);
  }

  async update(
    userId: string,
    updateData: UpdateCycleProfileConfigData,
  ): Promise<CycleProfileConfig> {
    const prismaData = await this.prisma.cycleProfileConfig.update({
      where: { userId },
      data: {
        isCycleTrackingEnabled: updateData.isCycleTrackingEnabled,
        usesExternalProvider: updateData.usesExternalProvider,
        useMenopauseMode: updateData.useMenopauseMode,
        averageCycleLength: updateData.averageCycleLength,
        averagePeriodLength: updateData.averagePeriodLength,
        prefersManualInput: updateData.prefersManualInput,
      },
    });

    return this.toDomainEntity(prismaData);
  }

  private toDomainEntity(
    prismaData: PrismaCycleProfileConfig,
  ): CycleProfileConfig {
    return new CycleProfileConfig(
      prismaData.id,
      prismaData.userId,
      prismaData.isCycleTrackingEnabled,
      prismaData.usesExternalProvider,
      prismaData.useMenopauseMode,
      prismaData.averageCycleLength ?? 28,
      prismaData.averagePeriodLength ?? 5,
      prismaData.prefersManualInput,
      prismaData.createdAt,
      prismaData.updatedAt,
    );
  }
}
