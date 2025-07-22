import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { CycleModule } from '../cycle/cycle.module';
import { ExerciseModule } from '../exercise/exercise.module';

// Application Use Cases
import { GenerateProgramByPhaseUseCase } from './application/use-cases/generate-program-by-phase.use-case';
import { CreateProgramUseCase } from './application/use-cases/create-program.use-case';
import { GetUserProgramsUseCase } from './application/use-cases/get-user-programs.use-case';
import { GetProgramByIdUseCase } from './application/use-cases/get-program-by-id.use-case';
import { UpdateProgramUseCase } from './application/use-cases/update-program.use-case';
import { DeleteProgramUseCase } from './application/use-cases/delete-program.use-case';
import { StartProgramUseCase } from './application/use-cases/start-program.use-case';
import { GetProgramStatusUseCase } from './application/use-cases/get-program-status.use-case';

// Infrastructure
import { PrismaProgramRepository } from './infrastructure/prisma-program.repository';
import { PrismaProgramExerciseRepository } from './infrastructure/prisma-program-exercise.repository';

// Tokens
import {
  PROGRAM_REPOSITORY_TOKEN,
  PROGRAM_EXERCISE_REPOSITORY_TOKEN,
} from './tokens';

// Controller
import { ProgramController } from './controller/program.controller';

@Module({
  imports: [CoreModule, CycleModule, ExerciseModule],
  controllers: [ProgramController],
  providers: [
    // Existing use case
    GenerateProgramByPhaseUseCase,

    // New CRUD use cases
    CreateProgramUseCase,
    GetUserProgramsUseCase,
    GetProgramByIdUseCase,
    UpdateProgramUseCase,
    DeleteProgramUseCase,
    StartProgramUseCase,
    GetProgramStatusUseCase,

    // Repository implementations
    {
      provide: PROGRAM_REPOSITORY_TOKEN,
      useClass: PrismaProgramRepository,
    },
    {
      provide: PROGRAM_EXERCISE_REPOSITORY_TOKEN,
      useClass: PrismaProgramExerciseRepository,
    },
  ],
  exports: [
    GenerateProgramByPhaseUseCase,
    CreateProgramUseCase,
    GetUserProgramsUseCase,
    GetProgramByIdUseCase,
    UpdateProgramUseCase,
    DeleteProgramUseCase,
    StartProgramUseCase,
    GetProgramStatusUseCase,
    PROGRAM_REPOSITORY_TOKEN,
    PROGRAM_EXERCISE_REPOSITORY_TOKEN,
  ],
})
export class ProgramModule {}
