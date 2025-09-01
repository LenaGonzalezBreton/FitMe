import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  ChangePasswordUseCase,
  ChangePasswordRequest,
} from '../../../../src/modules/auth/application/use-cases/change-password.use-case';
import { IUserRepository } from '../../../../src/modules/auth/domain/auth.repository';
import { USER_REPOSITORY_TOKEN } from '../../../../src/modules/auth/tokens';
import { AuthUser } from '../../../../src/modules/auth/domain/auth.entity';

describe('ChangePasswordUseCase', () => {
  let useCase: ChangePasswordUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  const mockUser: AuthUser = new AuthUser(
    '123e4567-e89b-12d3-a456-426614174000',
    'test@example.com',
    'hashedCurrentPassword',
    true, // onboardingCompleted
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
        ChangePasswordUseCase,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<ChangePasswordUseCase>(ChangePasswordUseCase);
    userRepository = module.get(USER_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validRequest: ChangePasswordRequest = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      currentPassword: 'currentPassword123',
      newPassword: 'newPassword123',
    };

    it('should change password successfully', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockResolvedValueOnce(true as never) // Current password valid
        .mockResolvedValueOnce(false as never); // New password different
      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue('hashedNewPassword' as never);
      userRepository.updatePassword.mockResolvedValue();

      // Act
      await useCase.execute(validRequest);

      // Assert
      expect(userRepository.findById).toHaveBeenCalledWith(validRequest.userId);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'currentPassword123',
        'hashedCurrentPassword',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 12);
      expect(userRepository.updatePassword).toHaveBeenCalledWith(
        validRequest.userId,
        'hashedNewPassword',
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new NotFoundException('Utilisateur non trouvé.'),
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when current password is incorrect', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new UnauthorizedException('Mot de passe actuel incorrect.'),
      );
      expect(userRepository.updatePassword).not.toHaveBeenCalled();
    });

    it('should throw error when new password is too short', async () => {
      // Arrange
      const invalidRequest = { ...validRequest, newPassword: 'short' };
      userRepository.findById.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      // Act & Assert
      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        'Le nouveau mot de passe doit contenir au moins 8 caractères.',
      );
      expect(userRepository.updatePassword).not.toHaveBeenCalled();
    });

    it('should throw error when new password is empty', async () => {
      // Arrange
      const invalidRequest = { ...validRequest, newPassword: '' };
      userRepository.findById.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      // Act & Assert
      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        'Le nouveau mot de passe doit contenir au moins 8 caractères.',
      );
    });

    it('should throw error when new password is same as current password', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockResolvedValueOnce(true as never) // Current password valid
        .mockResolvedValueOnce(true as never); // New password same as current

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        "Le nouveau mot de passe doit être différent de l'ancien.",
      );
      expect(userRepository.updatePassword).not.toHaveBeenCalled();
    });

    it('should handle bcrypt errors gracefully', async () => {
      // Arrange
      const bcryptError = new Error('Bcrypt error');
      userRepository.findById.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockRejectedValue(bcryptError as never);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        'Bcrypt error',
      );
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
  });
});
