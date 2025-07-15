import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { GetExercisesByPhaseUseCase } from '../application/use-cases/get-exercises-by-phase.use-case';
import { ExerciseQueryDto, ExerciseListResponseDto } from './dto/exercise.dto';
import { CyclePhase } from '../../cycle/domain/cycle.entity';
import { Intensity, MuscleZone } from '../domain/exercise.entity';

@ApiTags('Exercises')
@Controller('exercises')
export class ExerciseController {
  constructor(
    private readonly getExercisesByPhaseUseCase: GetExercisesByPhaseUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Récupérer les exercices par phase de cycle',
    description:
      "Retourne une liste d'exercices adaptés à la phase de cycle spécifiée",
  })
  @ApiQuery({
    name: 'phase',
    enum: CyclePhase,
    required: false,
    description: 'Phase du cycle menstruel',
  })
  @ApiQuery({
    name: 'intensity',
    enum: Intensity,
    required: false,
    description: "Niveau d'intensité souhaité",
  })
  @ApiQuery({
    name: 'muscleZone',
    enum: MuscleZone,
    required: false,
    description: 'Zone musculaire ciblée',
  })
  @ApiQuery({
    name: 'maxDuration',
    type: Number,
    required: false,
    description: 'Durée maximale en minutes',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: "Nombre maximum d'exercices à retourner (défaut: 20)",
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des exercices retournée avec succès',
    type: ExerciseListResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Paramètres invalides',
  })
  async getExercises(
    @Query() query: ExerciseQueryDto,
  ): Promise<ExerciseListResponseDto> {
    try {
      // Utiliser une phase par défaut si non spécifiée
      const phase = query.phase || CyclePhase.FOLLICULAR;

      const result = await this.getExercisesByPhaseUseCase.execute({
        phase,
        intensity: query.intensity,
        muscleZone: query.muscleZone,
        maxDuration: query.maxDuration,
        limit: query.limit,
      });

      return {
        success: true,
        data: {
          exercises: result.exercises,
          phaseInfo: result.phaseInfo,
          totalCount: result.totalCount,
        },
        message: `${result.totalCount} exercice(s) trouvé(s) pour la phase ${result.phaseInfo.phaseLabel}`,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la récupération des exercices';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }
}
