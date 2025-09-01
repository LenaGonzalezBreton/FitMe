import { Test, TestingModule } from '@nestjs/testing';
import { LogPeriodUseCase } from '../../../../src/modules/cycle/application/use-cases/log-period.use-case';
import { ICycleRepository } from '../../../../src/modules/cycle/domain/cycle.repository';
import { CYCLE_REPOSITORY_TOKEN } from '../../../../src/modules/cycle/tokens';

describe('LogPeriodUseCase', () => {
  let useCase: LogPeriodUseCase;
  let cycleRepository: jest.Mocked<ICycleRepository>;

  beforeEach(async () => {
    const mockCycleRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findByUserId: jest.fn(),
      findCurrentCycleByUserId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogPeriodUseCase,
        { provide: CYCLE_REPOSITORY_TOKEN, useValue: mockCycleRepository },
      ],
    }).compile();

    useCase = module.get<LogPeriodUseCase>(LogPeriodUseCase);
    cycleRepository = module.get(CYCLE_REPOSITORY_TOKEN);
  });

  it('should log period successfully', async () => {
    const request = {
      userId: 'user-123',
      startDate: new Date('2024-01-01'),
      flowIntensity: 3, // Changed from string to number
    };

    const mockPeriod = {
      id: 'period-123',
      startDate: request.startDate,
      periodLength: 5,
      cycleLength: 28,
    };

    cycleRepository.findByUserId.mockResolvedValue([]);
    cycleRepository.create.mockResolvedValue(mockPeriod as any);

    const result = await useCase.execute(request);

    expect(result.period).toBeDefined();
    expect(cycleRepository.create).toHaveBeenCalled();
  });
});
