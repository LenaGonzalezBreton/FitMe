import {
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsString,
  IsNotEmpty,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CyclePhase } from '../../../cycle/domain/cycle.entity';
import { Intensity, MuscleZone } from '../../domain/exercise.entity';

export class ExerciseQueryDto {
  @ApiProperty({
    enum: CyclePhase,
    required: false,
    example: CyclePhase.FOLLICULAR,
    description: 'Phase du cycle menstruel pour filtrer les exercices adaptés',
  })
  @IsOptional()
  @IsEnum(CyclePhase)
  phase?: CyclePhase;

  @ApiProperty({
    enum: Intensity,
    required: false,
    example: Intensity.MODERATE,
    description: "Niveau d'intensité souhaité pour les exercices",
  })
  @IsOptional()
  @IsEnum(Intensity)
  intensity?: Intensity;

  @ApiProperty({
    enum: MuscleZone,
    required: false,
    example: MuscleZone.FULL_BODY,
    description: 'Zone musculaire ciblée pour les exercices',
  })
  @IsOptional()
  @IsEnum(MuscleZone)
  muscleZone?: MuscleZone;

  @ApiProperty({
    type: Number,
    required: false,
    example: 45,
    description: 'Durée maximale en minutes pour chaque exercice',
    minimum: 1,
    maximum: 300,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(300)
  maxDuration?: number;

  @ApiProperty({
    type: Number,
    required: false,
    example: 20,
    description: "Nombre maximum d'exercices à retourner dans la réponse",
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class ExerciseDto {
  @ApiProperty({
    example: 'exe_123456789',
    description: "Identifiant unique de l'exercice",
  })
  id: string;

  @ApiProperty({
    example: 'Squats au poids du corps',
    description: "Nom de l'exercice",
  })
  title: string;

  @ApiProperty({
    example: 'Exercice de renforcement pour les jambes et les fessiers',
    required: false,
    description: "Description détaillée de l'exercice et de ses bénéfices",
  })
  description?: string;

  @ApiProperty({
    example: 'https://fitme-app.com/images/exercises/squats.jpg',
    required: false,
    description: "URL de l'image ou vidéo démonstrative de l'exercice",
  })
  imageUrl?: string;

  @ApiProperty({
    example: 15,
    required: false,
    description: 'Durée recommandée en minutes',
  })
  durationMinutes?: number;

  @ApiProperty({
    example: '15min',
    description: 'Durée formatée de manière lisible',
  })
  formattedDuration: string;

  @ApiProperty({
    enum: Intensity,
    example: Intensity.MODERATE,
    required: false,
    description: "Niveau d'intensité de l'exercice",
  })
  intensity?: Intensity;

  @ApiProperty({
    example: 'Modérée',
    description: "Label français du niveau d'intensité",
  })
  intensityLabel: string;

  @ApiProperty({
    enum: MuscleZone,
    example: MuscleZone.LOWER_BODY,
    required: false,
    description: 'Zone musculaire principalement travaillée',
  })
  muscleZone?: MuscleZone;

  @ApiProperty({
    example: 'Bas du corps',
    description: 'Label français de la zone musculaire',
  })
  muscleZoneLabel: string;

  @ApiProperty({
    example: true,
    description:
      'Indique si cet exercice est spécialement recommandé pour la phase de cycle',
  })
  isRecommendedForPhase: boolean;
}

export class PhaseInfoDto {
  @ApiProperty({
    enum: CyclePhase,
    example: CyclePhase.FOLLICULAR,
    description: 'Phase du cycle menstruel',
  })
  phase: CyclePhase | string;

  @ApiProperty({
    example: 'Phase Folliculaire',
    description: 'Nom complet en français de la phase',
  })
  phaseLabel: string;

  @ApiProperty({
    enum: Intensity,
    example: Intensity.MODERATE,
    description: 'Intensité recommandée pour cette phase',
  })
  recommendedIntensity: Intensity;

  @ApiProperty({
    example:
      "Énergie croissante. Moment idéal pour augmenter progressivement l'intensité.",
    description: 'Description détaillée des caractéristiques de cette phase',
  })
  description: string;
}

export class ExerciseListDataDto {
  @ApiProperty({
    type: [ExerciseDto],
    description: 'Liste des exercices correspondant aux critères',
  })
  exercises: ExerciseDto[];

  @ApiProperty({
    type: PhaseInfoDto,
    description: 'Informations sur la phase de cycle et recommandations',
  })
  phaseInfo: PhaseInfoDto;

  @ApiProperty({
    example: 15,
    description: "Nombre total d'exercices retournés",
  })
  totalCount: number;
}

export class ExerciseListResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indique si la requête a été traitée avec succès',
  })
  success: boolean;

  @ApiProperty({
    type: ExerciseListDataDto,
    description:
      'Données de la réponse contenant exercices et informations de phase',
  })
  data: ExerciseListDataDto;

  @ApiProperty({
    example: '15 exercice(s) trouvé(s) pour la phase Phase Folliculaire',
    description: 'Message descriptif du résultat de la recherche',
  })
  message: string;
}

// ============================================
// Exercise Enhancement DTOs
// ============================================

export class RateExerciseDto {
  @ApiProperty({
    description: 'Note de 1 à 5 étoiles',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    description: "Commentaire optionnel sur l'exercice",
    example: 'Excellent exercice pour le renforcement des jambes !',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class ExerciseDetailsDto {
  @ApiProperty({
    description: "Identifiant de l'exercice",
    example: 'exe_123456789',
  })
  id: string;

  @ApiProperty({
    description: "Nom de l'exercice",
    example: 'Squats au poids du corps',
  })
  title: string;

  @ApiPropertyOptional({
    description: "Description détaillée de l'exercice",
    example: 'Exercice de renforcement pour les jambes et les fessiers',
  })
  description?: string;

  @ApiPropertyOptional({
    description: "URL de l'image de l'exercice",
    example: 'https://fitme-app.com/images/exercises/squats.jpg',
  })
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Durée recommandée en minutes',
    example: 15,
  })
  durationMinutes?: number;

  @ApiProperty({
    description: 'Durée formatée',
    example: '15min',
  })
  formattedDuration: string;

  @ApiPropertyOptional({
    enum: Intensity,
    description: "Niveau d'intensité",
    example: Intensity.MODERATE,
  })
  intensity?: Intensity;

  @ApiProperty({
    description: "Label d'intensité en français",
    example: 'Modérée',
  })
  intensityLabel: string;

  @ApiPropertyOptional({
    enum: MuscleZone,
    description: 'Zone musculaire travaillée',
    example: MuscleZone.LOWER_BODY,
  })
  muscleZone?: MuscleZone;

  @ApiProperty({
    description: 'Label de zone musculaire en français',
    example: 'Bas du corps',
  })
  muscleZoneLabel: string;

  @ApiProperty({
    description: "Indique si l'exercice est dans les favoris",
    example: true,
  })
  isFavorite: boolean;

  @ApiProperty({
    description: "Note moyenne de l'exercice",
    example: 4.3,
  })
  averageRating: number;

  @ApiProperty({
    description: "Nombre total d'évaluations",
    example: 127,
  })
  totalRatings: number;

  @ApiPropertyOptional({
    description: "Note donnée par l'utilisateur actuel",
    example: 5,
  })
  userRating?: number;

  @ApiProperty({
    description: 'Date de création',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Date de dernière modification',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: string;
}

export class FavoriteExerciseDto {
  @ApiProperty({
    description: "Informations de l'exercice",
    type: ExerciseDetailsDto,
  })
  exercise: ExerciseDetailsDto;

  @ApiProperty({
    description: "Date d'ajout aux favoris",
    example: '2024-01-15T10:30:00.000Z',
  })
  addedToFavoritesAt: string;

  @ApiProperty({
    description: "Note moyenne de l'exercice",
    example: 4.3,
  })
  averageRating: number;

  @ApiProperty({
    description: "Nombre total d'évaluations",
    example: 127,
  })
  totalRatings: number;

  @ApiPropertyOptional({
    description: "Note donnée par l'utilisateur",
    example: 5,
  })
  userRating?: number;
}

export class ExerciseRatingDto {
  @ApiProperty({
    description: "Identifiant de l'évaluation",
    example: 'rat_123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Note de 1 à 5 étoiles',
    example: 4,
  })
  rating: number;

  @ApiPropertyOptional({
    description: "Commentaire sur l'exercice",
    example: 'Excellent exercice pour le renforcement des jambes !',
  })
  comment?: string;

  @ApiProperty({
    description: "Date de création de l'évaluation",
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Date de dernière modification',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: string;
}

export class ExerciseDetailsResponseDto {
  @ApiProperty({
    description: "Détails complets de l'exercice",
    type: ExerciseDetailsDto,
  })
  exercise: ExerciseDetailsDto;
}

export class FavoriteExercisesResponseDto {
  @ApiProperty({
    description: 'Liste des exercices favoris avec détails',
    type: [FavoriteExerciseDto],
  })
  favorites: FavoriteExerciseDto[];

  @ApiProperty({
    description: "Nombre total d'exercices favoris",
    example: 12,
  })
  total: number;
}

export class AddToFavoritesResponseDto {
  @ApiProperty({
    description: 'Message de confirmation',
    example: 'Exercice ajouté aux favoris avec succès',
  })
  message: string;

  @ApiProperty({
    description: "Date d'ajout aux favoris",
    example: '2024-01-15T10:30:00.000Z',
  })
  addedAt: string;
}

export class RateExerciseResponseDto {
  @ApiProperty({
    description: 'Évaluation créée ou mise à jour',
    type: ExerciseRatingDto,
  })
  rating: ExerciseRatingDto;

  @ApiProperty({
    description: "Indique si c'est une nouvelle évaluation ou une mise à jour",
    example: true,
  })
  isNewRating: boolean;

  @ApiProperty({
    description: "Nouvelle note moyenne de l'exercice",
    example: 4.3,
  })
  newAverageRating: number;
}

export class CreateExerciseDto {
  @ApiProperty({
    description: "Titre de l'exercice",
    example: 'Pompes modifiées',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: "Description détaillée de l'exercice",
    example: 'Pompes adaptées pour les débutants, genoux au sol',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: "URL de l'image de démonstration",
    example: 'https://example.com/images/pompes-modifiees.jpg',
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: "Durée de l'exercice en minutes",
    example: 15,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  durationMinutes?: number;

  @ApiPropertyOptional({
    description: "Niveau d'intensité de l'exercice",
    enum: Intensity,
    example: Intensity.MODERATE,
  })
  @IsOptional()
  @IsEnum(Intensity)
  intensity?: Intensity;

  @ApiPropertyOptional({
    description: 'Zone musculaire ciblée',
    enum: MuscleZone,
    example: MuscleZone.UPPER_BODY,
  })
  @IsOptional()
  @IsEnum(MuscleZone)
  muscleZone?: MuscleZone;
}

export class CreateExerciseResponseDto {
  @ApiProperty({
    description: 'Exercice créé avec succès',
    type: ExerciseDetailsDto,
  })
  exercise: ExerciseDetailsDto;

  @ApiProperty({
    description: 'Message de confirmation',
    example: 'Exercice créé avec succès',
  })
  message: string;
}
