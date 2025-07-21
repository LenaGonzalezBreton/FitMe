import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { CycleModule } from '../cycle/cycle.module';
import { ExerciseModule } from '../exercise/exercise.module';

// Application Use Cases
import { GenerateProgramByPhaseUseCase } from './application/use-cases/generate-program-by-phase.use-case';

// Controller
import { ProgramController } from './controller/program.controller';

@Module({
  imports: [CoreModule, CycleModule, ExerciseModule],
  controllers: [ProgramController],
  providers: [GenerateProgramByPhaseUseCase],
  exports: [GenerateProgramByPhaseUseCase],
})
export class ProgramModule {}
