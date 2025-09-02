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
   * Calcule le jour actuel dans le cycle
   */
  getCurrentCycleDay(currentDate: Date = new Date()): number {
    const daysSinceStart = Math.floor(
      (currentDate.getTime() - this.startDate.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return daysSinceStart + 1;
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
    // 1. The current date is after or equal to the start date, AND
    // 2. Either we're within the expected cycle length OR no new cycle has started
    const daysSinceStart = Math.floor((currentDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const cycleLength = this.cycleLength || 28;
    
    // Handle same-day cycles and time zone differences (allow -1 for edge cases)
    // If we're within a reasonable range (up to 1.5x the cycle length), consider it current
    // This handles cases where cycles are longer than expected
    return daysSinceStart >= -1 && daysSinceStart <= (cycleLength * 1.5);
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

  /**
   * Détermine si une date est pendant les règles
   */
  isPeriodDay(date: Date): boolean {
    const dayInCycle = this.getCurrentCycleDay(date);
    const periodLength = this.periodLength || 5;
    return dayInCycle <= periodLength;
  }

  /**
   * Détermine si une date est dans la phase post-règles (énergie croissante)
   */
  isPostPeriodPhase(date: Date): boolean {
    const dayInCycle = this.getCurrentCycleDay(date);
    const periodLength = this.periodLength || 5;
    const ovulationDay = this.getOvulationDay();
    return dayInCycle > periodLength && dayInCycle < ovulationDay - 2;
  }

  /**
   * Détermine si une date est dans la phase d'ovulation
   */
  isOvulationPhase(date: Date): boolean {
    const dayInCycle = this.getCurrentCycleDay(date);
    const ovulationDay = this.getOvulationDay();
    return dayInCycle >= ovulationDay - 2 && dayInCycle <= ovulationDay + 2;
  }

  /**
   * Détermine si une date est dans la phase post-ovulation
   */
  isPostOvulationPhase(date: Date): boolean {
    const dayInCycle = this.getCurrentCycleDay(date);
    const ovulationDay = this.getOvulationDay();
    return dayInCycle > ovulationDay + 2;
  }
}


