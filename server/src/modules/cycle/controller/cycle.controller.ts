import {
  Controller,
  Get,
  Post,
  Put,
  Request,
  Body,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetCurrentPhaseUseCase } from '../application/use-cases/get-current-phase.use-case';
import { GetCycleConfigUseCase } from '../application/use-cases/get-cycle-config.use-case';
import { UpdateCycleConfigUseCase } from '../application/use-cases/update-cycle-config.use-case';
import { LogPeriodUseCase } from '../application/use-cases/log-period.use-case';
import { GetPeriodsHistoryUseCase } from '../application/use-cases/get-periods-history.use-case';
import { GetCyclePredictionsUseCase } from '../application/use-cases/get-cycle-predictions.use-case';
import { GetCycleCalendarUseCase } from '../application/use-cases/get-cycle-calendar.use-case';
import { LogSymptomsUseCase } from '../application/use-cases/log-symptoms.use-case';
import { GetSymptomsHistoryUseCase } from '../application/use-cases/get-symptoms-history.use-case';
import {
  CurrentPhaseResponseDto,
  CycleConfigResponseDto,
  UpdateCycleConfigDto,
  LogPeriodDto,
  LogPeriodResponseDto,
  PeriodsHistoryResponseDto,
  CyclePredictionsResponseDto,
  CycleCalendarResponseDto,
  LogSymptomsDto,
  LogSymptomsResponseDto,
  SymptomsHistoryResponseDto,
} from './dto/cycle.dto';
import { SymptomType } from '@prisma/client';

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
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CycleController {
  constructor(
    private readonly getCurrentPhaseUseCase: GetCurrentPhaseUseCase,
    private readonly getCycleConfigUseCase: GetCycleConfigUseCase,
    private readonly updateCycleConfigUseCase: UpdateCycleConfigUseCase,
    private readonly logPeriodUseCase: LogPeriodUseCase,
    private readonly getPeriodsHistoryUseCase: GetPeriodsHistoryUseCase,
    private readonly getCyclePredictionsUseCase: GetCyclePredictionsUseCase,
    private readonly getCycleCalendarUseCase: GetCycleCalendarUseCase,
    private readonly logSymptomsUseCase: LogSymptomsUseCase,
    private readonly getSymptomsHistoryUseCase: GetSymptomsHistoryUseCase,
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

  // ============================================
  // Configuration du cycle
  // ============================================

  @Get('config')
  @ApiOperation({
    summary: 'Récupérer la configuration du cycle',
    description: 'Retourne les paramètres personnalisés du cycle menstruel',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuration récupérée avec succès',
    type: CycleConfigResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Configuration non trouvée',
  })
  async getCycleConfig(
    @Request() req: AuthenticatedRequest,
  ): Promise<CycleConfigResponseDto> {
    try {
      const result = await this.getCycleConfigUseCase.execute({
        userId: req.user.id,
      });

      const configDto = {
        userId: result.config.userId,
        isCycleTrackingEnabled: result.config.isCycleTrackingEnabled,
        usesExternalProvider: result.config.usesExternalProvider,
        useMenopauseMode: result.config.useMenopauseMode,
        averageCycleLength: result.config.averageCycleLength,
        averagePeriodLength: result.config.averagePeriodLength,
        prefersManualInput: result.config.prefersManualInput,
        createdAt:
          result.config.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt:
          result.config.updatedAt?.toISOString() || new Date().toISOString(),
      };

      return {
        config: configDto,
        message: 'Configuration du cycle récupérée avec succès',
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la récupération de la configuration';
      const statusCode =
        error instanceof Error && error.message.includes('trouvée')
          ? HttpStatus.NOT_FOUND
          : HttpStatus.BAD_REQUEST;
      throw new HttpException(message, statusCode);
    }
  }

  @Put('config')
  @ApiOperation({
    summary: 'Mettre à jour la configuration du cycle',
    description: 'Modifie les paramètres personnalisés du cycle menstruel',
  })
  @ApiBody({ type: UpdateCycleConfigDto })
  @ApiResponse({
    status: 200,
    description: 'Configuration mise à jour avec succès',
    type: CycleConfigResponseDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Configuration créée avec succès',
    type: CycleConfigResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
  })
  async updateCycleConfig(
    @Request() req: AuthenticatedRequest,
    @Body() updateDto: UpdateCycleConfigDto,
  ): Promise<CycleConfigResponseDto> {
    try {
      const result = await this.updateCycleConfigUseCase.execute({
        userId: req.user.id,
        isCycleTrackingEnabled: updateDto.isCycleTrackingEnabled,
        usesExternalProvider: updateDto.usesExternalProvider,
        useMenopauseMode: updateDto.useMenopauseMode,
        averageCycleLength: updateDto.averageCycleLength,
        averagePeriodLength: updateDto.averagePeriodLength,
        prefersManualInput: updateDto.prefersManualInput,
      });

      const configDto = {
        userId: result.config.userId,
        isCycleTrackingEnabled: result.config.isCycleTrackingEnabled,
        usesExternalProvider: result.config.usesExternalProvider,
        useMenopauseMode: result.config.useMenopauseMode,
        averageCycleLength: result.config.averageCycleLength,
        averagePeriodLength: result.config.averagePeriodLength,
        prefersManualInput: result.config.prefersManualInput,
        createdAt:
          result.config.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt:
          result.config.updatedAt?.toISOString() || new Date().toISOString(),
      };

      return {
        config: configDto,
        message: result.isNewConfig
          ? 'Configuration du cycle créée avec succès'
          : 'Configuration du cycle mise à jour avec succès',
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la mise à jour de la configuration';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  // ============================================
  // Suivi des règles
  // ============================================

  @Post('periods')
  @ApiOperation({
    summary: 'Enregistrer des règles',
    description: 'Logger manuellement le début et la fin des règles',
  })
  @ApiBody({ type: LogPeriodDto })
  @ApiResponse({
    status: 201,
    description: 'Règles enregistrées avec succès',
    type: LogPeriodResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
  })
  async logPeriod(
    @Request() req: AuthenticatedRequest,
    @Body() logDto: LogPeriodDto,
  ): Promise<LogPeriodResponseDto> {
    try {
      const result = await this.logPeriodUseCase.execute({
        userId: req.user.id,
        startDate: new Date(logDto.startDate),
        endDate: logDto.endDate ? new Date(logDto.endDate) : undefined,
        flowIntensity: logDto.flowIntensity,
        notes: logDto.notes,
      });

      const periodDto = {
        id: result.period.id,
        startDate: result.period.startDate.toISOString(),
        periodLength: result.period.periodLength,
        cycleLength: result.period.cycleLength,
        isRegular: result.period.isRegular || true,
        flowIntensity: logDto.flowIntensity,
        notes: logDto.notes,
      };

      return {
        period: periodDto,
        message: result.isNewCycle
          ? 'Nouveau cycle créé avec succès'
          : 'Cycle existant mis à jour avec succès',
        isNewCycle: result.isNewCycle,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erreur lors de l'enregistrement des règles";
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('periods')
  @ApiOperation({
    summary: "Récupérer l'historique des règles",
    description: 'Liste chronologique des règles avec statistiques',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Nombre de cycles à retourner',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Nombre de cycles à ignorer',
  })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    type: String,
    description: 'Date de début (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'toDate',
    required: false,
    type: String,
    description: 'Date de fin (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Historique récupéré avec succès',
    type: PeriodsHistoryResponseDto,
  })
  async getPeriodsHistory(
    @Request() req: AuthenticatedRequest,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ): Promise<PeriodsHistoryResponseDto> {
    try {
      const result = await this.getPeriodsHistoryUseCase.execute({
        userId: req.user.id,
        limit,
        offset,
        fromDate: fromDate ? new Date(fromDate) : undefined,
        toDate: toDate ? new Date(toDate) : undefined,
      });

      const periodsDto = result.periods.map((period) => ({
        id: period.id,
        startDate: period.startDate.toISOString(),
        periodLength: period.periodLength,
        cycleLength: period.cycleLength,
        isRegular: period.isRegular || true,
      }));

      return {
        periods: periodsDto,
        total: result.total,
        averageCycleLength: result.averageCycleLength,
        averagePeriodLength: result.averagePeriodLength,
        regularityPercentage: result.regularityPercentage,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération de l'historique";
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  // ============================================
  // Prédictions et calendrier
  // ============================================

  @Get('predictions')
  @ApiOperation({
    summary: 'Obtenir les prédictions du cycle',
    description: 'Calculs intelligents des prochaines règles et ovulation',
  })
  @ApiResponse({
    status: 200,
    description: 'Prédictions calculées avec succès',
    type: CyclePredictionsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Pas assez de données pour les prédictions',
  })
  async getCyclePredictions(
    @Request() req: AuthenticatedRequest,
  ): Promise<CyclePredictionsResponseDto> {
    try {
      const result = await this.getCyclePredictionsUseCase.execute({
        userId: req.user.id,
      });

      const predictionsDto = {
        nextPeriodStart: result.nextPeriodStart.toISOString(),
        nextOvulation: result.nextOvulation.toISOString(),
        confidence: result.confidence,
        currentCycleDay: result.currentCycleDay,
        currentPhase: result.currentPhase,
        daysUntilNextPeriod: result.daysUntilNextPeriod,
        daysUntilOvulation: result.daysUntilOvulation,
      };

      return {
        predictions: predictionsDto,
        message: `Prédictions calculées avec ${result.confidence}% de confiance`,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur lors du calcul des prédictions';
      const statusCode =
        error instanceof Error && error.message.includes('trouvé')
          ? HttpStatus.NOT_FOUND
          : HttpStatus.BAD_REQUEST;
      throw new HttpException(message, statusCode);
    }
  }

  @Get('calendar')
  @ApiOperation({
    summary: 'Obtenir le calendrier du cycle',
    description: 'Vue calendrier avec phases, prédictions et événements',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Date de début (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'months',
    required: false,
    type: Number,
    description: 'Nombre de mois (défaut: 3)',
  })
  @ApiResponse({
    status: 200,
    description: 'Calendrier généré avec succès',
    type: CycleCalendarResponseDto,
  })
  async getCycleCalendar(
    @Request() req: AuthenticatedRequest,
    @Query('startDate') startDate?: string,
    @Query('months') months?: number,
  ): Promise<CycleCalendarResponseDto> {
    try {
      const result = await this.getCycleCalendarUseCase.execute({
        userId: req.user.id,
        startDate: startDate ? new Date(startDate) : undefined,
        months,
      });

      const calendarDto = result.calendar.map((day) => ({
        date: day.date.toISOString().split('T')[0], // Format YYYY-MM-DD
        phase: day.phase,
        cycleDay: day.cycleDay,
        dayType: day.dayType,
        events: day.events,
        isPredicted: day.isPredicted,
      }));

      return {
        calendar: calendarDto,
        startDate: result.startDate.toISOString().split('T')[0],
        endDate: result.endDate.toISOString().split('T')[0],
        monthsCount: result.monthsCount,
        message: `Calendrier du cycle pour ${result.monthsCount} mois avec prédictions`,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la génération du calendrier';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  // ============================================
  // Suivi des symptômes
  // ============================================

  @Post('symptoms')
  @ApiOperation({
    summary: 'Enregistrer des symptômes',
    description: 'Logger les symptômes ressentis pour une date donnée',
  })
  @ApiBody({ type: LogSymptomsDto })
  @ApiResponse({
    status: 201,
    description: 'Symptômes enregistrés avec succès',
    type: LogSymptomsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
  })
  async logSymptoms(
    @Request() req: AuthenticatedRequest,
    @Body() logDto: LogSymptomsDto,
  ): Promise<LogSymptomsResponseDto> {
    try {
      const result = await this.logSymptomsUseCase.execute({
        userId: req.user.id,
        date: new Date(logDto.date),
        symptoms: logDto.symptoms,
      });

      const symptomsDto = result.symptoms.map((symptom) => {
        // Décoder les données du symptôme
        let intensity = 3;
        let notes: string | undefined;
        try {
          const parsed = JSON.parse(symptom.value) as {
            intensity: number;
            notes: string | undefined;
          };
          intensity = parsed.intensity;
          notes = parsed.notes || undefined;
        } catch {
          intensity = parseInt(symptom.value) || 3;
        }

        return {
          id: symptom.id!,
          type: symptom.symptomType,
          intensity,
          notes,
          date: symptom.date.toISOString(),
          createdAt:
            symptom.createdAt?.toISOString() || new Date().toISOString(),
        };
      });

      return {
        symptoms: symptomsDto,
        date: result.date.toISOString().split('T')[0],
        message: `${symptomsDto.length} symptôme(s) enregistré(s) pour le ${result.date.toLocaleDateString('fr-FR')}`,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erreur lors de l'enregistrement des symptômes";
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('symptoms')
  @ApiOperation({
    summary: "Récupérer l'historique des symptômes",
    description:
      'Analyse des patterns de symptômes avec statistiques par phases',
  })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    type: String,
    description: 'Date de début (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'toDate',
    required: false,
    type: String,
    description: 'Date de fin (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'symptomType',
    required: false,
    enum: [
      'CRAMPS',
      'BLOATING',
      'HEADACHE',
      'BACK_PAIN',
      'BREAST_TENDERNESS',
      'ACNE',
      'MOOD_SWINGS',
      'FATIGUE',
      'NAUSEA',
      'FOOD_CRAVINGS',
      'CONSTIPATION',
      'DIARRHEA',
      'HOT_FLASHES',
      'COLD_FLASHES',
      'JOINT_PAIN',
      'INSOMNIA',
    ],
    description: 'Type de symptôme spécifique',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: "Nombre d'entrées à retourner",
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: "Nombre d'entrées à ignorer",
  })
  @ApiResponse({
    status: 200,
    description: 'Historique des symptômes récupéré avec succès',
    type: SymptomsHistoryResponseDto,
  })
  async getSymptomsHistory(
    @Request() req: AuthenticatedRequest,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('symptomType') symptomType?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<SymptomsHistoryResponseDto> {
    try {
      const result = await this.getSymptomsHistoryUseCase.execute({
        userId: req.user.id,
        fromDate: fromDate ? new Date(fromDate) : undefined,
        toDate: toDate ? new Date(toDate) : undefined,
        symptomType: symptomType as SymptomType,
        limit,
        offset,
      });

      const symptomsDto = result.symptoms.map((symptom) => ({
        id: symptom.id,
        type: symptom.type,
        intensity: symptom.intensity,
        notes: symptom.notes,
        date: symptom.date.toISOString(),
        createdAt: symptom.createdAt.toISOString(),
      }));

      const statsDto = result.stats.map((stat) => ({
        type: stat.type,
        averageIntensity: stat.averageIntensity,
        occurrences: stat.occurrences,
        mostCommonPhase: stat.mostCommonPhase,
        phaseDistribution: stat.phaseDistribution,
      }));

      return {
        symptoms: symptomsDto,
        stats: statsDto,
        periodStart: result.periodStart.toISOString().split('T')[0],
        periodEnd: result.periodEnd.toISOString().split('T')[0],
        totalEntries: result.totalEntries,
        uniqueSymptomTypes: result.uniqueSymptomTypes,
        message: `Analyse de ${result.totalEntries} symptômes sur ${Math.ceil((result.periodEnd.getTime() - result.periodStart.getTime()) / (1000 * 60 * 60 * 24))} jours - ${result.uniqueSymptomTypes} types différents identifiés`,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la récupération des symptômes';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }
}
