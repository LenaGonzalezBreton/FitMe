import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import {
  GetExercisesByPhaseUseCase,
  GetExercisesByPhaseRequest,
} from '../../../../src/modules/exercise/application/use-cases/get-exercises-by-phase.use-case';
import {
  IExerciseRepository,
  IPhaseExerciseRepository,
} from '../../../../src/modules/exercise/domain/exercise.repository';
import {
  Exercise,
  Intensity,
  MuscleZone,
} from '../../../../src/modules/exercise/domain/exercise.entity';
import { CyclePhase } from '../../../../src/modules/cycle/domain/cycle.entity';
import {
  EXERCISE_REPOSITORY_TOKEN,
  PHASE_EXERCISE_REPOSITORY_TOKEN,
} from '../../../../src/modules/exercise/tokens';

describe('GetExercisesByPhaseUseCase', () => {
  let useCase: GetExercisesByPhaseUseCase;
  let exerciseRepository: jest.Mocked<IExerciseRepository>;
  let phaseExerciseRepository: jest.Mocked<IPhaseExerciseRepository>;

  const mockExercises = [
    new Exercise(
      'exercise-1',
      'Yoga Flow',
      'Gentle yoga flow',
      'https://example.com/yoga.jpg',
      30,
      Intensity.LOW,
      MuscleZone.FLEXIBILITY,
      'creator-1',
      new Date(),
      new Date(),
    ),
    new Exercise(
      'exercise-2',
      'Light Cardio',
      'Light cardio workout',
      'https://example.com/cardio.jpg',
      20,
      Intensity.MODERATE,
      MuscleZone.CARDIO,
      'creator-2',
      new Date(),
      new Date(),
    ),
  ];

  beforeEach(async () => {
    const mockExerciseRepository: jest.Mocked<IExerciseRepository> = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByPhase: jest.fn(),
      findByIntensity: jest.fn(),
      findByMuscleZone: jest.fn(),
      findWithFilters: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockPhaseExerciseRepository: jest.Mocked<IPhaseExerciseRepository> = {
      findByPhaseName: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetExercisesByPhaseUseCase,
        {
          provide: EXERCISE_REPOSITORY_TOKEN,
          useValue: mockExerciseRepository,
        },
        {
          provide: PHASE_EXERCISE_REPOSITORY_TOKEN,
          useValue: mockPhaseExerciseRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetExercisesByPhaseUseCase>(
      GetExercisesByPhaseUseCase,
    );
    exerciseRepository = module.get(EXERCISE_REPOSITORY_TOKEN);
    phaseExerciseRepository = module.get(PHASE_EXERCISE_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validRequest: GetExercisesByPhaseRequest = {
      phase: CyclePhase.MENSTRUAL,
      limit: 10,
    };

    it('should get exercises by phase successfully', async () => {
      phaseExerciseRepository.findByPhaseName.mockResolvedValue([]);
      exerciseRepository.findWithFilters.mockResolvedValue(mockExercises);

      const result = await useCase.execute(validRequest);

      expect(phaseExerciseRepository.findByPhaseName).toHaveBeenCalledWith(
        'MENSTRUAL',
      );
      expect(exerciseRepository.findWithFilters).toHaveBeenCalled();
      expect(result.exercises).toHaveLength(2);
      expect(result.exercises[0]).toEqual({
        id: 'exercise-1',
        title: 'Yoga Flow',
        description: 'Gentle yoga flow',
        imageUrl: 'https://example.com/yoga.jpg',
        durationMinutes: 30,
        formattedDuration: '30min',
        intensity: Intensity.LOW,
        intensityLabel: 'Faible',
        muscleZone: MuscleZone.FLEXIBILITY,
        muscleZoneLabel: 'Flexibilité',
        isRecommendedForPhase: false,
      });
    });

    it('should filter exercises with additional filters', async () => {
      const requestWithFilters: GetExercisesByPhaseRequest = {
        phase: CyclePhase.FOLLICULAR,
        intensity: Intensity.LOW,
        muscleZone: MuscleZone.FLEXIBILITY,
        maxDuration: 45,
        limit: 5,
      };

      const filteredExercises = [mockExercises[0]]; // Only yoga flow matches
      phaseExerciseRepository.findByPhaseName.mockResolvedValue([]);
      exerciseRepository.findWithFilters.mockResolvedValue(filteredExercises);

      const result = await useCase.execute(requestWithFilters);

      expect(exerciseRepository.findWithFilters).toHaveBeenCalledWith({
        phaseName: 'FOLLICULAR',
        intensity: Intensity.LOW,
        muscleZone: MuscleZone.FLEXIBILITY,
        maxDuration: 45,
      });
      expect(result.exercises).toHaveLength(1);
      expect(result.totalCount).toBe(1);
    });

    it('should handle empty results', async () => {
      phaseExerciseRepository.findByPhaseName.mockResolvedValue([]);
      exerciseRepository.findWithFilters.mockResolvedValue([]);

      const result = await useCase.execute(validRequest);

      expect(result.exercises).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it('should apply limit correctly', async () => {
      const requestWithLimit = {
        ...validRequest,
        limit: 1,
      };

      phaseExerciseRepository.findByPhaseName.mockResolvedValue([]);
      exerciseRepository.findWithFilters.mockResolvedValue(
        mockExercises.slice(0, 1),
      );

      const result = await useCase.execute(requestWithLimit);

      expect(result.exercises).toHaveLength(1);
      expect(result.totalCount).toBe(1);
    });

    it('should throw BadRequestException for invalid phase', async () => {
      const invalidRequest = {
        ...validRequest,
        phase: 'INVALID_PHASE',
      };

      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        new BadRequestException('Phase de cycle invalide'),
      );

      expect(exerciseRepository.findByPhase).not.toHaveBeenCalled();
    });

    it('should work with string phase names', async () => {
      const requestWithStringPhase = {
        ...validRequest,
        phase: 'OVULATION',
      };

      phaseExerciseRepository.findByPhaseName.mockResolvedValue([]);
      exerciseRepository.findWithFilters.mockResolvedValue(mockExercises);

      const result = await useCase.execute(requestWithStringPhase);

      expect(phaseExerciseRepository.findByPhaseName).toHaveBeenCalledWith(
        'OVULATION',
      );
      expect(exerciseRepository.findWithFilters).toHaveBeenCalled();
      expect(result.exercises).toHaveLength(2);
    });
  });
});
