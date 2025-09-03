import { Injectable, Inject } from '@nestjs/common';
import { Program } from '../../domain/program.entity';
import { IProgramRepository } from '../../domain/program.repository';
import { PROGRAM_REPOSITORY_TOKEN } from '../../tokens';

export interface GetTemplateProgramsRequest {
  filters?: {
    limit?: number;
    offset?: number;
  };
}

export interface GetTemplateProgramsResponse {
  programs: Program[];
  total: number;
  offset: number;
  limit: number;
}

@Injectable()
export class GetTemplateProgramsUseCase {
  constructor(
    @Inject(PROGRAM_REPOSITORY_TOKEN)
    private readonly programRepository: IProgramRepository,
  ) {}

  async execute(
    request: GetTemplateProgramsRequest = {},
  ): Promise<GetTemplateProgramsResponse> {
    const filters = {
      limit: request.filters?.limit || 20,
      offset: request.filters?.offset || 0,
    };

    console.log('[GetTemplatePrograms] Fetching template programs with filters:', filters);

    // Get template programs
    const programs = await this.programRepository.findTemplates(filters);
    
    console.log(`[GetTemplatePrograms] Found ${programs.length} template programs`);
    programs.forEach((program, index) => {
      console.log(`[GetTemplatePrograms] Program ${index + 1}: ${program.title} (${program.exercises?.length || 0} exercises)`);
    });

    // Get total count for pagination
    const total = await this.programRepository.countTemplates();

    console.log(`[GetTemplatePrograms] Total template programs available: ${total}`);

    return {
      programs,
      total,
      offset: filters.offset,
      limit: filters.limit,
    };
  }
}