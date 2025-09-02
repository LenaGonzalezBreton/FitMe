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
    let currentCycle = await this.cycleRepository.findCurrentCycleByUserId(userId);
    
    // Si aucun cycle "actuel" n'est trouvé, essayer de récupérer le plus récent
    if (!currentCycle) {
      const userCycles = await this.cycleRepository.findByUserId(userId);
      if (userCycles.length > 0) {
        // Utiliser le cycle le plus récent même s'il n'est pas strictement "actuel"
        currentCycle = userCycles[0]; // Les cycles sont triés par date décroissante
        
        console.log(`Using most recent cycle for user ${userId} as fallback:`, {
          cycleId: currentCycle.id,
          startDate: currentCycle.startDate,
          cycleLength: currentCycle.cycleLength
        });
      }
    }
    
    if (!currentCycle) {
      // Si aucun cycle n'existe du tout, fournir des informations par défaut
      const cycleLength = config.averageCycleLength;
      const periodLength = config.averagePeriodLength;
      
      // Jour par défaut : début du cycle
      const defaultCycleDay = 1;
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
    // Prioritiser la configuration utilisateur pour la longueur du cycle
    const cycleLength = config.averageCycleLength || currentCycle.cycleLength || 28;
    const periodLength = config.averagePeriodLength || currentCycle.periodLength || 5;


    // Déterminer les caractéristiques du jour actuel avec la configuration utilisateur
    const isPeriodDay = this.isPeriodDay(cycleDay, periodLength);
    const isOvulationPhase = this.isOvulationPhase(cycleDay, cycleLength);
    const isFertileDay = this.isFertileDay(cycleDay, cycleLength);


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
      return 'Phase Menstruelle - Période de repos et de récupération';
    } else if (isOvulationPhase) {
      return "Phase d'Ovulation - Pic d'énergie, parfaite pour les entraînements intenses";
    } else if (isFertileDay) {
      return 'Phase Fertile - Énergie élevée, idéale pour les entraînements modérés à intenses';
    } else if (cycleDay <= 14) {
      return 'Phase Folliculaire - Énergie croissante, idéale pour commencer de nouveaux défis';
    } else {
      return 'Phase Lutéale - Focus sur la force et l\'endurance modérée';
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
        "Phase Folliculaire - Commencer à augmenter l'intensité progressivement",
        'Phase Folliculaire - Exercices cardiovasculaires modérés',
        'Phase Folliculaire - Renforcement musculaire avec poids légers',
        'Phase Folliculaire - Planifier de nouveaux objectifs',
      ];
    } else {
      return [
        'Phase Lutéale - Entraînement en force et musculation',
        'Phase Lutéale - Exercices de stabilité et équilibre',
        'Phase Lutéale - Activités anti-stress (méditation, yoga)',
        'Phase Lutéale - Maintenir la régularité sans forcer',
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

  // Helper methods that use user configuration instead of cycle entity defaults
  private isPeriodDay(cycleDay: number, periodLength: number): boolean {
    return cycleDay <= periodLength;
  }

  private getOvulationDay(cycleLength: number): number {
    // L'ovulation se produit généralement 14 jours avant les prochaines règles
    return cycleLength - 14;
  }

  private isOvulationPhase(cycleDay: number, cycleLength: number): boolean {
    const ovulationDay = this.getOvulationDay(cycleLength);
    return cycleDay >= ovulationDay - 2 && cycleDay <= ovulationDay + 2;
  }

  private isFertileDay(cycleDay: number, cycleLength: number): boolean {
    const ovulationDay = this.getOvulationDay(cycleLength);
    // Période fertile : 5 jours avant l'ovulation jusqu'à 2 jours après
    return cycleDay >= ovulationDay - 5 && cycleDay <= ovulationDay + 2;
  }
}
