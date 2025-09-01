import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateSettingsUseCase } from '../../../../src/modules/auth/application/use-cases/update-settings.use-case';
import {
  IUserRepository,
  IUserSettingsRepository,
} from '../../../../src/modules/auth/domain/auth.repository';
import {
  USER_REPOSITORY_TOKEN,
  USER_SETTINGS_REPOSITORY_TOKEN,
} from '../../../../src/modules/auth/tokens';

describe('UpdateSettingsUseCase', () => {
  let useCase: UpdateSettingsUseCase;
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
        UpdateSettingsUseCase,
        { provide: USER_REPOSITORY_TOKEN, useValue: mockUserRepository },
        {
          provide: USER_SETTINGS_REPOSITORY_TOKEN,
          useValue: mockUserSettingsRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateSettingsUseCase>(UpdateSettingsUseCase);
    userRepository = module.get(USER_REPOSITORY_TOKEN);
    userSettingsRepository = module.get(USER_SETTINGS_REPOSITORY_TOKEN);
  });

  it('should update settings successfully', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const request = {
      userId: 'user-123',
      settings: {
        notificationEnabled: true,
        unitPreference: 'METRIC',
        notificationTime: '09:00:00',
      },
      reminders: [
        {
          type: 'EXERCISE',
          enabled: true,
          time: '10:00:00',
        },
      ],
      objectives: [
        {
          type: 'GENERAL_FITNESS',
          note: 'Stay healthy',
        },
      ],
      featureFlags: [
        {
          feature: 'BETA_FEATURE',
          isEnabled: true,
        },
      ],
    };

    const mockUpdatedSettings = {
      unitPreference: 'METRIC',
      notificationEnabled: true,
      notificationTime: new Date('2024-01-01T09:00:00'),
    };

    userRepository.findById.mockResolvedValue(mockUser as any);
    userSettingsRepository.createOrUpdateUserSettings.mockResolvedValue(
      mockUpdatedSettings as any,
    );
    userSettingsRepository.createOrUpdateReminderSetting.mockResolvedValue(
      undefined as any,
    );
    userSettingsRepository.createOrUpdateUserObjective.mockResolvedValue(
      undefined as any,
    );
    userSettingsRepository.createOrUpdateFeatureFlag.mockResolvedValue(
      undefined as any,
    );

    const result = await useCase.execute(request);

    expect(result).toEqual({
      message: 'Paramètres mis à jour avec succès',
      settings: {
        unitPreference: 'METRIC',
        notificationEnabled: true,
        notificationTime: '09:00:00',
      },
      updatedReminders: 1,
      updatedObjectives: 1,
      updatedFeatureFlags: 1,
    });
    expect(userRepository.findById).toHaveBeenCalledWith('user-123');
    expect(
      userSettingsRepository.createOrUpdateUserSettings,
    ).toHaveBeenCalledWith('user-123', {
      unitPreference: 'METRIC',
      notificationEnabled: true,
      notificationTime: expect.any(Date),
    });
    expect(
      userSettingsRepository.createOrUpdateReminderSetting,
    ).toHaveBeenCalledWith('user-123', 'EXERCISE', {
      enabled: true,
      time: expect.any(Date),
    });
    expect(
      userSettingsRepository.createOrUpdateUserObjective,
    ).toHaveBeenCalledWith('user-123', 'GENERAL_FITNESS', 'Stay healthy');
    expect(
      userSettingsRepository.createOrUpdateFeatureFlag,
    ).toHaveBeenCalledWith('user-123', 'BETA_FEATURE', true);
  });

  it('should throw NotFoundException when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);
    const request = {
      userId: 'user-123',
      settings: {},
      reminders: [],
      objectives: [],
      featureFlags: [],
    };

    await expect(useCase.execute(request)).rejects.toThrow(NotFoundException);
  });
});
