import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import {
  RemoveFromFavoritesUseCase,
  RemoveFromFavoritesRequest,
} from '../../../../src/modules/exercise/application/use-cases/remove-from-favorites.use-case';
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

describe('RemoveFromFavoritesUseCase', () => {
  let useCase: RemoveFromFavoritesUseCase;
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
        RemoveFromFavoritesUseCase,
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

    useCase = module.get<RemoveFromFavoritesUseCase>(
      RemoveFromFavoritesUseCase,
    );
    exerciseRepository = module.get(EXERCISE_REPOSITORY_TOKEN);
    favoriteExerciseRepository = module.get(FAVORITE_EXERCISE_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validRequest: RemoveFromFavoritesRequest = {
      userId: 'user-123',
      exerciseId: 'exercise-123',
    };

    it('should remove exercise from favorites successfully', async () => {
      const mockFavoriteExercise = FavoriteExercise.create({
        id: 'favorite-123',
        userId: 'user-123',
        exerciseId: 'exercise-123',
        createdAt: new Date(),
      });

      exerciseRepository.findById.mockResolvedValue(mockExercise);
      favoriteExerciseRepository.findByUserAndExercise.mockResolvedValue(
        mockFavoriteExercise,
      );
      favoriteExerciseRepository.delete.mockResolvedValue();

      await useCase.execute(validRequest);

      expect(exerciseRepository.findById).toHaveBeenCalledWith('exercise-123');
      expect(
        favoriteExerciseRepository.findByUserAndExercise,
      ).toHaveBeenCalledWith('user-123', 'exercise-123');
      expect(favoriteExerciseRepository.delete).toHaveBeenCalledWith(
        'user-123',
        'exercise-123',
      );
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
      expect(favoriteExerciseRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when exercise is not in favorites', async () => {
      exerciseRepository.findById.mockResolvedValue(mockExercise);
      favoriteExerciseRepository.findByUserAndExercise.mockResolvedValue(null);

      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new NotFoundException('Exercise is not in favorites'),
      );

      expect(exerciseRepository.findById).toHaveBeenCalledWith('exercise-123');
      expect(
        favoriteExerciseRepository.findByUserAndExercise,
      ).toHaveBeenCalledWith('user-123', 'exercise-123');
      expect(favoriteExerciseRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      const repositoryError = new Error('Database connection failed');
      exerciseRepository.findById.mockRejectedValue(repositoryError);

      await expect(useCase.execute(validRequest)).rejects.toThrow(
        'Database connection failed',
      );

      expect(exerciseRepository.findById).toHaveBeenCalledWith('exercise-123');
    });

    it('should handle favorite repository delete errors gracefully', async () => {
      const favoriteError = new Error('Failed to delete favorite');
      const mockFavoriteExercise = FavoriteExercise.create({
        userId: 'user-123',
        exerciseId: 'exercise-123',
      });

      exerciseRepository.findById.mockResolvedValue(mockExercise);
      favoriteExerciseRepository.findByUserAndExercise.mockResolvedValue(
        mockFavoriteExercise,
      );
      favoriteExerciseRepository.delete.mockRejectedValue(favoriteError);

      await expect(useCase.execute(validRequest)).rejects.toThrow(
        'Failed to delete favorite',
      );

      expect(favoriteExerciseRepository.delete).toHaveBeenCalledWith(
        'user-123',
        'exercise-123',
      );
    });
  });
});
