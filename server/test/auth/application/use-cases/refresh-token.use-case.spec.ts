import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  RefreshTokenUseCase,
  RefreshTokenRequest,
} from '../../../../src/modules/auth/application/use-cases/refresh-token.use-case';
import { IRefreshTokenRepository } from '../../../../src/modules/auth/domain/auth.repository';
import { AuthTokens } from '../../../../src/modules/auth/domain/auth.entity';
import { REFRESH_TOKEN_REPOSITORY_TOKEN } from '../../../../src/modules/auth/tokens';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let refreshTokenRepository: jest.Mocked<IRefreshTokenRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockStoredToken = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: 'user-123',
    tokenHash: 'hashedRefreshToken',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    revoked: false,
    createdAt: new Date(),
  };

  beforeEach(async () => {
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
        RefreshTokenUseCase,
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

    useCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
    refreshTokenRepository = module.get(REFRESH_TOKEN_REPOSITORY_TOKEN);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    const validRequest: RefreshTokenRequest = {
      refreshToken: 'valid.refresh.token',
    };

    it('should refresh tokens successfully with valid refresh token', async () => {
      jest.spyOn(crypto, 'createHash').mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashedRefreshToken'),
      } as any);

      refreshTokenRepository.findByTokenHash.mockResolvedValue(mockStoredToken);
      jwtService.verify.mockReturnValue({ sub: 'user-123' });
      refreshTokenRepository.revokeByTokenHash.mockResolvedValue();
      refreshTokenRepository.create.mockResolvedValue();
      configService.get
        .mockReturnValueOnce('15m')
        .mockReturnValueOnce('7d')
        .mockReturnValueOnce('7d');
      jwtService.sign
        .mockReturnValueOnce('new.access.token')
        .mockReturnValueOnce('new.refresh.token');

      const result = await useCase.execute(validRequest);

      expect(refreshTokenRepository.findByTokenHash).toHaveBeenCalledWith(
        'hashedRefreshToken',
      );
      expect(jwtService.verify).toHaveBeenCalledWith('valid.refresh.token');
      expect(refreshTokenRepository.revokeByTokenHash).toHaveBeenCalledWith(
        'hashedRefreshToken',
      );
      expect(refreshTokenRepository.create).toHaveBeenCalledWith(
        'user-123',
        expect.any(String),
        expect.any(Date),
      );
      expect(result).toEqual({
        tokens: expect.any(AuthTokens),
      });
    });

    it('should throw UnauthorizedException when token is not found', async () => {
      jest.spyOn(crypto, 'createHash').mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashedRefreshToken'),
      } as any);
      refreshTokenRepository.findByTokenHash.mockResolvedValue(null);

      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new UnauthorizedException(
          'Token de rafraîchissement invalide ou expiré',
        ),
      );
      expect(jwtService.verify).not.toHaveBeenCalled();
    });
  });
});
