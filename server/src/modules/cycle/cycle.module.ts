import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';

// Application Use Cases
import { GetCurrentCycleUseCase } from './application/use-cases/get-current-cycle.use-case';
import { GetCycleConfigUseCase } from './application/use-cases/get-cycle-config.use-case';
import { UpdateCycleConfigUseCase } from './application/use-cases/update-cycle-config.use-case';
import { LogPeriodUseCase } from './application/use-cases/log-period.use-case';
import { GetPeriodsHistoryUseCase } from './application/use-cases/get-periods-history.use-case';
import { GetCyclePredictionsUseCase } from './application/use-cases/get-cycle-predictions.use-case';
import { GetCycleCalendarUseCase } from './application/use-cases/get-cycle-calendar.use-case';
import { GetCycleComparisonUseCase } from './application/use-cases/get-cycle-comparison.use-case';
import { LogSymptomsUseCase } from './application/use-cases/log-symptoms.use-case';
import { GetSymptomsHistoryUseCase } from './application/use-cases/get-symptoms-history.use-case';

// Infrastructure Repositories
import { PrismaCycleRepository } from './infrastructure/prisma-cycle.repository';
import { PrismaCycleProfileConfigRepository } from './infrastructure/prisma-cycle-profile-config.repository';
import { PrismaSymptomLogRepository } from './infrastructure/prisma-symptom-log.repository';

// Controller
import { CycleController } from './controller/cycle.controller';

// Tokens for DI
import {
  CYCLE_REPOSITORY_TOKEN,
  CYCLE_PROFILE_CONFIG_REPOSITORY_TOKEN,
  SYMPTOM_LOG_REPOSITORY_TOKEN,
} from './tokens';

@Module({
  imports: [CoreModule],
  controllers: [CycleController],
  providers: [
    // Use Cases
    GetCurrentCycleUseCase,
    GetCycleConfigUseCase,
    UpdateCycleConfigUseCase,
    LogPeriodUseCase,
    GetPeriodsHistoryUseCase,
    GetCyclePredictionsUseCase,
    GetCycleCalendarUseCase,
    GetCycleComparisonUseCase,
    LogSymptomsUseCase,
    GetSymptomsHistoryUseCase,

    // Repository Implementations
    {
      provide: CYCLE_REPOSITORY_TOKEN,
      useClass: PrismaCycleRepository,
    },
    {
      provide: CYCLE_PROFILE_CONFIG_REPOSITORY_TOKEN,
      useClass: PrismaCycleProfileConfigRepository,
    },
    {
      provide: SYMPTOM_LOG_REPOSITORY_TOKEN,
      useClass: PrismaSymptomLogRepository,
    },
  ],
  exports: [
    GetCurrentCycleUseCase,
    GetCycleConfigUseCase,
    UpdateCycleConfigUseCase,
    LogPeriodUseCase,
    GetPeriodsHistoryUseCase,
    GetCyclePredictionsUseCase,
    GetCycleCalendarUseCase,
    GetCycleComparisonUseCase,
    LogSymptomsUseCase,
    GetSymptomsHistoryUseCase,
    CYCLE_REPOSITORY_TOKEN,
    CYCLE_PROFILE_CONFIG_REPOSITORY_TOKEN,
    SYMPTOM_LOG_REPOSITORY_TOKEN,
  ],
})
export class CycleModule {}
