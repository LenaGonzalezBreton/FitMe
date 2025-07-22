import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Program } from '../../domain/program.entity';
import { IProgramRepository } from '../../domain/program.repository';
import { PROGRAM_REPOSITORY_TOKEN } from '../../tokens';

export interface GetProgramByIdRequest {
  programId: string;
  userId: string;
}

@Injectable()
export class GetProgramByIdUseCase {
  constructor(
    @Inject(PROGRAM_REPOSITORY_TOKEN)
    private readonly programRepository: IProgramRepository,
  ) {}

  async execute(request: GetProgramByIdRequest): Promise<Program> {
    const program = await this.programRepository.findById(request.programId);

    if (!program) {
      throw new NotFoundException(
        `Program with id ${request.programId} not found`,
      );
    }

    // Check if user owns this program (unless it's a template)
    if (!program.isTemplate && program.userId !== request.userId) {
      throw new ForbiddenException('You can only access your own programs');
    }

    return program;
  }
}
