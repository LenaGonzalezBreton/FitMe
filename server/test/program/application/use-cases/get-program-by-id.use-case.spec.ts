import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import {
  GetProgramByIdUseCase,
  GetProgramByIdRequest,
} from '../../../../src/modules/program/application/use-cases/get-program-by-id.use-case';
import { IProgramRepository } from '../../../../src/modules/program/domain/program.repository';
import { Program } from '../../../../src/modules/program/domain/program.entity';
import { PROGRAM_REPOSITORY_TOKEN } from '../../../../src/modules/program/tokens';

describe('GetProgramByIdUseCase', () => {
  let useCase: GetProgramByIdUseCase;
  let programRepository: jest.Mocked<IProgramRepository>;

  const mockUserProgram = new Program({
    id: 'program-123',
    userId: 'user-123',
    title: 'User Program',
    startDate: new Date('2024-01-15'),
    isActive: true,
    isTemplate: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockTemplateProgram = new Program({
    id: 'template-123',
    userId: 'creator-123',
    title: 'Template Program',
    startDate: new Date('2024-01-01'),
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
        GetProgramByIdUseCase,
        {
          provide: PROGRAM_REPOSITORY_TOKEN,
          useValue: mockProgramRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetProgramByIdUseCase>(GetProgramByIdUseCase);
    programRepository = module.get(PROGRAM_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validRequest: GetProgramByIdRequest = {
      programId: 'program-123',
      userId: 'user-123',
    };

    it('should get program successfully when user owns it', async () => {
      programRepository.findById.mockResolvedValue(mockUserProgram);

      const result = await useCase.execute(validRequest);

      expect(programRepository.findById).toHaveBeenCalledWith('program-123');
      expect(result).toEqual(mockUserProgram);
    });

    it('should get template program even if user does not own it', async () => {
      const templateRequest: GetProgramByIdRequest = {
        programId: 'template-123',
        userId: 'different-user',
      };

      programRepository.findById.mockResolvedValue(mockTemplateProgram);

      const result = await useCase.execute(templateRequest);

      expect(programRepository.findById).toHaveBeenCalledWith('template-123');
      expect(result).toEqual(mockTemplateProgram);
    });

    it('should throw NotFoundException when program does not exist', async () => {
      programRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(validRequest)).rejects.toThrow(
        new NotFoundException('Program with id program-123 not found'),
      );

      expect(programRepository.findById).toHaveBeenCalledWith('program-123');
    });

    it("should throw ForbiddenException when user tries to access another user's non-template program", async () => {
      const forbiddenRequest: GetProgramByIdRequest = {
        programId: 'program-123',
        userId: 'different-user', // Different user trying to access user-123's program
      };

      programRepository.findById.mockResolvedValue(mockUserProgram);

      await expect(useCase.execute(forbiddenRequest)).rejects.toThrow(
        new ForbiddenException('You can only access your own programs'),
      );

      expect(programRepository.findById).toHaveBeenCalledWith('program-123');
    });

    it('should handle program owned by same user', async () => {
      const sameUserProgram = new Program({
        ...mockUserProgram,
        userId: 'user-123',
      });

      const sameUserRequest: GetProgramByIdRequest = {
        programId: 'program-123',
        userId: 'user-123',
      };

      programRepository.findById.mockResolvedValue(sameUserProgram);

      const result = await useCase.execute(sameUserRequest);

      expect(result).toEqual(sameUserProgram);
    });
  });
});
