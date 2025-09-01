import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import {
  UpdateProfileUseCase,
  UpdateProfileRequest,
} from '../../../../src/modules/auth/application/use-cases/update-profile.use-case';
import {
  IUserRepository,
  ProfileType,
  ContextType,
} from '../../../../src/modules/auth/domain/auth.repository';
import { USER_REPOSITORY_TOKEN } from '../../../../src/modules/auth/tokens';
import { AuthUser } from '../../../../src/modules/auth/domain/auth.entity';

describe('UpdateProfileUseCase', () => {
  let useCase: UpdateProfileUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  const mockUser: AuthUser = new AuthUser(
    '123e4567-e89b-12d3-a456-426614174000',
    'test@example.com',
    'mockHashedPassword',
    true, // onboardingCompleted
    'John', // firstName
    new Date('1990-01-01'), // birthDate
    undefined, // experienceLevel
    ProfileType.FEMALE,
    ContextType.CYCLE,
    'FITNESS', // objective
    'WEEKLY', // sportFrequency
    false, // isMenopausal
    new Date(),
    new Date(),
  );

  beforeEach(async () => {
    const mockUserRepository: jest.Mocked<IUserRepository> = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateOnboardingProfile: jest.fn(),
      updatePassword: jest.fn(),
      updateProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProfileUseCase,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateProfileUseCase>(UpdateProfileUseCase);
    userRepository = module.get(USER_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validRequest: UpdateProfileRequest = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      firstName: 'Jane',
      birthDate: '1992-05-15',
      profileType: 'FEMALE',
      contextType: 'CYCLE',
      objective: 'WEIGHT_LOSS',
      sportFrequency: 'DAILY',
      isMenopausal: false,
    };

    it('should update profile successfully', async () => {
      // Arrange
      const updatedUser = new AuthUser(
        mockUser.id,
        mockUser.email,
        mockUser.passwordHash,
        mockUser.onboardingCompleted,
        validRequest.firstName,
        new Date(validRequest.birthDate!),
        mockUser.experienceLevel,
        validRequest.profileType as any,
        validRequest.contextType as any,
        validRequest.objective,
        validRequest.sportFrequency,
        validRequest.isMenopausal,
        mockUser.createdAt,
        mockUser.updatedAt,
      );
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.updateProfile.mockResolvedValue(updatedUser);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(userRepository.findById).toHaveBeenCalledWith(validRequest.userId);
      expect(userRepository.updateProfile).toHaveBeenCalledWith(
        validRequest.userId,
        expect.objectContaining({
          firstName: 'Jane',
          birthDate: new Date('1992-05-15'),
          profileType: ProfileType.FEMALE,
          contextType: ContextType.CYCLE,
          objective: 'WEIGHT_LOSS',
          sportFrequency: 'DAILY',
          isMenopausal: false,
        }),
      );
      expect(result.user.firstName).toBe('Jane');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new NotFoundException('Utilisateur non trouvé.'),
      );
    });

    it('should throw error for invalid birth date', async () => {
      // Arrange
      const invalidRequest = { ...validRequest, birthDate: 'invalid-date' };
      userRepository.findById.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        'Date de naissance invalide.',
      );
    });

    it('should throw error for age under 13', async () => {
      // Arrange
      const currentYear = new Date().getFullYear();
      const invalidRequest = {
        ...validRequest,
        birthDate: `${currentYear - 10}-01-01`,
      };
      userRepository.findById.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        "L'âge doit être entre 13 et 120 ans.",
      );
    });

    it('should throw error for invalid profile type', async () => {
      // Arrange
      const invalidRequest = { ...validRequest, profileType: 'INVALID' };
      userRepository.findById.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        'Type de profil invalide.',
      );
    });

    it('should trim string fields', async () => {
      // Arrange
      const requestWithSpaces = {
        ...validRequest,
        firstName: '  Jane  ',
        objective: '  FITNESS  ',
        sportFrequency: '  DAILY  ',
      };
      const updatedUser = { ...mockUser };
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.updateProfile.mockResolvedValue(updatedUser);

      // Act
      await useCase.execute(requestWithSpaces);

      // Assert
      expect(userRepository.updateProfile).toHaveBeenCalledWith(
        validRequest.userId,
        expect.objectContaining({
          firstName: 'Jane',
          objective: 'FITNESS',
          sportFrequency: 'DAILY',
        }),
      );
    });
  });
});
