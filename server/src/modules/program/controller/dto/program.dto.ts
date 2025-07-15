import { IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MuscleZone } from '../../../exercise/domain/exercise.entity';

export class GenerateProgramDto {
  @ApiProperty({
    type: Number,
    required: false,
    example: 30,
    description: 'Durée souhaitée en minutes (défaut: 30)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(10)
  @Max(120)
  duration?: number;

  @ApiProperty({
    enum: MuscleZone,
    required: false,
    example: MuscleZone.FULL_BODY,
    description: 'Zone musculaire à privilégier',
  })
  @IsOptional()
  @IsEnum(MuscleZone)
  focusZone?: MuscleZone;

  @ApiProperty({
    enum: ['cardio', 'strength', 'flexibility', 'mixed'],
    required: false,
    example: 'mixed',
    description: 'Type de séance souhaité',
  })
  @IsOptional()
  @IsEnum(['cardio', 'strength', 'flexibility', 'mixed'])
  sessionType?: 'cardio' | 'strength' | 'flexibility' | 'mixed';
}

export class GeneratedProgramResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  data: {
    program: any;
    userPhase: any;
    adaptations: string[];
  };

  @ApiProperty({
    example:
      'Programme "Énergie Croissante - Complet 30min" généré avec succès pour votre Phase Folliculaire',
  })
  message: string;
}
