import {
  Controller,
  Get,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetCurrentPhaseUseCase } from '../application/use-cases/get-current-phase.use-case';
import { CurrentPhaseResponseDto } from './dto/cycle.dto';

interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    firstName?: string;
    profileType?: string;
    contextType?: string;
  };
}

@ApiTags('Cycle')
@Controller('cycle')
export class CycleController {
  constructor(
    private readonly getCurrentPhaseUseCase: GetCurrentPhaseUseCase,
  ) {}

  @Get('current-phase')
  @ApiOperation({
    summary: 'Récupérer la phase actuelle du cycle',
    description:
      "Retourne la phase actuelle du cycle menstruel de l'utilisatrice connectée",
  })
  @ApiResponse({
    status: 200,
    description: 'Phase actuelle retournée avec succès',
    type: CurrentPhaseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Aucun cycle trouvé ou suivi des cycles désactivé',
  })
  async getCurrentPhase(
    @Request() req: AuthenticatedRequest,
  ): Promise<CurrentPhaseResponseDto> {
    try {
      const userId = req.user.id;

      const result = await this.getCurrentPhaseUseCase.execute({
        userId,
        date: new Date(),
      });

      return {
        success: true,
        data: {
          phase: result.phase,
          cycleDay: result.cycleDay,
          cycleLength: result.cycleLength,
          periodLength: result.periodLength,
          daysUntilNextPhase: result.daysUntilNextPhase,
          phaseDescription: result.phaseDescription,
          recommendations: result.recommendations,
        },
        message: `Vous êtes actuellement en ${result.phaseDescription}`,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la récupération de la phase actuelle';
      const statusCode =
        error instanceof Error && error.message.includes('trouvé')
          ? HttpStatus.NOT_FOUND
          : HttpStatus.BAD_REQUEST;
      throw new HttpException(message, statusCode);
    }
  }
}
