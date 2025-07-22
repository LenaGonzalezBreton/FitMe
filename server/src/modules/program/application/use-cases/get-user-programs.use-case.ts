import { Injectable, Inject } from '@nestjs/common';
import { Program } from '../../domain/program.entity';
import {
  IProgramRepository,
  ProgramFilters,
} from '../../domain/program.repository';
import { PROGRAM_REPOSITORY_TOKEN } from '../../tokens';

export interface GetUserProgramsRequest {
  userId: string;
  filters?: {
    isActive?: boolean;
    isTemplate?: boolean;
    startDateFrom?: Date;
    startDateTo?: Date;
    limit?: number;
    offset?: number;
  };
}

export interface GetUserProgramsResponse {
  programs: Program[];
  total: number;
  offset: number;
  limit: number;
}

@Injectable()
export class GetUserProgramsUseCase {
  constructor(
    @Inject(PROGRAM_REPOSITORY_TOKEN)
    private readonly programRepository: IProgramRepository,
  ) {}

  async execute(
    request: GetUserProgramsRequest,
  ): Promise<GetUserProgramsResponse> {
    const filters: ProgramFilters = {
      userId: request.userId,
      ...request.filters,
      limit: request.filters?.limit || 20,
      offset: request.filters?.offset || 0,
    };

    // Get programs with filters
    const programs = await this.programRepository.findByUserId(
      request.userId,
      filters,
    );

    // Get total count for pagination
    const total = await this.programRepository.countByUserId(request.userId);

    return {
      programs,
      total,
      offset: filters.offset || 0,
      limit: filters.limit || 20,
    };
  }
}
