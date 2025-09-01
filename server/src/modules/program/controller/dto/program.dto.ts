import {
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsString,
  IsDateString,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

// ============================================
// CRUD DTOs
// ============================================

export class ProgramExerciseDto {
  @ApiProperty({
    description: 'Exercise ID',
    example: 'clh456789123',
  })
  @IsNotEmpty()
  @IsString()
  exerciseId: string;

  @ApiProperty({
    description: 'Order of this exercise in the program',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  order: number;

  @ApiPropertyOptional({
    description: 'Number of sets',
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  sets?: number;

  @ApiPropertyOptional({
    description: 'Number of repetitions (can be range like "8-12")',
    example: '10-15',
  })
  @IsOptional()
  @IsString()
  reps?: string;

  @ApiPropertyOptional({
    description: 'Duration in seconds for time-based exercises',
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  duration?: number;

  @ApiPropertyOptional({
    description: 'Rest time in seconds between sets',
    example: 60,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  restTime?: number;

  @ApiPropertyOptional({
    description: 'Additional notes for this exercise',
    example: 'Focus on form over speed',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateProgramDto {
  @ApiProperty({
    description: 'Program title',
    example: 'Follicular Phase Strength Training',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Program goal description',
    example: 'Build strength during follicular phase with progressive overload',
  })
  @IsOptional()
  @IsString()
  goal?: string;

  @ApiProperty({
    description: 'Program start date',
    example: '2024-01-15T00:00:00.000Z',
  })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({
    description: 'Program end date',
    example: '2024-02-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Whether this program is a template that can be reused',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;

  @ApiPropertyOptional({
    description: 'List of exercises in this program',
    type: [ProgramExerciseDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProgramExerciseDto)
  exercises?: ProgramExerciseDto[];
}

export class UpdateProgramDto {
  @ApiPropertyOptional({
    description: 'Program title',
    example: 'Updated Follicular Phase Training',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Program goal description',
    example: 'Updated goal for strength building',
  })
  @IsOptional()
  @IsString()
  goal?: string;

  @ApiPropertyOptional({
    description: 'Program start date',
    example: '2024-01-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Program end date',
    example: '2024-02-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Whether the program is currently active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Whether this program is a template',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;
}

export class ProgramQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by template status',
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isTemplate?: boolean;

  @ApiPropertyOptional({
    description: 'Filter programs starting from this date',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter programs starting until this date',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  startDateTo?: string;

  @ApiPropertyOptional({
    description: 'Number of programs to return (max 100)',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of programs to skip',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;
}

export class ProgramResponseDto {
  @ApiProperty({
    description: 'Program ID',
    example: 'clh123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Program title',
    example: 'Follicular Phase Strength Training',
  })
  title: string;

  @ApiProperty({
    description: 'Program goal',
    example: 'Build strength during follicular phase',
  })
  goal: string | null;

  @ApiProperty({
    description: 'Program start date',
    example: '2024-01-15T00:00:00.000Z',
  })
  startDate: string;

  @ApiProperty({
    description: 'Program end date',
    example: '2024-02-15T00:00:00.000Z',
  })
  endDate: string | null;

  @ApiProperty({
    description: 'Whether the program is currently active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether this program is a template',
    example: false,
  })
  isTemplate: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: string;

  @ApiProperty({
    description: 'Number of exercises in the program',
    example: 8,
  })
  exerciseCount: number;

  @ApiProperty({
    description: 'Exercises in this program (only included in detailed view)',
    type: [ProgramExerciseDto],
    required: false,
  })
  exercises?: ProgramExerciseDto[];
}

export class ProgramListResponseDto {
  @ApiProperty({
    description: 'List of programs',
    type: [ProgramResponseDto],
  })
  programs: ProgramResponseDto[];

  @ApiProperty({
    description: 'Total count of programs (for pagination)',
    example: 15,
  })
  total: number;

  @ApiProperty({
    description: 'Current page offset',
    example: 0,
  })
  offset: number;

  @ApiProperty({
    description: 'Number of programs returned',
    example: 10,
  })
  limit: number;
}
