export enum CyclePhase {
  MENSTRUAL = 'MENSTRUAL',
  FOLLICULAR = 'FOLLICULAR',
  OVULATION = 'OVULATION',
  LUTEAL = 'LUTEAL',
}

export class Cycle {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly startDate: Date,
    public readonly cycleLength?: number,
    public readonly periodLength?: number,
    public readonly isRegular: boolean = true,
    public readonly providerId?: string,
    public readonly externalCycleId?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  /**
   * Calcule la phase actuelle du cycle en fonction de la date donnée
   */
  getCurrentPhase(currentDate: Date = new Date()): CyclePhase {
    const daysSinceStart = Math.floor(
      (currentDate.getTime() - this.startDate.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    const cycleLength = this.cycleLength || 28;
    const periodLength = this.periodLength || 5;

    // Calculer le jour actuel dans le cycle (1-based)
    const dayInCycle = daysSinceStart + 1;

    // Phase menstruelle : jours 1 à periodLength
    if (dayInCycle <= periodLength) {
      return CyclePhase.MENSTRUAL;
    }

    // Calculer le jour d'ovulation (14 jours avant la fin du cycle)
    const ovulationDay = cycleLength - 14;

    // Phase folliculaire : de la fin des règles jusqu'à 3 jours avant l'ovulation
    if (dayInCycle > periodLength && dayInCycle < ovulationDay - 2) {
      return CyclePhase.FOLLICULAR;
    }

    // Phase d'ovulation : période fertile (ovulation ± 2 jours)
    if (dayInCycle >= ovulationDay - 2 && dayInCycle <= ovulationDay + 2) {
      return CyclePhase.OVULATION;
    }

    // Phase lutéale : après l'ovulation jusqu'à la fin du cycle
    // Cette phase dure toujours environ 14 jours
    return CyclePhase.LUTEAL;
  }

  /**
   * Calcule le prochain début de cycle
   */
  getNextCycleStart(): Date {
    const cycleLength = this.cycleLength || 28;
    const nextStart = new Date(this.startDate);
    nextStart.setDate(nextStart.getDate() + cycleLength);
    return nextStart;
  }

  /**
   * Vérifie si le cycle est en cours
   */
  isCurrentCycle(currentDate: Date = new Date()): boolean {
    // A cycle is considered current if:
    // 1. The current date is after the start date, AND
    // 2. Either we're within the expected cycle length OR no new cycle has started
    const daysSinceStart = Math.floor((currentDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const cycleLength = this.cycleLength || 28;
    
    // If we're within a reasonable range (up to 1.5x the cycle length), consider it current
    // This handles cases where cycles are longer than expected
    return daysSinceStart >= 0 && daysSinceStart <= (cycleLength * 1.5);
  }

  /**
   * Valide les paramètres du cycle
   */
  static validateCycleParameters(cycleLength: number, periodLength: number): boolean {
    // Vérifier que la durée du cycle est dans les limites normales (21-35 jours)
    if (cycleLength < 21 || cycleLength > 35) {
      return false;
    }
    
    // Vérifier que la durée des règles est dans les limites normales (2-8 jours)
    if (periodLength < 2 || periodLength > 8) {
      return false;
    }
    
    // Vérifier que la durée des règles ne dépasse pas la durée du cycle
    if (periodLength >= cycleLength) {
      return false;
    }
    
    return true;
  }

  /**
   * Calcule le jour d'ovulation prévu
   */
  getOvulationDay(): number {
    const cycleLength = this.cycleLength || 28;
    // L'ovulation se produit généralement 14 jours avant les prochaines règles
    return cycleLength - 14;
  }

  /**
   * Détermine si une date est dans la période fertile
   */
  isFertileDay(date: Date): boolean {
    const daysSinceStart = Math.floor(
      (date.getTime() - this.startDate.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    
    const cycleLength = this.cycleLength || 28;
    const dayInCycle = daysSinceStart + 1;
    const ovulationDay = this.getOvulationDay();
    
    // Période fertile : 5 jours avant l'ovulation jusqu'à 2 jours après
    return dayInCycle >= ovulationDay - 5 && dayInCycle <= ovulationDay + 2;
  }
}

export class CycleProfileConfig {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly isCycleTrackingEnabled: boolean = true,
    public readonly usesExternalProvider: boolean = false,
    public readonly useMenopauseMode: boolean = false,
    public readonly averageCycleLength: number = 28,
    public readonly averagePeriodLength: number = 5,
    public readonly prefersManualInput: boolean = false,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}

export class Phase {
  constructor(
    public readonly id: string,
    public readonly cycleId: string,
    public readonly name: CyclePhase,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  /**
   * Vérifie si la phase est active à la date donnée
   */
  isActiveAt(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }

  /**
   * Calcule la durée de la phase en jours
   */
  getDurationInDays(): number {
    return (
      Math.floor(
        (this.endDate.getTime() - this.startDate.getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1
    );
  }
}
