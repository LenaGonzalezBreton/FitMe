import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  HttpException,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { GenerateProgramByPhaseUseCase } from '../application/use-cases/generate-program-by-phase.use-case';
import { CreateProgramUseCase } from '../application/use-cases/create-program.use-case';
import { GetUserProgramsUseCase } from '../application/use-cases/get-user-programs.use-case';
import { GetProgramByIdUseCase } from '../application/use-cases/get-program-by-id.use-case';
import { UpdateProgramUseCase } from '../application/use-cases/update-program.use-case';
import { DeleteProgramUseCase } from '../application/use-cases/delete-program.use-case';
import { StartProgramUseCase } from '../application/use-cases/start-program.use-case';
import { GetProgramStatusUseCase } from '../application/use-cases/get-program-status.use-case';
import {
  GenerateProgramDto,
  GeneratedProgramResponseDto,
  CreateProgramDto,
  UpdateProgramDto,
  ProgramQueryDto,
  ProgramResponseDto,
  ProgramListResponseDto,
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
    private readonly createProgramUseCase: CreateProgramUseCase,
    private readonly getUserProgramsUseCase: GetUserProgramsUseCase,
    private readonly getProgramByIdUseCase: GetProgramByIdUseCase,
    private readonly updateProgramUseCase: UpdateProgramUseCase,
    private readonly deleteProgramUseCase: DeleteProgramUseCase,
    private readonly startProgramUseCase: StartProgramUseCase,
    private readonly getProgramStatusUseCase: GetProgramStatusUseCase,
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

  // ============================================
  // CRUD Operations
  // ============================================

  @Post()
  @ApiOperation({
    summary: 'Créer un nouveau programme',
    description: "Crée un programme d'entraînement personnalisé avec exercices",
  })
  @ApiBody({ type: CreateProgramDto })
  @ApiResponse({
    status: 201,
    description: 'Programme créé avec succès',
    type: ProgramResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflit (date de fin avant date de début)',
  })
  async createProgram(
    @Body() createDto: CreateProgramDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ProgramResponseDto> {
    try {
      const program = await this.createProgramUseCase.execute({
        userId: req.user.id,
        title: createDto.title,
        goal: createDto.goal,
        startDate: new Date(createDto.startDate),
        endDate: createDto.endDate ? new Date(createDto.endDate) : undefined,
        isTemplate: createDto.isTemplate,
        exercises: createDto.exercises,
      });

      return this.mapProgramToResponse(program);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get()
  @ApiOperation({
    summary: "Récupérer les programmes de l'utilisateur",
    description:
      "Liste tous les programmes de l'utilisateur avec filtres et pagination",
  })
  @ApiQuery({ type: ProgramQueryDto })
  @ApiResponse({
    status: 200,
    description: 'Liste des programmes récupérée avec succès',
    type: ProgramListResponseDto,
  })
  async getUserPrograms(
    @Query() query: ProgramQueryDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ProgramListResponseDto> {
    try {
      const result = await this.getUserProgramsUseCase.execute({
        userId: req.user.id,
        filters: {
          isActive: query.isActive,
          isTemplate: query.isTemplate,
          startDateFrom: query.startDateFrom
            ? new Date(query.startDateFrom)
            : undefined,
          startDateTo: query.startDateTo
            ? new Date(query.startDateTo)
            : undefined,
          limit: query.limit,
          offset: query.offset,
        },
      });

      return {
        programs: result.programs.map((program) =>
          this.mapProgramToResponse(program),
        ),
        total: result.total,
        offset: result.offset,
        limit: result.limit,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Récupérer un programme par ID',
    description: "Récupère les détails complets d'un programme spécifique",
  })
  @ApiParam({
    name: 'id',
    description: 'ID du programme',
    example: 'clh123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Programme récupéré avec succès',
    type: ProgramResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Programme non trouvé',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès non autorisé',
  })
  async getProgramById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ProgramResponseDto> {
    try {
      const program = await this.getProgramByIdUseCase.execute({
        programId: id,
        userId: req.user.id,
      });

      return this.mapProgramToResponse(program, true); // Include exercises in detailed view
    } catch (error) {
      this.handleError(error);
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Mettre à jour un programme',
    description: "Met à jour les propriétés d'un programme existant",
  })
  @ApiParam({
    name: 'id',
    description: 'ID du programme',
    example: 'clh123456789',
  })
  @ApiBody({ type: UpdateProgramDto })
  @ApiResponse({
    status: 200,
    description: 'Programme mis à jour avec succès',
    type: ProgramResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Programme non trouvé',
  })
  @ApiResponse({
    status: 403,
    description: 'Modification non autorisée',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflit (date de fin avant date de début)',
  })
  async updateProgram(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateProgramDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ProgramResponseDto> {
    try {
      const program = await this.updateProgramUseCase.execute({
        programId: id,
        userId: req.user.id,
        title: updateDto.title,
        goal: updateDto.goal,
        startDate: updateDto.startDate
          ? new Date(updateDto.startDate)
          : undefined,
        endDate: updateDto.endDate ? new Date(updateDto.endDate) : undefined,
        isActive: updateDto.isActive,
        isTemplate: updateDto.isTemplate,
      });

      return this.mapProgramToResponse(program);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer un programme',
    description:
      'Supprime définitivement un programme et ses exercices associés',
  })
  @ApiParam({
    name: 'id',
    description: 'ID du programme',
    example: 'clh123456789',
  })
  @ApiResponse({
    status: 204,
    description: 'Programme supprimé avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Programme non trouvé',
  })
  @ApiResponse({
    status: 403,
    description: 'Suppression non autorisée',
  })
  async deleteProgram(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    try {
      await this.deleteProgramUseCase.execute({
        programId: id,
        userId: req.user.id,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  @Post(':id/start')
  @ApiOperation({
    summary: 'Démarrer un programme',
    description:
      "Active un programme pour l'utilisateur. Désactive automatiquement les autres programmes actifs.",
  })
  @ApiParam({
    name: 'id',
    description: 'ID du programme',
    example: 'clh123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Programme démarré avec succès',
    type: ProgramResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Programme non trouvé',
  })
  @ApiResponse({
    status: 403,
    description: 'Démarrage non autorisé',
  })
  @ApiResponse({
    status: 409,
    description: 'Programme déjà actif ou expiré',
  })
  async startProgram(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ProgramResponseDto> {
    try {
      const program = await this.startProgramUseCase.execute({
        programId: id,
        userId: req.user.id,
      });

      return this.mapProgramToResponse(program);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Put(':id/pause')
  @ApiOperation({
    summary: 'Mettre en pause un programme',
    description: 'Désactive temporairement un programme actif',
  })
  @ApiParam({
    name: 'id',
    description: 'ID du programme',
    example: 'clh123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Programme mis en pause avec succès',
    type: ProgramResponseDto,
  })
  async pauseProgram(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ProgramResponseDto> {
    try {
      const program = await this.updateProgramUseCase.execute({
        programId: id,
        userId: req.user.id,
        isActive: false,
      });

      return this.mapProgramToResponse(program);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Put(':id/resume')
  @ApiOperation({
    summary: 'Reprendre un programme',
    description: 'Réactive un programme en pause',
  })
  @ApiParam({
    name: 'id',
    description: 'ID du programme',
    example: 'clh123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Programme repris avec succès',
    type: ProgramResponseDto,
  })
  async resumeProgram(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ProgramResponseDto> {
    try {
      const program = await this.updateProgramUseCase.execute({
        programId: id,
        userId: req.user.id,
        isActive: true,
      });

      return this.mapProgramToResponse(program);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Put(':id/complete')
  @ApiOperation({
    summary: 'Marquer un programme comme terminé',
    description: 'Marque un programme comme terminé et le désactive',
  })
  @ApiParam({
    name: 'id',
    description: 'ID du programme',
    example: 'clh123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Programme marqué comme terminé',
    type: ProgramResponseDto,
  })
  async completeProgram(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ProgramResponseDto> {
    try {
      const program = await this.updateProgramUseCase.execute({
        programId: id,
        userId: req.user.id,
        isActive: false,
        endDate: new Date(), // Set end date to now
      });

      return this.mapProgramToResponse(program);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get(':id/status')
  @ApiOperation({
    summary: "Récupérer le statut d'un programme",
    description:
      "Récupère des informations détaillées sur le statut et la progression d'un programme",
  })
  @ApiParam({
    name: 'id',
    description: 'ID du programme',
    example: 'clh123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Statut du programme récupéré avec succès',
  })
  async getProgramStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    try {
      const status = await this.getProgramStatusUseCase.execute({
        programId: id,
        userId: req.user.id,
      });

      return {
        success: true,
        data: status,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get(':id/progress')
  @ApiOperation({
    summary: "Récupérer la progression d'un programme",
    description:
      "Récupère les informations de progression détaillées d'un programme",
  })
  @ApiParam({
    name: 'id',
    description: 'ID du programme',
    example: 'clh123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Progression du programme récupérée avec succès',
  })
  async getProgramProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    try {
      // This will be implemented when we add session tracking
      // For now, return basic status
      const status = await this.getProgramStatusUseCase.execute({
        programId: id,
        userId: req.user.id,
      });

      return {
        success: true,
        data: {
          ...status,
          sessionsCompleted: 0, // Placeholder - will be calculated from sessions
          totalSessions: 0, // Placeholder - will be calculated from program structure
          currentWeek: 1, // Placeholder
          completedExercises: [], // Placeholder
        },
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // ============================================
  // Helper Methods
  // ============================================

  private mapProgramToResponse(
    program: any,
    includeExercises = false,
  ): ProgramResponseDto {
    return {
      id: program.id,
      title: program.title,
      goal: program.goal,
      startDate: program.startDate.toISOString(),
      endDate: program.endDate?.toISOString() || null,
      isActive: program.isActive || false,
      isTemplate: program.isTemplate || false,
      createdAt: program.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: program.updatedAt?.toISOString() || new Date().toISOString(),
      exerciseCount: program.exercises?.length || 0,
      ...(includeExercises &&
        program.exercises && {
          exercises: program.exercises.map((exercise: any) => ({
            exerciseId: exercise.exerciseId,
            order: exercise.order,
            sets: exercise.sets,
            reps: exercise.reps,
            duration: exercise.duration,
            restTime: exercise.restTime,
            notes: exercise.notes,
          })),
        }),
    };
  }

  private handleError(error: any): never {
    if (error.name === 'NotFoundException') {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
    if (error.name === 'ForbiddenException') {
      throw new HttpException(error.message, HttpStatus.FORBIDDEN);
    }
    if (error.name === 'ConflictException') {
      throw new HttpException(error.message, HttpStatus.CONFLICT);
    }

    const message =
      error instanceof Error ? error.message : 'Erreur interne du serveur';
    throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
