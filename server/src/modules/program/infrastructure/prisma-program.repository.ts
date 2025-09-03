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
    console.log('[PrismaProgramRepository] Creating program:', {
      title: program.title,
      userId: program.userId,
      exercisesCount: program.exercises?.length || 0
    });

    if (program.exercises && program.exercises.length > 0) {
      console.log('[PrismaProgramRepository] Program exercises to create:', 
        program.exercises.map(ex => ({
          exerciseId: ex.exerciseId,
          order: ex.order,
          sets: ex.sets,
          duration: ex.duration,
          restTime: ex.restTime
        }))
      );
    } else {
      console.log('[PrismaProgramRepository] ⚠️  No exercises provided for program');
    }

    const data = {
      userId: program.userId,
      title: program.title,
      goal: program.goal,
      startDate: program.startDate,
      endDate: program.endDate,
      isActive: program.isActive,
      isTemplate: program.isTemplate,
      type: program.type,
      trainingDays: program.trainingDays,
      duration: program.duration,
      focusZone: program.focusZone,
      cyclePhase: program.cyclePhase,
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

    console.log('[PrismaProgramRepository] Prisma create data:', {
      ...data,
      programExercises: data.programExercises ? 'INCLUDED' : 'NOT_INCLUDED'
    });

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

    console.log('[PrismaProgramRepository] Program created in database:', {
      id: createdProgram.id,
      title: createdProgram.title,
      programExercisesCount: createdProgram.programExercises?.length || 0,
      programExercises: createdProgram.programExercises?.map(pe => ({
        id: pe.id,
        exerciseId: pe.exerciseId,
        order: pe.order,
        exerciseTitle: pe.exercise?.title
      }))
    });

    const domainEntity = this.mapToDomain(createdProgram);
    
    console.log('[PrismaProgramRepository] Mapped to domain entity:', {
      id: domainEntity.id,
      title: domainEntity.title,
      exercisesCount: domainEntity.exercises?.length || 0
    });

    return domainEntity;
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
      take: filters?.limit ? Number(filters.limit) : undefined,
      skip: filters?.offset ? Number(filters.offset) : undefined,
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
    if (programData.type !== undefined) {
      updateData.type = programData.type;
    }
    if (programData.trainingDays !== undefined) {
      updateData.trainingDays = programData.trainingDays;
    }
    if (programData.duration !== undefined) {
      updateData.duration = programData.duration;
    }
    if (programData.focusZone !== undefined) {
      updateData.focusZone = programData.focusZone;
    }
    if (programData.cyclePhase !== undefined) {
      updateData.cyclePhase = programData.cyclePhase;
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

  async findTemplates(filters?: {
    limit?: number;
    offset?: number;
  }): Promise<Program[]> {
    const programs = await this.prisma.program.findMany({
      where: {
        isTemplate: true,
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
      orderBy: {
        createdAt: 'desc',
      },
      take: filters?.limit ? Number(filters.limit) : undefined,
      skip: filters?.offset ? Number(filters.offset) : undefined,
    });

    return programs.map(this.mapToDomain);
  }

  async countTemplates(): Promise<number> {
    return this.prisma.program.count({
      where: { isTemplate: true },
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
      type: prismaProgram.type,
      trainingDays: prismaProgram.trainingDays,
      duration: prismaProgram.duration,
      focusZone: prismaProgram.focusZone,
      cyclePhase: prismaProgram.cyclePhase,
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
        // Include exercise details from joined exercise table
        title: pe.exercise?.title || `Exercice ${pe.order}`,
        description: pe.exercise?.description || '',
        muscleZone: pe.exercise?.muscleZone,
        intensity: pe.exercise?.intensity,
        equipment: pe.exercise?.equipment,
        exerciseTitle: pe.exercise?.title || `Exercice ${pe.order}`, // For backward compatibility
      })),
    });
  }
}
