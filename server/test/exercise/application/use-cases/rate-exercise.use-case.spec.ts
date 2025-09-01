import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import {
  RateExerciseUseCase,
  RateExerciseRequest,
} from '../../../../src/modules/exercise/application/use-cases/rate-exercise.use-case';
import {
  IExerciseRepository,
  IExerciseRatingRepository,
} from '../../../../src/modules/exercise/domain/exercise.repository';
import {
  Exercise,
  ExerciseRating,
  Intensity,
  MuscleZone,
} from '../../../../src/modules/exercise/domain/exercise.entity';
import {
  EXERCISE_REPOSITORY_TOKEN,
  EXERCISE_RATING_REPOSITORY_TOKEN,
} from '../../../../src/modules/exercise/tokens';

describe('RateExerciseUseCase', () => {
  let useCase: RateExerciseUseCase;
  let exerciseRepository: jest.Mocked<IExerciseRepository>;
  let exerciseRatingRepository: jest.Mocked<IExerciseRatingRepository>;

  const mockExercise = new Exercise(
    'exercise-123',
    'Test Exercise',
    'A test exercise',
    'https://example.com/image.jpg',
    30,
    Intensity.MODERATE,
    MuscleZone.UPPER_BODY,
    'creator-123',
    new Date(),
    new Date(),
  );

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

    const mockExerciseRatingRepository: jest.Mocked<IExerciseRatingRepository> =
      {
        create: jest.fn(),
        update: jest.fn(),
        findByUserAndExercise: jest.fn(),
        findByExerciseId: jest.fn(),
        findByUserId: jest.fn(),
        getAverageRating: jest.fn(),
        countRatingsByExercise: jest.fn(),
        delete: jest.fn(),
      };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateExerciseUseCase,
        {
          provide: EXERCISE_REPOSITORY_TOKEN,
          useValue: mockExerciseRepository,
        },
        {
          provide: EXERCISE_RATING_REPOSITORY_TOKEN,
          useValue: mockExerciseRatingRepository,
        },
      ],
    }).compile();

    useCase = module.get<RateExerciseUseCase>(RateExerciseUseCase);
    exerciseRepository = module.get(EXERCISE_REPOSITORY_TOKEN);
    exerciseRatingRepository = module.get(EXERCISE_RATING_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validRequest: RateExerciseRequest = {
      userId: 'user-123',
      exerciseId: 'exercise-123',
      rating: 4,
      comment: 'Good exercise!',
    };

    it('should create new rating successfully', async () => {
      const mockNewRating = new ExerciseRating({
        id: 'rating-123',
        userId: 'user-123',
        exerciseId: 'exercise-123',
        rating: 4,
        comment: 'Good exercise!',
      });

      exerciseRepository.findById.mockResolvedValue(mockExercise);
      exerciseRatingRepository.findByUserAndExercise.mockResolvedValue(null);
      exerciseRatingRepository.create.mockResolvedValue(mockNewRating);

      const result = await useCase.execute(validRequest);

      expect(exerciseRepository.findById).toHaveBeenCalledWith('exercise-123');
      expect(
        exerciseRatingRepository.findByUserAndExercise,
      ).toHaveBeenCalledWith('user-123', 'exercise-123');
      expect(exerciseRatingRepository.create).toHaveBeenCalledWith(
        'user-123',
        'exercise-123',
        4,
        'Good exercise!',
      );
      expect(result).toEqual(mockNewRating);
    });

    it('should update existing rating successfully', async () => {
      const existingRating = new ExerciseRating({
        id: 'rating-123',
        userId: 'user-123',
        exerciseId: 'exercise-123',
        rating: 3,
        comment: 'Okay exercise',
      });

      const updatedRating = new ExerciseRating({
        id: 'rating-123',
        userId: 'user-123',
        exerciseId: 'exercise-123',
        rating: 4,
        comment: 'Good exercise!',
      });

      exerciseRepository.findById.mockResolvedValue(mockExercise);
      exerciseRatingRepository.findByUserAndExercise.mockResolvedValue(
        existingRating,
      );
      exerciseRatingRepository.update.mockResolvedValue(updatedRating);

      const result = await useCase.execute(validRequest);

      expect(exerciseRepository.findById).toHaveBeenCalledWith('exercise-123');
      expect(
        exerciseRatingRepository.findByUserAndExercise,
      ).toHaveBeenCalledWith('user-123', 'exercise-123');
      expect(exerciseRatingRepository.update).toHaveBeenCalledWith(
        'user-123',
        'exercise-123',
        4,
        'Good exercise!',
      );
      expect(result).toEqual(updatedRating);
    });

    it('should throw NotFoundException when exercise does not exist', async () => {
      exerciseRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new NotFoundException('Exercise with id exercise-123 not found'),
      );

      expect(exerciseRepository.findById).toHaveBeenCalledWith('exercise-123');
      expect(
        exerciseRatingRepository.findByUserAndExercise,
      ).not.toHaveBeenCalled();
      expect(exerciseRatingRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when rating is invalid', async () => {
      const invalidRequest = {
        ...validRequest,
        rating: 6, // Invalid rating > 5
      };

      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        new BadRequestException('Rating must be between 1 and 5'),
      );

      expect(exerciseRepository.findById).not.toHaveBeenCalled();
    });

    it('should work without comment', async () => {
      const requestWithoutComment = {
        userId: 'user-123',
        exerciseId: 'exercise-123',
        rating: 4,
      };

      const mockNewRating = new ExerciseRating({
        id: 'rating-123',
        userId: 'user-123',
        exerciseId: 'exercise-123',
        rating: 4,
      });

      exerciseRepository.findById.mockResolvedValue(mockExercise);
      exerciseRatingRepository.findByUserAndExercise.mockResolvedValue(null);
      exerciseRatingRepository.create.mockResolvedValue(mockNewRating);

      const result = await useCase.execute(requestWithoutComment);

      expect(exerciseRatingRepository.create).toHaveBeenCalledWith(
        'user-123',
        'exercise-123',
        4,
        undefined,
      );
      expect(result).toEqual(mockNewRating);
    });
  });
});
