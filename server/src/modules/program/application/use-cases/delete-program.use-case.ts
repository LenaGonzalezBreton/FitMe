import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IProgramRepository } from '../../domain/program.repository';
import { PROGRAM_REPOSITORY_TOKEN } from '../../tokens';

export interface DeleteProgramRequest {
  programId: string;
  userId: string;
}

@Injectable()
export class DeleteProgramUseCase {
  constructor(
    @Inject(PROGRAM_REPOSITORY_TOKEN)
    private readonly programRepository: IProgramRepository,
  ) {}

  async execute(request: DeleteProgramRequest): Promise<void> {
    // Check if program exists
    const existingProgram = await this.programRepository.findById(
      request.programId,
    );

    if (!existingProgram) {
      throw new NotFoundException(
        `Program with id ${request.programId} not found`,
      );
    }

    // Check ownership
    if (existingProgram.userId !== request.userId) {
      throw new ForbiddenException('You can only delete your own programs');
    }

    // Delete the program (cascade will handle program exercises)
    await this.programRepository.delete(request.programId);
  }
}
