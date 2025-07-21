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

export interface UpdateProgramRequest {
  programId: string;
  userId: string;
  title?: string;
  goal?: string;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  isTemplate?: boolean;
}

@Injectable()
export class UpdateProgramUseCase {
  constructor(
    @Inject(PROGRAM_REPOSITORY_TOKEN)
    private readonly programRepository: IProgramRepository,
  ) {}

  async execute(request: UpdateProgramRequest): Promise<Program> {
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
      throw new ForbiddenException('You can only update your own programs');
    }

    // Validate business rules
    const startDate = request.startDate || existingProgram.startDate;
    const endDate =
      request.endDate !== undefined ? request.endDate : existingProgram.endDate;

    if (endDate && endDate <= startDate) {
      throw new ConflictException('End date must be after start date');
    }

    // Prepare update data
    const updateData: Partial<Program> = {};

    if (request.title !== undefined) updateData.title = request.title;
    if (request.goal !== undefined) updateData.goal = request.goal;
    if (request.startDate !== undefined)
      updateData.startDate = request.startDate;
    if (request.endDate !== undefined) updateData.endDate = request.endDate;
    if (request.isActive !== undefined) updateData.isActive = request.isActive;
    if (request.isTemplate !== undefined)
      updateData.isTemplate = request.isTemplate;

    // Update the program
    const updatedProgram = await this.programRepository.update(
      request.programId,
      updateData,
    );

    return updatedProgram;
  }
}
