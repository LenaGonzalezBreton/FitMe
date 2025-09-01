import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { AuthController } from '../../../src/modules/auth/controller/auth.controller';
import { RegisterUseCase } from '../../../src/modules/auth/application/use-cases/register.use-case';
import { LoginUseCase } from '../../../src/modules/auth/application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../../src/modules/auth/application/use-cases/refresh-token.use-case';
import { CompleteOnboardingUseCase } from '../../../src/modules/auth/application/use-cases/complete-onboarding.use-case';
import { UpdateProfileUseCase } from '../../../src/modules/auth/application/use-cases/update-profile.use-case';
import { ChangePasswordUseCase } from '../../../src/modules/auth/application/use-cases/change-password.use-case';
import { GetSettingsUseCase } from '../../../src/modules/auth/application/use-cases/get-settings.use-case';
import { UpdateSettingsUseCase } from '../../../src/modules/auth/application/use-cases/update-settings.use-case';
import { GetPreferencesUseCase } from '../../../src/modules/auth/application/use-cases/get-preferences.use-case';

describe('AuthController', () => {
  let controller: AuthController;
  let registerUseCase: jest.Mocked<RegisterUseCase>;
  let loginUseCase: jest.Mocked<LoginUseCase>;
  let refreshTokenUseCase: jest.Mocked<RefreshTokenUseCase>;
  let completeOnboardingUseCase: jest.Mocked<CompleteOnboardingUseCase>;
  let updateProfileUseCase: jest.Mocked<UpdateProfileUseCase>;
  let changePasswordUseCase: jest.Mocked<ChangePasswordUseCase>;
  let getSettingsUseCase: jest.Mocked<GetSettingsUseCase>;
  let updateSettingsUseCase: jest.Mocked<UpdateSettingsUseCase>;
  let getPreferencesUseCase: jest.Mocked<GetPreferencesUseCase>;

  beforeEach(async () => {
    const mockRegisterUseCase = { execute: jest.fn() };
    const mockLoginUseCase = { execute: jest.fn() };
    const mockRefreshTokenUseCase = { execute: jest.fn() };
    const mockCompleteOnboardingUseCase = { execute: jest.fn() };
    const mockUpdateProfileUseCase = { execute: jest.fn() };
    const mockChangePasswordUseCase = { execute: jest.fn() };
    const mockGetSettingsUseCase = { execute: jest.fn() };
    const mockUpdateSettingsUseCase = { execute: jest.fn() };
    const mockGetPreferencesUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: RefreshTokenUseCase, useValue: mockRefreshTokenUseCase },
        {
          provide: CompleteOnboardingUseCase,
          useValue: mockCompleteOnboardingUseCase,
        },
        { provide: UpdateProfileUseCase, useValue: mockUpdateProfileUseCase },
        { provide: ChangePasswordUseCase, useValue: mockChangePasswordUseCase },
        { provide: GetSettingsUseCase, useValue: mockGetSettingsUseCase },
        { provide: UpdateSettingsUseCase, useValue: mockUpdateSettingsUseCase },
        { provide: GetPreferencesUseCase, useValue: mockGetPreferencesUseCase },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    registerUseCase = module.get(RegisterUseCase);
    loginUseCase = module.get(LoginUseCase);
    refreshTokenUseCase = module.get(RefreshTokenUseCase);
    completeOnboardingUseCase = module.get(CompleteOnboardingUseCase);
    updateProfileUseCase = module.get(UpdateProfileUseCase);
    changePasswordUseCase = module.get(ChangePasswordUseCase);
    getSettingsUseCase = module.get(GetSettingsUseCase);
    updateSettingsUseCase = module.get(UpdateSettingsUseCase);
    getPreferencesUseCase = module.get(GetPreferencesUseCase);
  });

  describe('POST /auth/register', () => {
    it('should register and login user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        profileType: 'FEMALE',
        contextType: 'CYCLE',
      };
      const mockRequest = { headers: { 'user-agent': 'test-agent' } };
      const ipAddress = '192.168.1.1';

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        onboardingCompleted: false,
      };
      const mockTokens = {
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresIn: 900,
      };

      registerUseCase.execute.mockResolvedValue({ user: mockUser });
      loginUseCase.execute.mockResolvedValue({
        tokens: mockTokens,
        user: mockUser,
      });

      const result = await controller.register(
        registerDto,
        mockRequest as any,
        ipAddress,
      );

      expect(registerUseCase.execute).toHaveBeenCalledWith(registerDto);
      expect(loginUseCase.execute).toHaveBeenCalledWith({
        email: registerDto.email,
        password: registerDto.password,
        userAgent: 'test-agent',
        ipAddress,
      });
      expect(result.tokens).toEqual(mockTokens);
      expect(result.user).toEqual(mockUser);
    });

    it('should throw HttpException on error', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockRequest = { headers: {} };

      registerUseCase.execute.mockRejectedValue(
        new Error('User already exists'),
      );

      await expect(
        controller.register(
          registerDto as any,
          mockRequest as any,
          '127.0.0.1',
        ),
      ).rejects.toThrow(
        new HttpException('User already exists', HttpStatus.BAD_REQUEST),
      );
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const mockRequest = { headers: { 'user-agent': 'test-agent' } };
      const ipAddress = '192.168.1.1';

      const mockResponse = {
        tokens: {
          accessToken: 'access',
          refreshToken: 'refresh',
          expiresIn: 900,
        },
        user: {
          id: 'user-123',
          email: 'test@example.com',
          onboardingCompleted: false,
        },
      };

      loginUseCase.execute.mockResolvedValue(mockResponse);

      const result = await controller.login(
        loginDto,
        mockRequest as any,
        ipAddress,
      );

      expect(loginUseCase.execute).toHaveBeenCalledWith({
        ...loginDto,
        userAgent: 'test-agent',
        ipAddress,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw HttpException with UNAUTHORIZED on login error', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrong' };

      loginUseCase.execute.mockRejectedValue(new Error('Invalid credentials'));

      await expect(
        controller.login(loginDto, { headers: {} } as any, '127.0.0.1'),
      ).rejects.toThrow(
        new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED),
      );
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh token successfully', async () => {
      const refreshTokenDto = { refreshToken: 'valid.refresh.token' };
      const mockTokens = {
        accessToken: 'new.access',
        refreshToken: 'new.refresh',
        expiresIn: 900,
      };

      refreshTokenUseCase.execute.mockResolvedValue({ tokens: mockTokens });

      const result = await controller.refresh(refreshTokenDto);

      expect(refreshTokenUseCase.execute).toHaveBeenCalledWith(refreshTokenDto);
      expect(result.tokens).toEqual(mockTokens);
    });
  });

  describe('POST /auth/onboarding', () => {
    it('should complete onboarding successfully', async () => {
      const onboardingDto = {
        objective: 'FITNESS',
        experienceLevel: 'BEGINNER',
        isMenopausal: false,
      };
      const mockRequest = { user: { id: 'user-123' } };
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        firstName: 'John',
        profileType: 'FEMALE',
        contextType: 'CYCLE',
        onboardingCompleted: true,
        experienceLevel: 'BEGINNER',
        objective: 'FITNESS',
        isMenopausal: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      completeOnboardingUseCase.execute.mockResolvedValue(mockUser);

      const result = await controller.completeOnboarding(
        mockRequest,
        onboardingDto as any,
      );

      expect(completeOnboardingUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-123',
        ...onboardingDto,
      });
      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
    });

    it('should handle NotFoundException with NOT_FOUND status', async () => {
      const onboardingDto = { objective: 'FITNESS' };
      const mockRequest = { user: { id: 'user-123' } };

      completeOnboardingUseCase.execute.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(
        controller.completeOnboarding(mockRequest, onboardingDto as any),
      ).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('GET /auth/profile', () => {
    it('should get user profile', () => {
      const mockRequest = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'John',
          birthDate: new Date('1990-01-01'),
          profileType: 'FEMALE',
          onboardingCompleted: true,
        },
      };

      const result = controller.getProfile(mockRequest);

      expect(result.user.id).toBe('user-123');
      expect(result.user.birthDate).toBe('1990-01-01');
    });
  });

  describe('PUT /auth/profile', () => {
    it('should update profile successfully', async () => {
      const updateDto = { firstName: 'Jane', profileType: 'FEMALE' };
      const mockRequest = { user: { id: 'user-123' } };
      const mockResponse = {
        user: { id: 'user-123', email: 'test@example.com', firstName: 'Jane' },
      };

      updateProfileUseCase.execute.mockResolvedValue(mockResponse);

      const result = await controller.updateProfile(
        updateDto as any,
        mockRequest,
      );

      expect(updateProfileUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-123',
        ...updateDto,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('POST /auth/change-password', () => {
    it('should change password successfully', async () => {
      const changePasswordDto = {
        currentPassword: 'old123',
        newPassword: 'new123',
      };
      const mockRequest = { user: { id: 'user-123' } };

      changePasswordUseCase.execute.mockResolvedValue();

      const result = await controller.changePassword(
        changePasswordDto,
        mockRequest,
      );

      expect(changePasswordUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-123',
        ...changePasswordDto,
      });
      expect(result.message).toBe('Mot de passe mis à jour avec succès');
    });

    it('should handle incorrect current password with UNAUTHORIZED', async () => {
      const changePasswordDto = {
        currentPassword: 'wrong',
        newPassword: 'new123',
      };
      const mockRequest = { user: { id: 'user-123' } };

      const error = new Error('Mot de passe actuel incorrect');
      changePasswordUseCase.execute.mockRejectedValue(error);

      await expect(
        controller.changePassword(changePasswordDto, mockRequest),
      ).rejects.toThrow(
        new HttpException(
          'Mot de passe actuel incorrect',
          HttpStatus.UNAUTHORIZED,
        ),
      );
    });
  });

  describe('GET /auth/settings', () => {
    it('should get settings successfully', async () => {
      const mockRequest = { user: { id: 'user-123' } };
      const mockSettings = {
        settings: { unitPreference: 'METRIC', notificationEnabled: true },
        reminders: [],
        objectives: [],
        featureFlags: [],
      };

      getSettingsUseCase.execute.mockResolvedValue(mockSettings);

      const result = await controller.getSettings(mockRequest);

      expect(getSettingsUseCase.execute).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockSettings);
    });
  });

  describe('PUT /auth/settings', () => {
    it('should update settings successfully', async () => {
      const updateDto = { settings: { notificationEnabled: true } };
      const mockRequest = { user: { id: 'user-123' } };
      const mockResponse = {
        message: 'Paramètres mis à jour avec succès',
        settings: { unitPreference: 'METRIC', notificationEnabled: true },
        updatedReminders: 0,
        updatedObjectives: 0,
        updatedFeatureFlags: 0,
      };

      updateSettingsUseCase.execute.mockResolvedValue(mockResponse);

      const result = await controller.updateSettings(
        updateDto as any,
        mockRequest,
      );

      expect(updateSettingsUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-123',
        ...updateDto,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('GET /auth/preferences', () => {
    it('should get preferences successfully', async () => {
      const mockRequest = { user: { id: 'user-123' } };
      const mockPreferences = {
        general: {
          unitPreference: 'METRIC',
          notificationEnabled: true,
          notificationTime: '09:00:00',
        },
        workouts: {
          objectives: [],
          reminders: [],
        },
        notifications: {
          reminders: [],
          generalEnabled: true,
          defaultTime: '09:00:00',
        },
      };

      getPreferencesUseCase.execute.mockResolvedValue(mockPreferences);

      const result = await controller.getPreferences(mockRequest);

      expect(getPreferencesUseCase.execute).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockPreferences);
    });
  });

  describe('GET /auth/test-public', () => {
    it('should return public test response', async () => {
      const result = await controller.testPublic();

      expect(result.message).toBe(
        'Cette route est publique et accessible sans authentification',
      );
      expect(result.timestamp).toBeDefined();
    });
  });
});
