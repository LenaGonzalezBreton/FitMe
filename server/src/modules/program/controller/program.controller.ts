import {
  Controller,
  Post,
  Body,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { GenerateProgramByPhaseUseCase } from '../application/use-cases/generate-program-by-phase.use-case';
import {
  GenerateProgramDto,
  GeneratedProgramResponseDto,
} from './dto/program.dto';

interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    firstName?: string;
    profileType?: string;
    contextType?: string;
  };
}

@ApiTags('Programs')
@Controller('programs')
export class ProgramController {
  constructor(
    private readonly generateProgramByPhaseUseCase: GenerateProgramByPhaseUseCase,
  ) {}

  @Post('generate')
  @ApiOperation({
    summary: "Générer un programme d'entraînement adapté à la phase de cycle",
    description:
      'Crée un programme personnalisé basé sur la phase actuelle du cycle menstruel et les préférences',
  })
  @ApiBody({ type: GenerateProgramDto })
  @ApiResponse({
    status: 201,
    description: 'Programme généré avec succès',
    type: GeneratedProgramResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Aucun cycle trouvé ou suivi des cycles désactivé',
  })
  async generateProgram(
    @Body() generateDto: GenerateProgramDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<GeneratedProgramResponseDto> {
    try {
      const userId = req.user.id;

      const result = await this.generateProgramByPhaseUseCase.execute({
        userId,
        duration: generateDto.duration,
        focusZone: generateDto.focusZone,
        sessionType: generateDto.sessionType,
      });

      return {
        success: true,
        data: {
          program: result.program,
          userPhase: result.userPhase,
          adaptations: result.adaptations,
        },
        message: `Programme "${result.program.title}" généré avec succès pour votre ${result.userPhase.phaseLabel}`,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la génération du programme';
      const statusCode =
        error instanceof Error && error.message?.includes('trouvé')
          ? HttpStatus.NOT_FOUND
          : HttpStatus.BAD_REQUEST;
      throw new HttpException(message, statusCode);
    }
  }
}
