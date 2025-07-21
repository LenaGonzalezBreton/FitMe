import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';
import { ProgramExercise } from '../domain/program.entity';
import { IProgramExerciseRepository } from '../domain/program.repository';

@Injectable()
export class PrismaProgramExerciseRepository
  implements IProgramExerciseRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(programExercise: ProgramExercise): Promise<ProgramExercise> {
    const created = await this.prisma.programExercise.create({
      data: {
        programId: programExercise.programId!,
        exerciseId: programExercise.exerciseId,
        order: programExercise.order,
        sets: programExercise.sets,
        reps: programExercise.reps,
        duration: programExercise.duration,
        restTime: programExercise.restTime,
        notes: programExercise.notes,
      },
      include: {
        exercise: true,
      },
    });

    return this.mapToDomain(created);
  }

  async findById(id: string): Promise<ProgramExercise | null> {
    const programExercise = await this.prisma.programExercise.findUnique({
      where: { id },
      include: {
        exercise: true,
      },
    });

    return programExercise ? this.mapToDomain(programExercise) : null;
  }

  async findByProgramId(programId: string): Promise<ProgramExercise[]> {
    const programExercises = await this.prisma.programExercise.findMany({
      where: { programId },
      orderBy: { order: 'asc' },
      include: {
        exercise: true,
      },
    });

    return programExercises.map(this.mapToDomain);
  }

  async update(
    id: string,
    programExerciseData: Partial<ProgramExercise>,
  ): Promise<ProgramExercise> {
    const updateData: any = {};

    if (programExerciseData.order !== undefined) {
      updateData.order = programExerciseData.order;
    }
    if (programExerciseData.sets !== undefined) {
      updateData.sets = programExerciseData.sets;
    }
    if (programExerciseData.reps !== undefined) {
      updateData.reps = programExerciseData.reps;
    }
    if (programExerciseData.duration !== undefined) {
      updateData.duration = programExerciseData.duration;
    }
    if (programExerciseData.restTime !== undefined) {
      updateData.restTime = programExerciseData.restTime;
    }
    if (programExerciseData.notes !== undefined) {
      updateData.notes = programExerciseData.notes;
    }

    const updated = await this.prisma.programExercise.update({
      where: { id },
      data: updateData,
      include: {
        exercise: true,
      },
    });

    return this.mapToDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.programExercise.delete({
      where: { id },
    });
  }

  async deleteByProgramId(programId: string): Promise<void> {
    await this.prisma.programExercise.deleteMany({
      where: { programId },
    });
  }

  async reorder(
    programId: string,
    exerciseOrders: { id: string; order: number }[],
  ): Promise<void> {
    // Use transaction to ensure all updates happen atomically
    await this.prisma.$transaction(
      exerciseOrders.map(({ id, order }) =>
        this.prisma.programExercise.update({
          where: { id },
          data: { order },
        }),
      ),
    );
  }

  private mapToDomain(prismaProgramExercise: any): ProgramExercise {
    return new ProgramExercise({
      id: prismaProgramExercise.id,
      programId: prismaProgramExercise.programId,
      exerciseId: prismaProgramExercise.exerciseId,
      order: prismaProgramExercise.order,
      sets: prismaProgramExercise.sets,
      reps: prismaProgramExercise.reps,
      duration: prismaProgramExercise.duration,
      restTime: prismaProgramExercise.restTime,
      notes: prismaProgramExercise.notes,
      createdAt: prismaProgramExercise.createdAt,
      updatedAt: prismaProgramExercise.updatedAt,
    });
  }
}
