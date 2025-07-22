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
import { CyclePhase } from '../../domain/cycle.entity';
import { SymptomType } from '@prisma/client';

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
  @ApiProperty({
    description: 'Date de début des règles',
    example: '2024-01-15',
    type: String,
    format: 'date',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

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
    description: 'Date prédite des prochaines règles',
    example: '2024-02-12T00:00:00.000Z',
  })
  nextPeriodStart: string;

  @ApiProperty({
    description: 'Date prédite de la prochaine ovulation',
    example: '2024-01-28T00:00:00.000Z',
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
    description: 'Phase actuelle du cycle',
    enum: CyclePhase,
    example: CyclePhase.OVULATION,
  })
  currentPhase: CyclePhase;

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
    description: 'Phase du cycle ce jour',
    enum: CyclePhase,
    example: CyclePhase.MENSTRUAL,
  })
  phase?: CyclePhase;

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
    enum: SymptomType,
    example: SymptomType.CRAMPS,
  })
  @IsEnum(SymptomType)
  @IsNotEmpty()
  type: SymptomType;

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
    enum: SymptomType,
    example: SymptomType.CRAMPS,
  })
  type: SymptomType;

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
    enum: SymptomType,
    example: SymptomType.CRAMPS,
  })
  type: SymptomType;

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
    enum: CyclePhase,
    example: CyclePhase.MENSTRUAL,
  })
  mostCommonPhase: CyclePhase;

  @ApiProperty({
    description: "Pourcentage d'occurrence par phase",
    example: {
      MENSTRUAL: 80,
      FOLLICULAR: 10,
      OVULATION: 5,
      LUTEAL: 15,
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
