import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Cycle } from '../../domain/cycle.entity';
import { ICycleRepository } from '../../domain/cycle.repository';
import { CYCLE_REPOSITORY_TOKEN } from '../../tokens';

export interface GetCycleComparisonRequest {
  userId: string;
  lastNCycles?: number; // Nombre de cycles à comparer (défaut: 3)
}

export interface CycleComparisonData {
  cycleNumber: number;
  startDate: Date;
  cycleLength: number;
  periodLength: number;
  isRegular: boolean;
  flowIntensity?: number;
  notes?: string;
}

export interface CycleTrend {
  metric: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  change: number;
  changePercentage: number;
  description: string;
}

export interface GetCycleComparisonResponse {
  cycles: CycleComparisonData[];
  trends: CycleTrend[];
  insights: string[];
  averages: {
    cycleLength: number;
    periodLength: number;
    regularityRate: number;
  };
  comparedPeriod: {
    startDate: Date;
    endDate: Date;
    totalCycles: number;
  };
}

@Injectable()
export class GetCycleComparisonUseCase {
  constructor(
    @Inject(CYCLE_REPOSITORY_TOKEN)
    private readonly cycleRepository: ICycleRepository,
  ) {}

  async execute(
    request: GetCycleComparisonRequest,
  ): Promise<GetCycleComparisonResponse> {
    const lastNCycles = request.lastNCycles || 3;

    // Récupérer tous les cycles de l'utilisateur
    const allCycles = await this.cycleRepository.findByUserId(request.userId);

    if (allCycles.length === 0) {
      throw new NotFoundException('Aucun historique de cycles trouvé.');
    }

    // Trier par date (plus récent en premier) et prendre les N derniers cycles
    allCycles.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    const recentCycles = allCycles.slice(
      0,
      Math.min(lastNCycles, allCycles.length),
    );

    if (recentCycles.length < 2) {
      throw new NotFoundException(
        'Pas assez de données pour faire une comparaison. Au moins 2 cycles sont nécessaires.',
      );
    }

    // Convertir en format de comparaison
    const cycleComparisonData = recentCycles.map((cycle, index) => ({
      cycleNumber: recentCycles.length - index, // Numéroter du plus ancien au plus récent
      startDate: cycle.startDate,
      cycleLength: cycle.cycleLength || 28,
      periodLength: cycle.periodLength || 5,
      isRegular: cycle.isRegular,
      flowIntensity: undefined, // TODO: ajouter si disponible dans le futur
      notes: undefined, // TODO: ajouter si disponible dans le futur
    }));

    // Inverser pour avoir du plus ancien au plus récent pour l'analyse
    const sortedForAnalysis = [...cycleComparisonData].reverse();

    // Calculer les tendances
    const trends = this.calculateTrends(sortedForAnalysis);

    // Générer des insights
    const insights = this.generateInsights(sortedForAnalysis, trends);

    // Calculer les moyennes
    const averages = this.calculateAverages(sortedForAnalysis);

    // Période comparée
    const comparedPeriod = {
      startDate: recentCycles[recentCycles.length - 1].startDate,
      endDate: recentCycles[0].startDate,
      totalCycles: recentCycles.length,
    };

    return {
      cycles: cycleComparisonData, // Retourner dans l'ordre original (plus récent en premier)
      trends,
      insights,
      averages,
      comparedPeriod,
    };
  }

  private calculateTrends(cycles: CycleComparisonData[]): CycleTrend[] {
    const trends: CycleTrend[] = [];

    // Tendance de la longueur du cycle
    const cycleLengths = cycles.map((c) => c.cycleLength);
    const cycleLengthTrend = this.calculateTrendForMetric(
      cycleLengths,
      'Durée du cycle',
    );
    if (cycleLengthTrend) trends.push(cycleLengthTrend);

    // Tendance de la durée des règles
    const periodLengths = cycles.map((c) => c.periodLength);
    const periodLengthTrend = this.calculateTrendForMetric(
      periodLengths,
      'Durée des règles',
    );
    if (periodLengthTrend) trends.push(periodLengthTrend);

    // Tendance de régularité
    const regularityTrend = this.calculateRegularityTrend(cycles);
    if (regularityTrend) trends.push(regularityTrend);

    return trends;
  }

  private calculateTrendForMetric(
    values: number[],
    metricName: string,
  ): CycleTrend | null {
    if (values.length < 2) return null;

    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const change = lastValue - firstValue;
    const changePercentage = Math.round((change / firstValue) * 100 * 10) / 10;

    let trend: 'increasing' | 'decreasing' | 'stable';
    let description: string;

    if (Math.abs(change) <= 1) {
      trend = 'stable';
      description = `${metricName} reste stable`;
    } else if (change > 0) {
      trend = 'increasing';
      description = `${metricName} en augmentation (+${change} jours)`;
    } else {
      trend = 'decreasing';
      description = `${metricName} en diminution (${change} jours)`;
    }

    return {
      metric: metricName,
      trend,
      change,
      changePercentage,
      description,
    };
  }

  private calculateRegularityTrend(
    cycles: CycleComparisonData[],
  ): CycleTrend | null {
    if (cycles.length < 2) return null;

    const regularCyclesCount = cycles.filter((c) => c.isRegular).length;
    const regularityRate = (regularCyclesCount / cycles.length) * 100;

    // Comparer avec une hypothétique période précédente (simulation)
    // En réalité, il faudrait comparer avec les cycles précédents
    const change = 0; // Placeholder
    const changePercentage = 0; // Placeholder

    return {
      metric: 'Régularité',
      trend: 'stable',
      change,
      changePercentage,
      description: `Régularité actuelle: ${Math.round(regularityRate)}%`,
    };
  }

  private generateInsights(
    cycles: CycleComparisonData[],
    trends: CycleTrend[],
  ): string[] {
    const insights: string[] = [];

    // Analyse de la variation des longueurs de cycle
    const cycleLengths = cycles.map((c) => c.cycleLength);
    const cycleVariation =
      Math.max(...cycleLengths) - Math.min(...cycleLengths);

    if (cycleVariation <= 3) {
      insights.push(
        '🎯 Excellente régularité : vos cycles varient de moins de 3 jours',
      );
    } else if (cycleVariation <= 7) {
      insights.push('✅ Bonne régularité : variation normale de vos cycles');
    } else {
      insights.push(
        '⚠️ Cycles irréguliers : variation importante détectée, consultez un professionnel',
      );
    }

    // Analyse des tendances significatives
    const significantTrends = trends.filter((t) => Math.abs(t.change) > 2);
    if (significantTrends.length > 0) {
      const trendDescriptions = significantTrends
        .map((t) => t.description)
        .join(', ');
      insights.push(`📈 Évolutions notables : ${trendDescriptions}`);
    }

    // Analyse de la durée des règles
    const periodLengths = cycles.map((c) => c.periodLength);
    const avgPeriodLength =
      periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length;

    if (avgPeriodLength < 3) {
      insights.push(
        '🩸 Règles courtes : durée inférieure à la normale, surveillez votre santé',
      );
    } else if (avgPeriodLength > 7) {
      insights.push(
        '🩸 Règles longues : durée supérieure à la normale, consultez si cela persiste',
      );
    } else {
      insights.push('🩸 Durée des règles dans la normale');
    }

    // Conseils basés sur les patterns
    if (cycles.every((c) => c.isRegular)) {
      insights.push(
        '🌟 Félicitations ! Tous vos cycles récents sont réguliers',
      );
    }

    return insights;
  }

  private calculateAverages(cycles: CycleComparisonData[]) {
    const cycleLengths = cycles.map((c) => c.cycleLength);
    const periodLengths = cycles.map((c) => c.periodLength);
    const regularCycles = cycles.filter((c) => c.isRegular).length;

    return {
      cycleLength:
        Math.round(
          (cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length) * 10,
        ) / 10,
      periodLength:
        Math.round(
          (periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length) *
            10,
        ) / 10,
      regularityRate: Math.round((regularCycles / cycles.length) * 100),
    };
  }
}
