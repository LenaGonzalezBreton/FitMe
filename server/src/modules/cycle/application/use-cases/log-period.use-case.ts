import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Cycle } from '../../domain/cycle.entity';
import {
  ICycleRepository,
  ICycleProfileConfigRepository,
  CreateCycleData,
  UpdateCycleData,
} from '../../domain/cycle.repository';
import { CYCLE_REPOSITORY_TOKEN, CYCLE_PROFILE_CONFIG_REPOSITORY_TOKEN } from '../../tokens';

export interface LogPeriodRequest {
  userId: string;
  startDate: Date;
  endDate?: Date;
  flowIntensity?: number;
  notes?: string;
}

export interface LogPeriodResponse {
  period: Cycle;
  isNewCycle: boolean;
}

@Injectable()
export class LogPeriodUseCase {
  constructor(
    @Inject(CYCLE_REPOSITORY_TOKEN)
    private readonly cycleRepository: ICycleRepository,
    @Inject(CYCLE_PROFILE_CONFIG_REPOSITORY_TOKEN)
    private readonly configRepository: ICycleProfileConfigRepository,
  ) {}

  async execute(request: LogPeriodRequest): Promise<LogPeriodResponse> {
    // Validation des données
    if (request.startDate > new Date()) {
      throw new BadRequestException(
        'La date de début des règles ne peut pas être dans le futur',
      );
    }

    if (request.endDate && request.endDate <= request.startDate) {
      throw new BadRequestException(
        'La date de fin doit être postérieure à la date de début',
      );
    }

    if (request.flowIntensity !== undefined) {
      if (request.flowIntensity < 1 || request.flowIntensity > 5) {
        throw new BadRequestException(
          "L'intensité du flux doit être comprise entre 1 et 5",
        );
      }
    }

    // Vérifier s'il existe déjà un cycle pour cette période
    const userCycles = await this.cycleRepository.findByUserId(request.userId);

    // Rechercher un cycle existant qui pourrait correspondre à cette période
    const existingCycle = userCycles.find((cycle) => {
      const cycleDateRange = this.getCycleDateRange(cycle);
      return (
        request.startDate >= cycleDateRange.start &&
        request.startDate <= cycleDateRange.end
      );
    });

    let period: Cycle;
    let isNewCycle = false;

    if (existingCycle) {
      // Mise à jour du cycle existant
      const config = await this.configRepository.findByUserId(request.userId);
      const periodLength = request.endDate
        ? this.calculateDaysDifference(request.startDate, request.endDate)
        : config?.averagePeriodLength; // Utiliser la configuration utilisateur par défaut


      const updateData: UpdateCycleData = {
        startDate: request.startDate,
        periodLength: periodLength,
        // Notes peuvent être stockées dans un champ custom ou via relation
      };

      period = await this.cycleRepository.update(existingCycle.id, updateData);
    } else {
      // Création d'un nouveau cycle
      const config = await this.configRepository.findByUserId(request.userId);
      const periodLength = request.endDate
        ? this.calculateDaysDifference(request.startDate, request.endDate)
        : config?.averagePeriodLength; // Utiliser la configuration utilisateur par défaut


      // Calculer la longueur du cycle basée sur le cycle précédent et la configuration utilisateur
      const cycleLength = await this.calculateCycleLength(
        userCycles,
        request.startDate,
        request.userId,
      );

      const createData: CreateCycleData = {
        userId: request.userId,
        startDate: request.startDate,
        cycleLength: cycleLength,
        periodLength: periodLength,
        isRegular: true, // À calculer basé sur l'historique
      };

      period = await this.cycleRepository.create(createData);
      isNewCycle = true;
    }

    return { period, isNewCycle };
  }

  private getCycleDateRange(cycle: Cycle): { start: Date; end: Date } {
    const start = cycle.startDate;
    const cycleLength = cycle.cycleLength || 28;
    const end = new Date(start);
    end.setDate(start.getDate() + cycleLength);

    return { start, end };
  }

  private calculateDaysDifference(start: Date, end: Date): number {
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  private async calculateCycleLength(
    userCycles: Cycle[],
    currentStartDate: Date,
    userId: string,
  ): Promise<number> {
    // Récupérer la configuration utilisateur
    const config = await this.configRepository.findByUserId(userId);
    const userConfiguredLength = config?.averageCycleLength || 28;


    if (userCycles.length === 0) {
      // Pour le premier cycle, utiliser la configuration de l'utilisateur
      return userConfiguredLength;
    }

    // Trier les cycles par date de début
    const sortedCycles = userCycles
      .filter((cycle) => cycle.startDate < currentStartDate)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    if (sortedCycles.length === 0) {
      // Pas de cycles précédents valides, utiliser la configuration utilisateur
      return userConfiguredLength;
    }

    // Prendre le cycle le plus récent pour calculer la longueur
    const lastCycle = sortedCycles[sortedCycles.length - 1];
    const daysBetween = this.calculateDaysDifference(
      lastCycle.startDate,
      currentStartDate,
    );

    // Validation que c'est une durée de cycle raisonnable
    if (daysBetween >= 21 && daysBetween <= 40) {
      return daysBetween;
    }

    // Sinon, retourner la moyenne des cycles récents avec la configuration utilisateur comme fallback
    const recentCycles = sortedCycles.slice(-6); // 6 derniers cycles
    const avgLength =
      recentCycles.reduce((sum, cycle) => sum + (cycle.cycleLength || userConfiguredLength), 0) /
      recentCycles.length;

    return Math.round(avgLength);
  }
}
