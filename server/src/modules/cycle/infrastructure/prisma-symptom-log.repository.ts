import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';
import {
  ISymptomLogRepository,
  CreateSymptomLogData,
  UpdateSymptomLogData,
  SymptomLogFilters,
  SymptomLogEntity,
} from '../domain/symptom-log.repository';
import { SymptomLog as PrismaSymptomLog } from '@prisma/client';

@Injectable()
export class PrismaSymptomLogRepository implements ISymptomLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(symptomData: CreateSymptomLogData): Promise<SymptomLogEntity> {
    const prismaData = await this.prisma.symptomLog.create({
      data: {
        userId: symptomData.userId,
        date: symptomData.date,
        symptomType: symptomData.symptomType,
        value: symptomData.value,
      },
    });

    return this.toDomainEntity(prismaData);
  }

  async findByUserId(
    userId: string,
    filters?: SymptomLogFilters,
  ): Promise<SymptomLogEntity[]> {
    const where: any = { userId };

    if (filters?.fromDate || filters?.toDate) {
      where.date = {};
      if (filters.fromDate) {
        where.date.gte = filters.fromDate;
      }
      if (filters.toDate) {
        where.date.lte = filters.toDate;
      }
    }

    if (filters?.symptomType) {
      where.symptomType = filters.symptomType;
    }

    const prismaData = await this.prisma.symptomLog.findMany({
      where,
      orderBy: { date: 'desc' },
      take: filters?.limit,
      skip: filters?.offset,
    });

    return prismaData.map((data) => this.toDomainEntity(data));
  }

  async findByUserIdAndDate(
    userId: string,
    date: Date,
  ): Promise<SymptomLogEntity[]> {
    // Créer la plage de dates pour le jour entier
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const prismaData = await this.prisma.symptomLog.findMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { symptomType: 'asc' },
    });

    return prismaData.map((data) => this.toDomainEntity(data));
  }

  async update(
    symptomId: string,
    updateData: UpdateSymptomLogData,
  ): Promise<SymptomLogEntity> {
    const prismaData = await this.prisma.symptomLog.update({
      where: { id: symptomId },
      data: {
        date: updateData.date,
        symptomType: updateData.symptomType,
        value: updateData.value,
      },
    });

    return this.toDomainEntity(prismaData);
  }

  async delete(symptomId: string): Promise<void> {
    await this.prisma.symptomLog.delete({
      where: { id: symptomId },
    });
  }

  async deleteByUserIdAndDate(userId: string, date: Date): Promise<void> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    await this.prisma.symptomLog.deleteMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
  }

  private toDomainEntity(prismaData: PrismaSymptomLog): SymptomLogEntity {
    return {
      id: prismaData.id,
      userId: prismaData.userId,
      date: prismaData.date,
      symptomType: prismaData.symptomType,
      value: prismaData.value,
      createdAt: prismaData.createdAt,
      updatedAt: prismaData.updatedAt,
    };
  }
}
