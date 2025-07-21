import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IProgramRepository } from '../../domain/program.repository';
import { PROGRAM_REPOSITORY_TOKEN } from '../../tokens';

export interface GetProgramStatusRequest {
  programId: string;
  userId: string;
}

export interface ProgramStatus {
  id: string;
  title: string;
  isActive: boolean;
  isExpired: boolean;
  isTemplate: boolean;
  startDate: Date;
  endDate?: Date;
  durationInDays: number;
  daysRemaining?: number;
  completionPercentage: number;
}

@Injectable()
export class GetProgramStatusUseCase {
  constructor(
    @Inject(PROGRAM_REPOSITORY_TOKEN)
    private readonly programRepository: IProgramRepository,
  ) {}

  async execute(request: GetProgramStatusRequest): Promise<ProgramStatus> {
    const program = await this.programRepository.findById(request.programId);

    if (!program) {
      throw new NotFoundException(
        `Program with id ${request.programId} not found`,
      );
    }

    // Check ownership
    if (!program.isTemplate && program.userId !== request.userId) {
      throw new ForbiddenException(
        'You can only view status of your own programs',
      );
    }

    const now = new Date();
    const durationInDays = program.getDurationInDays();
    let daysRemaining: number | undefined;
    let completionPercentage = 0;

    if (program.endDate) {
      daysRemaining = Math.max(
        0,
        Math.ceil(
          (program.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        ),
      );

      // Calculate completion percentage based on time elapsed
      const totalDays = Math.ceil(
        (program.endDate.getTime() - program.startDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      const elapsedDays = Math.ceil(
        (now.getTime() - program.startDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      completionPercentage = Math.min(
        100,
        Math.max(0, (elapsedDays / totalDays) * 100),
      );
    }

    return {
      id: program.id!,
      title: program.title,
      isActive: program.isActive || false,
      isExpired: program.isExpired(),
      isTemplate: program.isTemplate || false,
      startDate: program.startDate,
      endDate: program.endDate,
      durationInDays,
      daysRemaining,
      completionPercentage: Math.round(completionPercentage),
    };
  }
}
