import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import {
  CreateExerciseUseCase,
  CreateExerciseRequest,
} from '../../../../src/modules/exercise/application/use-cases/create-exercise.use-case';
import { IExerciseRepository } from '../../../../src/modules/exercise/domain/exercise.repository';
import {
  Exercise,
  Intensity,
  MuscleZone,
} from '../../../../src/modules/exercise/domain/exercise.entity';
import { EXERCISE_REPOSITORY_TOKEN } from '../../../../src/modules/exercise/tokens';

describe('CreateExerciseUseCase', () => {
  let useCase: CreateExerciseUseCase;
  let exerciseRepository: jest.Mocked<IExerciseRepository>;

  beforeEach(async () => {
    const mockExerciseRepository: jest.Mocked<IExerciseRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByPhase: jest.fn(),
      findByIntensity: jest.fn(),
      findByMuscleZone: jest.fn(),
      findWithFilters: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateExerciseUseCase,
        {
          provide: EXERCISE_REPOSITORY_TOKEN,
          useValue: mockExerciseRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateExerciseUseCase>(CreateExerciseUseCase);
    exerciseRepository = module.get(EXERCISE_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validRequest: CreateExerciseRequest = {
      userId: 'user-123',
      title: 'Test Exercise',
      description: 'A test exercise',
      imageUrl: 'https://example.com/image.jpg',
      durationMinutes: 30,
      intensity: 'MODERATE',
      muscleZone: 'UPPER_BODY',
    };

    it('should create exercise successfully with all fields', async () => {
      const mockExercise = new Exercise(
        'exercise-123',
        'Test Exercise',
        'A test exercise',
        'https://example.com/image.jpg',
        30,
        Intensity.MODERATE,
        MuscleZone.UPPER_BODY,
        'user-123',
        new Date(),
        new Date(),
      );

      exerciseRepository.create.mockResolvedValue(mockExercise);

      const result = await useCase.execute(validRequest);

      expect(exerciseRepository.create).toHaveBeenCalledWith({
        title: 'Test Exercise',
        description: 'A test exercise',
        imageUrl: 'https://example.com/image.jpg',
        durationMinutes: 30,
        intensity: 'MODERATE',
        muscleZone: 'UPPER_BODY',
        createdBy: 'user-123',
      });
      expect(result).toEqual(mockExercise);
    });

    it('should create exercise successfully with minimum fields', async () => {
      const minimalRequest = {
        userId: 'user-123',
        title: 'Minimal Exercise',
      };

      const mockExercise = new Exercise(
        'exercise-123',
        'Minimal Exercise',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        'user-123',
        new Date(),
        new Date(),
      );

      exerciseRepository.create.mockResolvedValue(mockExercise);

      const result = await useCase.execute(minimalRequest);

      expect(exerciseRepository.create).toHaveBeenCalledWith({
        title: 'Minimal Exercise',
        description: undefined,
        imageUrl: undefined,
        durationMinutes: undefined,
        intensity: undefined,
        muscleZone: undefined,
        createdBy: 'user-123',
      });
      expect(result).toEqual(mockExercise);
    });

    it('should trim whitespace from text fields', async () => {
      const requestWithWhitespace = {
        userId: 'user-123',
        title: '  Test Exercise  ',
        description: '  A test exercise  ',
        imageUrl: '  https://example.com/image.jpg  ',
      };

      const mockExercise = new Exercise('exercise-123', 'Test Exercise');
      exerciseRepository.create.mockResolvedValue(mockExercise);

      await useCase.execute(requestWithWhitespace);

      expect(exerciseRepository.create).toHaveBeenCalledWith({
        title: 'Test Exercise',
        description: 'A test exercise',
        imageUrl: 'https://example.com/image.jpg',
        durationMinutes: undefined,
        intensity: undefined,
        muscleZone: undefined,
        createdBy: 'user-123',
      });
    });

    it('should throw BadRequestException when title is empty', async () => {
      const invalidRequest = {
        ...validRequest,
        title: '',
      };

      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        new BadRequestException('Exercise title is required'),
      );
      expect(exerciseRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when title is only whitespace', async () => {
      const invalidRequest = {
        ...validRequest,
        title: '   ',
      };

      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        new BadRequestException('Exercise title is required'),
      );
      expect(exerciseRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when userId is empty', async () => {
      const invalidRequest = {
        ...validRequest,
        userId: '',
      };

      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        new BadRequestException('User ID is required'),
      );
      expect(exerciseRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when userId is only whitespace', async () => {
      const invalidRequest = {
        ...validRequest,
        userId: '   ',
      };

      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        new BadRequestException('User ID is required'),
      );
      expect(exerciseRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when duration is zero', async () => {
      const invalidRequest = {
        ...validRequest,
        durationMinutes: 0,
      };

      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        new BadRequestException('Duration must be positive'),
      );
      expect(exerciseRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when duration is negative', async () => {
      const invalidRequest = {
        ...validRequest,
        durationMinutes: -10,
      };

      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        new BadRequestException('Duration must be positive'),
      );
      expect(exerciseRepository.create).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      const repositoryError = new Error('Database connection failed');
      exerciseRepository.create.mockRejectedValue(repositoryError);

      await expect(useCase.execute(validRequest)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should pass intensity and muscleZone as enum values', async () => {
      const mockExercise = new Exercise('exercise-123', 'Test Exercise');
      exerciseRepository.create.mockResolvedValue(mockExercise);

      await useCase.execute(validRequest);

      expect(exerciseRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          intensity: 'MODERATE',
          muscleZone: 'UPPER_BODY',
        }),
      );
    });

    it('should handle undefined optional fields correctly', async () => {
      const requestWithUndefinedFields = {
        userId: 'user-123',
        title: 'Test Exercise',
        description: undefined,
        imageUrl: undefined,
        durationMinutes: undefined,
        intensity: undefined,
        muscleZone: undefined,
      };

      const mockExercise = new Exercise('exercise-123', 'Test Exercise');
      exerciseRepository.create.mockResolvedValue(mockExercise);

      await useCase.execute(requestWithUndefinedFields);

      expect(exerciseRepository.create).toHaveBeenCalledWith({
        title: 'Test Exercise',
        description: undefined,
        imageUrl: undefined,
        durationMinutes: undefined,
        intensity: undefined,
        muscleZone: undefined,
        createdBy: 'user-123',
      });
    });
  });
});
