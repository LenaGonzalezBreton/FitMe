import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import {
  AddToFavoritesUseCase,
  AddToFavoritesRequest,
} from '../../../../src/modules/exercise/application/use-cases/add-to-favorites.use-case';
import {
  IExerciseRepository,
  IFavoriteExerciseRepository,
} from '../../../../src/modules/exercise/domain/exercise.repository';
import {
  Exercise,
  FavoriteExercise,
  Intensity,
  MuscleZone,
} from '../../../../src/modules/exercise/domain/exercise.entity';
import {
  EXERCISE_REPOSITORY_TOKEN,
  FAVORITE_EXERCISE_REPOSITORY_TOKEN,
} from '../../../../src/modules/exercise/tokens';

describe('AddToFavoritesUseCase', () => {
  let useCase: AddToFavoritesUseCase;
  let exerciseRepository: jest.Mocked<IExerciseRepository>;
  let favoriteExerciseRepository: jest.Mocked<IFavoriteExerciseRepository>;

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

    const mockFavoriteExerciseRepository: jest.Mocked<IFavoriteExerciseRepository> =
      {
        findByUserId: jest.fn(),
        findByUserAndExercise: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        exists: jest.fn(),
      };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddToFavoritesUseCase,
        {
          provide: EXERCISE_REPOSITORY_TOKEN,
          useValue: mockExerciseRepository,
        },
        {
          provide: FAVORITE_EXERCISE_REPOSITORY_TOKEN,
          useValue: mockFavoriteExerciseRepository,
        },
      ],
    }).compile();

    useCase = module.get<AddToFavoritesUseCase>(AddToFavoritesUseCase);
    exerciseRepository = module.get(EXERCISE_REPOSITORY_TOKEN);
    favoriteExerciseRepository = module.get(FAVORITE_EXERCISE_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validRequest: AddToFavoritesRequest = {
      userId: 'user-123',
      exerciseId: 'exercise-123',
    };

    it('should add exercise to favorites successfully', async () => {
      const mockFavoriteExercise = FavoriteExercise.create({
        id: 'favorite-123',
        userId: 'user-123',
        exerciseId: 'exercise-123',
        createdAt: new Date(),
      });

      exerciseRepository.findById.mockResolvedValue(mockExercise);
      favoriteExerciseRepository.findByUserAndExercise.mockResolvedValue(null);
      favoriteExerciseRepository.create.mockResolvedValue(mockFavoriteExercise);

      const result = await useCase.execute(validRequest);

      expect(exerciseRepository.findById).toHaveBeenCalledWith('exercise-123');
      expect(
        favoriteExerciseRepository.findByUserAndExercise,
      ).toHaveBeenCalledWith('user-123', 'exercise-123');
      expect(favoriteExerciseRepository.create).toHaveBeenCalledWith(
        'user-123',
        'exercise-123',
      );
      expect(result).toEqual(mockFavoriteExercise);
    });

    it('should throw NotFoundException when exercise does not exist', async () => {
      exerciseRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new NotFoundException('Exercise with id exercise-123 not found'),
      );

      expect(exerciseRepository.findById).toHaveBeenCalledWith('exercise-123');
      expect(
        favoriteExerciseRepository.findByUserAndExercise,
      ).not.toHaveBeenCalled();
      expect(favoriteExerciseRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when exercise is already in favorites', async () => {
      const existingFavorite = FavoriteExercise.create({
        id: 'existing-favorite-123',
        userId: 'user-123',
        exerciseId: 'exercise-123',
        createdAt: new Date(),
      });

      exerciseRepository.findById.mockResolvedValue(mockExercise);
      favoriteExerciseRepository.findByUserAndExercise.mockResolvedValue(
        existingFavorite,
      );

      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new ConflictException('Exercise is already in favorites'),
      );

      expect(exerciseRepository.findById).toHaveBeenCalledWith('exercise-123');
      expect(
        favoriteExerciseRepository.findByUserAndExercise,
      ).toHaveBeenCalledWith('user-123', 'exercise-123');
      expect(favoriteExerciseRepository.create).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      const repositoryError = new Error('Database connection failed');
      exerciseRepository.findById.mockRejectedValue(repositoryError);

      await expect(useCase.execute(validRequest)).rejects.toThrow(
        'Database connection failed',
      );

      expect(exerciseRepository.findById).toHaveBeenCalledWith('exercise-123');
    });

    it('should handle favorite repository create errors gracefully', async () => {
      const favoriteError = new Error('Failed to create favorite');

      exerciseRepository.findById.mockResolvedValue(mockExercise);
      favoriteExerciseRepository.findByUserAndExercise.mockResolvedValue(null);
      favoriteExerciseRepository.create.mockRejectedValue(favoriteError);

      await expect(useCase.execute(validRequest)).rejects.toThrow(
        'Failed to create favorite',
      );

      expect(favoriteExerciseRepository.create).toHaveBeenCalledWith(
        'user-123',
        'exercise-123',
      );
    });

    it('should handle favorite repository check errors gracefully', async () => {
      const favoriteError = new Error('Failed to check existing favorite');

      exerciseRepository.findById.mockResolvedValue(mockExercise);
      favoriteExerciseRepository.findByUserAndExercise.mockRejectedValue(
        favoriteError,
      );

      await expect(useCase.execute(validRequest)).rejects.toThrow(
        'Failed to check existing favorite',
      );

      expect(
        favoriteExerciseRepository.findByUserAndExercise,
      ).toHaveBeenCalledWith('user-123', 'exercise-123');
    });

    it('should work with different user and exercise IDs', async () => {
      const differentRequest: AddToFavoritesRequest = {
        userId: 'different-user-456',
        exerciseId: 'different-exercise-456',
      };

      const differentMockExercise = new Exercise(
        'different-exercise-456',
        'Different Exercise',
      );
      const mockFavoriteExercise = FavoriteExercise.create({
        userId: 'different-user-456',
        exerciseId: 'different-exercise-456',
      });

      exerciseRepository.findById.mockResolvedValue(differentMockExercise);
      favoriteExerciseRepository.findByUserAndExercise.mockResolvedValue(null);
      favoriteExerciseRepository.create.mockResolvedValue(mockFavoriteExercise);

      const result = await useCase.execute(differentRequest);

      expect(exerciseRepository.findById).toHaveBeenCalledWith(
        'different-exercise-456',
      );
      expect(
        favoriteExerciseRepository.findByUserAndExercise,
      ).toHaveBeenCalledWith('different-user-456', 'different-exercise-456');
      expect(favoriteExerciseRepository.create).toHaveBeenCalledWith(
        'different-user-456',
        'different-exercise-456',
      );
      expect(result).toEqual(mockFavoriteExercise);
    });

    it('should validate request parameters implicitly', async () => {
      // Since the use case doesn't explicitly validate request parameters,
      // we test that it passes them correctly to the repositories

      exerciseRepository.findById.mockResolvedValue(mockExercise);
      favoriteExerciseRepository.findByUserAndExercise.mockResolvedValue(null);
      const mockFavoriteExercise = FavoriteExercise.create({
        userId: 'user-123',
        exerciseId: 'exercise-123',
      });
      favoriteExerciseRepository.create.mockResolvedValue(mockFavoriteExercise);

      await useCase.execute(validRequest);

      expect(exerciseRepository.findById).toHaveBeenCalledWith('exercise-123');
      expect(
        favoriteExerciseRepository.findByUserAndExercise,
      ).toHaveBeenCalledWith('user-123', 'exercise-123');
      expect(favoriteExerciseRepository.create).toHaveBeenCalledWith(
        'user-123',
        'exercise-123',
      );
    });
  });
});
