import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';
import { Program } from '../domain/program.entity';
import {
  IProgramRepository,
  ProgramFilters,
} from '../domain/program.repository';

@Injectable()
export class PrismaProgramRepository implements IProgramRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(program: Program): Promise<Program> {
    const data = {
      userId: program.userId,
      title: program.title,
      goal: program.goal,
      startDate: program.startDate,
      endDate: program.endDate,
      ...(program.exercises &&
        program.exercises.length > 0 && {
          programExercises: {
            create: program.exercises.map((exercise) => ({
              exerciseId: exercise.exerciseId,
              order: exercise.order,
              sets: exercise.sets,
              reps: exercise.reps,
              duration: exercise.duration,
              restTime: exercise.restTime,
              notes: exercise.notes,
            })),
          },
        }),
    };

    const createdProgram = await this.prisma.program.create({
      data,
      include: {
        programExercises: {
          orderBy: {
            order: 'asc',
          },
          include: {
            exercise: true,
          },
        },
      },
    });

    return this.mapToDomain(createdProgram);
  }

  async findById(id: string): Promise<Program | null> {
    const program = await this.prisma.program.findUnique({
      where: { id },
      include: {
        programExercises: {
          orderBy: {
            order: 'asc',
          },
          include: {
            exercise: true,
          },
        },
      },
    });

    return program ? this.mapToDomain(program) : null;
  }

  async findByUserId(
    userId: string,
    filters?: ProgramFilters,
  ): Promise<Program[]> {
    const where: any = {
      userId,
    };

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.isTemplate !== undefined) {
      where.isTemplate = filters.isTemplate;
    }

    if (filters?.startDateFrom) {
      where.startDate = {
        ...where.startDate,
        gte: filters.startDateFrom,
      };
    }

    if (filters?.startDateTo) {
      where.startDate = {
        ...where.startDate,
        lte: filters.startDateTo,
      };
    }

    const programs = await this.prisma.program.findMany({
      where,
      include: {
        programExercises: {
          orderBy: {
            order: 'asc',
          },
          include: {
            exercise: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: filters?.limit,
      skip: filters?.offset,
    });

    return programs.map(this.mapToDomain);
  }

  async findActiveByUserId(userId: string): Promise<Program | null> {
    const program = await this.prisma.program.findFirst({
      where: {
        userId,
        isActive: true,
      },
      include: {
        programExercises: {
          orderBy: {
            order: 'asc',
          },
          include: {
            exercise: true,
          },
        },
      },
    });

    return program ? this.mapToDomain(program) : null;
  }

  async update(id: string, programData: Partial<Program>): Promise<Program> {
    const updateData: any = {};

    if (programData.title !== undefined) {
      updateData.title = programData.title;
    }
    if (programData.goal !== undefined) {
      updateData.goal = programData.goal;
    }
    if (programData.startDate !== undefined) {
      updateData.startDate = programData.startDate;
    }
    if (programData.endDate !== undefined) {
      updateData.endDate = programData.endDate;
    }
    if (programData.isActive !== undefined) {
      updateData.isActive = programData.isActive;
    }
    if (programData.isTemplate !== undefined) {
      updateData.isTemplate = programData.isTemplate;
    }

    // If updating to active, deactivate all other programs for this user
    if (programData.isActive === true) {
      const existingProgram = await this.prisma.program.findUnique({
        where: { id },
      });

      if (existingProgram) {
        await this.prisma.program.updateMany({
          where: {
            userId: existingProgram.userId,
            isActive: true,
            id: { not: id },
          },
          data: {
            isActive: false,
          },
        });
      }
    }

    const updatedProgram = await this.prisma.program.update({
      where: { id },
      data: updateData,
      include: {
        programExercises: {
          orderBy: {
            order: 'asc',
          },
          include: {
            exercise: true,
          },
        },
      },
    });

    return this.mapToDomain(updatedProgram);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.program.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.program.count({
      where: { id },
    });
    return count > 0;
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.program.count({
      where: { userId },
    });
  }

  private mapToDomain(prismaProgram: any): Program {
    return new Program({
      id: prismaProgram.id,
      userId: prismaProgram.userId,
      title: prismaProgram.title,
      goal: prismaProgram.goal,
      startDate: prismaProgram.startDate,
      endDate: prismaProgram.endDate,
      isActive: prismaProgram.isActive,
      isTemplate: prismaProgram.isTemplate,
      createdAt: prismaProgram.createdAt,
      updatedAt: prismaProgram.updatedAt,
      exercises: prismaProgram.programExercises?.map((pe: any) => ({
        id: pe.id,
        programId: pe.programId,
        exerciseId: pe.exerciseId,
        order: pe.order,
        sets: pe.sets,
        reps: pe.reps,
        duration: pe.duration,
        restTime: pe.restTime,
        notes: pe.notes,
        createdAt: pe.createdAt,
        updatedAt: pe.updatedAt,
      })),
    });
  }
}
