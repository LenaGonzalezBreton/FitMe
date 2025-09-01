import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ProgramController } from '../../../src/modules/program/controller/program.controller';
import { GenerateProgramByPhaseUseCase } from '../../../src/modules/program/application/use-cases/generate-program-by-phase.use-case';
import { CreateProgramUseCase } from '../../../src/modules/program/application/use-cases/create-program.use-case';
import { GetUserProgramsUseCase } from '../../../src/modules/program/application/use-cases/get-user-programs.use-case';
import { GetProgramByIdUseCase } from '../../../src/modules/program/application/use-cases/get-program-by-id.use-case';
import { UpdateProgramUseCase } from '../../../src/modules/program/application/use-cases/update-program.use-case';
import { DeleteProgramUseCase } from '../../../src/modules/program/application/use-cases/delete-program.use-case';
import { StartProgramUseCase } from '../../../src/modules/program/application/use-cases/start-program.use-case';
import { GetProgramStatusUseCase } from '../../../src/modules/program/application/use-cases/get-program-status.use-case';
import { Program } from '../../../src/modules/program/domain/program.entity';
import { MuscleZone } from '../../../src/modules/exercise/domain/exercise.entity';

describe('ProgramController', () => {
  let controller: ProgramController;
  let generateProgramByPhaseUseCase: jest.Mocked<GenerateProgramByPhaseUseCase>;
  let createProgramUseCase: jest.Mocked<CreateProgramUseCase>;
  let getUserProgramsUseCase: jest.Mocked<GetUserProgramsUseCase>;
  let getProgramByIdUseCase: jest.Mocked<GetProgramByIdUseCase>;
  let updateProgramUseCase: jest.Mocked<UpdateProgramUseCase>;
  let deleteProgramUseCase: jest.Mocked<DeleteProgramUseCase>;
  let startProgramUseCase: jest.Mocked<StartProgramUseCase>;
  let getProgramStatusUseCase: jest.Mocked<GetProgramStatusUseCase>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockRequest = {
    user: mockUser,
  };

  const mockProgram = new Program({
    id: 'program-123',
    userId: 'user-123',
    title: 'Test Program',
    goal: 'Build strength',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-02-15'),
    isActive: false,
    isTemplate: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgramController],
      providers: [
        {
          provide: GenerateProgramByPhaseUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: CreateProgramUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetUserProgramsUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetProgramByIdUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: UpdateProgramUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: DeleteProgramUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: StartProgramUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetProgramStatusUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProgramController>(ProgramController);
    generateProgramByPhaseUseCase = module.get(GenerateProgramByPhaseUseCase);
    createProgramUseCase = module.get(CreateProgramUseCase);
    getUserProgramsUseCase = module.get(GetUserProgramsUseCase);
    getProgramByIdUseCase = module.get(GetProgramByIdUseCase);
    updateProgramUseCase = module.get(UpdateProgramUseCase);
    deleteProgramUseCase = module.get(DeleteProgramUseCase);
    startProgramUseCase = module.get(StartProgramUseCase);
    getProgramStatusUseCase = module.get(GetProgramStatusUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateProgram', () => {
    const generateDto = {
      duration: 30,
      focusZone: MuscleZone.UPPER_BODY,
      sessionType: 'strength' as const,
    };

    it('should generate program successfully', async () => {
      const mockGeneratedProgram = {
        program: {
          id: 'generated-123',
          title: 'Generated Program',
          description: 'A generated program',
          totalDuration: 30,
          formattedTotalDuration: '30min',
          exercises: [],
          phaseRecommendations: [],
          tips: [],
        },
        userPhase: {
          phase: 'FOLLICULAR',
          phaseLabel: 'Phase folliculaire',
          cycleDay: 10,
          recommendations: [],
        },
        adaptations: [],
      };

      generateProgramByPhaseUseCase.execute.mockResolvedValue(
        mockGeneratedProgram,
      );

      const result = await controller.generateProgram(
        generateDto,
        mockRequest as any,
      );

      expect(generateProgramByPhaseUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-123',
        duration: 30,
        focusZone: MuscleZone.UPPER_BODY,
        sessionType: 'strength',
      });

      expect(result).toEqual({
        success: true,
        data: mockGeneratedProgram,
        message:
          'Programme "Generated Program" généré avec succès pour votre Phase folliculaire',
      });
    });

    it('should handle generation errors', async () => {
      const error = new Error('Aucun cycle trouvé');
      generateProgramByPhaseUseCase.execute.mockRejectedValue(error);

      await expect(
        controller.generateProgram(generateDto, mockRequest as any),
      ).rejects.toThrow(
        new HttpException('Aucun cycle trouvé', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('createProgram', () => {
    const createDto = {
      title: 'New Program',
      goal: 'Build strength',
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      isTemplate: false,
      exercises: [],
    };

    it('should create program successfully', async () => {
      createProgramUseCase.execute.mockResolvedValue(mockProgram);

      const result = await controller.createProgram(
        createDto,
        mockRequest as any,
      );

      expect(createProgramUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-123',
        title: 'New Program',
        goal: 'Build strength',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-15'),
        isTemplate: false,
        exercises: [],
      });

      expect(result).toEqual({
        id: 'program-123',
        title: 'Test Program',
        goal: 'Build strength',
        startDate: mockProgram.startDate.toISOString(),
        endDate: mockProgram.endDate!.toISOString(),
        isActive: false,
        isTemplate: false,
        createdAt: mockProgram.createdAt!.toISOString(),
        updatedAt: mockProgram.updatedAt!.toISOString(),
        exerciseCount: 0,
      });
    });
  });

  describe('getUserPrograms', () => {
    const queryDto = {
      isActive: true,
      isTemplate: false,
      limit: 10,
      offset: 0,
    };

    it('should get user programs successfully', async () => {
      const mockResult = {
        programs: [mockProgram],
        total: 1,
        offset: 0,
        limit: 10,
      };

      getUserProgramsUseCase.execute.mockResolvedValue(mockResult);

      const result = await controller.getUserPrograms(
        queryDto,
        mockRequest as any,
      );

      expect(getUserProgramsUseCase.execute).toHaveBeenCalledWith({
        userId: 'user-123',
        filters: {
          isActive: true,
          isTemplate: false,
          startDateFrom: undefined,
          startDateTo: undefined,
          limit: 10,
          offset: 0,
        },
      });

      expect(result).toEqual({
        programs: [
          expect.objectContaining({
            id: 'program-123',
            title: 'Test Program',
          }),
        ],
        total: 1,
        offset: 0,
        limit: 10,
      });
    });
  });

  describe('getProgramById', () => {
    it('should get program by id successfully', async () => {
      getProgramByIdUseCase.execute.mockResolvedValue(mockProgram);

      const result = await controller.getProgramById(
        'program-123',
        mockRequest as any,
      );

      expect(getProgramByIdUseCase.execute).toHaveBeenCalledWith({
        programId: 'program-123',
        userId: 'user-123',
      });

      expect(result).toEqual({
        id: 'program-123',
        title: 'Test Program',
        goal: 'Build strength',
        startDate: mockProgram.startDate.toISOString(),
        endDate: mockProgram.endDate!.toISOString(),
        isActive: false,
        isTemplate: false,
        createdAt: mockProgram.createdAt!.toISOString(),
        updatedAt: mockProgram.updatedAt!.toISOString(),
        exerciseCount: 0,
      });
    });
  });

  describe('updateProgram', () => {
    const updateDto = {
      title: 'Updated Program',
      goal: 'Updated goal',
      isActive: true,
    };

    it('should update program successfully', async () => {
      const updatedProgram = new Program({
        ...mockProgram,
        title: 'Updated Program',
        goal: 'Updated goal',
        isActive: true,
      });

      updateProgramUseCase.execute.mockResolvedValue(updatedProgram);

      const result = await controller.updateProgram(
        'program-123',
        updateDto,
        mockRequest as any,
      );

      expect(updateProgramUseCase.execute).toHaveBeenCalledWith({
        programId: 'program-123',
        userId: 'user-123',
        title: 'Updated Program',
        goal: 'Updated goal',
        startDate: undefined,
        endDate: undefined,
        isActive: true,
        isTemplate: undefined,
      });

      expect(result.title).toBe('Updated Program');
      expect(result.isActive).toBe(true);
    });
  });

  describe('deleteProgram', () => {
    it('should delete program successfully', async () => {
      deleteProgramUseCase.execute.mockResolvedValue();

      await controller.deleteProgram('program-123', mockRequest as any);

      expect(deleteProgramUseCase.execute).toHaveBeenCalledWith({
        programId: 'program-123',
        userId: 'user-123',
      });
    });
  });

  describe('startProgram', () => {
    it('should start program successfully', async () => {
      const activeProgram = new Program({
        ...mockProgram,
        isActive: true,
      });

      startProgramUseCase.execute.mockResolvedValue(activeProgram);

      const result = await controller.startProgram(
        'program-123',
        mockRequest as any,
      );

      expect(startProgramUseCase.execute).toHaveBeenCalledWith({
        programId: 'program-123',
        userId: 'user-123',
      });

      expect(result.isActive).toBe(true);
    });
  });

  describe('pauseProgram', () => {
    it('should pause program successfully', async () => {
      const pausedProgram = new Program({
        ...mockProgram,
        isActive: false,
      });

      updateProgramUseCase.execute.mockResolvedValue(pausedProgram);

      const result = await controller.pauseProgram(
        'program-123',
        mockRequest as any,
      );

      expect(updateProgramUseCase.execute).toHaveBeenCalledWith({
        programId: 'program-123',
        userId: 'user-123',
        isActive: false,
      });

      expect(result.isActive).toBe(false);
    });
  });

  describe('resumeProgram', () => {
    it('should resume program successfully', async () => {
      const resumedProgram = new Program({
        ...mockProgram,
        isActive: true,
      });

      updateProgramUseCase.execute.mockResolvedValue(resumedProgram);

      const result = await controller.resumeProgram(
        'program-123',
        mockRequest as any,
      );

      expect(updateProgramUseCase.execute).toHaveBeenCalledWith({
        programId: 'program-123',
        userId: 'user-123',
        isActive: true,
      });

      expect(result.isActive).toBe(true);
    });
  });

  describe('completeProgram', () => {
    it('should complete program successfully', async () => {
      const completedProgram = new Program({
        ...mockProgram,
        isActive: false,
        endDate: new Date(),
      });

      updateProgramUseCase.execute.mockResolvedValue(completedProgram);

      const result = await controller.completeProgram(
        'program-123',
        mockRequest as any,
      );

      expect(updateProgramUseCase.execute).toHaveBeenCalledWith({
        programId: 'program-123',
        userId: 'user-123',
        isActive: false,
        endDate: expect.any(Date),
      });

      expect(result.isActive).toBe(false);
    });
  });

  describe('getProgramStatus', () => {
    it('should get program status successfully', async () => {
      const mockStatus = {
        id: 'program-123',
        title: 'Test Program',
        isActive: true,
        isExpired: false,
        isTemplate: false,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-15'),
        durationInDays: 31,
        daysRemaining: 20,
        completionPercentage: 35,
      };

      getProgramStatusUseCase.execute.mockResolvedValue(mockStatus);

      const result = await controller.getProgramStatus(
        'program-123',
        mockRequest as any,
      );

      expect(getProgramStatusUseCase.execute).toHaveBeenCalledWith({
        programId: 'program-123',
        userId: 'user-123',
      });

      expect(result).toEqual({
        success: true,
        data: mockStatus,
      });
    });
  });

  describe('getProgramProgress', () => {
    it('should get program progress successfully', async () => {
      const mockStatus = {
        id: 'program-123',
        title: 'Test Program',
        isActive: true,
        isExpired: false,
        isTemplate: false,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-15'),
        durationInDays: 31,
        daysRemaining: 20,
        completionPercentage: 35,
      };

      getProgramStatusUseCase.execute.mockResolvedValue(mockStatus);

      const result = await controller.getProgramProgress(
        'program-123',
        mockRequest as any,
      );

      expect(result).toEqual({
        success: true,
        data: {
          ...mockStatus,
          sessionsCompleted: 0,
          totalSessions: 0,
          currentWeek: 1,
          completedExercises: [],
        },
      });
    });
  });

  describe('error handling', () => {
    it('should handle NotFoundException', async () => {
      const error = { name: 'NotFoundException', message: 'Program not found' };
      getProgramByIdUseCase.execute.mockRejectedValue(error);

      await expect(
        controller.getProgramById('program-123', mockRequest as any),
      ).rejects.toThrow(
        new HttpException('Program not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should handle ForbiddenException', async () => {
      const error = { name: 'ForbiddenException', message: 'Access denied' };
      getProgramByIdUseCase.execute.mockRejectedValue(error);

      await expect(
        controller.getProgramById('program-123', mockRequest as any),
      ).rejects.toThrow(
        new HttpException('Access denied', HttpStatus.FORBIDDEN),
      );
    });

    it('should handle ConflictException', async () => {
      const error = { name: 'ConflictException', message: 'Conflict occurred' };
      createProgramUseCase.execute.mockRejectedValue(error);

      const createDto = {
        title: 'New Program',
        startDate: '2024-01-15',
      };

      await expect(
        controller.createProgram(createDto as any, mockRequest as any),
      ).rejects.toThrow(
        new HttpException('Conflict occurred', HttpStatus.CONFLICT),
      );
    });

    it('should handle generic errors', async () => {
      const error = new Error('Something went wrong');
      getProgramByIdUseCase.execute.mockRejectedValue(error);

      await expect(
        controller.getProgramById('program-123', mockRequest as any),
      ).rejects.toThrow(
        new HttpException(
          'Something went wrong',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
