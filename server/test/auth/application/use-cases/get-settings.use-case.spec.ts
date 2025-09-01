import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetSettingsUseCase } from '../../../../src/modules/auth/application/use-cases/get-settings.use-case';
import {
  IUserRepository,
  IUserSettingsRepository,
} from '../../../../src/modules/auth/domain/auth.repository';
import {
  USER_REPOSITORY_TOKEN,
  USER_SETTINGS_REPOSITORY_TOKEN,
} from '../../../../src/modules/auth/tokens';

describe('GetSettingsUseCase', () => {
  let useCase: GetSettingsUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let userSettingsRepository: jest.Mocked<IUserSettingsRepository>;

  beforeEach(async () => {
    const mockUserRepository: jest.Mocked<IUserRepository> = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateOnboardingProfile: jest.fn(),
      updatePassword: jest.fn(),
      updateProfile: jest.fn(),
    };

    const mockUserSettingsRepository: jest.Mocked<IUserSettingsRepository> = {
      getUserSettings: jest.fn(),
      createOrUpdateUserSettings: jest.fn(),
      getReminderSettings: jest.fn(),
      createOrUpdateReminderSetting: jest.fn(),
      getUserObjectives: jest.fn(),
      createOrUpdateUserObjective: jest.fn(),
      getUserFeatureFlags: jest.fn(),
      createOrUpdateFeatureFlag: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSettingsUseCase,
        { provide: USER_REPOSITORY_TOKEN, useValue: mockUserRepository },
        {
          provide: USER_SETTINGS_REPOSITORY_TOKEN,
          useValue: mockUserSettingsRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetSettingsUseCase>(GetSettingsUseCase);
    userRepository = module.get(USER_REPOSITORY_TOKEN);
    userSettingsRepository = module.get(USER_SETTINGS_REPOSITORY_TOKEN);
  });

  it('should get settings successfully', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockNotificationTime = new Date('2024-01-01T09:00:00');
    const mockSettings = {
      unitPreference: 'METRIC',
      notificationEnabled: true,
      notificationTime: mockNotificationTime,
    };

    const mockReminder = {
      id: 'reminder-123',
      userId: 'user-123',
      type: 'WORKOUT',
      enabled: true,
      time: new Date('2024-01-01T10:00:00'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockObjective = {
      id: 'objective-123',
      userId: 'user-123',
      type: 'FITNESS',
      note: 'Test note',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockFeatureFlag = {
      id: 'flag-123',
      userId: 'user-123',
      feature: 'BETA_FEATURE',
      isEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    userRepository.findById.mockResolvedValue(mockUser as any);
    userSettingsRepository.getUserSettings.mockResolvedValue(
      mockSettings as any,
    );
    userSettingsRepository.getReminderSettings.mockResolvedValue([
      mockReminder,
    ]);
    userSettingsRepository.getUserObjectives.mockResolvedValue([mockObjective]);
    userSettingsRepository.getUserFeatureFlags.mockResolvedValue([
      mockFeatureFlag,
    ]);

    const result = await useCase.execute('user-123');

    expect(result.settings).toEqual({
      unitPreference: 'METRIC',
      notificationEnabled: true,
      notificationTime: '09:00:00',
    });
    expect(result.reminders).toEqual([
      {
        id: 'reminder-123',
        type: 'WORKOUT',
        enabled: true,
        time: '10:00:00',
      },
    ]);
    expect(result.objectives).toEqual([
      {
        id: 'objective-123',
        type: 'FITNESS',
        note: 'Test note',
      },
    ]);
    expect(result.featureFlags).toEqual([
      {
        id: 'flag-123',
        feature: 'BETA_FEATURE',
        isEnabled: true,
      },
    ]);
    expect(userRepository.findById).toHaveBeenCalledWith('user-123');
  });

  it('should throw NotFoundException when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('user-123')).rejects.toThrow(
      NotFoundException,
    );
  });
});
