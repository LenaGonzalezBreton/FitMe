import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { Program } from '../../domain/program.entity';
import { IProgramRepository } from '../../domain/program.repository';
import { PROGRAM_REPOSITORY_TOKEN } from '../../tokens';

export interface StartProgramRequest {
  programId: string;
  userId: string;
}

@Injectable()
export class StartProgramUseCase {
  constructor(
    @Inject(PROGRAM_REPOSITORY_TOKEN)
    private readonly programRepository: IProgramRepository,
  ) {}

  async execute(request: StartProgramRequest): Promise<Program> {
    // Check if program exists
    const program = await this.programRepository.findById(request.programId);

    if (!program) {
      throw new NotFoundException(
        `Program with id ${request.programId} not found`,
      );
    }

    // Check ownership (templates can be started by anyone)
    if (!program.isTemplate && program.userId !== request.userId) {
      throw new ForbiddenException(
        'You can only start your own programs or templates',
      );
    }

    // Check if program is already active
    if (program.isActive) {
      throw new ConflictException('Program is already active');
    }

    // Check if program is expired
    if (program.isExpired()) {
      throw new ConflictException('Cannot start an expired program');
    }

    // If starting a template, create a copy for the user
    if (program.isTemplate && program.userId !== request.userId) {
      const newProgram = Program.create({
        userId: request.userId,
        title: `${program.title} (Copy)`,
        goal: program.goal,
        startDate: new Date(),
        endDate: program.endDate
          ? new Date(
              Date.now() +
                (program.endDate.getTime() - program.startDate.getTime()),
            )
          : undefined,
        isTemplate: false,
        exercises: program.exercises,
      });

      const createdProgram = await this.programRepository.create(newProgram);
      return this.programRepository.update(createdProgram.id!, {
        isActive: true,
      });
    }

    // Activate the program (this will deactivate other active programs)
    const activatedProgram = await this.programRepository.update(
      request.programId,
      {
        isActive: true,
      },
    );

    return activatedProgram;
  }
}
