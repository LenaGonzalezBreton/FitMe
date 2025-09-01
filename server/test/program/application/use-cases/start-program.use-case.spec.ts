import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import {
  StartProgramUseCase,
  StartProgramRequest,
} from '../../../../src/modules/program/application/use-cases/start-program.use-case';
import { IProgramRepository } from '../../../../src/modules/program/domain/program.repository';
import { Program } from '../../../../src/modules/program/domain/program.entity';
import { PROGRAM_REPOSITORY_TOKEN } from '../../../../src/modules/program/tokens';

describe('StartProgramUseCase', () => {
  let useCase: StartProgramUseCase;
  let programRepository: jest.Mocked<IProgramRepository>;

  const mockProgram = new Program({
    id: 'program-123',
    userId: 'user-123',
    title: 'Test Program',
    goal: 'Build strength',
    startDate: new Date('2025-09-01'),
    endDate: new Date('2025-10-01'),
    isActive: false,
    isTemplate: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockTemplateProgram = new Program({
    id: 'template-123',
    userId: 'creator-123',
    title: 'Template Program',
    goal: 'Template goal',
    startDate: new Date('2025-09-01'),
    endDate: new Date('2025-10-01'),
    isActive: false,
    isTemplate: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

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
        StartProgramUseCase,
        {
          provide: PROGRAM_REPOSITORY_TOKEN,
          useValue: mockProgramRepository,
        },
      ],
    }).compile();

    useCase = module.get<StartProgramUseCase>(StartProgramUseCase);
    programRepository = module.get(PROGRAM_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('execute', () => {
    const validRequest: StartProgramRequest = {
      programId: 'program-123',
      userId: 'user-123',
    };

    it('should start program successfully when user owns it', async () => {
      const activatedProgram = new Program({
        ...mockProgram,
        isActive: true,
      });

      programRepository.findById.mockResolvedValue(mockProgram);
      programRepository.update.mockResolvedValue(activatedProgram);

      const result = await useCase.execute(validRequest);

      expect(programRepository.findById).toHaveBeenCalledWith('program-123');
      expect(programRepository.update).toHaveBeenCalledWith('program-123', {
        isActive: true,
      });
      expect(result).toEqual(activatedProgram);
    });

    it('should throw NotFoundException when program does not exist', async () => {
      programRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new NotFoundException('Program with id program-123 not found'),
      );

      expect(programRepository.findById).toHaveBeenCalledWith('program-123');
      expect(programRepository.update).not.toHaveBeenCalled();
    });

    it("should throw ForbiddenException when user tries to start another user's non-template program", async () => {
      const forbiddenRequest: StartProgramRequest = {
        programId: 'program-123',
        userId: 'different-user',
      };

      programRepository.findById.mockResolvedValue(mockProgram);

      await expect(useCase.execute(forbiddenRequest)).rejects.toThrow(
        new ForbiddenException(
          'You can only start your own programs or templates',
        ),
      );

      expect(programRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when program is already active', async () => {
      const activeProgram = new Program({
        ...mockProgram,
        isActive: true,
      });

      programRepository.findById.mockResolvedValue(activeProgram);

      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new ConflictException('Program is already active'),
      );

      expect(programRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when program is expired', async () => {
      const expiredProgram = new Program({
        ...mockProgram,
        endDate: new Date('2025-08-01'), // Past date
      });

      programRepository.findById.mockResolvedValue(expiredProgram);

      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new ConflictException('Cannot start an expired program'),
      );

      expect(programRepository.update).not.toHaveBeenCalled();
    });

    it('should allow starting template program by creator', async () => {
      const templateRequest: StartProgramRequest = {
        programId: 'template-123',
        userId: 'creator-123', // Same as template creator
      };

      const activatedTemplate = new Program({
        ...mockTemplateProgram,
        isActive: true,
      });

      programRepository.findById.mockResolvedValue(mockTemplateProgram);
      programRepository.update.mockResolvedValue(activatedTemplate);

      const result = await useCase.execute(templateRequest);

      expect(programRepository.update).toHaveBeenCalledWith('template-123', {
        isActive: true,
      });
      expect(result).toEqual(activatedTemplate);
    });

    it('should create copy when starting template program by different user', async () => {
      const templateRequest: StartProgramRequest = {
        programId: 'template-123',
        userId: 'different-user',
      };

      const newProgram = new Program({
        id: 'new-program-456',
        userId: 'different-user',
        title: 'Template Program (Copy)',
        goal: 'Template goal',
        startDate: expect.any(Date),
        isActive: false,
        isTemplate: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const activatedCopy = new Program({
        ...newProgram,
        isActive: true,
      });

      programRepository.findById.mockResolvedValue(mockTemplateProgram);
      programRepository.create.mockResolvedValue(newProgram);
      programRepository.update.mockResolvedValue(activatedCopy);

      const result = await useCase.execute(templateRequest);

      expect(programRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'different-user',
          title: 'Template Program (Copy)',
          goal: 'Template goal',
          startDate: expect.any(Date),
          isTemplate: false,
        }),
      );
      expect(programRepository.update).toHaveBeenCalledWith('new-program-456', {
        isActive: true,
      });
      expect(result).toEqual(activatedCopy);
    });

    it('should calculate correct end date for template copy', async () => {
      const templateWithDuration = new Program({
        ...mockTemplateProgram,
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-10-31'), // 30 days duration
      });

      const templateRequest: StartProgramRequest = {
        programId: 'template-123',
        userId: 'different-user',
      };

      const mockNow = new Date('2025-10-01');
      jest.useFakeTimers();
      jest.setSystemTime(mockNow);

      const newProgram = new Program({
        id: 'new-program-456',
        userId: 'different-user',
        title: 'Template Program (Copy)',
        startDate: mockNow,
        endDate: new Date('2025-10-31'), // Same duration as template
        isActive: false,
        isTemplate: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      programRepository.findById.mockResolvedValue(templateWithDuration);
      programRepository.create.mockResolvedValue(newProgram);
      programRepository.update.mockResolvedValue(newProgram);

      await useCase.execute(templateRequest);

      expect(programRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: mockNow,
          endDate: expect.any(Date),
        }),
      );
    });

    it('should handle template without end date', async () => {
      const templateWithoutEndDate = new Program({
        ...mockTemplateProgram,
        endDate: undefined,
      });

      const templateRequest: StartProgramRequest = {
        programId: 'template-123',
        userId: 'different-user',
      };

      const newProgram = new Program({
        id: 'new-program-456',
        userId: 'different-user',
        title: 'Template Program (Copy)',
        startDate: new Date(),
        endDate: undefined,
        isActive: false,
        isTemplate: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      programRepository.findById.mockResolvedValue(templateWithoutEndDate);
      programRepository.create.mockResolvedValue(newProgram);
      programRepository.update.mockResolvedValue(newProgram);

      await useCase.execute(templateRequest);

      expect(programRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          endDate: undefined,
        }),
      );
    });
  });
});
