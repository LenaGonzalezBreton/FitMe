import { Injectable, Inject } from '@nestjs/common';
import { Cycle } from '../../domain/cycle.entity';
import { ICycleRepository } from '../../domain/cycle.repository';
import { ISymptomLogRepository } from '../../domain/symptom-log.repository';
import {
  CYCLE_REPOSITORY_TOKEN,
  SYMPTOM_LOG_REPOSITORY_TOKEN,
} from '../../tokens';

export interface GetPeriodsHistoryRequest {
  userId: string;
  limit?: number;
  offset?: number;
  fromDate?: Date;
  toDate?: Date;
}

export interface PeriodWithSymptoms {
  cycle: Cycle;
  flowIntensity?: number;
  notes?: string;
}

export interface GetPeriodsHistoryResponse {
  periods: PeriodWithSymptoms[];
  total: number;
  averageCycleLength: number;
  averagePeriodLength: number;
  regularityPercentage: number;
}

@Injectable()
export class GetPeriodsHistoryUseCase {
  constructor(
    @Inject(CYCLE_REPOSITORY_TOKEN)
    private readonly cycleRepository: ICycleRepository,
    @Inject(SYMPTOM_LOG_REPOSITORY_TOKEN)
    private readonly symptomLogRepository: ISymptomLogRepository,
  ) {}

  async execute(
    request: GetPeriodsHistoryRequest,
  ): Promise<GetPeriodsHistoryResponse> {
    // Récupérer tous les cycles de l'utilisateur
    let cycles = await this.cycleRepository.findByUserId(request.userId);

    // Filtrer par dates si spécifiées
    if (request.fromDate || request.toDate) {
      cycles = cycles.filter((cycle) => {
        if (request.fromDate && cycle.startDate < request.fromDate) {
          return false;
        }
        if (request.toDate && cycle.startDate > request.toDate) {
          return false;
        }
        return true;
      });
    }

    // Trier par date de début (plus récent en premier)
    cycles.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

    const total = cycles.length;

    // Appliquer pagination
    const offset = request.offset || 0;
    const limit = request.limit || 50;
    const paginatedCycles = cycles.slice(offset, offset + limit);

    // Enrichir les cycles avec les données de symptômes
    const periodsWithSymptoms = await this.enrichWithSymptoms(
      paginatedCycles,
      request.userId,
    );

    // Calculer les statistiques
    const stats = this.calculateStatistics(cycles);

    return {
      periods: periodsWithSymptoms,
      total,
      averageCycleLength: stats.averageCycleLength,
      averagePeriodLength: stats.averagePeriodLength,
      regularityPercentage: stats.regularityPercentage,
    };
  }

  private async enrichWithSymptoms(
    cycles: Cycle[],
    userId: string,
  ): Promise<PeriodWithSymptoms[]> {
    const enrichedPeriods: PeriodWithSymptoms[] = [];

    for (const cycle of cycles) {
      // Récupérer les symptômes pour la date de début de ce cycle
      const symptoms = await this.symptomLogRepository.findByUserIdAndDate(
        userId,
        cycle.startDate,
      );

      // Extraire les données pertinentes
      const flowIntensitySymptom = symptoms.find(
        (s) => s.symptomType === 'FLOW_INTENSITY',
      );
      const notesSymptom = symptoms.find(
        (s) => s.symptomType === 'PERIOD_NOTES',
      );

      enrichedPeriods.push({
        cycle,
        flowIntensity: flowIntensitySymptom
          ? parseInt(flowIntensitySymptom.value)
          : undefined,
        notes: notesSymptom?.value || undefined,
      });
    }

    return enrichedPeriods;
  }

  private calculateStatistics(cycles: Cycle[]): {
    averageCycleLength: number;
    averagePeriodLength: number;
    regularityPercentage: number;
  } {
    if (cycles.length === 0) {
      return {
        averageCycleLength: 28,
        averagePeriodLength: 5,
        regularityPercentage: 0,
      };
    }

    // Calculer la durée moyenne du cycle
    const cycleLengths = cycles
      .filter((cycle) => cycle.cycleLength != null)
      .map((cycle) => cycle.cycleLength!);

    const averageCycleLength =
      cycleLengths.length > 0
        ? cycleLengths.reduce((sum, length) => sum + length, 0) /
          cycleLengths.length
        : 28;

    // Calculer la durée moyenne des règles
    const periodLengths = cycles
      .filter((cycle) => cycle.periodLength != null)
      .map((cycle) => cycle.periodLength!);

    const averagePeriodLength =
      periodLengths.length > 0
        ? periodLengths.reduce((sum, length) => sum + length, 0) /
          periodLengths.length
        : 5;

    // Calculer le pourcentage de régularité
    const regularCycles = cycles.filter((cycle) => cycle.isRegular).length;
    const regularityPercentage =
      cycles.length > 0 ? (regularCycles / cycles.length) * 100 : 0;

    return {
      averageCycleLength: Math.round(averageCycleLength * 10) / 10,
      averagePeriodLength: Math.round(averagePeriodLength * 10) / 10,
      regularityPercentage: Math.round(regularityPercentage * 10) / 10,
    };
  }
}
