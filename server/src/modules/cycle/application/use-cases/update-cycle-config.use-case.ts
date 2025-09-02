import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  CycleProfileConfig,
  CreateCycleProfileConfigData,
  UpdateCycleProfileConfigData,
} from '../../domain/cycle-profile-config.entity';
import { Cycle } from '../../domain/cycle.entity';
import { ICycleProfileConfigRepository } from '../../domain/cycle.repository';
import { CYCLE_PROFILE_CONFIG_REPOSITORY_TOKEN } from '../../tokens';

export interface UpdateCycleConfigRequest {
  userId: string;
  isCycleTrackingEnabled?: boolean;
  usesExternalProvider?: boolean;
  useMenopauseMode?: boolean;
  averageCycleLength?: number;
  averagePeriodLength?: number;
  prefersManualInput?: boolean;
}

export interface UpdateCycleConfigResponse {
  config: CycleProfileConfig;
  isNewConfig: boolean;
}

@Injectable()
export class UpdateCycleConfigUseCase {
  constructor(
    @Inject(CYCLE_PROFILE_CONFIG_REPOSITORY_TOKEN)
    private readonly cycleProfileConfigRepository: ICycleProfileConfigRepository,
  ) {}

  async execute(
    request: UpdateCycleConfigRequest,
  ): Promise<UpdateCycleConfigResponse> {
    // Validation des durées avec les limites médicales correctes
    if (request.averageCycleLength !== undefined) {
      if (request.averageCycleLength < 21 || request.averageCycleLength > 35) {
        throw new BadRequestException(
          'La durée du cycle doit être comprise entre 21 et 35 jours',
        );
      }
    }

    if (request.averagePeriodLength !== undefined) {
      if (request.averagePeriodLength < 2 || request.averagePeriodLength > 8) {
        throw new BadRequestException(
          'La durée des règles doit être comprise entre 2 et 8 jours',
        );
      }
    }

    // Validation supplémentaire : vérifier que la durée des règles est inférieure à la durée du cycle
    const cycleLength = request.averageCycleLength ?? 28;
    const periodLength = request.averagePeriodLength ?? 5;

    if (!Cycle.validateCycleParameters(cycleLength, periodLength)) {
      throw new BadRequestException(
        'Les paramètres du cycle sont invalides. Vérifiez les durées.',
      );
    }

    // Vérifier si la configuration existe
    const existingConfig = await this.cycleProfileConfigRepository.findByUserId(
      request.userId,
    );

    let config: CycleProfileConfig;
    let isNewConfig = false;

    if (existingConfig) {
      // Mise à jour de la configuration existante
      const updateData: UpdateCycleProfileConfigData = {
        isCycleTrackingEnabled: request.isCycleTrackingEnabled,
        usesExternalProvider: request.usesExternalProvider,
        useMenopauseMode: request.useMenopauseMode,
        averageCycleLength: request.averageCycleLength,
        averagePeriodLength: request.averagePeriodLength,
        prefersManualInput: request.prefersManualInput,
      };

      config = await this.cycleProfileConfigRepository.update(
        request.userId,
        updateData,
      );
    } else {
      // Création d'une nouvelle configuration
      const createData: CreateCycleProfileConfigData = {
        userId: request.userId,
        isCycleTrackingEnabled: request.isCycleTrackingEnabled ?? true,
        usesExternalProvider: request.usesExternalProvider ?? false,
        useMenopauseMode: request.useMenopauseMode ?? false,
        averageCycleLength: request.averageCycleLength ?? 28,
        averagePeriodLength: request.averagePeriodLength ?? 5,
        prefersManualInput: request.prefersManualInput ?? false,
      };

      config = await this.cycleProfileConfigRepository.create(createData);
      isNewConfig = true;
    }

    return { config, isNewConfig };
  }
}
