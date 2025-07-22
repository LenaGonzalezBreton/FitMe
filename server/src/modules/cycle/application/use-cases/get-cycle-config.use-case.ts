import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CycleProfileConfig } from '../../domain/cycle.entity';
import { ICycleProfileConfigRepository } from '../../domain/cycle.repository';
import { CYCLE_PROFILE_CONFIG_REPOSITORY_TOKEN } from '../../tokens';

export interface GetCycleConfigRequest {
  userId: string;
}

export interface GetCycleConfigResponse {
  config: CycleProfileConfig;
}

@Injectable()
export class GetCycleConfigUseCase {
  constructor(
    @Inject(CYCLE_PROFILE_CONFIG_REPOSITORY_TOKEN)
    private readonly cycleProfileConfigRepository: ICycleProfileConfigRepository,
  ) {}

  async execute(
    request: GetCycleConfigRequest,
  ): Promise<GetCycleConfigResponse> {
    const config = await this.cycleProfileConfigRepository.findByUserId(
      request.userId,
    );

    if (!config) {
      throw new NotFoundException(
        'Configuration du cycle non trouvée. Veuillez créer votre profil cycle.',
      );
    }

    return { config };
  }
}
