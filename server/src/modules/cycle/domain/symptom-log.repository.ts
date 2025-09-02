import { SymptomLog } from './symptom-log.entity';

export type SymptomLogEntity = SymptomLog;

export interface ISymptomLogRepository {
  /**
   * Crée une entrée de symptôme
   */
  create(symptomData: CreateSymptomLogData): Promise<SymptomLogEntity>;

  /**
   * Trouve les symptômes d'un utilisateur
   */
  findByUserId(
    userId: string,
    filters?: SymptomLogFilters,
  ): Promise<SymptomLogEntity[]>;

  /**
   * Trouve les symptômes pour une date spécifique
   */
  findByUserIdAndDate(userId: string, date: Date): Promise<SymptomLogEntity[]>;

  /**
   * Met à jour un symptôme
   */
  update(
    symptomId: string,
    updateData: UpdateSymptomLogData,
  ): Promise<SymptomLogEntity>;

  /**
   * Supprime un symptôme
   */
  delete(symptomId: string): Promise<void>;

  /**
   * Supprime tous les symptômes pour une date
   */
  deleteByUserIdAndDate(userId: string, date: Date): Promise<void>;
}

export interface CreateSymptomLogData {
  userId: string;
  date: Date;
  symptomType: string;
  value: string; // Intensité + notes encodées
}

export interface UpdateSymptomLogData {
  date?: Date;
  symptomType?: string;
  value?: string;
}

export interface SymptomLogFilters {
  fromDate?: Date;
  toDate?: Date;
  symptomType?: string;
  limit?: number;
  offset?: number;
}
