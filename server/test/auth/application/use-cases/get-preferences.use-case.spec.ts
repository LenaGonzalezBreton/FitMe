import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetPreferencesUseCase } from '../../../../src/modules/auth/application/use-cases/get-preferences.use-case';
import {
  IUserRepository,
  IUserSettingsRepository,
} from '../../../../src/modules/auth/domain/auth.repository';
import {
  USER_REPOSITORY_TOKEN,
  USER_SETTINGS_REPOSITORY_TOKEN,
} from '../../../../src/modules/auth/tokens';

describe('GetPreferencesUseCase', () => {
  let useCase: GetPreferencesUseCase;
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
        GetPreferencesUseCase,
        { provide: USER_REPOSITORY_TOKEN, useValue: mockUserRepository },
        {
          provide: USER_SETTINGS_REPOSITORY_TOKEN,
          useValue: mockUserSettingsRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetPreferencesUseCase>(GetPreferencesUseCase);
    userRepository = module.get(USER_REPOSITORY_TOKEN);
    userSettingsRepository = module.get(USER_SETTINGS_REPOSITORY_TOKEN);
  });

  it('should get preferences successfully', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };

    const mockSettings = {
      unitPreference: 'METRIC',
      notificationEnabled: true,
      notificationTime: new Date('2024-01-01T09:00:00'),
    };

    const mockReminders = [
      {
        id: 'reminder-1',
        userId: 'user-123',
        type: 'EXERCISE',
        enabled: true,
        time: new Date('2024-01-01T10:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'reminder-2',
        userId: 'user-123',
        type: 'PERIOD_START',
        enabled: true,
        time: new Date('2024-01-01T08:00:00'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const mockObjectives = [
      {
        id: 'objective-1',
        userId: 'user-123',
        type: 'GENERAL_FITNESS',
        note: 'Stay healthy',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    userRepository.findById.mockResolvedValue(mockUser as any);
    userSettingsRepository.getUserSettings.mockResolvedValue(
      mockSettings as any,
    );
    userSettingsRepository.getReminderSettings.mockResolvedValue(mockReminders);
    userSettingsRepository.getUserObjectives.mockResolvedValue(mockObjectives);

    const result = await useCase.execute('user-123');

    expect(result).toEqual({
      general: {
        unitPreference: 'METRIC',
        notificationEnabled: true,
        notificationTime: '09:00:00',
      },
      workouts: {
        objectives: [
          {
            id: 'objective-1',
            type: 'GENERAL_FITNESS',
            note: 'Stay healthy',
          },
        ],
        reminders: [
          {
            id: 'reminder-1',
            type: 'EXERCISE',
            enabled: true,
            time: '10:00:00',
          },
        ],
      },
      notifications: {
        reminders: [
          {
            id: 'reminder-2',
            type: 'PERIOD_START',
            enabled: true,
            time: '08:00:00',
          },
        ],
        generalEnabled: true,
        defaultTime: '09:00:00',
      },
    });
    expect(userRepository.findById).toHaveBeenCalledWith('user-123');
    expect(userSettingsRepository.getUserSettings).toHaveBeenCalledWith(
      'user-123',
    );
    expect(userSettingsRepository.getReminderSettings).toHaveBeenCalledWith(
      'user-123',
    );
    expect(userSettingsRepository.getUserObjectives).toHaveBeenCalledWith(
      'user-123',
    );
  });

  it('should throw NotFoundException when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('user-123')).rejects.toThrow(
      NotFoundException,
    );
  });
});
