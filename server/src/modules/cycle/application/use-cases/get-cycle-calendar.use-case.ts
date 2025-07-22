import { Injectable, Inject } from '@nestjs/common';
import { Cycle, CyclePhase } from '../../domain/cycle.entity';
import { ICycleRepository } from '../../domain/cycle.repository';
import { CYCLE_REPOSITORY_TOKEN } from '../../tokens';
import { GetCyclePredictionsUseCase } from './get-cycle-predictions.use-case';

export interface GetCycleCalendarRequest {
  userId: string;
  startDate?: Date;
  months?: number;
}

export interface CalendarDay {
  date: Date;
  phase?: CyclePhase;
  cycleDay?: number;
  dayType:
    | 'period_start'
    | 'period_day'
    | 'ovulation'
    | 'fertile'
    | 'normal'
    | 'predicted_period'
    | 'predicted_ovulation';
  events?: string[];
  isPredicted: boolean;
}

export interface GetCycleCalendarResponse {
  calendar: CalendarDay[];
  startDate: Date;
  endDate: Date;
  monthsCount: number;
}

@Injectable()
export class GetCycleCalendarUseCase {
  constructor(
    @Inject(CYCLE_REPOSITORY_TOKEN)
    private readonly cycleRepository: ICycleRepository,
    private readonly getCyclePredictionsUseCase: GetCyclePredictionsUseCase,
  ) {}

  async execute(
    request: GetCycleCalendarRequest,
  ): Promise<GetCycleCalendarResponse> {
    const startDate = request.startDate || new Date();
    const months = request.months || 3;

    // Calculer la période du calendrier
    const calendarStart = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      1,
    );
    const calendarEnd = new Date(calendarStart);
    calendarEnd.setMonth(calendarEnd.getMonth() + months);
    calendarEnd.setDate(0); // Dernier jour du mois précédent

    // Récupérer l'historique des cycles et les prédictions
    const cycles = await this.cycleRepository.findByUserId(request.userId);

    let predictions = null;
    try {
      predictions = await this.getCyclePredictionsUseCase.execute({
        userId: request.userId,
      });
    } catch {
      // Ignorer si pas de prédictions possibles
    }

    // Générer le calendrier
    const calendar = this.generateCalendarDays(
      calendarStart,
      calendarEnd,
      cycles,
      predictions,
    );

    return {
      calendar,
      startDate: calendarStart,
      endDate: calendarEnd,
      monthsCount: months,
    };
  }

  private generateCalendarDays(
    startDate: Date,
    endDate: Date,
    cycles: Cycle[],
    predictions: any,
  ): CalendarDay[] {
    const calendar: CalendarDay[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const calendarDay = this.createCalendarDay(
        currentDate,
        cycles,
        predictions,
      );
      calendar.push(calendarDay);

      // Passer au jour suivant
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return calendar;
  }

  private createCalendarDay(
    date: Date,
    cycles: Cycle[],
    predictions: any,
  ): CalendarDay {
    const dayInfo = this.analyzeDayInCycles(date, cycles);

    // Déterminer le type de jour
    let dayType: CalendarDay['dayType'] = 'normal';
    let isPredicted = false;
    const events: string[] = [];

    if (dayInfo.cycle) {
      // Jour basé sur un cycle confirmé
      const cycleDay = dayInfo.cycleDay!;
      const phase = dayInfo.phase!;

      if (cycleDay === 1) {
        dayType = 'period_start';
        events.push('début_règles');
      } else if (cycleDay <= (dayInfo.cycle.periodLength || 5)) {
        dayType = 'period_day';
        events.push('règles');
      } else if (phase === CyclePhase.OVULATION) {
        dayType = 'ovulation';
        events.push('ovulation');
      } else if (this.isFertileDay(cycleDay, dayInfo.cycle.cycleLength || 28)) {
        dayType = 'fertile';
        events.push('période_fertile');
      }
    } else if (predictions) {
      // Jours prédits
      isPredicted = true;

      if (this.isSameDay(date, predictions.nextPeriodStart)) {
        dayType = 'predicted_period';
        events.push('règles_prédites');
      } else if (this.isSameDay(date, predictions.nextOvulation)) {
        dayType = 'predicted_ovulation';
        events.push('ovulation_prédite');
      } else if (this.isNearDate(date, predictions.nextOvulation, 2)) {
        dayType = 'fertile';
        events.push('période_fertile_prédite');
      }
    }

    return {
      date: new Date(date),
      phase: dayInfo.phase,
      cycleDay: dayInfo.cycleDay,
      dayType,
      events: events.length > 0 ? events : undefined,
      isPredicted,
    };
  }

  private analyzeDayInCycles(
    date: Date,
    cycles: Cycle[],
  ): {
    cycle?: Cycle;
    phase?: CyclePhase;
    cycleDay?: number;
  } {
    // Trouver le cycle qui contient cette date
    for (const cycle of cycles) {
      const cycleEndDate = new Date(cycle.startDate);
      cycleEndDate.setDate(
        cycleEndDate.getDate() + (cycle.cycleLength || 28) - 1,
      );

      if (date >= cycle.startDate && date <= cycleEndDate) {
        const cycleDay =
          Math.floor(
            (date.getTime() - cycle.startDate.getTime()) /
              (1000 * 60 * 60 * 24),
          ) + 1;

        const phase = this.getPhaseForCycleDay(
          cycleDay,
          cycle.cycleLength || 28,
        );

        return {
          cycle,
          phase,
          cycleDay,
        };
      }
    }

    return {};
  }

  private getPhaseForCycleDay(
    cycleDay: number,
    cycleLength: number,
  ): CyclePhase {
    // Phase menstruelle : jours 1-5
    if (cycleDay <= 5) {
      return CyclePhase.MENSTRUAL;
    }

    // Phase folliculaire : après les règles jusqu'à l'ovulation
    const ovulationDay = cycleLength - 14;
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

  private isFertileDay(cycleDay: number, cycleLength: number): boolean {
    // Période fertile : ovulation ± 5 jours
    const ovulationDay = cycleLength - 14;
    return cycleDay >= ovulationDay - 5 && cycleDay <= ovulationDay + 1;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  private isNearDate(
    date: Date,
    targetDate: Date,
    daysDifference: number,
  ): boolean {
    const diffTime = Math.abs(date.getTime() - targetDate.getTime());
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= daysDifference;
  }
}
