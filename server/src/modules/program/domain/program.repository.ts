import { Program, ProgramExercise } from './program.entity';

export interface ProgramFilters {
  userId?: string;
  isActive?: boolean;
  isTemplate?: boolean;
  startDateFrom?: Date;
  startDateTo?: Date;
  limit?: number;
  offset?: number;
}

export interface IProgramRepository {
  create(program: Program): Promise<Program>;
  findById(id: string): Promise<Program | null>;
  findByUserId(userId: string, filters?: ProgramFilters): Promise<Program[]>;
  findActiveByUserId(userId: string): Promise<Program | null>;
  update(id: string, program: Partial<Program>): Promise<Program>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  countByUserId(userId: string): Promise<number>;
}

export interface IProgramExerciseRepository {
  create(programExercise: ProgramExercise): Promise<ProgramExercise>;
  findById(id: string): Promise<ProgramExercise | null>;
  findByProgramId(programId: string): Promise<ProgramExercise[]>;
  update(
    id: string,
    programExercise: Partial<ProgramExercise>,
  ): Promise<ProgramExercise>;
  delete(id: string): Promise<void>;
  deleteByProgramId(programId: string): Promise<void>;
  reorder(
    programId: string,
    exerciseOrders: { id: string; order: number }[],
  ): Promise<void>;
}
