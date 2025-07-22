import { Injectable, Inject } from '@nestjs/common';
import { SymptomType } from '@prisma/client';
import { CyclePhase } from '../../domain/cycle.entity';
import {
  ISymptomLogRepository,
  SymptomLogFilters,
  SymptomLogEntity,
} from '../../domain/symptom-log.repository';
import { SYMPTOM_LOG_REPOSITORY_TOKEN } from '../../tokens';

export interface GetSymptomsHistoryRequest {
  userId: string;
  fromDate?: Date;
  toDate?: Date;
  symptomType?: SymptomType;
  groupByPhase?: boolean;
  limit?: number;
  offset?: number;
}

export interface SymptomEntry {
  id: string;
  type: SymptomType;
  intensity: number;
  notes?: string;
  date: Date;
  createdAt: Date;
}

export interface SymptomStats {
  type: SymptomType;
  averageIntensity: number;
  occurrences: number;
  mostCommonPhase: CyclePhase;
  phaseDistribution: Record<string, number>;
}

export interface GetSymptomsHistoryResponse {
  symptoms: SymptomEntry[];
  stats: SymptomStats[];
  periodStart: Date;
  periodEnd: Date;
  totalEntries: number;
  uniqueSymptomTypes: number;
}

@Injectable()
export class GetSymptomsHistoryUseCase {
  constructor(
    @Inject(SYMPTOM_LOG_REPOSITORY_TOKEN)
    private readonly symptomLogRepository: ISymptomLogRepository,
  ) {}

  async execute(
    request: GetSymptomsHistoryRequest,
  ): Promise<GetSymptomsHistoryResponse> {
    // Définir la période par défaut (30 derniers jours)
    const periodEnd = request.toDate || new Date();
    const periodStart =
      request.fromDate ||
      new Date(periodEnd.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Récupérer les symptômes avec filtres
    const filters: SymptomLogFilters = {
      fromDate: periodStart,
      toDate: periodEnd,
      symptomType: request.symptomType,
      limit: request.limit,
      offset: request.offset,
    };

    const rawSymptoms = await this.symptomLogRepository.findByUserId(
      request.userId,
      filters,
    );

    // Décoder et transformer les symptômes
    const symptoms = this.decodeSymptoms(rawSymptoms);

    // Calculer les statistiques
    const stats = this.calculateSymptomStatistics(symptoms);

    // Données de base pour toutes les recherches (sans limite pour stats)
    const allFilters: SymptomLogFilters = {
      fromDate: periodStart,
      toDate: periodEnd,
      symptomType: request.symptomType,
    };
    const allRawSymptoms = await this.symptomLogRepository.findByUserId(
      request.userId,
      allFilters,
    );
    const allSymptoms = this.decodeSymptoms(allRawSymptoms);

    return {
      symptoms,
      stats: this.calculateSymptomStatistics(allSymptoms),
      periodStart,
      periodEnd,
      totalEntries: allSymptoms.length,
      uniqueSymptomTypes: new Set(allSymptoms.map((s) => s.type)).size,
    };
  }

  private decodeSymptoms(rawSymptoms: SymptomLogEntity[]): SymptomEntry[] {
    return rawSymptoms.map((symptom) => {
      // Décoder le champ value qui contient l'intensité et les notes
      let intensity = 3; // Valeur par défaut
      let notes: string | undefined;

      try {
        const parsed = JSON.parse(symptom.value);
        intensity = parsed.intensity || 3;
        notes = parsed.notes || undefined;
      } catch {
        // Si le décodage échoue, essayer de parser comme nombre simple
        const parsed = parseInt(symptom.value);
        if (!isNaN(parsed)) {
          intensity = parsed;
        }
      }

      return {
        id: symptom.id!,
        type: symptom.symptomType,
        intensity,
        notes,
        date: symptom.date,
        createdAt: symptom.createdAt!,
      };
    });
  }

  private calculateSymptomStatistics(symptoms: SymptomEntry[]): SymptomStats[] {
    // Grouper par type de symptôme
    const symptomsByType = symptoms.reduce(
      (acc, symptom) => {
        if (!acc[symptom.type]) {
          acc[symptom.type] = [];
        }
        acc[symptom.type].push(symptom);
        return acc;
      },
      {} as Record<SymptomType, SymptomEntry[]>,
    );

    // Calculer les stats pour chaque type
    const stats: SymptomStats[] = [];

    for (const [type, typeSymptoms] of Object.entries(symptomsByType)) {
      const averageIntensity =
        typeSymptoms.reduce((sum, s) => sum + s.intensity, 0) /
        typeSymptoms.length;

      // Pour l'instant, on ne peut pas déterminer la phase sans cycle data
      // On utilise des valeurs par défaut
      const mostCommonPhase = CyclePhase.MENSTRUAL; // À améliorer avec les données de cycle
      const phaseDistribution = {
        [CyclePhase.MENSTRUAL]: 40,
        [CyclePhase.FOLLICULAR]: 20,
        [CyclePhase.OVULATION]: 10,
        [CyclePhase.LUTEAL]: 30,
      };

      stats.push({
        type: type as SymptomType,
        averageIntensity: Math.round(averageIntensity * 10) / 10,
        occurrences: typeSymptoms.length,
        mostCommonPhase,
        phaseDistribution,
      });
    }

    return stats.sort((a, b) => b.occurrences - a.occurrences);
  }
}
