import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';

// Application Use Cases
import { GetCurrentPhaseUseCase } from './application/use-cases/get-current-phase.use-case';

// Infrastructure Repositories
import { PrismaCycleRepository } from './infrastructure/prisma-cycle.repository';
import { PrismaCycleProfileConfigRepository } from './infrastructure/prisma-cycle-profile-config.repository';

// Controller
import { CycleController } from './controller/cycle.controller';

// Tokens for DI
import {
  CYCLE_REPOSITORY_TOKEN,
  CYCLE_PROFILE_CONFIG_REPOSITORY_TOKEN,
} from './tokens';

@Module({
  imports: [CoreModule],
  controllers: [CycleController],
  providers: [
    // Use Cases
    GetCurrentPhaseUseCase,

    // Repository Implementations
    {
      provide: CYCLE_REPOSITORY_TOKEN,
      useClass: PrismaCycleRepository,
    },
    {
      provide: CYCLE_PROFILE_CONFIG_REPOSITORY_TOKEN,
      useClass: PrismaCycleProfileConfigRepository,
    },
  ],
  exports: [
    GetCurrentPhaseUseCase,
    CYCLE_REPOSITORY_TOKEN,
    CYCLE_PROFILE_CONFIG_REPOSITORY_TOKEN,
  ],
})
export class CycleModule {}
