import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  RegisterUseCase,
  RegisterRequest,
} from '../../../../src/modules/auth/application/use-cases/register.use-case';
import {
  IUserRepository,
  ProfileType,
  ContextType,
} from '../../../../src/modules/auth/domain/auth.repository';
import { USER_REPOSITORY_TOKEN } from '../../../../src/modules/auth/tokens';
import { AuthUser } from '../../../../src/modules/auth/domain/auth.entity';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  const mockUser: AuthUser = new AuthUser(
    '123e4567-e89b-12d3-a456-426614174000',
    'test@example.com',
    'mockHashedPassword',
    false, // onboardingCompleted
    'John', // firstName
    undefined, // birthDate
    undefined, // experienceLevel
    ProfileType.FEMALE,
    ContextType.CYCLE,
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
        RegisterUseCase,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<RegisterUseCase>(RegisterUseCase);
    userRepository = module.get(USER_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validRequest: RegisterRequest = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      profileType: 'FEMALE',
      contextType: 'CYCLE',
    };

    it('should register a new user successfully', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        firstName: 'John',
        profileType: ProfileType.FEMALE,
        contextType: ContextType.CYCLE,
      });
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          profileType: mockUser.profileType,
          contextType: mockUser.contextType,
          onboardingCompleted: mockUser.onboardingCompleted,
          experienceLevel: mockUser.experienceLevel,
        },
      });
    });

    it('should normalize email by trimming and converting to lowercase', async () => {
      // Arrange
      const requestWithUnnormalizedEmail = {
        ...validRequest,
        email: '  TeSt@ExAmPlE.COM  ',
      };
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);

      // Act
      await useCase.execute(requestWithUnnormalizedEmail);

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        '  TeSt@ExAmPlE.COM  ',
      );
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
        }),
      );
    });

    it('should use default values for optional fields', async () => {
      // Arrange
      const minimalRequest: RegisterRequest = {
        email: 'test@example.com',
        password: 'password123',
      };
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);

      // Act
      await useCase.execute(minimalRequest);

      // Assert
      expect(userRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        firstName: undefined,
        profileType: ProfileType.FEMALE,
        contextType: ContextType.CYCLE,
      });
    });

    it('should throw ConflictException when user already exists', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new ConflictException('Un utilisateur avec cet email existe déjà.'),
      );
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when password is too short', async () => {
      // Arrange
      const invalidRequest = {
        ...validRequest,
        password: 'short',
      };
      userRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        'Le mot de passe doit contenir au moins 8 caractères.',
      );
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when password is empty', async () => {
      // Arrange
      const invalidRequest = {
        ...validRequest,
        password: '',
      };
      userRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        'Le mot de passe doit contenir au moins 8 caractères.',
      );
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should handle repository errors properly', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      userRepository.findByEmail.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle bcrypt hashing errors', async () => {
      // Arrange
      const bcryptError = new Error('Hashing failed');
      userRepository.findByEmail.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockRejectedValue(bcryptError as never);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        'Hashing failed',
      );
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should trim firstName when provided', async () => {
      // Arrange
      const requestWithSpaces = {
        ...validRequest,
        firstName: '  John  ',
      };
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);

      // Act
      await useCase.execute(requestWithSpaces);

      // Assert
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
        }),
      );
    });
  });
});
