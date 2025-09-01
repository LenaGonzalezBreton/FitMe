import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import {
  CreateProgramUseCase,
  CreateProgramRequest,
} from '../../../../src/modules/program/application/use-cases/create-program.use-case';
import { IProgramRepository } from '../../../../src/modules/program/domain/program.repository';
import {
  Program,
  ProgramExercise,
} from '../../../../src/modules/program/domain/program.entity';
import { PROGRAM_REPOSITORY_TOKEN } from '../../../../src/modules/program/tokens';

describe('CreateProgramUseCase', () => {
  let useCase: CreateProgramUseCase;
  let programRepository: jest.Mocked<IProgramRepository>;

  const mockProgram = new Program({
    id: 'program-123',
    userId: 'user-123',
    title: 'Test Program',
    goal: 'Build strength',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-02-15'),
    isActive: false,
    isTemplate: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const mockProgramRepository: jest.Mocked<IProgramRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findActiveByUserId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      countByUserId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProgramUseCase,
        {
          provide: PROGRAM_REPOSITORY_TOKEN,
          useValue: mockProgramRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateProgramUseCase>(CreateProgramUseCase);
    programRepository = module.get(PROGRAM_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validRequest: CreateProgramRequest = {
      userId: 'user-123',
      title: 'Test Program',
      goal: 'Build strength',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-02-15'),
      isTemplate: false,
      exercises: [
        {
          exerciseId: 'exercise-1',
          order: 1,
          sets: 3,
          reps: '10-12',
          restTime: 60,
        },
        {
          exerciseId: 'exercise-2',
          order: 2,
          duration: 30,
          notes: 'Hold the position',
        },
      ],
    };

    it('should create program successfully with exercises', async () => {
      programRepository.findActiveByUserId.mockResolvedValue(null);
      programRepository.create.mockResolvedValue(mockProgram);

      const result = await useCase.execute(validRequest);

      expect(programRepository.findActiveByUserId).toHaveBeenCalledWith(
        'user-123',
      );
      expect(programRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          title: 'Test Program',
          goal: 'Build strength',
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-02-15'),
          isTemplate: false,
          exercises: expect.arrayContaining([
            expect.objectContaining({
              exerciseId: 'exercise-1',
              order: 1,
              sets: 3,
              reps: '10-12',
              restTime: 60,
            }),
            expect.objectContaining({
              exerciseId: 'exercise-2',
              order: 2,
              duration: 30,
              notes: 'Hold the position',
            }),
          ]),
        }),
      );
      expect(result).toEqual(mockProgram);
    });

    it('should create program without exercises', async () => {
      const requestWithoutExercises = {
        ...validRequest,
        exercises: undefined,
      };

      programRepository.findActiveByUserId.mockResolvedValue(null);
      programRepository.create.mockResolvedValue(mockProgram);

      const result = await useCase.execute(requestWithoutExercises);

      expect(programRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          title: 'Test Program',
          exercises: undefined,
        }),
      );
      expect(result).toEqual(mockProgram);
    });

    it('should create template program', async () => {
      const templateRequest = {
        ...validRequest,
        isTemplate: true,
      };

      programRepository.findActiveByUserId.mockResolvedValue(null);
      programRepository.create.mockResolvedValue(mockProgram);

      await useCase.execute(templateRequest);

      expect(programRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isTemplate: true,
        }),
      );
    });

    it('should throw ConflictException when end date is before start date', async () => {
      const invalidRequest = {
        ...validRequest,
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-01-15'), // Before start date
      };

      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        new ConflictException('End date must be after start date'),
      );

      expect(programRepository.findActiveByUserId).not.toHaveBeenCalled();
      expect(programRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when end date equals start date', async () => {
      const invalidRequest = {
        ...validRequest,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-15'), // Same as start date
      };

      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        new ConflictException('End date must be after start date'),
      );
    });

    it('should work with no end date', async () => {
      const requestWithoutEndDate = {
        ...validRequest,
        endDate: undefined,
      };

      programRepository.findActiveByUserId.mockResolvedValue(null);
      programRepository.create.mockResolvedValue(mockProgram);

      await useCase.execute(requestWithoutEndDate);

      expect(programRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          endDate: undefined,
        }),
      );
    });

    it('should handle empty exercises array', async () => {
      const requestWithEmptyExercises = {
        ...validRequest,
        exercises: [],
      };

      programRepository.findActiveByUserId.mockResolvedValue(null);
      programRepository.create.mockResolvedValue(mockProgram);

      await useCase.execute(requestWithEmptyExercises);

      expect(programRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          exercises: [],
        }),
      );
    });
  });
});
