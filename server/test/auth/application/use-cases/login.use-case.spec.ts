import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  LoginUseCase,
  LoginRequest,
} from '../../../../src/modules/auth/application/use-cases/login.use-case';
import {
  IUserRepository,
  IRefreshTokenRepository,
} from '../../../../src/modules/auth/domain/auth.repository';
import {
  AuthUser,
  AuthTokens,
} from '../../../../src/modules/auth/domain/auth.entity';
import {
  USER_REPOSITORY_TOKEN,
  REFRESH_TOKEN_REPOSITORY_TOKEN,
} from '../../../../src/modules/auth/tokens';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let refreshTokenRepository: jest.Mocked<IRefreshTokenRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser: AuthUser = new AuthUser(
    '123e4567-e89b-12d3-a456-426614174000',
    'test@example.com',
    'hashedPassword',
    false,
    'John',
    undefined,
    undefined,
    'FEMALE',
    'CYCLE',
    undefined,
    undefined,
    undefined,
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

    const mockRefreshTokenRepository: jest.Mocked<IRefreshTokenRepository> = {
      create: jest.fn(),
      findByTokenHash: jest.fn(),
      revokeByUserId: jest.fn(),
      revokeByTokenHash: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      signAsync: jest.fn(),
      verify: jest.fn(),
      verifyAsync: jest.fn(),
      decode: jest.fn(),
    } as any;

    const mockConfigService = {
      get: jest.fn(),
      getOrThrow: jest.fn(),
      set: jest.fn(),
      setEnvFilePaths: jest.fn(),
      changes$: {} as any,
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: mockUserRepository,
        },
        {
          provide: REFRESH_TOKEN_REPOSITORY_TOKEN,
          useValue: mockRefreshTokenRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
    userRepository = module.get(USER_REPOSITORY_TOKEN);
    refreshTokenRepository = module.get(REFRESH_TOKEN_REPOSITORY_TOKEN);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    const validRequest: LoginRequest = {
      email: 'test@example.com',
      password: 'password123',
      userAgent: 'Mozilla/5.0',
      ipAddress: '192.168.1.1',
    };

    it('should login successfully with valid credentials', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      refreshTokenRepository.revokeByUserId.mockResolvedValue();
      refreshTokenRepository.create.mockResolvedValue();
      configService.get.mockReturnValueOnce('15m').mockReturnValueOnce('7d');
      jwtService.sign
        .mockReturnValueOnce('mock.access.token')
        .mockReturnValueOnce('mock.refresh.token');
      jest.spyOn(crypto, 'createHash').mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashedRefreshToken'),
      } as any);

      const result = await useCase.execute(validRequest);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword',
      );
      expect(refreshTokenRepository.revokeByUserId).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(refreshTokenRepository.create).toHaveBeenCalledWith(
        mockUser.id,
        'hashedRefreshToken',
        expect.any(Date),
      );
      expect(result).toEqual({
        tokens: expect.any(AuthTokens),
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

    it('should throw error when user does not exist', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      const bcryptCompareSpy = jest.spyOn(bcrypt, 'compare');

      await expect(useCase.execute(validRequest)).rejects.toThrow(
        'Email ou mot de passe incorrect',
      );
      expect(bcryptCompareSpy).not.toHaveBeenCalled();
      expect(refreshTokenRepository.revokeByUserId).not.toHaveBeenCalled();
    });

    it('should throw error when password is invalid', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(useCase.execute(validRequest)).rejects.toThrow(
        'Email ou mot de passe incorrect',
      );
      expect(refreshTokenRepository.revokeByUserId).not.toHaveBeenCalled();
    });
  });
});
