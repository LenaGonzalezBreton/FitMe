import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Cycle } from '../../domain/cycle.entity';
import {
  ICycleRepository,
  ICycleProfileConfigRepository,
  CreateCycleData,
  UpdateCycleData,
} from '../../domain/cycle.repository';
import {
  ISymptomLogRepository,
  CreateSymptomLogData,
} from '../../domain/symptom-log.repository';
import {
  CYCLE_REPOSITORY_TOKEN,
  CYCLE_PROFILE_CONFIG_REPOSITORY_TOKEN,
  SYMPTOM_LOG_REPOSITORY_TOKEN,
} from '../../tokens';

export interface LogPeriodRequest {
  userId: string;
  startDate?: Date; // Optionnel quand isNewCycle = false
  endDate?: Date;
  flowIntensity?: number;
  notes?: string;
  isNewCycle?: boolean; // true = nouveau cycle, false = continuer cycle actuel
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
    @Inject(SYMPTOM_LOG_REPOSITORY_TOKEN)
    private readonly symptomLogRepository: ISymptomLogRepository,
  ) {}

  async execute(request: LogPeriodRequest): Promise<LogPeriodResponse> {
    console.log('🔍 LogPeriodUseCase.execute started with request:', {
      userId: request.userId,
      isNewCycle: request.isNewCycle,
      flowIntensity: request.flowIntensity,
      notes: request.notes ? 'HAS_NOTES' : 'NO_NOTES',
      startDate: request.startDate?.toISOString() || 'undefined'
    });

    // Vérifier si l'utilisateur a une configuration de cycle, sinon en créer une par défaut
    let config = await this.configRepository.findByUserId(request.userId);
    console.log('📋 Existing cycle config for user:', {
      userId: request.userId,
      configExists: !!config,
      isCycleTrackingEnabled: config?.isCycleTrackingEnabled,
      averageCycleLength: config?.averageCycleLength,
      averagePeriodLength: config?.averagePeriodLength,
      useMenopauseMode: config?.useMenopauseMode
    });

    if (!config) {
      console.log('🆕 Creating default cycle config for user:', request.userId);
      try {
        config = await this.configRepository.create({
          userId: request.userId,
          isCycleTrackingEnabled: true,
          averageCycleLength: 28,
          averagePeriodLength: 5,
          usesExternalProvider: false,
          useMenopauseMode: false,
          prefersManualInput: false,
        });
        console.log('✅ Default cycle config created successfully:', {
          userId: request.userId,
          configId: config.id,
          isCycleTrackingEnabled: config.isCycleTrackingEnabled
        });
      } catch (error) {
        console.error('❌ Failed to create default cycle config:', error);
        throw new BadRequestException(
          'Impossible de créer la configuration de cycle: ' + (error as Error).message,
        );
      }
    }

    if (!config.isCycleTrackingEnabled) {
      console.log('🚫 Cycle tracking disabled for user:', {
        userId: request.userId,
        isCycleTrackingEnabled: config.isCycleTrackingEnabled,
        useMenopauseMode: config.useMenopauseMode
      });
      throw new BadRequestException(
        "Le suivi des cycles n'est pas activé pour cet utilisateur",
      );
    }

    console.log('✅ Cycle tracking validation passed for user:', request.userId);

    const isNewCycle = request.isNewCycle !== false; // Par défaut true si non spécifié

    // Validation des données pour nouveau cycle
    if (isNewCycle) {
      if (!request.startDate) {
        throw new BadRequestException(
          'La date de début est obligatoire pour un nouveau cycle',
        );
      }
      if (request.startDate > new Date()) {
        throw new BadRequestException(
          'La date de début des règles ne peut pas être dans le futur',
        );
      }
    }

    if (
      request.endDate &&
      request.startDate &&
      request.endDate <= request.startDate
    ) {
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

    // Récupérer les cycles de l'utilisateur
    const userCycles = await this.cycleRepository.findByUserId(request.userId);

    let period: Cycle;
    let resultIsNewCycle = false;

    if (!isNewCycle) {
      // Mode "continuer cycle actuel" - chercher le cycle actuel
      const currentCycle = this.findCurrentCycle(userCycles);

      if (!currentCycle) {
        throw new BadRequestException(
          'Aucun cycle actuel trouvé. Veuillez commencer un nouveau cycle.',
        );
      }

      // Mettre à jour le cycle actuel avec les nouvelles informations
      period = await this.updateCurrentCycle(currentCycle);
      resultIsNewCycle = false;
    } else {
      // Mode "nouveau cycle" - logique existante
      const existingCycle = userCycles.find((cycle) => {
        if (!request.startDate) return false;
        const cycleDateRange = this.getCycleDateRange(cycle);
        return (
          request.startDate >= cycleDateRange.start &&
          request.startDate <= cycleDateRange.end
        );
      });

      if (existingCycle) {
        // Mise à jour du cycle existant
        const config = await this.configRepository.findByUserId(request.userId);
        const periodLength =
          request.endDate && request.startDate
            ? this.calculateDaysDifference(request.startDate, request.endDate)
            : config?.averagePeriodLength;

        const updateData: UpdateCycleData = {
          startDate: request.startDate!,
          periodLength: periodLength,
          // Notes peuvent être stockées dans un champ custom ou via relation
        };

        period = await this.cycleRepository.update(
          existingCycle.id,
          updateData,
        );
        resultIsNewCycle = false;
      } else {
        // Création d'un nouveau cycle
        const config = await this.configRepository.findByUserId(request.userId);
        const periodLength =
          request.endDate && request.startDate
            ? this.calculateDaysDifference(request.startDate, request.endDate)
            : config?.averagePeriodLength;

        // Calculer la longueur du cycle basée sur le cycle précédent et la configuration utilisateur
        const cycleLength = await this.calculateCycleLength(
          userCycles,
          request.startDate!,
          request.userId,
        );

        const createData: CreateCycleData = {
          userId: request.userId,
          startDate: request.startDate!,
          cycleLength: cycleLength,
          periodLength: periodLength,
          isRegular: true, // À calculer basé sur l'historique
        };

        period = await this.cycleRepository.create(createData);
        resultIsNewCycle = true;
      }
    }

    // Sauvegarder les données supplémentaires dans SymptomLog
    console.log('💾 Saving symptom data to SymptomLog table:', {
      userId: request.userId,
      flowIntensity: request.flowIntensity,
      hasNotes: !!request.notes,
      cycleStartDate: period.startDate.toISOString(),
      isNewCycle: resultIsNewCycle
    });
    
    try {
      await this.saveSymptomData(request, period.startDate, resultIsNewCycle);
      console.log('✅ Symptom data saved successfully');
    } catch (error) {
      console.error('❌ Failed to save symptom data:', error);
      // Ne pas faire échouer toute l'opération si la sauvegarde des symptômes échoue
    }

    console.log('🎉 LogPeriodUseCase completed successfully:', {
      cycleId: period.id,
      isNewCycle: resultIsNewCycle,
      periodLength: period.periodLength,
      cycleLength: period.cycleLength
    });

    return { period, isNewCycle: resultIsNewCycle };
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
      recentCycles.reduce(
        (sum, cycle) => sum + (cycle.cycleLength || userConfiguredLength),
        0,
      ) / recentCycles.length;

    return Math.round(avgLength);
  }

  private findCurrentCycle(userCycles: Cycle[]): Cycle | null {
    // Chercher un cycle dont les règles ont commencé dans les 10 derniers jours
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const recentCycles = userCycles
      .filter((cycle) => cycle.startDate >= tenDaysAgo)
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

    if (recentCycles.length === 0) {
      return null;
    }

    const latestCycle = recentCycles[0];

    // Vérifier si on est encore dans la période de règles
    const daysSinceStart = Math.floor(
      (new Date().getTime() - latestCycle.startDate.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    const maxPeriodLength = 10; // Durée maximum raisonnable des règles

    return daysSinceStart <= maxPeriodLength ? latestCycle : null;
  }

  private async updateCurrentCycle(currentCycle: Cycle): Promise<Cycle> {
    // Calculer la nouvelle longueur de période basée sur le nombre de jours écoulés
    const daysSinceStart = Math.ceil(
      (new Date().getTime() - currentCycle.startDate.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    const newPeriodLength = Math.max(
      daysSinceStart,
      currentCycle.periodLength || 0,
    );

    const updateData: UpdateCycleData = {
      periodLength: newPeriodLength,
      // Garder la startDate originale - ne pas la changer !
      // Les notes peuvent être gérées via un système de notes quotidiennes
    };

    return await this.cycleRepository.update(currentCycle.id, updateData);
  }

  /**
   * Sauvegarde les données de symptômes (intensité du flux et notes) dans SymptomLog
   */
  private async saveSymptomData(
    request: LogPeriodRequest,
    cycleStartDate: Date,
    actualIsNewCycle: boolean,
  ): Promise<void> {
    const targetDate = actualIsNewCycle ? cycleStartDate : new Date();
    
    console.log('🔍 saveSymptomData called with:', {
      userId: request.userId,
      originalIsNewCycle: request.isNewCycle,
      actualIsNewCycle: actualIsNewCycle,
      targetDate: targetDate.toISOString(),
      flowIntensity: request.flowIntensity,
      notes: request.notes ? `"${request.notes}"` : 'null'
    });

    const symptomPromises: Promise<any>[] = [];

    // Sauvegarder l'intensité du flux si fournie
    if (request.flowIntensity !== undefined) {
      const flowSymptomData: CreateSymptomLogData = {
        userId: request.userId,
        date: targetDate,
        symptomType: 'FLOW_INTENSITY',
        value: request.flowIntensity.toString(),
      };
      console.log('📝 Adding FLOW_INTENSITY to symptom log:', flowSymptomData);
      symptomPromises.push(this.symptomLogRepository.create(flowSymptomData));
    }

    // Sauvegarder les notes si fournies
    if (request.notes?.trim()) {
      const noteSymptomData: CreateSymptomLogData = {
        userId: request.userId,
        date: targetDate,
        symptomType: 'PERIOD_NOTES',
        value: request.notes.trim(),
      };
      console.log('📝 Adding PERIOD_NOTES to symptom log:', noteSymptomData);
      symptomPromises.push(this.symptomLogRepository.create(noteSymptomData));
    }

    // Exécuter toutes les sauvegardes en parallèle
    if (symptomPromises.length > 0) {
      console.log(`💾 Executing ${symptomPromises.length} symptom log saves in parallel...`);
      try {
        const results = await Promise.all(symptomPromises);
        console.log('✅ All symptom logs saved successfully:', results.length);
      } catch (error) {
        console.error('❌ Error saving symptom logs:', error);
        throw error;
      }
    } else {
      console.log('ℹ️ No symptom data to save (no flow intensity or notes provided)');
    }
  }
}
