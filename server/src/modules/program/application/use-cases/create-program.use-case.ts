import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { Program } from '../../domain/program.entity';
import { IProgramRepository } from '../../domain/program.repository';
import { PROGRAM_REPOSITORY_TOKEN } from '../../tokens';

export interface CreateProgramRequest {
  userId: string;
  title: string;
  goal?: string;
  startDate: Date;
  endDate?: Date;
  isTemplate?: boolean;
  exercises?: Array<{
    exerciseId: string;
    order: number;
    sets?: number;
    reps?: string;
    duration?: number;
    restTime?: number;
    notes?: string;
  }>;
}

@Injectable()
export class CreateProgramUseCase {
  constructor(
    @Inject(PROGRAM_REPOSITORY_TOKEN)
    private readonly programRepository: IProgramRepository,
  ) {}

  async execute(request: CreateProgramRequest): Promise<Program> {
    // Validate business rules
    if (request.endDate && request.endDate <= request.startDate) {
      throw new ConflictException('End date must be after start date');
    }

    // Check if user already has an active program (if this one is set as active)
    const existingActiveProgram =
      await this.programRepository.findActiveByUserId(request.userId);

    // Create program entity
    const program = Program.create({
      userId: request.userId,
      title: request.title,
      goal: request.goal,
      startDate: request.startDate,
      endDate: request.endDate,
      isTemplate: request.isTemplate,
      exercises: request.exercises?.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        order: exercise.order,
        sets: exercise.sets,
        reps: exercise.reps,
        duration: exercise.duration,
        restTime: exercise.restTime,
        notes: exercise.notes,
      })),
    });

    // Save to repository
    const createdProgram = await this.programRepository.create(program);

    return createdProgram;
  }
}
