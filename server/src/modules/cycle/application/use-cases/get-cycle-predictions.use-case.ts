import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Cycle, CyclePhase } from '../../domain/cycle.entity';
import { ICycleRepository } from '../../domain/cycle.repository';
import { CYCLE_REPOSITORY_TOKEN } from '../../tokens';

export interface GetCyclePredictionsRequest {
  userId: string;
}

export interface CyclePrediction {
  nextPeriodStart: Date;
  nextOvulation: Date;
  confidence: number;
  currentCycleDay: number;
  currentPhase: CyclePhase;
  daysUntilNextPeriod: number;
  daysUntilOvulation: number;
}

@Injectable()
export class GetCyclePredictionsUseCase {
  constructor(
    @Inject(CYCLE_REPOSITORY_TOKEN)
    private readonly cycleRepository: ICycleRepository,
  ) {}

  async execute(request: GetCyclePredictionsRequest): Promise<CyclePrediction> {
    // Récupérer l'historique des cycles
    const cycles = await this.cycleRepository.findByUserId(request.userId);

    if (cycles.length === 0) {
      throw new NotFoundException(
        'Aucun historique de cycles trouvé. Commencez par enregistrer vos règles.',
      );
    }

    // Trier par date (plus récent en premier)
    cycles.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

    const currentDate = new Date();
    const currentCycle = this.getCurrentCycle(cycles, currentDate);

    // Calculer les statistiques basées sur l'historique
    const stats = this.calculateCycleStatistics(cycles);

    // Déterminer la phase actuelle et le jour du cycle
    const { currentPhase, currentCycleDay } = this.getCurrentPhaseAndDay(
      currentCycle,
      currentDate,
      stats.averageCycleLength,
    );

    // Prédire la prochaine période et ovulation
    const nextPeriodStart = this.predictNextPeriodStart(
      currentCycle || cycles[0],
      stats.averageCycleLength,
      currentDate,
    );

    const nextOvulation = this.predictOvulation(
      nextPeriodStart,
      stats.averageCycleLength,
    );

    // Calculer la confiance basée sur la régularité
    const confidence = this.calculateConfidence(cycles, stats);

    // Calculer les jours restants
    const daysUntilNextPeriod = this.calculateDaysUntil(
      currentDate,
      nextPeriodStart,
    );
    const daysUntilOvulation = this.calculateDaysUntil(
      currentDate,
      nextOvulation,
    );

    return {
      nextPeriodStart,
      nextOvulation,
      confidence,
      currentCycleDay,
      currentPhase,
      daysUntilNextPeriod,
      daysUntilOvulation: daysUntilOvulation < 0 ? 0 : daysUntilOvulation,
    };
  }

  private getCurrentCycle(cycles: Cycle[], currentDate: Date): Cycle | null {
    // Trouver le cycle actuel basé sur la date
    for (const cycle of cycles) {
      const cycleEndDate = new Date(cycle.startDate);
      cycleEndDate.setDate(cycleEndDate.getDate() + (cycle.cycleLength || 28));

      if (currentDate >= cycle.startDate && currentDate <= cycleEndDate) {
        return cycle;
      }
    }
    return null;
  }

  private calculateCycleStatistics(cycles: Cycle[]): {
    averageCycleLength: number;
    averagePeriodLength: number;
    regularityScore: number;
  } {
    const recentCycles = cycles.slice(0, 6); // 6 derniers cycles

    // Calculer la durée moyenne du cycle
    const cycleLengths = recentCycles
      .filter((cycle) => cycle.cycleLength != null)
      .map((cycle) => cycle.cycleLength!);

    const averageCycleLength =
      cycleLengths.length > 0
        ? cycleLengths.reduce((sum, length) => sum + length, 0) /
          cycleLengths.length
        : 28;

    // Calculer la durée moyenne des règles
    const periodLengths = recentCycles
      .filter((cycle) => cycle.periodLength != null)
      .map((cycle) => cycle.periodLength!);

    const averagePeriodLength =
      periodLengths.length > 0
        ? periodLengths.reduce((sum, length) => sum + length, 0) /
          periodLengths.length
        : 5;

    // Calculer le score de régularité (variance des durées de cycle)
    const variance =
      cycleLengths.length > 1
        ? cycleLengths.reduce(
            (sum, length) => sum + Math.pow(length - averageCycleLength, 2),
            0,
          ) / cycleLengths.length
        : 0;

    const regularityScore = Math.max(0, 100 - variance * 10);

    return {
      averageCycleLength,
      averagePeriodLength,
      regularityScore,
    };
  }

  private getCurrentPhaseAndDay(
    currentCycle: Cycle | null,
    currentDate: Date,
    averageCycleLength: number,
  ): { currentPhase: CyclePhase; currentCycleDay: number } {
    if (!currentCycle) {
      return {
        currentPhase: CyclePhase.FOLLICULAR,
        currentCycleDay: 1,
      };
    }

    const daysDifference = Math.floor(
      (currentDate.getTime() - currentCycle.startDate.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const currentCycleDay = daysDifference + 1;

    // Déterminer la phase basée sur le jour du cycle
    const currentPhase = this.getPhaseForCycleDay(
      currentCycleDay,
      averageCycleLength,
    );

    return { currentPhase, currentCycleDay };
  }

  private getPhaseForCycleDay(
    cycleDay: number,
    cycleLength: number,
  ): CyclePhase {
    // Phase menstruelle : jours 1-5 (approximatif)
    if (cycleDay <= 5) {
      return CyclePhase.MENSTRUAL;
    }

    // Phase folliculaire : après les règles jusqu'à l'ovulation
    const ovulationDay = cycleLength - 14; // Approximatif
    if (cycleDay < ovulationDay) {
      return CyclePhase.FOLLICULAR;
    }

    // Phase d'ovulation : autour du jour d'ovulation (±2 jours)
    if (cycleDay >= ovulationDay - 2 && cycleDay <= ovulationDay + 2) {
      return CyclePhase.OVULATION;
    }

    // Phase lutéale : après l'ovulation
    return CyclePhase.LUTEAL;
  }

  private predictNextPeriodStart(
    lastCycle: Cycle,
    averageCycleLength: number,
    currentDate: Date,
  ): Date {
    const nextPeriodStart = new Date(lastCycle.startDate);
    nextPeriodStart.setDate(nextPeriodStart.getDate() + averageCycleLength);

    // Si la prédiction est dans le passé, ajouter un autre cycle
    while (nextPeriodStart <= currentDate) {
      nextPeriodStart.setDate(nextPeriodStart.getDate() + averageCycleLength);
    }

    return nextPeriodStart;
  }

  private predictOvulation(nextPeriodStart: Date, cycleLength: number): Date {
    // L'ovulation se produit généralement 14 jours avant le début des prochaines règles
    const ovulationDate = new Date(nextPeriodStart);
    ovulationDate.setDate(ovulationDate.getDate() - 14);

    return ovulationDate;
  }

  private calculateConfidence(
    cycles: Cycle[],
    stats: { regularityScore: number },
  ): number {
    // La confiance dépend de :
    // 1. Nombre de cycles dans l'historique
    // 2. Régularité des cycles
    // 3. Complétion des données

    let confidence = 50; // Base

    // Bonus pour l'historique
    const historyBonus = Math.min(cycles.length * 5, 30);
    confidence += historyBonus;

    // Bonus pour la régularité
    const regularityBonus = (stats.regularityScore / 100) * 20;
    confidence += regularityBonus;

    // Malus si peu de données complètes
    const completeCycles = cycles.filter(
      (cycle) => cycle.cycleLength != null && cycle.periodLength != null,
    ).length;

    const completeDataRatio =
      cycles.length > 0 ? completeCycles / cycles.length : 0;
    confidence *= completeDataRatio;

    return Math.min(Math.max(Math.round(confidence), 10), 95);
  }

  private calculateDaysUntil(currentDate: Date, targetDate: Date): number {
    const diffTime = targetDate.getTime() - currentDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
