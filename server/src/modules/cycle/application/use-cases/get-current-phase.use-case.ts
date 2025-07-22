import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  ICycleRepository,
  ICycleProfileConfigRepository,
} from '../../domain/cycle.repository';
import { CyclePhase } from '../../domain/cycle.entity';
import {
  CYCLE_REPOSITORY_TOKEN,
  CYCLE_PROFILE_CONFIG_REPOSITORY_TOKEN,
} from '../../tokens';

export interface GetCurrentPhaseRequest {
  userId: string;
  date?: Date;
}

export interface GetCurrentPhaseResponse {
  phase: CyclePhase;
  cycleDay: number;
  cycleLength: number;
  periodLength: number;
  daysUntilNextPhase: number;
  phaseDescription: string;
  recommendations: string[];
}

@Injectable()
export class GetCurrentPhaseUseCase {
  constructor(
    @Inject(CYCLE_REPOSITORY_TOKEN)
    private readonly cycleRepository: ICycleRepository,
    @Inject(CYCLE_PROFILE_CONFIG_REPOSITORY_TOKEN)
    private readonly configRepository: ICycleProfileConfigRepository,
  ) {}

  async execute(
    request: GetCurrentPhaseRequest,
  ): Promise<GetCurrentPhaseResponse> {
    const { userId, date = new Date() } = request;

    // Vérifier si l'utilisateur a activé le suivi des cycles
    const config = await this.configRepository.findByUserId(userId);
    if (!config || !config.isCycleTrackingEnabled) {
      throw new NotFoundException(
        "Le suivi des cycles n'est pas activé pour cet utilisateur",
      );
    }

    // Récupérer le cycle actuel
    const currentCycle =
      await this.cycleRepository.findCurrentCycleByUserId(userId);
    if (!currentCycle) {
      throw new NotFoundException(
        'Aucun cycle actuel trouvé pour cet utilisateur',
      );
    }

    // Calculer la phase actuelle
    const phase = currentCycle.getCurrentPhase(date);

    // Calculer le jour du cycle
    const daysSinceStart = Math.floor(
      (date.getTime() - currentCycle.startDate.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const cycleLength = currentCycle.cycleLength || config.averageCycleLength;
    const cycleDay = (daysSinceStart % cycleLength) + 1;

    // Calculer les jours jusqu'à la prochaine phase
    const daysUntilNextPhase = this.calculateDaysUntilNextPhase(
      phase,
      cycleDay,
      cycleLength,
      currentCycle.periodLength || config.averagePeriodLength,
    );

    return {
      phase,
      cycleDay,
      cycleLength,
      periodLength: currentCycle.periodLength || config.averagePeriodLength,
      daysUntilNextPhase,
      phaseDescription: this.getPhaseDescription(phase),
      recommendations: this.getPhaseRecommendations(phase),
    };
  }

  private calculateDaysUntilNextPhase(
    currentPhase: CyclePhase,
    cycleDay: number,
    cycleLength: number,
    periodLength: number,
  ): number {
    switch (currentPhase) {
      case CyclePhase.MENSTRUAL:
        return periodLength - cycleDay + 1;
      case CyclePhase.FOLLICULAR:
        return Math.floor(cycleLength / 2) - 2 - cycleDay + 1;
      case CyclePhase.OVULATION:
        return Math.floor(cycleLength / 2) + 2 - cycleDay + 1;
      case CyclePhase.LUTEAL:
        return cycleLength - cycleDay + 1;
      default:
        return 0;
    }
  }

  private getPhaseDescription(phase: CyclePhase): string {
    switch (phase) {
      case CyclePhase.MENSTRUAL:
        return 'Phase menstruelle - Période de repos et de récupération';
      case CyclePhase.FOLLICULAR:
        return 'Phase folliculaire - Énergie croissante, idéale pour commencer de nouveaux défis';
      case CyclePhase.OVULATION:
        return "Phase d'ovulation - Pic d'énergie, parfaite pour les entraînements intenses";
      case CyclePhase.LUTEAL:
        return "Phase lutéale - Focus sur la force et l'endurance modérée";
      default:
        return 'Phase non définie';
    }
  }

  private getPhaseRecommendations(phase: CyclePhase): string[] {
    switch (phase) {
      case CyclePhase.MENSTRUAL:
        return [
          'Privilégier les exercices doux (yoga, stretching)',
          'Rester hydratée et bien se reposer',
          "Écouter son corps et adapter l'intensité",
          'Focus sur la récupération',
        ];
      case CyclePhase.FOLLICULAR:
        return [
          "Commencer à augmenter l'intensité progressivement",
          'Exercices cardiovasculaires modérés',
          'Renforcement musculaire avec poids légers',
          'Planifier de nouveaux objectifs',
        ];
      case CyclePhase.OVULATION:
        return [
          'Entraînements HIIT et haute intensité',
          'Soulever des charges plus lourdes',
          "Sports d'équipe et activités sociales",
          "Profiter du pic d'énergie",
        ];
      case CyclePhase.LUTEAL:
        return [
          'Entraînement en force et musculation',
          'Exercices de stabilité et équilibre',
          'Activités anti-stress (méditation, yoga)',
          'Maintenir la régularité sans forcer',
        ];
      default:
        return ['Consulter un professionnel de santé'];
    }
  }
}
