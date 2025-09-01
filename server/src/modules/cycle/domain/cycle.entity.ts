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

    const dayInCycle = daysSinceStart % cycleLength;

    // Phase menstruelle : jours 1-5 (par défaut)
    if (dayInCycle < periodLength) {
      return CyclePhase.MENSTRUAL;
    }

    // Phase folliculaire : jours 6-13 (par défaut)
    if (dayInCycle < Math.floor(cycleLength / 2) - 2) {
      return CyclePhase.FOLLICULAR;
    }

    // Phase d'ovulation : jours 14-16 (par défaut)
    if (dayInCycle < Math.floor(cycleLength / 2) + 2) {
      return CyclePhase.OVULATION;
    }

    // Phase lutéale : jours 17-28 (par défaut)
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
    const nextCycleStart = this.getNextCycleStart();
    return currentDate >= this.startDate && currentDate < nextCycleStart;
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
