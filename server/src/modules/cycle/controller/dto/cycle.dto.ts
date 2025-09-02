import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  IsDateString,
  IsArray,
  IsEnum,
  IsString,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CurrentCycleDataDto {
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
    example: true,
    description: 'Indique si le jour actuel est un jour de règles',
  })
  isPeriodDay: boolean;

  @ApiProperty({
    example: false,
    description: "Indique si le jour actuel est dans la phase d'ovulation",
  })
  isOvulationPhase: boolean;

  @ApiProperty({
    example: false,
    description: 'Indique si le jour actuel est dans la période fertile',
  })
  isFertileDay: boolean;

  @ApiProperty({
    example: 16,
    description: 'Nombre de jours avant le prochain cycle',
    minimum: 0,
  })
  daysUntilNextCycle: number;

  @ApiProperty({
    example:
      'Phase post-règles - Énergie croissante, idéale pour commencer de nouveaux défis',
    description:
      'Description détaillée du jour actuel du cycle et de ses caractéristiques',
  })
  cycleDescription: string;

  @ApiProperty({
    example: [
      "Commencer à augmenter l'intensité progressivement",
      'Exercices cardiovasculaires modérés',
      'Renforcement musculaire avec poids légers',
    ],
    description: 'Liste des recommandations spécifiques à ce jour du cycle',
    type: [String],
  })
  recommendations: string[];
}

export class CurrentCycleResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indique si la requête a été traitée avec succès',
  })
  success: boolean;

  @ApiProperty({
    type: CurrentCycleDataDto,
    description: 'Données détaillées sur le jour actuel du cycle',
  })
  data: CurrentCycleDataDto;

  @ApiProperty({
    example:
      'Phase post-règles - Énergie croissante, idéale pour commencer de nouveaux défis',
    description: 'Message descriptif sur le jour actuel du cycle',
  })
  message: string;
}

// ============================================
// Cycle Configuration DTOs
// ============================================

export class CycleConfigDto {
  @ApiProperty({
    description: 'Identifiant utilisateur',
    example: 'user_123456789',
  })
  userId: string;

  @ApiProperty({
    description: 'Suivi du cycle activé',
    example: true,
  })
  isCycleTrackingEnabled: boolean;

  @ApiProperty({
    description: 'Utilise un fournisseur externe (Apple Health, Google Fit)',
    example: false,
  })
  usesExternalProvider: boolean;

  @ApiProperty({
    description: 'Mode ménopause activé',
    example: false,
  })
  useMenopauseMode: boolean;

  @ApiPropertyOptional({
    description: 'Durée moyenne du cycle en jours',
    example: 28,
    minimum: 21,
    maximum: 40,
  })
  averageCycleLength?: number;

  @ApiPropertyOptional({
    description: 'Durée moyenne des règles en jours',
    example: 5,
    minimum: 3,
    maximum: 10,
  })
  averagePeriodLength?: number;

  @ApiProperty({
    description: 'Préfère la saisie manuelle',
    example: false,
  })
  prefersManualInput: boolean;

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

export class CycleConfigResponseDto {
  @ApiProperty({
    description: 'Configuration du cycle',
    type: CycleConfigDto,
  })
  config: CycleConfigDto;

  @ApiProperty({
    description: 'Message de confirmation',
    example: 'Configuration du cycle récupérée avec succès',
  })
  message: string;
}

export class UpdateCycleConfigDto {
  @ApiPropertyOptional({
    description: 'Activer/désactiver le suivi du cycle',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isCycleTrackingEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Activer/désactiver le fournisseur externe',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  usesExternalProvider?: boolean;

  @ApiPropertyOptional({
    description: 'Activer/désactiver le mode ménopause',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  useMenopauseMode?: boolean;

  @ApiPropertyOptional({
    description: 'Durée moyenne du cycle (21-40 jours)',
    example: 28,
    minimum: 21,
    maximum: 40,
  })
  @IsOptional()
  @IsNumber()
  @Min(21)
  @Max(40)
  averageCycleLength?: number;

  @ApiPropertyOptional({
    description: 'Durée moyenne des règles (3-10 jours)',
    example: 5,
    minimum: 3,
    maximum: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(3)
  @Max(10)
  averagePeriodLength?: number;

  @ApiPropertyOptional({
    description: 'Préférer la saisie manuelle',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  prefersManualInput?: boolean;
}

// ============================================
// Period Tracking DTOs
// ============================================

export class LogPeriodDto {
  @ApiPropertyOptional({
    description: 'Date de début des règles (obligatoire pour nouveau cycle)',
    example: '2024-01-15',
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Date de fin des règles',
    example: '2024-01-20',
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Intensité du flux (1=léger, 5=très fort)',
    example: 3,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  flowIntensity?: number;

  @ApiPropertyOptional({
    description: 'Notes additionnelles',
    example: 'Flux normal, quelques crampes le premier jour',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description:
      "Indique si c'est un nouveau cycle ou une mise à jour du cycle actuel",
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isNewCycle?: boolean;
}

export class PeriodDto {
  @ApiProperty({
    description: 'Identifiant du cycle',
    example: 'cycle_123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Date de début des règles',
    example: '2024-01-15T00:00:00.000Z',
  })
  startDate: string;

  @ApiPropertyOptional({
    description: 'Durée des règles en jours',
    example: 5,
  })
  periodLength?: number;

  @ApiPropertyOptional({
    description: 'Durée totale du cycle en jours',
    example: 28,
  })
  cycleLength?: number;

  @ApiProperty({
    description: 'Cycle régulier',
    example: true,
  })
  isRegular: boolean;

  @ApiPropertyOptional({
    description: 'Intensité du flux moyenne',
    example: 3,
  })
  flowIntensity?: number;

  @ApiPropertyOptional({
    description: 'Notes sur ce cycle',
    example: 'Cycle normal, pas de complications',
  })
  notes?: string;
}

export class LogPeriodResponseDto {
  @ApiProperty({
    description: 'Cycle créé ou mis à jour',
    type: PeriodDto,
  })
  period: PeriodDto;

  @ApiProperty({
    description: 'Message de confirmation',
    example: 'Règles enregistrées avec succès',
  })
  message: string;

  @ApiProperty({
    description: 'Indique si un nouveau cycle a été créé',
    example: true,
  })
  isNewCycle: boolean;
}

export class PeriodsHistoryResponseDto {
  @ApiProperty({
    description: 'Liste des cycles/règles',
    type: [PeriodDto],
  })
  periods: PeriodDto[];

  @ApiProperty({
    description: 'Nombre total de cycles',
    example: 12,
  })
  total: number;

  @ApiProperty({
    description: 'Durée moyenne du cycle',
    example: 28.5,
  })
  averageCycleLength: number;

  @ApiProperty({
    description: 'Durée moyenne des règles',
    example: 5.2,
  })
  averagePeriodLength: number;

  @ApiProperty({
    description: 'Pourcentage de cycles réguliers',
    example: 85.5,
  })
  regularityPercentage: number;
}

// ============================================
// Predictions DTOs
// ============================================

export class CyclePredictionDto {
  @ApiProperty({
    description: 'Date de début des prochaines règles',
    example: '2024-02-15',
  })
  nextPeriodStart: string;

  @ApiProperty({
    description: 'Date de la prochaine ovulation',
    example: '2024-02-01',
  })
  nextOvulation: string;

  @ApiProperty({
    description: 'Niveau de confiance de la prédiction (%)',
    example: 87.5,
    minimum: 0,
    maximum: 100,
  })
  confidence: number;

  @ApiProperty({
    description: 'Jour actuel dans le cycle',
    example: 14,
  })
  currentCycleDay: number;

  @ApiProperty({
    description: 'Caractéristiques du jour actuel',
    example: 'post_period_phase',
    enum: [
      'period_day',
      'post_period_phase',
      'ovulation_phase',
      'post_ovulation_phase',
    ],
  })
  currentCycleCharacteristics: string;

  @ApiProperty({
    description: "Jours jusqu'aux prochaines règles",
    example: 14,
  })
  daysUntilNextPeriod: number;

  @ApiProperty({
    description: "Jours jusqu'à la prochaine ovulation",
    example: 0,
  })
  daysUntilOvulation: number;
}

export class CyclePredictionsResponseDto {
  @ApiProperty({
    description: 'Prédictions du cycle',
    type: CyclePredictionDto,
  })
  predictions: CyclePredictionDto;

  @ApiProperty({
    description: 'Message informatif',
    example:
      'Prédictions calculées avec 87% de confiance basées sur vos 6 derniers cycles',
  })
  message: string;
}

// ============================================
// Calendar DTOs
// ============================================

export class CalendarDayDto {
  @ApiProperty({
    description: 'Date du jour',
    example: '2024-01-15',
  })
  date: string;

  @ApiPropertyOptional({
    description: 'Caractéristiques du cycle ce jour',
    example: 'period_day',
    enum: [
      'period_day',
      'post_period_phase',
      'ovulation_phase',
      'post_ovulation_phase',
    ],
  })
  cycleCharacteristics?: string;

  @ApiPropertyOptional({
    description: 'Jour du cycle (1-40)',
    example: 1,
  })
  cycleDay?: number;

  @ApiProperty({
    description: 'Type de jour',
    example: 'period_start',
    enum: [
      'period_start',
      'period_day',
      'ovulation',
      'fertile',
      'normal',
      'predicted_period',
      'predicted_ovulation',
    ],
  })
  dayType: string;

  @ApiPropertyOptional({
    description: 'Événements/symptômes ce jour',
    type: [String],
    example: ['crampes', 'flux_fort'],
  })
  events?: string[];

  @ApiProperty({
    description: 'Jour prédit ou confirmé',
    example: false,
  })
  isPredicted: boolean;
}

export class CycleCalendarResponseDto {
  @ApiProperty({
    description: 'Jours du calendrier',
    type: [CalendarDayDto],
  })
  calendar: CalendarDayDto[];

  @ApiProperty({
    description: 'Date de début du calendrier',
    example: '2024-01-01',
  })
  startDate: string;

  @ApiProperty({
    description: 'Date de fin du calendrier',
    example: '2024-03-31',
  })
  endDate: string;

  @ApiProperty({
    description: 'Nombre de mois affichés',
    example: 3,
  })
  monthsCount: number;

  @ApiProperty({
    description: 'Message informatif',
    example: 'Calendrier du cycle pour 3 mois avec prédictions',
  })
  message: string;
}

// ============================================
// Symptoms DTOs
// ============================================

export class LogSymptomDto {
  @ApiProperty({
    description: 'Type de symptôme',
    example: 'cramps',
    enum: [
      'cramps',
      'bloating',
      'fatigue',
      'mood_swings',
      'breast_tenderness',
      'headache',
      'back_pain',
      'other',
    ],
  })
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'Intensité du symptôme (1=léger, 5=très fort)',
    example: 3,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  intensity: number;

  @ApiPropertyOptional({
    description: 'Notes sur le symptôme',
    example: 'Crampes légères le matin, soulagées par chaleur',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class LogSymptomsDto {
  @ApiProperty({
    description: 'Date des symptômes',
    example: '2024-01-15',
    type: String,
    format: 'date',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'Liste des symptômes ressentis',
    type: [LogSymptomDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LogSymptomDto)
  symptoms: LogSymptomDto[];
}

export class SymptomEntryDto {
  @ApiProperty({
    description: 'Identifiant du symptôme',
    example: 'symptom_123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Type de symptôme',
    example: 'cramps',
    enum: [
      'cramps',
      'bloating',
      'fatigue',
      'mood_swings',
      'breast_tenderness',
      'headache',
      'back_pain',
      'other',
    ],
  })
  type: string;

  @ApiProperty({
    description: 'Intensité (1-5)',
    example: 3,
  })
  intensity: number;

  @ApiPropertyOptional({
    description: 'Notes sur le symptôme',
    example: 'Crampes légères le matin',
  })
  notes?: string;

  @ApiProperty({
    description: 'Date du symptôme',
    example: '2024-01-15T00:00:00.000Z',
  })
  date: string;

  @ApiProperty({
    description: 'Date de création',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: string;
}

export class LogSymptomsResponseDto {
  @ApiProperty({
    description: 'Symptômes enregistrés',
    type: [SymptomEntryDto],
  })
  symptoms: SymptomEntryDto[];

  @ApiProperty({
    description: 'Date des symptômes',
    example: '2024-01-15',
  })
  date: string;

  @ApiProperty({
    description: 'Message de confirmation',
    example: '3 symptômes enregistrés pour le 15 janvier 2024',
  })
  message: string;
}

export class SymptomStatsDto {
  @ApiProperty({
    description: 'Type de symptôme',
    enum: [
      'period_day',
      'post_period_phase',
      'ovulation_phase',
      'post_ovulation_phase',
    ],
    example: 'period_day',
  })
  type: string;

  @ApiProperty({
    description: 'Intensité moyenne',
    example: 3.2,
  })
  averageIntensity: number;

  @ApiProperty({
    description: "Nombre d'occurrences",
    example: 15,
  })
  occurrences: number;

  @ApiProperty({
    description: 'Phase du cycle la plus fréquente',
    enum: [
      'period_day',
      'post_period_phase',
      'ovulation_phase',
      'post_ovulation_phase',
    ],
    example: 'period_day',
  })
  mostCommonPhase: string;

  @ApiProperty({
    description: "Pourcentage d'occurrence par phase",
    example: {
      period_day: 80,
      post_period_phase: 10,
      ovulation_phase: 5,
      post_ovulation_phase: 15,
    },
  })
  phaseDistribution: Record<string, number>;
}

export class SymptomsHistoryResponseDto {
  @ApiProperty({
    description: 'Historique des symptômes',
    type: [SymptomEntryDto],
  })
  symptoms: SymptomEntryDto[];

  @ApiProperty({
    description: 'Statistiques par type de symptôme',
    type: [SymptomStatsDto],
  })
  stats: SymptomStatsDto[];

  @ApiProperty({
    description: 'Période analysée - date de début',
    example: '2024-01-01',
  })
  periodStart: string;

  @ApiProperty({
    description: 'Période analysée - date de fin',
    example: '2024-01-31',
  })
  periodEnd: string;

  @ApiProperty({
    description: "Nombre total d'entrées de symptômes",
    example: 45,
  })
  totalEntries: number;

  @ApiProperty({
    description: 'Types de symptômes uniques',
    example: 8,
  })
  uniqueSymptomTypes: number;

  @ApiProperty({
    description: 'Message informatif',
    example:
      'Analyse de 45 symptômes sur 31 jours - 8 types différents identifiés',
  })
  message: string;
}

export class CycleStatisticsDto {
  @ApiProperty({
    description: 'Nombre total de cycles enregistrés',
    example: 12,
  })
  totalCycles: number;

  @ApiProperty({
    description: 'Durée moyenne du cycle en jours',
    example: 28.5,
  })
  averageCycleLength: number;

  @ApiProperty({
    description: 'Durée moyenne des règles en jours',
    example: 5.2,
  })
  averagePeriodLength: number;

  @ApiProperty({
    description: 'Pourcentage de cycles réguliers',
    example: 83.3,
  })
  regularityPercentage: number;

  @ApiProperty({
    description: 'Caractéristiques les plus communes',
    example: 'post_period_phase',
    enum: [
      'period_day',
      'post_period_phase',
      'ovulation_phase',
      'post_ovulation_phase',
    ],
  })
  mostCommonCharacteristics: string;

  @ApiProperty({
    description: 'Nombre de types de symptômes uniques',
    example: 8,
  })
  uniqueSymptomTypes: number;
}

// ============================================
// Cycle Comparison DTOs
// ============================================

export class CycleComparisonDataDto {
  @ApiProperty({
    description: 'Numéro du cycle dans la comparaison',
    example: 1,
  })
  cycleNumber: number;

  @ApiProperty({
    description: 'Date de début du cycle',
    example: '2024-01-15',
  })
  startDate: string;

  @ApiProperty({
    description: 'Durée du cycle en jours',
    example: 28,
  })
  cycleLength: number;

  @ApiProperty({
    description: 'Durée des règles en jours',
    example: 5,
  })
  periodLength: number;

  @ApiProperty({
    description: 'Le cycle est-il régulier',
    example: true,
  })
  isRegular: boolean;

  @ApiPropertyOptional({
    description: 'Intensité du flux (1-5)',
    example: 3,
  })
  flowIntensity?: number;

  @ApiPropertyOptional({
    description: 'Notes sur le cycle',
    example: "Cycle plus court que d'habitude",
  })
  notes?: string;
}

export class CycleTrendDto {
  @ApiProperty({
    description: 'Métrique analysée',
    example: 'Durée du cycle',
  })
  metric: string;

  @ApiProperty({
    description: 'Tendance observée',
    example: 'increasing',
    enum: ['increasing', 'decreasing', 'stable'],
  })
  trend: string;

  @ApiProperty({
    description: 'Changement absolu',
    example: 2,
  })
  change: number;

  @ApiProperty({
    description: 'Changement en pourcentage',
    example: 7.1,
  })
  changePercentage: number;

  @ApiProperty({
    description: 'Description de la tendance',
    example: 'Durée du cycle en augmentation (+2 jours)',
  })
  description: string;
}

export class CycleComparisonAveragesDto {
  @ApiProperty({
    description: 'Durée moyenne du cycle',
    example: 28.3,
  })
  cycleLength: number;

  @ApiProperty({
    description: 'Durée moyenne des règles',
    example: 5.2,
  })
  periodLength: number;

  @ApiProperty({
    description: 'Taux de régularité (%)',
    example: 67,
  })
  regularityRate: number;
}

export class CycleComparisonPeriodDto {
  @ApiProperty({
    description: 'Date de début de la période comparée',
    example: '2024-01-01',
  })
  startDate: string;

  @ApiProperty({
    description: 'Date de fin de la période comparée',
    example: '2024-03-15',
  })
  endDate: string;

  @ApiProperty({
    description: 'Nombre total de cycles comparés',
    example: 3,
  })
  totalCycles: number;
}

export class CycleComparisonResponseDto {
  @ApiProperty({
    description: 'Données des cycles comparés',
    type: [CycleComparisonDataDto],
  })
  cycles: CycleComparisonDataDto[];

  @ApiProperty({
    description: 'Tendances détectées',
    type: [CycleTrendDto],
  })
  trends: CycleTrendDto[];

  @ApiProperty({
    description: 'Insights et recommandations',
    type: [String],
    example: [
      '🎯 Excellente régularité : vos cycles varient de moins de 3 jours',
      '📈 Évolutions notables : Durée du cycle en augmentation (+2 jours)',
    ],
  })
  insights: string[];

  @ApiProperty({
    description: 'Moyennes calculées',
    type: CycleComparisonAveragesDto,
  })
  averages: CycleComparisonAveragesDto;

  @ApiProperty({
    description: 'Période analysée',
    type: CycleComparisonPeriodDto,
  })
  comparedPeriod: CycleComparisonPeriodDto;

  @ApiProperty({
    description: 'Message informatif',
    example: 'Comparaison de 3 cycles récents avec tendances et insights',
  })
  message: string;
}
