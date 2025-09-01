import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import {
  GetExerciseDetailsUseCase,
  GetExerciseDetailsRequest,
} from '../../../../src/modules/exercise/application/use-cases/get-exercise-details.use-case';
import {
  IExerciseRepository,
  IFavoriteExerciseRepository,
  IExerciseRatingRepository,
} from '../../../../src/modules/exercise/domain/exercise.repository';
import {
  Exercise,
  Intensity,
  MuscleZone,
  ExerciseRating,
} from '../../../../src/modules/exercise/domain/exercise.entity';
import {
  EXERCISE_REPOSITORY_TOKEN,
  FAVORITE_EXERCISE_REPOSITORY_TOKEN,
  EXERCISE_RATING_REPOSITORY_TOKEN,
} from '../../../../src/modules/exercise/tokens';

describe('GetExerciseDetailsUseCase', () => {
  let useCase: GetExerciseDetailsUseCase;
  let exerciseRepository: jest.Mocked<IExerciseRepository>;
  let favoriteExerciseRepository: jest.Mocked<IFavoriteExerciseRepository>;
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

    const mockFavoriteExerciseRepository: jest.Mocked<IFavoriteExerciseRepository> =
      {
        create: jest.fn(),
        delete: jest.fn(),
        exists: jest.fn(),
        findByUserId: jest.fn(),
        findByUserAndExercise: jest.fn(),
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
        GetExerciseDetailsUseCase,
        {
          provide: EXERCISE_REPOSITORY_TOKEN,
          useValue: mockExerciseRepository,
        },
        {
          provide: FAVORITE_EXERCISE_REPOSITORY_TOKEN,
          useValue: mockFavoriteExerciseRepository,
        },
        {
          provide: EXERCISE_RATING_REPOSITORY_TOKEN,
          useValue: mockExerciseRatingRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetExerciseDetailsUseCase>(GetExerciseDetailsUseCase);
    exerciseRepository = module.get(EXERCISE_REPOSITORY_TOKEN);
    favoriteExerciseRepository = module.get(FAVORITE_EXERCISE_REPOSITORY_TOKEN);
    exerciseRatingRepository = module.get(EXERCISE_RATING_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should get exercise details successfully without user context', async () => {
      const request: GetExerciseDetailsRequest = {
        exerciseId: 'exercise-123',
      };

      exerciseRepository.findById.mockResolvedValue(mockExercise);
      exerciseRatingRepository.getAverageRating.mockResolvedValue(4.25);
      exerciseRatingRepository.countRatingsByExercise.mockResolvedValue(8);

      const result = await useCase.execute(request);

      expect(exerciseRepository.findById).toHaveBeenCalledWith('exercise-123');
      expect(exerciseRatingRepository.getAverageRating).toHaveBeenCalledWith(
        'exercise-123',
      );
      expect(
        exerciseRatingRepository.countRatingsByExercise,
      ).toHaveBeenCalledWith('exercise-123');
      expect(favoriteExerciseRepository.exists).not.toHaveBeenCalled();
      expect(
        exerciseRatingRepository.findByUserAndExercise,
      ).not.toHaveBeenCalled();

      expect(result).toEqual({
        exercise: mockExercise,
        isFavorite: false,
        averageRating: 4.3, // Rounded to 1 decimal place
        totalRatings: 8,
        userRating: undefined,
      });
    });

    it('should get exercise details with user context - favorite and rated', async () => {
      const request: GetExerciseDetailsRequest = {
        exerciseId: 'exercise-123',
        userId: 'user-123',
      };

      const mockUserRating = new ExerciseRating({
        id: 'rating-123',
        userId: 'user-123',
        exerciseId: 'exercise-123',
        rating: 5,
        comment: 'Great exercise!',
      });

      exerciseRepository.findById.mockResolvedValue(mockExercise);
      exerciseRatingRepository.getAverageRating.mockResolvedValue(4.75);
      exerciseRatingRepository.countRatingsByExercise.mockResolvedValue(12);
      favoriteExerciseRepository.exists.mockResolvedValue(true);
      exerciseRatingRepository.findByUserAndExercise.mockResolvedValue(
        mockUserRating,
      );

      const result = await useCase.execute(request);

      expect(exerciseRepository.findById).toHaveBeenCalledWith('exercise-123');
      expect(favoriteExerciseRepository.exists).toHaveBeenCalledWith(
        'user-123',
        'exercise-123',
      );
      expect(
        exerciseRatingRepository.findByUserAndExercise,
      ).toHaveBeenCalledWith('user-123', 'exercise-123');

      expect(result).toEqual({
        exercise: mockExercise,
        isFavorite: true,
        averageRating: 4.8, // Rounded to 1 decimal place
        totalRatings: 12,
        userRating: 5,
      });
    });

    it('should get exercise details with user context - not favorite and not rated', async () => {
      const request: GetExerciseDetailsRequest = {
        exerciseId: 'exercise-123',
        userId: 'user-123',
      };

      exerciseRepository.findById.mockResolvedValue(mockExercise);
      exerciseRatingRepository.getAverageRating.mockResolvedValue(3.0);
      exerciseRatingRepository.countRatingsByExercise.mockResolvedValue(5);
      favoriteExerciseRepository.exists.mockResolvedValue(false);
      exerciseRatingRepository.findByUserAndExercise.mockResolvedValue(null);

      const result = await useCase.execute(request);

      expect(result).toEqual({
        exercise: mockExercise,
        isFavorite: false,
        averageRating: 3.0,
        totalRatings: 5,
        userRating: undefined,
      });
    });

    it('should throw NotFoundException when exercise does not exist', async () => {
      const request: GetExerciseDetailsRequest = {
        exerciseId: 'non-existent-id',
      };

      exerciseRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(request)).rejects.toThrow(
        new NotFoundException('Exercise with id non-existent-id not found'),
      );

      expect(exerciseRepository.findById).toHaveBeenCalledWith(
        'non-existent-id',
      );
      expect(exerciseRatingRepository.getAverageRating).not.toHaveBeenCalled();
      expect(
        exerciseRatingRepository.countRatingsByExercise,
      ).not.toHaveBeenCalled();
      expect(favoriteExerciseRepository.exists).not.toHaveBeenCalled();
    });

    it('should handle zero ratings correctly', async () => {
      const request: GetExerciseDetailsRequest = {
        exerciseId: 'exercise-123',
        userId: 'user-123',
      };

      exerciseRepository.findById.mockResolvedValue(mockExercise);
      exerciseRatingRepository.getAverageRating.mockResolvedValue(0);
      exerciseRatingRepository.countRatingsByExercise.mockResolvedValue(0);
      favoriteExerciseRepository.exists.mockResolvedValue(false);
      exerciseRatingRepository.findByUserAndExercise.mockResolvedValue(null);

      const result = await useCase.execute(request);

      expect(result.averageRating).toBe(0);
      expect(result.totalRatings).toBe(0);
      expect(result.userRating).toBeUndefined();
    });

    it('should round average rating to 1 decimal place correctly', async () => {
      const testCases = [
        { input: 4.234, expected: 4.2 },
        { input: 4.236, expected: 4.2 },
        { input: 4.25, expected: 4.3 },
        { input: 4.0, expected: 4.0 },
        { input: 3.999, expected: 4.0 },
      ];

      for (const testCase of testCases) {
        exerciseRepository.findById.mockResolvedValue(mockExercise);
        exerciseRatingRepository.getAverageRating.mockResolvedValue(
          testCase.input,
        );
        exerciseRatingRepository.countRatingsByExercise.mockResolvedValue(1);

        const result = await useCase.execute({ exerciseId: 'exercise-123' });

        expect(result.averageRating).toBe(testCase.expected);
      }
    });

    it('should handle repository errors gracefully', async () => {
      const request: GetExerciseDetailsRequest = {
        exerciseId: 'exercise-123',
      };

      const repositoryError = new Error('Database connection failed');
      exerciseRepository.findById.mockRejectedValue(repositoryError);

      await expect(useCase.execute(request)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle favorite repository errors gracefully', async () => {
      const request: GetExerciseDetailsRequest = {
        exerciseId: 'exercise-123',
        userId: 'user-123',
      };

      exerciseRepository.findById.mockResolvedValue(mockExercise);
      exerciseRatingRepository.getAverageRating.mockResolvedValue(4.0);
      exerciseRatingRepository.countRatingsByExercise.mockResolvedValue(1);

      const favoriteError = new Error('Favorite repository error');
      favoriteExerciseRepository.exists.mockRejectedValue(favoriteError);

      await expect(useCase.execute(request)).rejects.toThrow(
        'Favorite repository error',
      );
    });

    it('should handle rating repository errors gracefully', async () => {
      const request: GetExerciseDetailsRequest = {
        exerciseId: 'exercise-123',
        userId: 'user-123',
      };

      exerciseRepository.findById.mockResolvedValue(mockExercise);

      const ratingError = new Error('Rating repository error');
      exerciseRatingRepository.getAverageRating.mockRejectedValue(ratingError);

      await expect(useCase.execute(request)).rejects.toThrow(
        'Rating repository error',
      );
    });

    it('should handle empty exercise ID', async () => {
      const request: GetExerciseDetailsRequest = {
        exerciseId: '',
      };

      exerciseRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(request)).rejects.toThrow(
        new NotFoundException('Exercise with id  not found'),
      );
    });
  });
});
