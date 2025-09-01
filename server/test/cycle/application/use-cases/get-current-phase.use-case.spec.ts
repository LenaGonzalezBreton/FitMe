import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import {
  GetCurrentPhaseUseCase,
  GetCurrentPhaseRequest,
} from '../../../../src/modules/cycle/application/use-cases/get-current-phase.use-case';
import {
  ICycleRepository,
  ICycleProfileConfigRepository,
} from '../../../../src/modules/cycle/domain/cycle.repository';
import { CyclePhase } from '../../../../src/modules/cycle/domain/cycle.entity';
import {
  CYCLE_REPOSITORY_TOKEN,
  CYCLE_PROFILE_CONFIG_REPOSITORY_TOKEN,
} from '../../../../src/modules/cycle/tokens';

describe('GetCurrentPhaseUseCase', () => {
  let useCase: GetCurrentPhaseUseCase;
  let cycleRepository: jest.Mocked<ICycleRepository>;
  let configRepository: jest.Mocked<ICycleProfileConfigRepository>;

  const mockConfig = {
    id: 'config-123',
    userId: 'user-123',
    isCycleTrackingEnabled: true,
    usesExternalProvider: false,
    useMenopauseMode: false,
    averageCycleLength: 28,
    averagePeriodLength: 5,
    prefersManualInput: true,
  };

  const mockCycle = {
    id: 'cycle-123',
    userId: 'user-123',
    startDate: new Date('2024-01-01'),
    cycleLength: 28,
    periodLength: 5,
    isRegular: true,
    getCurrentPhase: () => CyclePhase.FOLLICULAR,
    getNextCycleStart: () => new Date('2024-01-29'),
    isCurrentCycle: () => true,
    getOvulationDay: () => 14,
    isFertileDay: () => false,
  } as any;

  beforeEach(async () => {
    const mockCycleRepository: jest.Mocked<ICycleRepository> = {
      findCurrentCycleByUserId: jest.fn(),
      findByUserId: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockConfigRepository: jest.Mocked<ICycleProfileConfigRepository> = {
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCurrentPhaseUseCase,
        { provide: CYCLE_REPOSITORY_TOKEN, useValue: mockCycleRepository },
        {
          provide: CYCLE_PROFILE_CONFIG_REPOSITORY_TOKEN,
          useValue: mockConfigRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetCurrentPhaseUseCase>(GetCurrentPhaseUseCase);
    cycleRepository = module.get(CYCLE_REPOSITORY_TOKEN);
    configRepository = module.get(CYCLE_PROFILE_CONFIG_REPOSITORY_TOKEN);
  });

  describe('execute', () => {
    const validRequest: GetCurrentPhaseRequest = {
      userId: 'user-123',
      date: new Date('2024-01-15'),
    };

    it('should get current phase successfully', async () => {
      // Arrange
      configRepository.findByUserId.mockResolvedValue(mockConfig);
      cycleRepository.findCurrentCycleByUserId.mockResolvedValue(mockCycle);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(configRepository.findByUserId).toHaveBeenCalledWith('user-123');
      expect(cycleRepository.findCurrentCycleByUserId).toHaveBeenCalledWith(
        'user-123',
      );
      expect(result.phase).toBe(CyclePhase.FOLLICULAR);
      expect(result.cycleDay).toBe(15); // Day 15 = ((15-1) % 28) + 1 = 15
      expect(result.cycleLength).toBe(28);
      expect(result.periodLength).toBe(5);
      expect(result.phaseDescription).toBeDefined();
      expect(result.recommendations).toBeInstanceOf(Array);
    });

    it('should throw NotFoundException when cycle tracking is disabled', async () => {
      // Arrange
      const disabledConfig = { ...mockConfig, isCycleTrackingEnabled: false };
      configRepository.findByUserId.mockResolvedValue(disabledConfig);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new NotFoundException(
          "Le suivi des cycles n'est pas activé pour cet utilisateur",
        ),
      );
      expect(cycleRepository.findCurrentCycleByUserId).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when config does not exist', async () => {
      // Arrange
      configRepository.findByUserId.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new NotFoundException(
          "Le suivi des cycles n'est pas activé pour cet utilisateur",
        ),
      );
    });

    it('should provide default phase when no current cycle exists', async () => {
      // Arrange
      configRepository.findByUserId.mockResolvedValue(mockConfig);
      cycleRepository.findCurrentCycleByUserId.mockResolvedValue(null);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result.phase).toBe(CyclePhase.FOLLICULAR);
      expect(result.cycleDay).toBe(8); // Default cycle day
      expect(result.cycleLength).toBe(28);
      expect(result.periodLength).toBe(5);
    });

    it('should use current date when date is not provided', async () => {
      // Arrange
      const requestWithoutDate = { userId: 'user-123' };
      configRepository.findByUserId.mockResolvedValue(mockConfig);
      cycleRepository.findCurrentCycleByUserId.mockResolvedValue(mockCycle);

      // Act
      const result = await useCase.execute(requestWithoutDate);

      // Assert
      expect(result).toBeDefined();
      expect(configRepository.findByUserId).toHaveBeenCalledWith('user-123');
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      configRepository.findByUserId.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });
});
