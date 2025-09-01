import { Test, TestingModule } from '@nestjs/testing';
import {
  GetUserProgramsUseCase,
  GetUserProgramsRequest,
} from '../../../../src/modules/program/application/use-cases/get-user-programs.use-case';
import { IProgramRepository } from '../../../../src/modules/program/domain/program.repository';
import { Program } from '../../../../src/modules/program/domain/program.entity';
import { PROGRAM_REPOSITORY_TOKEN } from '../../../../src/modules/program/tokens';

describe('GetUserProgramsUseCase', () => {
  let useCase: GetUserProgramsUseCase;
  let programRepository: jest.Mocked<IProgramRepository>;

  const mockPrograms = [
    new Program({
      id: 'program-1',
      userId: 'user-123',
      title: 'Active Program',
      startDate: new Date('2024-01-15'),
      isActive: true,
      isTemplate: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    new Program({
      id: 'program-2',
      userId: 'user-123',
      title: 'Inactive Program',
      startDate: new Date('2024-01-10'),
      isActive: false,
      isTemplate: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    new Program({
      id: 'template-1',
      userId: 'user-123',
      title: 'My Template',
      startDate: new Date('2024-01-01'),
      isActive: false,
      isTemplate: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  ];

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
        GetUserProgramsUseCase,
        {
          provide: PROGRAM_REPOSITORY_TOKEN,
          useValue: mockProgramRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetUserProgramsUseCase>(GetUserProgramsUseCase);
    programRepository = module.get(PROGRAM_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const basicRequest: GetUserProgramsRequest = {
      userId: 'user-123',
    };

    it('should get user programs without filters', async () => {
      programRepository.findByUserId.mockResolvedValue(mockPrograms);
      programRepository.countByUserId.mockResolvedValue(3);

      const result = await useCase.execute(basicRequest);

      expect(programRepository.findByUserId).toHaveBeenCalledWith('user-123', {
        userId: 'user-123',
        limit: 20,
        offset: 0,
      });
      expect(programRepository.countByUserId).toHaveBeenCalledWith('user-123');
      expect(result).toEqual({
        programs: mockPrograms,
        total: 3,
        offset: 0,
        limit: 20,
      });
    });

    it('should get user programs with active filter', async () => {
      const activePrograms = [mockPrograms[0]]; // Only active program
      const requestWithFilter: GetUserProgramsRequest = {
        userId: 'user-123',
        filters: {
          isActive: true,
        },
      };

      programRepository.findByUserId.mockResolvedValue(activePrograms);
      programRepository.countByUserId.mockResolvedValue(3);

      const result = await useCase.execute(requestWithFilter);

      expect(programRepository.findByUserId).toHaveBeenCalledWith('user-123', {
        userId: 'user-123',
        isActive: true,
        limit: 20,
        offset: 0,
      });
      expect(result).toEqual({
        programs: activePrograms,
        total: 3,
        offset: 0,
        limit: 20,
      });
    });

    it('should get user programs with template filter', async () => {
      const templatePrograms = [mockPrograms[2]]; // Only template program
      const requestWithFilter: GetUserProgramsRequest = {
        userId: 'user-123',
        filters: {
          isTemplate: true,
        },
      };

      programRepository.findByUserId.mockResolvedValue(templatePrograms);
      programRepository.countByUserId.mockResolvedValue(3);

      const result = await useCase.execute(requestWithFilter);

      expect(programRepository.findByUserId).toHaveBeenCalledWith('user-123', {
        userId: 'user-123',
        isTemplate: true,
        limit: 20,
        offset: 0,
      });
      expect(result.programs).toEqual(templatePrograms);
    });

    it('should get user programs with date range filters', async () => {
      const requestWithDateFilter: GetUserProgramsRequest = {
        userId: 'user-123',
        filters: {
          startDateFrom: new Date('2024-01-10'),
          startDateTo: new Date('2024-01-20'),
        },
      };

      programRepository.findByUserId.mockResolvedValue([
        mockPrograms[0],
        mockPrograms[1],
      ]);
      programRepository.countByUserId.mockResolvedValue(3);

      const result = await useCase.execute(requestWithDateFilter);

      expect(programRepository.findByUserId).toHaveBeenCalledWith('user-123', {
        userId: 'user-123',
        startDateFrom: new Date('2024-01-10'),
        startDateTo: new Date('2024-01-20'),
        limit: 20,
        offset: 0,
      });
      expect(result.programs).toHaveLength(2);
    });

    it('should get user programs with pagination', async () => {
      const requestWithPagination: GetUserProgramsRequest = {
        userId: 'user-123',
        filters: {
          limit: 2,
          offset: 1,
        },
      };

      const paginatedPrograms = [mockPrograms[1], mockPrograms[2]];
      programRepository.findByUserId.mockResolvedValue(paginatedPrograms);
      programRepository.countByUserId.mockResolvedValue(3);

      const result = await useCase.execute(requestWithPagination);

      expect(programRepository.findByUserId).toHaveBeenCalledWith('user-123', {
        userId: 'user-123',
        limit: 2,
        offset: 1,
      });
      expect(result).toEqual({
        programs: paginatedPrograms,
        total: 3,
        offset: 1,
        limit: 2,
      });
    });

    it('should get user programs with combined filters', async () => {
      const requestWithMultipleFilters: GetUserProgramsRequest = {
        userId: 'user-123',
        filters: {
          isActive: false,
          isTemplate: false,
          limit: 10,
          offset: 0,
        },
      };

      const filteredPrograms = [mockPrograms[1]]; // Inactive non-template program
      programRepository.findByUserId.mockResolvedValue(filteredPrograms);
      programRepository.countByUserId.mockResolvedValue(3);

      const result = await useCase.execute(requestWithMultipleFilters);

      expect(programRepository.findByUserId).toHaveBeenCalledWith('user-123', {
        userId: 'user-123',
        isActive: false,
        isTemplate: false,
        limit: 10,
        offset: 0,
      });
      expect(result.programs).toEqual(filteredPrograms);
    });

    it('should return empty array when user has no programs', async () => {
      programRepository.findByUserId.mockResolvedValue([]);
      programRepository.countByUserId.mockResolvedValue(0);

      const result = await useCase.execute(basicRequest);

      expect(result).toEqual({
        programs: [],
        total: 0,
        offset: 0,
        limit: 20,
      });
    });

    it('should use default pagination values when not provided', async () => {
      const requestWithoutPagination: GetUserProgramsRequest = {
        userId: 'user-123',
        filters: {
          isActive: true,
        },
      };

      programRepository.findByUserId.mockResolvedValue([mockPrograms[0]]);
      programRepository.countByUserId.mockResolvedValue(1);

      await useCase.execute(requestWithoutPagination);

      expect(programRepository.findByUserId).toHaveBeenCalledWith('user-123', {
        userId: 'user-123',
        isActive: true,
        limit: 20, // Default limit
        offset: 0, // Default offset
      });
    });
  });
});
