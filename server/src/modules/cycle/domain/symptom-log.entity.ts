export class SymptomLog {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly date: Date,
    public readonly symptomType: string,
    public readonly value: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  /**
   * Valide les données du symptôme
   */
  static validateSymptomData(symptomData: CreateSymptomLogData): boolean {
    if (!symptomData.userId || !symptomData.date || !symptomData.symptomType || !symptomData.value) {
      return false;
    }
    
    // Vérifier que la date n'est pas dans le futur
    if (symptomData.date > new Date()) {
      return false;
    }
    
    return true;
  }

  /**
   * Crée une nouvelle instance de SymptomLog
   */
  static create(symptomData: CreateSymptomLogData): SymptomLog {
    if (!this.validateSymptomData(symptomData)) {
      throw new Error('Invalid symptom data');
    }

    return new SymptomLog(
      crypto.randomUUID(),
      symptomData.userId,
      symptomData.date,
      symptomData.symptomType,
      symptomData.value,
      new Date(),
      new Date(),
    );
  }

  /**
   * Met à jour les données du symptôme
   */
  update(updateData: UpdateSymptomLogData): SymptomLog {
    return new SymptomLog(
      this.id,
      this.userId,
      updateData.date || this.date,
      updateData.symptomType || this.symptomType,
      updateData.value || this.value,
      this.createdAt,
      new Date(),
    );
  }
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
