import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Cycle } from '../../domain/cycle.entity';
import { ICycleRepository, ICycleProfileConfigRepository } from '../../domain/cycle.repository';
import { CYCLE_REPOSITORY_TOKEN, CYCLE_PROFILE_CONFIG_REPOSITORY_TOKEN } from '../../tokens';

export interface GetCyclePredictionsRequest {
  userId: string;
}

export interface CyclePrediction {
  nextPeriodStart: Date;
  nextOvulation: Date;
  confidence: number;
  currentCycleDay: number;
  currentPhase: string;
  daysUntilNextPeriod: number;
  daysUntilOvulation: number;
}

@Injectable()
export class GetCyclePredictionsUseCase {
  constructor(
    @Inject(CYCLE_REPOSITORY_TOKEN)
    private readonly cycleRepository: ICycleRepository,
    @Inject(CYCLE_PROFILE_CONFIG_REPOSITORY_TOKEN)
    private readonly cycleProfileConfigRepository: ICycleProfileConfigRepository,
  ) {}

  async execute(request: GetCyclePredictionsRequest): Promise<CyclePrediction> {
    // Vérifier la configuration du profil pour la ménopause
    const profileConfig = await this.cycleProfileConfigRepository.findByUserId(request.userId);
    
    if (profileConfig?.useMenopauseMode) {
      throw new NotFoundException(
        'Le suivi des cycles est désactivé en mode ménopause. Les prédictions ne sont pas disponibles.',
      );
    }

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
    // Trouver le cycle actuel (le plus récent qui n'est pas terminé)
    for (const cycle of cycles) {
      const cycleEndDate = new Date(cycle.startDate);
      cycleEndDate.setDate(cycleEndDate.getDate() + (cycle.cycleLength || 28));

      if (currentDate >= cycle.startDate && currentDate <= cycleEndDate) {
        return cycle;
      }
    }

    return null;
  }

  private calculateCycleStatistics(cycles: Cycle[]) {
    if (cycles.length === 0) {
      return {
        averageCycleLength: 28,
        averagePeriodLength: 5,
        regularityScore: 0,
      };
    }

    // Calculer la longueur moyenne des cycles
    const cycleLengths = cycles.map((cycle) => cycle.cycleLength || 28);
    const averageCycleLength = Math.round(
      cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length,
    );

    // Calculer la longueur moyenne des règles
    const periodLengths = cycles
      .map((cycle) => cycle.periodLength)
      .filter((length): length is number => length !== null && length !== undefined);
    const averagePeriodLength = periodLengths.length > 0
      ? Math.round(
          periodLengths.reduce((sum, length) => sum + length, 0) / periodLengths.length,
        )
      : 5;

    // Calculer un score de régularité
    const regularityScore = this.calculateRegularityScore(cycles, averageCycleLength);

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
  ): { currentPhase: string; currentCycleDay: number } {
    if (!currentCycle) {
      return {
        currentPhase: 'follicular',
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
      currentCycle?.periodLength || 5,
    );

    return { currentPhase, currentCycleDay };
  }

  private getPhaseForCycleDay(
    cycleDay: number,
    cycleLength: number,
    periodLength: number = 5,
  ): string {
    // Phase menstruelle : jours 1 à periodLength
    if (cycleDay <= periodLength) {
      return 'menstrual';
    }

    // Calculer le jour d'ovulation (14 jours avant la fin du cycle)
    const ovulationDay = cycleLength - 14;

    // Phase folliculaire : de la fin des règles jusqu'à 3 jours avant l'ovulation
    if (cycleDay > periodLength && cycleDay < ovulationDay - 2) {
      return 'follicular';
    }

    // Phase d'ovulation : période fertile (ovulation ± 2 jours)
    if (cycleDay >= ovulationDay - 2 && cycleDay <= ovulationDay + 2) {
      return 'ovulation';
    }

    // Phase lutéale : après l'ovulation jusqu'à la fin du cycle
    // Cette phase dure toujours environ 14 jours
    return 'luteal';
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

    // Si l'ovulation est dans le passé, calculer pour le cycle actuel
    const currentDate = new Date();
    if (ovulationDate < currentDate) {
      // Calculer l'ovulation pour le cycle suivant
      const nextCycleOvulation = new Date(nextPeriodStart);
      nextCycleOvulation.setDate(nextCycleOvulation.getDate() + cycleLength - 14);
      return nextCycleOvulation;
    }

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

    // Bonus pour le nombre de cycles
    if (cycles.length >= 3) confidence += 20;
    if (cycles.length >= 6) confidence += 15;
    if (cycles.length >= 12) confidence += 15;

    // Bonus pour la régularité
    confidence += Math.min(stats.regularityScore, 20);

    return Math.min(confidence, 100);
  }

  private calculateRegularityScore(cycles: Cycle[], averageCycleLength: number): number {
    if (cycles.length < 2) return 0;

    let totalDeviation = 0;
    for (let i = 1; i < cycles.length; i++) {
      const currentCycle = cycles[i];
      const previousCycle = cycles[i - 1];

      const currentLength = currentCycle.cycleLength || 28;
      const previousLength = previousCycle.cycleLength || 28;

      const deviation = Math.abs(currentLength - previousLength);
      totalDeviation += deviation;
    }

    const averageDeviation = totalDeviation / (cycles.length - 1);
    const regularityScore = Math.max(0, 20 - averageDeviation);

    return Math.round(regularityScore);
  }

  private calculateDaysUntil(currentDate: Date, targetDate: Date): number {
    const timeDifference = targetDate.getTime() - currentDate.getTime();
    return Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  }
}
