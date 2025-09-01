import { Test, TestingModule } from '@nestjs/testing';
import {
  GetFavoriteExercisesUseCase,
  GetFavoriteExercisesRequest,
} from '../../../../src/modules/exercise/application/use-cases/get-favorite-exercises.use-case';
import {
  IExerciseRepository,
  IFavoriteExerciseRepository,
  IExerciseRatingRepository,
} from '../../../../src/modules/exercise/domain/exercise.repository';
import {
  Exercise,
  FavoriteExercise,
  ExerciseRating,
  Intensity,
  MuscleZone,
} from '../../../../src/modules/exercise/domain/exercise.entity';
import {
  EXERCISE_REPOSITORY_TOKEN,
  FAVORITE_EXERCISE_REPOSITORY_TOKEN,
  EXERCISE_RATING_REPOSITORY_TOKEN,
} from '../../../../src/modules/exercise/tokens';

describe('GetFavoriteExercisesUseCase', () => {
  let useCase: GetFavoriteExercisesUseCase;
  let exerciseRepository: jest.Mocked<IExerciseRepository>;
  let favoriteExerciseRepository: jest.Mocked<IFavoriteExerciseRepository>;
  let exerciseRatingRepository: jest.Mocked<IExerciseRatingRepository>;

  const mockExercise = new Exercise(
    'exercise-123',
    'Favorite Exercise',
    'A favorite exercise',
    'https://example.com/image.jpg',
    30,
    Intensity.MODERATE,
    MuscleZone.UPPER_BODY,
    'creator-123',
    new Date(),
    new Date(),
  );

  const mockFavorite = FavoriteExercise.create({
    id: 'favorite-123',
    userId: 'user-123',
    exerciseId: 'exercise-123',
    createdAt: new Date('2024-01-01'),
  });

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
        GetFavoriteExercisesUseCase,
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

    useCase = module.get<GetFavoriteExercisesUseCase>(
      GetFavoriteExercisesUseCase,
    );
    exerciseRepository = module.get(EXERCISE_REPOSITORY_TOKEN);
    favoriteExerciseRepository = module.get(FAVORITE_EXERCISE_REPOSITORY_TOKEN);
    exerciseRatingRepository = module.get(EXERCISE_RATING_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validRequest: GetFavoriteExercisesRequest = {
      userId: 'user-123',
    };

    it('should get favorite exercises successfully', async () => {
      const mockUserRating = new ExerciseRating({
        id: 'rating-123',
        userId: 'user-123',
        exerciseId: 'exercise-123',
        rating: 5,
        comment: 'Great exercise!',
      });

      favoriteExerciseRepository.findByUserId.mockResolvedValue([mockFavorite]);
      exerciseRepository.findById.mockResolvedValue(mockExercise);
      exerciseRatingRepository.getAverageRating.mockResolvedValue(4.5);
      exerciseRatingRepository.countRatingsByExercise.mockResolvedValue(10);
      exerciseRatingRepository.findByUserAndExercise.mockResolvedValue(
        mockUserRating,
      );

      const result = await useCase.execute(validRequest);

      expect(favoriteExerciseRepository.findByUserId).toHaveBeenCalledWith(
        'user-123',
      );
      expect(exerciseRepository.findById).toHaveBeenCalledWith('exercise-123');
      expect(exerciseRatingRepository.getAverageRating).toHaveBeenCalledWith(
        'exercise-123',
      );
      expect(
        exerciseRatingRepository.countRatingsByExercise,
      ).toHaveBeenCalledWith('exercise-123');
      expect(
        exerciseRatingRepository.findByUserAndExercise,
      ).toHaveBeenCalledWith('user-123', 'exercise-123');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        exercise: mockExercise,
        addedToFavoritesAt: mockFavorite.createdAt,
        averageRating: 4.5,
        totalRatings: 10,
        userRating: 5,
      });
    });

    it('should return empty array when user has no favorites', async () => {
      favoriteExerciseRepository.findByUserId.mockResolvedValue([]);

      const result = await useCase.execute(validRequest);

      expect(favoriteExerciseRepository.findByUserId).toHaveBeenCalledWith(
        'user-123',
      );
      expect(result).toHaveLength(0);
      expect(exerciseRepository.findById).not.toHaveBeenCalled();
    });

    it('should filter out exercises that no longer exist', async () => {
      favoriteExerciseRepository.findByUserId.mockResolvedValue([mockFavorite]);
      exerciseRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute(validRequest);

      expect(favoriteExerciseRepository.findByUserId).toHaveBeenCalledWith(
        'user-123',
      );
      expect(exerciseRepository.findById).toHaveBeenCalledWith('exercise-123');
      expect(result).toHaveLength(0);
    });
  });
});
