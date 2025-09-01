import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import {
  UpdateProgramUseCase,
  UpdateProgramRequest,
} from '../../../../src/modules/program/application/use-cases/update-program.use-case';
import { IProgramRepository } from '../../../../src/modules/program/domain/program.repository';
import { Program } from '../../../../src/modules/program/domain/program.entity';
import { PROGRAM_REPOSITORY_TOKEN } from '../../../../src/modules/program/tokens';

describe('UpdateProgramUseCase', () => {
  let useCase: UpdateProgramUseCase;
  let programRepository: jest.Mocked<IProgramRepository>;

  const mockProgram = new Program({
    id: 'program-123',
    userId: 'user-123',
    title: 'Original Program',
    goal: 'Original goal',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-02-15'),
    isActive: false,
    isTemplate: false,
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
        UpdateProgramUseCase,
        {
          provide: PROGRAM_REPOSITORY_TOKEN,
          useValue: mockProgramRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateProgramUseCase>(UpdateProgramUseCase);
    programRepository = module.get(PROGRAM_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const baseRequest: UpdateProgramRequest = {
      programId: 'program-123',
      userId: 'user-123',
    };

    it('should update program title successfully', async () => {
      const updateRequest = {
        ...baseRequest,
        title: 'Updated Program Title',
      };

      const updatedProgram = new Program({
        ...mockProgram,
        title: 'Updated Program Title',
      });

      programRepository.findById.mockResolvedValue(mockProgram);
      programRepository.update.mockResolvedValue(updatedProgram);

      const result = await useCase.execute(updateRequest);

      expect(programRepository.findById).toHaveBeenCalledWith('program-123');
      expect(programRepository.update).toHaveBeenCalledWith('program-123', {
        title: 'Updated Program Title',
      });
      expect(result).toEqual(updatedProgram);
    });

    it('should update program goal successfully', async () => {
      const updateRequest = {
        ...baseRequest,
        goal: 'Updated goal',
      };

      const updatedProgram = new Program({
        ...mockProgram,
        goal: 'Updated goal',
      });

      programRepository.findById.mockResolvedValue(mockProgram);
      programRepository.update.mockResolvedValue(updatedProgram);

      const result = await useCase.execute(updateRequest);

      expect(programRepository.update).toHaveBeenCalledWith('program-123', {
        goal: 'Updated goal',
      });
      expect(result).toEqual(updatedProgram);
    });

    it('should update program dates successfully', async () => {
      const updateRequest = {
        ...baseRequest,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-03-01'),
      };

      const updatedProgram = new Program({
        ...mockProgram,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-03-01'),
      });

      programRepository.findById.mockResolvedValue(mockProgram);
      programRepository.update.mockResolvedValue(updatedProgram);

      const result = await useCase.execute(updateRequest);

      expect(programRepository.update).toHaveBeenCalledWith('program-123', {
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-03-01'),
      });
      expect(result).toEqual(updatedProgram);
    });

    it('should update program status flags successfully', async () => {
      const updateRequest = {
        ...baseRequest,
        isActive: true,
        isTemplate: true,
      };

      const updatedProgram = new Program({
        ...mockProgram,
        isActive: true,
        isTemplate: true,
      });

      programRepository.findById.mockResolvedValue(mockProgram);
      programRepository.update.mockResolvedValue(updatedProgram);

      const result = await useCase.execute(updateRequest);

      expect(programRepository.update).toHaveBeenCalledWith('program-123', {
        isActive: true,
        isTemplate: true,
      });
      expect(result).toEqual(updatedProgram);
    });

    it('should update multiple fields at once', async () => {
      const updateRequest = {
        ...baseRequest,
        title: 'New Title',
        goal: 'New Goal',
        isActive: true,
      };

      const updatedProgram = new Program({
        ...mockProgram,
        title: 'New Title',
        goal: 'New Goal',
        isActive: true,
      });

      programRepository.findById.mockResolvedValue(mockProgram);
      programRepository.update.mockResolvedValue(updatedProgram);

      const result = await useCase.execute(updateRequest);

      expect(programRepository.update).toHaveBeenCalledWith('program-123', {
        title: 'New Title',
        goal: 'New Goal',
        isActive: true,
      });
      expect(result).toEqual(updatedProgram);
    });

    it('should throw NotFoundException when program does not exist', async () => {
      programRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(baseRequest)).rejects.toThrow(
        new NotFoundException('Program with id program-123 not found'),
      );

      expect(programRepository.findById).toHaveBeenCalledWith('program-123');
      expect(programRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user does not own the program', async () => {
      const otherUserProgram = new Program({
        ...mockProgram,
        userId: 'other-user',
      });

      programRepository.findById.mockResolvedValue(otherUserProgram);

      await expect(useCase.execute(baseRequest)).rejects.toThrow(
        new ForbiddenException('You can only update your own programs'),
      );

      expect(programRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when end date is before start date', async () => {
      const invalidRequest = {
        ...baseRequest,
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-01-15'), // Before start date
      };

      programRepository.findById.mockResolvedValue(mockProgram);

      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        new ConflictException('End date must be after start date'),
      );

      expect(programRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when new end date is before existing start date', async () => {
      const invalidRequest = {
        ...baseRequest,
        endDate: new Date('2024-01-10'), // Before existing start date (2024-01-15)
      };

      programRepository.findById.mockResolvedValue(mockProgram);

      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        new ConflictException('End date must be after start date'),
      );
    });

    it('should allow setting end date to null', async () => {
      const updateRequest = {
        ...baseRequest,
        endDate: null as any,
      };

      const updatedProgram = new Program({
        ...mockProgram,
        endDate: undefined,
      });

      programRepository.findById.mockResolvedValue(mockProgram);
      programRepository.update.mockResolvedValue(updatedProgram);

      const result = await useCase.execute(updateRequest);

      expect(programRepository.update).toHaveBeenCalledWith('program-123', {
        endDate: null,
      });
    });

    it('should not include undefined fields in update', async () => {
      const updateRequest = {
        ...baseRequest,
        title: 'New Title',
        // Other fields are undefined and should not be included
      };

      programRepository.findById.mockResolvedValue(mockProgram);
      programRepository.update.mockResolvedValue(mockProgram);

      await useCase.execute(updateRequest);

      expect(programRepository.update).toHaveBeenCalledWith('program-123', {
        title: 'New Title',
      });
    });
  });
});
