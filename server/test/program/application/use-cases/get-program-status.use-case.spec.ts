import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import {
  GetProgramStatusUseCase,
  GetProgramStatusRequest,
} from '../../../../src/modules/program/application/use-cases/get-program-status.use-case';
import { IProgramRepository } from '../../../../src/modules/program/domain/program.repository';
import { Program } from '../../../../src/modules/program/domain/program.entity';
import { PROGRAM_REPOSITORY_TOKEN } from '../../../../src/modules/program/tokens';

describe('GetProgramStatusUseCase', () => {
  let useCase: GetProgramStatusUseCase;
  let programRepository: jest.Mocked<IProgramRepository>;

  beforeEach(async () => {
    const mockProgramRepository: jest.Mocked<IProgramRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findActiveByUserId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      countByUserId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProgramStatusUseCase,
        {
          provide: PROGRAM_REPOSITORY_TOKEN,
          useValue: mockProgramRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetProgramStatusUseCase>(GetProgramStatusUseCase);
    programRepository = module.get(PROGRAM_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('execute', () => {
    const validRequest: GetProgramStatusRequest = {
      programId: 'program-123',
      userId: 'user-123',
    };

    it('should get program status successfully', async () => {
      const mockNow = new Date('2024-01-20');
      jest.useFakeTimers();
      jest.setSystemTime(mockNow);

      const mockProgram = new Program({
        id: 'program-123',
        userId: 'user-123',
        title: 'Test Program',
        startDate: new Date('2024-01-15'), // 5 days ago
        endDate: new Date('2024-02-15'), // 26 days from now (31 total days)
        isActive: true,
        isTemplate: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      programRepository.findById.mockResolvedValue(mockProgram);

      const result = await useCase.execute(validRequest);

      expect(programRepository.findById).toHaveBeenCalledWith('program-123');
      expect(result).toEqual({
        id: 'program-123',
        title: 'Test Program',
        isActive: true,
        isExpired: false,
        isTemplate: false,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-15'),
        durationInDays: 31,
        daysRemaining: 26,
        completionPercentage: 16, // 5/31 * 100 = ~16%
      });
    });

    it('should get status for program without end date', async () => {
      const mockProgram = new Program({
        id: 'program-123',
        userId: 'user-123',
        title: 'Ongoing Program',
        startDate: new Date('2024-01-15'),
        endDate: undefined,
        isActive: true,
        isTemplate: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      programRepository.findById.mockResolvedValue(mockProgram);

      const result = await useCase.execute(validRequest);

      expect(result).toEqual({
        id: 'program-123',
        title: 'Ongoing Program',
        isActive: true,
        isExpired: false,
        isTemplate: false,
        startDate: new Date('2024-01-15'),
        endDate: undefined,
        durationInDays: 0,
        daysRemaining: undefined,
        completionPercentage: 0,
      });
    });

    it('should get status for expired program', async () => {
      const mockNow = new Date('2024-02-20');
      jest.useFakeTimers();
      jest.setSystemTime(mockNow);

      const mockProgram = new Program({
        id: 'program-123',
        userId: 'user-123',
        title: 'Expired Program',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-15'), // 5 days ago
        isActive: false,
        isTemplate: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      programRepository.findById.mockResolvedValue(mockProgram);

      const result = await useCase.execute(validRequest);

      expect(result.isExpired).toBe(true);
      expect(result.daysRemaining).toBe(0);
      expect(result.completionPercentage).toBe(100);
    });

    it('should get status for template program by any user', async () => {
      const mockTemplateProgram = new Program({
        id: 'template-123',
        userId: 'creator-123',
        title: 'Template Program',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-02-01'),
        isActive: false,
        isTemplate: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const templateRequest: GetProgramStatusRequest = {
        programId: 'template-123',
        userId: 'different-user',
      };

      programRepository.findById.mockResolvedValue(mockTemplateProgram);

      const result = await useCase.execute(templateRequest);

      expect(result).toEqual({
        id: 'template-123',
        title: 'Template Program',
        isActive: false,
        isExpired: expect.any(Boolean),
        isTemplate: true,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-02-01'),
        durationInDays: 31,
        daysRemaining: expect.any(Number),
        completionPercentage: expect.any(Number),
      });
    });

    it('should throw NotFoundException when program does not exist', async () => {
      programRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new NotFoundException('Program with id program-123 not found'),
      );

      expect(programRepository.findById).toHaveBeenCalledWith('program-123');
    });

    it("should throw ForbiddenException when user tries to access another user's non-template program", async () => {
      const otherUserProgram = new Program({
        id: 'program-123',
        userId: 'other-user',
        title: 'Other User Program',
        startDate: new Date('2024-01-15'),
        isActive: false,
        isTemplate: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      programRepository.findById.mockResolvedValue(otherUserProgram);

      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new ForbiddenException('You can only view status of your own programs'),
      );
    });

    it('should calculate completion percentage correctly at program start', async () => {
      const mockProgram = new Program({
        id: 'program-123',
        userId: 'user-123',
        title: 'Starting Program',
        startDate: new Date('2024-01-20'), // Today
        endDate: new Date('2024-02-20'), // 31 days total
        isActive: true,
        isTemplate: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const mockNow = new Date('2024-01-20');
      jest.useFakeTimers();
      jest.setSystemTime(mockNow);

      programRepository.findById.mockResolvedValue(mockProgram);

      const result = await useCase.execute(validRequest);

      expect(result.completionPercentage).toBe(0); // Just started
      expect(result.daysRemaining).toBe(31);
    });

    it('should calculate completion percentage correctly at program end', async () => {
      const mockProgram = new Program({
        id: 'program-123',
        userId: 'user-123',
        title: 'Ending Program',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-20'), // Today
        isActive: true,
        isTemplate: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const mockNow = new Date('2024-01-20');
      jest.useFakeTimers();
      jest.setSystemTime(mockNow);

      programRepository.findById.mockResolvedValue(mockProgram);

      const result = await useCase.execute(validRequest);

      expect(result.completionPercentage).toBe(100);
      expect(result.daysRemaining).toBe(0);
    });

    it('should handle negative completion percentage correctly', async () => {
      const mockProgram = new Program({
        id: 'program-123',
        userId: 'user-123',
        title: 'Future Program',
        startDate: new Date('2024-01-25'), // Future start date
        endDate: new Date('2024-02-25'),
        isActive: false,
        isTemplate: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const mockNow = new Date('2024-01-20');
      jest.useFakeTimers();
      jest.setSystemTime(mockNow);

      programRepository.findById.mockResolvedValue(mockProgram);

      const result = await useCase.execute(validRequest);

      expect(result.completionPercentage).toBe(0); // Should not be negative
    });
  });
});
