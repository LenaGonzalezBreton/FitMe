import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  ICycleRepository,
  ICycleProfileConfigRepository,
} from '../../domain/cycle.repository';
import {
  CYCLE_REPOSITORY_TOKEN,
  CYCLE_PROFILE_CONFIG_REPOSITORY_TOKEN,
} from '../../tokens';

export interface GetCurrentCycleRequest {
  userId: string;
  date?: Date;
}

export interface GetCurrentCycleResponse {
  cycleDay: number;
  cycleLength: number;
  periodLength: number;
  isPeriodDay: boolean;
  isOvulationPhase: boolean;
  isFertileDay: boolean;
  daysUntilNextCycle: number;
  cycleDescription: string;
  recommendations: string[];
}

@Injectable()
export class GetCurrentCycleUseCase {
  constructor(
    @Inject(CYCLE_REPOSITORY_TOKEN)
    private readonly cycleRepository: ICycleRepository,
    @Inject(CYCLE_PROFILE_CONFIG_REPOSITORY_TOKEN)
    private readonly configRepository: ICycleProfileConfigRepository,
  ) {}

  async execute(
    request: GetCurrentCycleRequest,
  ): Promise<GetCurrentCycleResponse> {
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
      // Si aucun cycle n'existe, fournir des informations par défaut basées sur la configuration
      const cycleLength = config.averageCycleLength;
      const periodLength = config.averagePeriodLength;
      
      // Jour par défaut : milieu du cycle
      const defaultCycleDay = Math.floor(cycleLength / 2);
      const daysUntilNextCycle = cycleLength - defaultCycleDay;
      
      return {
        cycleDay: defaultCycleDay,
        cycleLength,
        periodLength,
        isPeriodDay: false,
        isOvulationPhase: false,
        isFertileDay: false,
        daysUntilNextCycle,
        cycleDescription: 'Cycle non démarré - commencez par enregistrer vos règles pour un suivi personnalisé',
        recommendations: this.getDefaultRecommendations(),
      };
    }

    // Calculer le jour actuel dans le cycle
    const cycleDay = currentCycle.getCurrentCycleDay(date);
    const cycleLength = currentCycle.cycleLength || config.averageCycleLength;
    const periodLength = currentCycle.periodLength || config.averagePeriodLength;

    // Déterminer les caractéristiques du jour actuel
    const isPeriodDay = currentCycle.isPeriodDay(date);
    const isOvulationPhase = currentCycle.isOvulationPhase(date);
    const isFertileDay = currentCycle.isFertileDay(date);

    // Calculer les jours jusqu'au prochain cycle
    const daysUntilNextCycle = this.calculateDaysUntilNextCycle(
      cycleDay,
      cycleLength,
    );

    return {
      cycleDay,
      cycleLength,
      periodLength,
      isPeriodDay,
      isOvulationPhase,
      isFertileDay,
      daysUntilNextCycle,
      cycleDescription: this.getCycleDescription(cycleDay, isPeriodDay, isOvulationPhase, isFertileDay),
      recommendations: this.getRecommendations(cycleDay, isPeriodDay, isOvulationPhase, isFertileDay),
    };
  }

  private calculateDaysUntilNextCycle(
    cycleDay: number,
    cycleLength: number,
  ): number {
    return cycleLength - cycleDay + 1;
  }

  private getCycleDescription(
    cycleDay: number,
    isPeriodDay: boolean,
    isOvulationPhase: boolean,
    isFertileDay: boolean,
  ): string {
    if (isPeriodDay) {
      return 'Jour de règles - Période de repos et de récupération';
    } else if (isOvulationPhase) {
      return "Phase d'ovulation - Pic d'énergie, parfaite pour les entraînements intenses";
    } else if (isFertileDay) {
      return 'Période fertile - Énergie élevée, idéale pour les entraînements modérés à intenses';
    } else if (cycleDay <= 14) {
      return 'Phase post-règles - Énergie croissante, idéale pour commencer de nouveaux défis';
    } else {
      return 'Phase post-ovulation - Focus sur la force et l\'endurance modérée';
    }
  }

  private getRecommendations(
    cycleDay: number,
    isPeriodDay: boolean,
    isOvulationPhase: boolean,
    isFertileDay: boolean,
  ): string[] {
    if (isPeriodDay) {
      return [
        'Privilégier les exercices doux (yoga, stretching)',
        'Rester hydratée et bien se reposer',
        "Écouter son corps et adapter l'intensité",
        'Focus sur la récupération',
      ];
    } else if (isOvulationPhase) {
      return [
        'Entraînements HIIT et haute intensité',
        'Soulever des charges plus lourdes',
        "Sports d'équipe et activités sociales",
        "Profiter du pic d'énergie",
      ];
    } else if (isFertileDay) {
      return [
        'Entraînements modérés à intenses',
        'Exercices cardiovasculaires',
        'Renforcement musculaire',
        'Maintenir une bonne intensité',
      ];
    } else if (cycleDay <= 14) {
      return [
        "Commencer à augmenter l'intensité progressivement",
        'Exercices cardiovasculaires modérés',
        'Renforcement musculaire avec poids légers',
        'Planifier de nouveaux objectifs',
      ];
    } else {
      return [
        'Entraînement en force et musculation',
        'Exercices de stabilité et équilibre',
        'Activités anti-stress (méditation, yoga)',
        'Maintenir la régularité sans forcer',
      ];
    }
  }

  private getDefaultRecommendations(): string[] {
    return [
      'Commencez par des exercices doux et progressifs',
      'Établissez une routine régulière',
      'Écoutez votre corps et adaptez l\'intensité',
      'Consultez un professionnel de santé pour des conseils personnalisés',
    ];
  }
}
