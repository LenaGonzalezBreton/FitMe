import { IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
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
