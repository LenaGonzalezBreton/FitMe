import { Cycle } from './cycle.entity';
import { CycleProfileConfig, CreateCycleProfileConfigData, UpdateCycleProfileConfigData } from './cycle-profile-config.entity';

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


