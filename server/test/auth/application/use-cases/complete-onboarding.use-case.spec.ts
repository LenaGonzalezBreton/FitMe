import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import {
  CompleteOnboardingUseCase,
  CompleteOnboardingRequest,
} from '../../../../src/modules/auth/application/use-cases/complete-onboarding.use-case';
import {
  IUserRepository,
  ObjectiveType,
  ExperienceLevel,
} from '../../../../src/modules/auth/domain/auth.repository';
import { ICycleProfileConfigRepository } from '../../../../src/modules/cycle/domain/cycle.repository';
import { USER_REPOSITORY_TOKEN } from '../../../../src/modules/auth/tokens';
import { CYCLE_PROFILE_CONFIG_REPOSITORY_TOKEN } from '../../../../src/modules/cycle/tokens';
import { AuthUser } from '../../../../src/modules/auth/domain/auth.entity';

describe('CompleteOnboardingUseCase', () => {
  let useCase: CompleteOnboardingUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let cycleConfigRepository: jest.Mocked<ICycleProfileConfigRepository>;

  const mockUser: AuthUser = new AuthUser(
    '123e4567-e89b-12d3-a456-426614174000',
    'test@example.com',
    'mockHashedPassword',
    false, // onboardingCompleted
    'John', // firstName
    undefined, // birthDate
    undefined, // experienceLevel
    'FEMALE',
    'CYCLE',
    undefined, // objective
    undefined, // sportFrequency
    undefined, // isMenopausal
    new Date(),
    new Date(),
  );

  const mockUpdatedUser: AuthUser = new AuthUser(
    mockUser.id,
    mockUser.email,
    mockUser.passwordHash,
    true, // onboardingCompleted
    mockUser.firstName,
    mockUser.birthDate,
    ExperienceLevel.INTERMEDIATE,
    mockUser.profileType,
    mockUser.contextType,
    ObjectiveType.GENERAL_FITNESS,
    mockUser.sportFrequency,
    false, // isMenopausal
    mockUser.createdAt,
    mockUser.updatedAt,
  );

  const mockCycleConfig = {
    id: 'config-123',
    userId: '123e4567-e89b-12d3-a456-426614174000',
    averageCycleLength: 28,
    averagePeriodLength: 5,
    isCycleTrackingEnabled: true,
    usesExternalProvider: false,
    useMenopauseMode: false,
    prefersManualInput: true,
  };

  beforeEach(async () => {
    const mockUserRepository: jest.Mocked<IUserRepository> = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateOnboardingProfile: jest.fn(),
      updatePassword: jest.fn(),
      updateProfile: jest.fn(),
    };

    const mockCycleConfigRepository: jest.Mocked<ICycleProfileConfigRepository> =
      {
        findByUserId: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompleteOnboardingUseCase,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: mockUserRepository,
        },
        {
          provide: CYCLE_PROFILE_CONFIG_REPOSITORY_TOKEN,
          useValue: mockCycleConfigRepository,
        },
      ],
    }).compile();

    useCase = module.get<CompleteOnboardingUseCase>(CompleteOnboardingUseCase);
    userRepository = module.get(USER_REPOSITORY_TOKEN);
    cycleConfigRepository = module.get(CYCLE_PROFILE_CONFIG_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validRequest: CompleteOnboardingRequest = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      objective: ObjectiveType.GENERAL_FITNESS,
      experienceLevel: ExperienceLevel.INTERMEDIATE,
      isMenopausal: false,
      averageCycleLength: 28,
      averagePeriodLength: 5,
    };

    it('should complete onboarding successfully for non-menopausal user', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.updateOnboardingProfile.mockResolvedValue(mockUpdatedUser);
      cycleConfigRepository.findByUserId.mockResolvedValue(null);
      cycleConfigRepository.create.mockResolvedValue(mockCycleConfig);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(userRepository.findById).toHaveBeenCalledWith(validRequest.userId);
      expect(userRepository.updateOnboardingProfile).toHaveBeenCalledWith(
        validRequest.userId,
        {
          objective: ObjectiveType.GENERAL_FITNESS,
          experienceLevel: ExperienceLevel.INTERMEDIATE,
          isMenopausal: false,
          onboardingCompleted: true,
        },
      );
      expect(cycleConfigRepository.findByUserId).toHaveBeenCalledWith(
        validRequest.userId,
      );
      expect(cycleConfigRepository.create).toHaveBeenCalledWith({
        userId: validRequest.userId,
        averageCycleLength: 28,
        averagePeriodLength: 5,
        isCycleTrackingEnabled: true,
      });
      expect(result).toBe(mockUpdatedUser);
    });

    it('should complete onboarding for menopausal user without cycle config', async () => {
      // Arrange
      const menopausalRequest = {
        ...validRequest,
        isMenopausal: true,
      };
      const menopausalUser = { ...mockUpdatedUser, isMenopausal: true };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.updateOnboardingProfile.mockResolvedValue(menopausalUser);

      // Act
      const result = await useCase.execute(menopausalRequest);

      // Assert
      expect(userRepository.updateOnboardingProfile).toHaveBeenCalledWith(
        validRequest.userId,
        {
          objective: ObjectiveType.GENERAL_FITNESS,
          experienceLevel: ExperienceLevel.INTERMEDIATE,
          isMenopausal: true,
          onboardingCompleted: true,
        },
      );
      expect(cycleConfigRepository.findByUserId).not.toHaveBeenCalled();
      expect(cycleConfigRepository.create).not.toHaveBeenCalled();
      expect(result).toBe(menopausalUser);
    });

    it('should update existing cycle configuration', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.updateOnboardingProfile.mockResolvedValue(mockUpdatedUser);
      cycleConfigRepository.findByUserId.mockResolvedValue(mockCycleConfig);
      cycleConfigRepository.update.mockResolvedValue(mockCycleConfig);

      // Act
      await useCase.execute(validRequest);

      // Assert
      expect(cycleConfigRepository.update).toHaveBeenCalledWith(
        validRequest.userId,
        {
          averageCycleLength: 28,
          averagePeriodLength: 5,
          isCycleTrackingEnabled: true,
        },
      );
      expect(cycleConfigRepository.create).not.toHaveBeenCalled();
    });

    it('should handle cycle config with optional parameters', async () => {
      // Arrange
      const requestWithoutCycleParams = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        objective: ObjectiveType.WEIGHT_LOSS,
        experienceLevel: ExperienceLevel.BEGINNER,
        isMenopausal: false,
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.updateOnboardingProfile.mockResolvedValue(mockUpdatedUser);
      cycleConfigRepository.findByUserId.mockResolvedValue(null);
      cycleConfigRepository.create.mockResolvedValue(mockCycleConfig);

      // Act
      await useCase.execute(requestWithoutCycleParams);

      // Assert
      expect(cycleConfigRepository.create).toHaveBeenCalledWith({
        userId: requestWithoutCycleParams.userId,
        averageCycleLength: undefined,
        averagePeriodLength: undefined,
        isCycleTrackingEnabled: true,
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new NotFoundException("L'utilisateur n'a pas été trouvé."),
      );
      expect(userRepository.updateOnboardingProfile).not.toHaveBeenCalled();
      expect(cycleConfigRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      userRepository.findById.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle user profile update errors', async () => {
      // Arrange
      const updateError = new Error('Failed to update user profile');
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.updateOnboardingProfile.mockRejectedValue(updateError);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        'Failed to update user profile',
      );
      expect(cycleConfigRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should handle cycle config repository errors', async () => {
      // Arrange
      const cycleConfigError = new Error('Failed to create cycle config');
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.updateOnboardingProfile.mockResolvedValue(mockUpdatedUser);
      cycleConfigRepository.findByUserId.mockResolvedValue(null);
      cycleConfigRepository.create.mockRejectedValue(cycleConfigError);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        'Failed to create cycle config',
      );
    });

    it('should handle all objective types correctly', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.updateOnboardingProfile.mockResolvedValue(mockUpdatedUser);
      cycleConfigRepository.findByUserId.mockResolvedValue(null);
      cycleConfigRepository.create.mockResolvedValue(mockCycleConfig);

      const objectives = [
        ObjectiveType.WEIGHT_LOSS,
        ObjectiveType.MUSCLE_GAIN,
        ObjectiveType.ENDURANCE,
        ObjectiveType.STRENGTH,
        ObjectiveType.FLEXIBILITY,
        ObjectiveType.STRESS_REDUCTION,
        ObjectiveType.ENERGY_BOOST,
      ];

      for (const objective of objectives) {
        const request = { ...validRequest, objective };

        // Act
        await useCase.execute(request);

        // Assert
        expect(userRepository.updateOnboardingProfile).toHaveBeenCalledWith(
          validRequest.userId,
          expect.objectContaining({ objective }),
        );
      }
    });

    it('should handle all experience levels correctly', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.updateOnboardingProfile.mockResolvedValue(mockUpdatedUser);
      cycleConfigRepository.findByUserId.mockResolvedValue(null);
      cycleConfigRepository.create.mockResolvedValue(mockCycleConfig);

      const experienceLevels = [
        ExperienceLevel.BEGINNER,
        ExperienceLevel.INTERMEDIATE,
        ExperienceLevel.ADVANCED,
      ];

      for (const experienceLevel of experienceLevels) {
        const request = { ...validRequest, experienceLevel };

        // Act
        await useCase.execute(request);

        // Assert
        expect(userRepository.updateOnboardingProfile).toHaveBeenCalledWith(
          validRequest.userId,
          expect.objectContaining({ experienceLevel }),
        );
      }
    });
  });
});
