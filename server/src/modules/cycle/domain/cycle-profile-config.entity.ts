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

  /**
   * Valide les paramètres de configuration
   */
  static validateConfig(config: CreateCycleProfileConfigData): boolean {
    // Vérifier que la durée du cycle est dans les limites normales (21-35 jours)
    if (config.averageCycleLength && (config.averageCycleLength < 21 || config.averageCycleLength > 35)) {
      return false;
    }
    
    // Vérifier que la durée des règles est dans les limites normales (2-8 jours)
    if (config.averagePeriodLength && (config.averagePeriodLength < 2 || config.averagePeriodLength > 8)) {
      return false;
    }
    
    // Vérifier que la durée des règles ne dépasse pas la durée du cycle
    if (config.averagePeriodLength && config.averageCycleLength && config.averagePeriodLength >= config.averageCycleLength) {
      return false;
    }
    
    return true;
  }

  /**
   * Crée une nouvelle instance de CycleProfileConfig
   */
  static create(configData: CreateCycleProfileConfigData): CycleProfileConfig {
    if (!this.validateConfig(configData)) {
      throw new Error('Invalid cycle profile configuration');
    }

    return new CycleProfileConfig(
      crypto.randomUUID(),
      configData.userId,
      configData.isCycleTrackingEnabled ?? true,
      configData.usesExternalProvider ?? false,
      configData.useMenopauseMode ?? false,
      configData.averageCycleLength ?? 28,
      configData.averagePeriodLength ?? 5,
      configData.prefersManualInput ?? false,
      new Date(),
      new Date(),
    );
  }

  /**
   * Met à jour la configuration
   */
  update(updateData: UpdateCycleProfileConfigData): CycleProfileConfig {
    const newConfig = {
      ...this,
      ...updateData,
      updatedAt: new Date(),
    };

    // Valider la nouvelle configuration
    if (!CycleProfileConfig.validateConfig(newConfig)) {
      throw new Error('Invalid cycle profile configuration');
    }

    return new CycleProfileConfig(
      this.id,
      this.userId,
      updateData.isCycleTrackingEnabled ?? this.isCycleTrackingEnabled,
      updateData.usesExternalProvider ?? this.usesExternalProvider,
      updateData.useMenopauseMode ?? this.useMenopauseMode,
      updateData.averageCycleLength ?? this.averageCycleLength,
      updateData.averagePeriodLength ?? this.averagePeriodLength,
      updateData.prefersManualInput ?? this.prefersManualInput,
      this.createdAt,
      new Date(),
    );
  }
}

export interface CreateCycleProfileConfigData {
  userId: string;
  isCycleTrackingEnabled?: boolean;
  usesExternalProvider?: boolean;
  useMenopauseMode?: boolean;
  averageCycleLength?: number;
  averagePeriodLength?: number;
  prefersManualInput?: boolean;
}

export interface UpdateCycleProfileConfigData {
  isCycleTrackingEnabled?: boolean;
  usesExternalProvider?: boolean;
  useMenopauseMode?: boolean;
  averageCycleLength?: number;
  averagePeriodLength?: number;
  prefersManualInput?: boolean;
}
