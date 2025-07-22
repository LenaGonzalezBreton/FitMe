import { Cycle, CycleProfileConfig, Phase, CyclePhase } from './cycle.entity';

export interface ICycleRepository {
  /**
   * Trouve le cycle actuel d'un utilisateur
   */
  findCurrentCycleByUserId(userId: string): Promise<Cycle | null>;

  /**
   * Trouve tous les cycles d'un utilisateur
   */
  findByUserId(userId: string): Promise<Cycle[]>;

  /**
   * Trouve un cycle par son ID
   */
  findById(cycleId: string): Promise<Cycle | null>;

  /**
   * Crée un nouveau cycle
   */
  create(cycleData: CreateCycleData): Promise<Cycle>;

  /**
   * Met à jour un cycle
   */
  update(cycleId: string, updateData: UpdateCycleData): Promise<Cycle>;

  /**
   * Supprime un cycle
   */
  delete(cycleId: string): Promise<void>;
}

export interface ICycleProfileConfigRepository {
  /**
   * Trouve la configuration de profil cycle d'un utilisateur
   */
  findByUserId(userId: string): Promise<CycleProfileConfig | null>;

  /**
   * Crée une nouvelle configuration de profil cycle
   */
  create(configData: CreateCycleProfileConfigData): Promise<CycleProfileConfig>;

  /**
   * Met à jour la configuration de profil cycle
   */
  update(
    userId: string,
    updateData: UpdateCycleProfileConfigData,
  ): Promise<CycleProfileConfig>;
}

export interface IPhaseRepository {
  /**
   * Trouve les phases d'un cycle
   */
  findByCycleId(cycleId: string): Promise<Phase[]>;

  /**
   * Trouve la phase active à une date donnée pour un cycle
   */
  findActivePhase(cycleId: string, date: Date): Promise<Phase | null>;

  /**
   * Crée une nouvelle phase
   */
  create(phaseData: CreatePhaseData): Promise<Phase>;

  /**
   * Met à jour une phase
   */
  update(phaseId: string, updateData: UpdatePhaseData): Promise<Phase>;

  /**
   * Supprime une phase
   */
  delete(phaseId: string): Promise<void>;
}

// Types de données pour la création et mise à jour
export interface CreateCycleData {
  userId: string;
  startDate: Date;
  cycleLength?: number;
  periodLength?: number;
  isRegular?: boolean;
  providerId?: string;
  externalCycleId?: string;
}

export interface UpdateCycleData {
  startDate?: Date;
  cycleLength?: number;
  periodLength?: number;
  isRegular?: boolean;
  providerId?: string;
  externalCycleId?: string;
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

export interface CreatePhaseData {
  cycleId: string;
  name: CyclePhase;
  startDate: Date;
  endDate: Date;
}

export interface UpdatePhaseData {
  name?: CyclePhase;
  startDate?: Date;
  endDate?: Date;
}
