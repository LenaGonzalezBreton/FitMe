import { ApiProperty } from '@nestjs/swagger';
import { CyclePhase } from '../../domain/cycle.entity';

export class CurrentPhaseDataDto {
  @ApiProperty({
    enum: CyclePhase,
    example: CyclePhase.FOLLICULAR,
    description: 'Phase actuelle du cycle menstruel',
  })
  phase: CyclePhase;

  @ApiProperty({
    example: 12,
    description: 'Jour actuel dans le cycle (1-28 généralement)',
    minimum: 1,
    maximum: 40,
  })
  cycleDay: number;

  @ApiProperty({
    example: 28,
    description: 'Durée totale du cycle en jours',
    minimum: 21,
    maximum: 35,
  })
  cycleLength: number;

  @ApiProperty({
    example: 5,
    description: 'Durée des règles en jours',
    minimum: 3,
    maximum: 8,
  })
  periodLength: number;

  @ApiProperty({
    example: 2,
    description: 'Nombre de jours avant la prochaine phase',
    minimum: 0,
  })
  daysUntilNextPhase: number;

  @ApiProperty({
    example:
      'Phase folliculaire - Énergie croissante, idéale pour commencer de nouveaux défis',
    description:
      'Description détaillée de la phase actuelle et de ses caractéristiques',
  })
  phaseDescription: string;

  @ApiProperty({
    example: [
      "Commencer à augmenter l'intensité progressivement",
      'Exercices cardiovasculaires modérés',
      'Renforcement musculaire avec poids légers',
    ],
    description: 'Liste des recommandations spécifiques à cette phase',
    type: [String],
  })
  recommendations: string[];
}

export class CurrentPhaseResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indique si la requête a été traitée avec succès',
  })
  success: boolean;

  @ApiProperty({
    type: CurrentPhaseDataDto,
    description: 'Données détaillées sur la phase actuelle du cycle',
  })
  data: CurrentPhaseDataDto;

  @ApiProperty({
    example:
      'Vous êtes actuellement en Phase folliculaire - Énergie croissante, idéale pour commencer de nouveaux défis',
    description: 'Message descriptif sur la phase actuelle',
  })
  message: string;
}
