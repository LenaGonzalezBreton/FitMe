import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import {
  DeleteProgramUseCase,
  DeleteProgramRequest,
} from '../../../../src/modules/program/application/use-cases/delete-program.use-case';
import { IProgramRepository } from '../../../../src/modules/program/domain/program.repository';
import { Program } from '../../../../src/modules/program/domain/program.entity';
import { PROGRAM_REPOSITORY_TOKEN } from '../../../../src/modules/program/tokens';

describe('DeleteProgramUseCase', () => {
  let useCase: DeleteProgramUseCase;
  let programRepository: jest.Mocked<IProgramRepository>;

  const mockProgram = new Program({
    id: 'program-123',
    userId: 'user-123',
    title: 'Test Program',
    startDate: new Date('2024-01-15'),
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
        DeleteProgramUseCase,
        {
          provide: PROGRAM_REPOSITORY_TOKEN,
          useValue: mockProgramRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteProgramUseCase>(DeleteProgramUseCase);
    programRepository = module.get(PROGRAM_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validRequest: DeleteProgramRequest = {
      programId: 'program-123',
      userId: 'user-123',
    };

    it('should delete program successfully when user owns it', async () => {
      programRepository.findById.mockResolvedValue(mockProgram);
      programRepository.delete.mockResolvedValue();

      await useCase.execute(validRequest);

      expect(programRepository.findById).toHaveBeenCalledWith('program-123');
      expect(programRepository.delete).toHaveBeenCalledWith('program-123');
    });

    it('should throw NotFoundException when program does not exist', async () => {
      programRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new NotFoundException('Program with id program-123 not found'),
      );

      expect(programRepository.findById).toHaveBeenCalledWith('program-123');
      expect(programRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user does not own the program', async () => {
      const otherUserProgram = new Program({
        ...mockProgram,
        userId: 'other-user', // Different user
      });

      programRepository.findById.mockResolvedValue(otherUserProgram);

      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new ForbiddenException('You can only delete your own programs'),
      );

      expect(programRepository.findById).toHaveBeenCalledWith('program-123');
      expect(programRepository.delete).not.toHaveBeenCalled();
    });

    it('should delete active program', async () => {
      const activeProgram = new Program({
        ...mockProgram,
        isActive: true,
      });

      programRepository.findById.mockResolvedValue(activeProgram);
      programRepository.delete.mockResolvedValue();

      await useCase.execute(validRequest);

      expect(programRepository.delete).toHaveBeenCalledWith('program-123');
    });

    it('should delete template program', async () => {
      const templateProgram = new Program({
        ...mockProgram,
        isTemplate: true,
      });

      programRepository.findById.mockResolvedValue(templateProgram);
      programRepository.delete.mockResolvedValue();

      await useCase.execute(validRequest);

      expect(programRepository.delete).toHaveBeenCalledWith('program-123');
    });

    it('should handle repository errors gracefully', async () => {
      const repositoryError = new Error('Database connection failed');
      programRepository.findById.mockRejectedValue(repositoryError);

      await expect(useCase.execute(validRequest)).rejects.toThrow(
        'Database connection failed',
      );

      expect(programRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle delete operation errors gracefully', async () => {
      const deleteError = new Error('Delete operation failed');
      programRepository.findById.mockResolvedValue(mockProgram);
      programRepository.delete.mockRejectedValue(deleteError);

      await expect(useCase.execute(validRequest)).rejects.toThrow(
        'Delete operation failed',
      );

      expect(programRepository.findById).toHaveBeenCalledWith('program-123');
      expect(programRepository.delete).toHaveBeenCalledWith('program-123');
    });
  });
});
