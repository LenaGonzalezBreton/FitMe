import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { SymptomType } from '@prisma/client';
import {
  ISymptomLogRepository,
  CreateSymptomLogData,
  SymptomLogEntity,
} from '../../domain/symptom-log.repository';
import { SYMPTOM_LOG_REPOSITORY_TOKEN } from '../../tokens';

export interface LogSymptomRequest {
  type: SymptomType;
  intensity: number;
  notes?: string;
}

export interface LogSymptomsRequest {
  userId: string;
  date: Date;
  symptoms: LogSymptomRequest[];
}

export interface LogSymptomsResponse {
  symptoms: SymptomLogEntity[];
  date: Date;
}

@Injectable()
export class LogSymptomsUseCase {
  constructor(
    @Inject(SYMPTOM_LOG_REPOSITORY_TOKEN)
    private readonly symptomLogRepository: ISymptomLogRepository,
  ) {}

  async execute(request: LogSymptomsRequest): Promise<LogSymptomsResponse> {
    // Validation des données
    if (request.date > new Date()) {
      throw new BadRequestException(
        'La date des symptômes ne peut pas être dans le futur',
      );
    }

    if (!request.symptoms || request.symptoms.length === 0) {
      throw new BadRequestException('Au moins un symptôme doit être fourni');
    }

    // Validation de chaque symptôme
    for (const symptom of request.symptoms) {
      if (symptom.intensity < 1 || symptom.intensity > 5) {
        throw new BadRequestException(
          `L'intensité de ${symptom.type} doit être comprise entre 1 et 5`,
        );
      }
    }

    // Supprimer les symptômes existants pour cette date
    // (permet de faire une mise à jour complète)
    await this.symptomLogRepository.deleteByUserIdAndDate(
      request.userId,
      request.date,
    );

    // Créer les nouvelles entrées de symptômes
    const createdSymptoms: SymptomLogEntity[] = [];

    for (const symptom of request.symptoms) {
      // Encoder l'intensité et les notes dans le champ value
      const value = this.encodeSymptomValue(symptom.intensity, symptom.notes);

      const createData: CreateSymptomLogData = {
        userId: request.userId,
        date: request.date,
        symptomType: symptom.type,
        value,
      };

      const createdSymptom = await this.symptomLogRepository.create(createData);
      createdSymptoms.push(createdSymptom);
    }

    return {
      symptoms: createdSymptoms,
      date: request.date,
    };
  }

  private encodeSymptomValue(intensity: number, notes?: string): string {
    // Encoder l'intensité et les notes dans un format JSON
    const data = {
      intensity,
      notes: notes || '',
    };
    return JSON.stringify(data);
  }
}
