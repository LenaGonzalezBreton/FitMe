import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GetExercisesByPhaseUseCase } from '../application/use-cases/get-exercises-by-phase.use-case';
import { GetExerciseDetailsUseCase } from '../application/use-cases/get-exercise-details.use-case';
import { AddToFavoritesUseCase } from '../application/use-cases/add-to-favorites.use-case';
import { RemoveFromFavoritesUseCase } from '../application/use-cases/remove-from-favorites.use-case';
import { GetFavoriteExercisesUseCase } from '../application/use-cases/get-favorite-exercises.use-case';
import { RateExerciseUseCase } from '../application/use-cases/rate-exercise.use-case';
import {
  ExerciseQueryDto,
  ExerciseListResponseDto,
  ExerciseDetailsResponseDto,
  AddToFavoritesResponseDto,
  FavoriteExercisesResponseDto,
  RateExerciseDto,
  RateExerciseResponseDto,
} from './dto/exercise.dto';
import { CyclePhase } from '../../cycle/domain/cycle.entity';
import { Intensity, MuscleZone } from '../domain/exercise.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Exercises')
@Controller('exercises')
export class ExerciseController {
  constructor(
    private readonly getExercisesByPhaseUseCase: GetExercisesByPhaseUseCase,
    private readonly getExerciseDetailsUseCase: GetExerciseDetailsUseCase,
    private readonly addToFavoritesUseCase: AddToFavoritesUseCase,
    private readonly removeFromFavoritesUseCase: RemoveFromFavoritesUseCase,
    private readonly getFavoriteExercisesUseCase: GetFavoriteExercisesUseCase,
    private readonly rateExerciseUseCase: RateExerciseUseCase,
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

  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Récupérer la liste des exercices favoris',
    description:
      "Retourne tous les exercices marqués comme favoris par l'utilisateur connecté",
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des exercices favoris retournée avec succès',
    type: FavoriteExercisesResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé - token JWT requis',
  })
  async getFavoriteExercises(
    @Request() req: { user: { sub: string } },
  ): Promise<FavoriteExercisesResponseDto> {
    try {
      const result = await this.getFavoriteExercisesUseCase.execute({
        userId: req.user.sub,
      });

      // Map domain entities to DTOs
      const favoritesDto = result.map((favorite) => ({
        exercise: {
          id: favorite.exercise.id,
          title: favorite.exercise.title,
          description: favorite.exercise.description,
          imageUrl: favorite.exercise.imageUrl,
          duration: favorite.exercise.durationMinutes,
          formattedDuration: favorite.exercise.durationMinutes
            ? `${favorite.exercise.durationMinutes} min`
            : 'Variable',
          intensity: favorite.exercise.intensity,
          intensityLabel: this.getIntensityLabel(favorite.exercise.intensity),
          muscleZone: favorite.exercise.muscleZone,
          muscleZoneLabel: this.getMuscleZoneLabel(
            favorite.exercise.muscleZone,
          ),
          isFavorite: true, // Always true since these are favorites
          averageRating: favorite.averageRating,
          totalRatings: favorite.totalRatings,
          userRating: favorite.userRating,
          createdAt:
            favorite.exercise.createdAt?.toISOString() ||
            new Date().toISOString(),
          updatedAt:
            favorite.exercise.updatedAt?.toISOString() ||
            new Date().toISOString(),
        },
        addedToFavoritesAt: favorite.addedToFavoritesAt.toISOString(),
        averageRating: favorite.averageRating,
        totalRatings: favorite.totalRatings,
      }));

      return {
        favorites: favoritesDto,
        total: favoritesDto.length,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la récupération des exercices favoris';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: "Récupérer les détails complets d'un exercice",
    description:
      "Retourne les détails d'un exercice spécifique avec moyennes de notation et informations détaillées",
  })
  @ApiParam({
    name: 'id',
    description: "Identifiant unique de l'exercice",
    example: 'clh123456789',
  })
  @ApiResponse({
    status: 200,
    description: "Détails de l'exercice retournés avec succès",
    type: ExerciseDetailsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Exercice non trouvé',
  })
  async getExerciseDetails(
    @Param('id') exerciseId: string,
  ): Promise<ExerciseDetailsResponseDto> {
    try {
      const result = await this.getExerciseDetailsUseCase.execute({
        exerciseId,
      });

      // Map domain entity to DTO
      const exerciseDetailsDto = {
        id: result.exercise.id,
        title: result.exercise.title,
        description: result.exercise.description,
        imageUrl: result.exercise.imageUrl,
        duration: result.exercise.durationMinutes,
        formattedDuration: result.exercise.durationMinutes
          ? `${result.exercise.durationMinutes} min`
          : 'Variable',
        intensity: result.exercise.intensity,
        intensityLabel: this.getIntensityLabel(result.exercise.intensity),
        muscleZone: result.exercise.muscleZone,
        muscleZoneLabel: this.getMuscleZoneLabel(result.exercise.muscleZone),
        isFavorite: result.isFavorite,
        averageRating: result.averageRating,
        totalRatings: result.totalRatings,
        userRating: result.userRating,
        createdAt:
          result.exercise.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt:
          result.exercise.updatedAt?.toISOString() || new Date().toISOString(),
      };

      return {
        exercise: exerciseDetailsDto,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des détails de l'exercice";

      if (message.includes('not found')) {
        throw new HttpException(message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Ajouter un exercice aux favoris',
    description: "Marque un exercice comme favori pour l'utilisateur connecté",
  })
  @ApiParam({
    name: 'id',
    description: "Identifiant unique de l'exercice à ajouter aux favoris",
    example: 'clh123456789',
  })
  @ApiResponse({
    status: 201,
    description: 'Exercice ajouté aux favoris avec succès',
    type: AddToFavoritesResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Erreur lors de l'ajout aux favoris",
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé - token JWT requis',
  })
  @ApiResponse({
    status: 404,
    description: 'Exercice non trouvé',
  })
  @ApiResponse({
    status: 409,
    description: 'Exercice déjà dans les favoris',
  })
  async addToFavorites(
    @Param('id') exerciseId: string,
    @Request() req: { user: { sub: string } },
  ): Promise<AddToFavoritesResponseDto> {
    try {
      await this.addToFavoritesUseCase.execute({
        userId: req.user.sub,
        exerciseId,
      });

      return {
        message: 'Exercice ajouté aux favoris avec succès',
        addedAt: new Date().toISOString(),
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erreur lors de l'ajout de l'exercice aux favoris";

      if (message.includes('not found')) {
        throw new HttpException(message, HttpStatus.NOT_FOUND);
      }
      if (message.includes('already') || message.includes('déjà')) {
        throw new HttpException(message, HttpStatus.CONFLICT);
      }
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retirer un exercice des favoris',
    description: "Retire un exercice des favoris de l'utilisateur connecté",
  })
  @ApiParam({
    name: 'id',
    description: "Identifiant unique de l'exercice à retirer des favoris",
    example: 'clh123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Exercice retiré des favoris avec succès',
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé - token JWT requis',
  })
  @ApiResponse({
    status: 404,
    description: 'Exercice non trouvé dans les favoris',
  })
  async removeFromFavorites(
    @Param('id') exerciseId: string,
    @Request() req: { user: { sub: string } },
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.removeFromFavoritesUseCase.execute({
        userId: req.user.sub,
        exerciseId,
      });

      return {
        success: true,
        message: 'Exercice retiré des favoris avec succès',
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression de l'exercice des favoris";

      if (message.includes('not found')) {
        throw new HttpException(message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':id/rate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Noter un exercice',
    description: "Permet à l'utilisateur de noter un exercice de 1 à 5 étoiles",
  })
  @ApiParam({
    name: 'id',
    description: "Identifiant unique de l'exercice à noter",
    example: 'clh123456789',
  })
  @ApiResponse({
    status: 201,
    description: 'Exercice noté avec succès',
    type: RateExerciseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Données de notation invalides',
  })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé - token JWT requis',
  })
  @ApiResponse({
    status: 404,
    description: 'Exercice non trouvé',
  })
  async rateExercise(
    @Param('id') exerciseId: string,
    @Body() rateExerciseDto: RateExerciseDto,
    @Request() req: { user: { sub: string } },
  ): Promise<RateExerciseResponseDto> {
    try {
      const result = await this.rateExerciseUseCase.execute({
        userId: req.user.sub,
        exerciseId,
        rating: rateExerciseDto.rating,
        comment: rateExerciseDto.comment,
      });

      // Map domain entity to DTO
      const ratingDto = {
        id: result.id!,
        userId: result.userId,
        exerciseId: result.exerciseId,
        rating: result.rating,
        comment: result.comment,
        createdAt: result.createdAt!.toISOString(),
        updatedAt: result.updatedAt!.toISOString(),
      };

      return {
        rating: ratingDto,
        isNewRating: true, // This could be determined by the use case if needed
        newAverageRating: 0, // This would need to be calculated or returned from the use case
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erreur lors de la notation de l'exercice";

      if (message.includes('not found')) {
        throw new HttpException(message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  private getIntensityLabel(intensity?: Intensity): string {
    switch (intensity) {
      case Intensity.LOW:
        return 'Faible';
      case Intensity.MODERATE:
        return 'Modérée';
      case Intensity.HIGH:
        return 'Élevée';
      default:
        return 'Non spécifiée';
    }
  }

  private getMuscleZoneLabel(muscleZone?: MuscleZone): string {
    switch (muscleZone) {
      case MuscleZone.UPPER_BODY:
        return 'Haut du corps';
      case MuscleZone.LOWER_BODY:
        return 'Bas du corps';
      case MuscleZone.CORE:
        return 'Abdominaux/Core';
      case MuscleZone.FULL_BODY:
        return 'Corps entier';
      case MuscleZone.CARDIO:
        return 'Cardio';
      default:
        return 'Non spécifiée';
    }
  }
}
