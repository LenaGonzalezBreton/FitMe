import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  HttpException,
  HttpStatus,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StartWorkoutSessionUseCase } from '../application/use-cases/start-workout-session.use-case';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CompleteWorkoutSessionUseCase } from '../application/use-cases/complete-workout-session.use-case';
import { GetWorkoutSessionUseCase } from '../application/use-cases/get-workout-session.use-case';
import { GetUserWorkoutSessionsUseCase } from '../application/use-cases/get-user-workout-sessions.use-case';
import { LogExerciseCompletionUseCase } from '../application/use-cases/log-exercise-completion.use-case';
import { PauseWorkoutSessionUseCase } from '../application/use-cases/pause-workout-session.use-case';
import { ResumeWorkoutSessionUseCase } from '../application/use-cases/resume-workout-session.use-case';
import { GetWorkoutStatsUseCase } from '../application/use-cases/get-workout-stats.use-case';

@ApiTags('Workouts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workouts')
export class WorkoutController {
  constructor(
    private readonly startWorkoutSessionUseCase: StartWorkoutSessionUseCase,
    private readonly completeWorkoutSessionUseCase: CompleteWorkoutSessionUseCase,
    private readonly getWorkoutSessionUseCase: GetWorkoutSessionUseCase,
    private readonly getUserWorkoutSessionsUseCase: GetUserWorkoutSessionsUseCase,
    private readonly logExerciseCompletionUseCase: LogExerciseCompletionUseCase,
    private readonly pauseWorkoutSessionUseCase: PauseWorkoutSessionUseCase,
    private readonly resumeWorkoutSessionUseCase: ResumeWorkoutSessionUseCase,
    private readonly getWorkoutStatsUseCase: GetWorkoutStatsUseCase,
  ) {}

  @Post('sessions')
  @ApiOperation({
    summary: 'Start a new workout session',
    description: 'Creates a new workout session for the authenticated user',
  })
  @ApiResponse({
    status: 201,
    description: 'Workout session started successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  async startWorkoutSession(
    @Body() body: { programId?: string; title?: string },
    @Request() req: { user: { id: string } },
  ) {
    try {
      const result = await this.startWorkoutSessionUseCase.execute({
        userId: req.user.id,
        programId: body.programId,
        title: body.title,
      });

      return {
        success: true,
        data: result,
        message: 'Workout session started successfully',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error starting workout session';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('sessions/:id/complete')
  @ApiOperation({
    summary: 'Complete a workout session',
    description: 'Marks a workout session as completed',
  })
  @ApiParam({
    name: 'id',
    description: 'Workout session ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Workout session completed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Workout session not found',
  })
  async completeWorkoutSession(
    @Param('id') sessionId: string,
    @Body() body: { notes?: string; rating?: number },
  ) {
    try {
      const result = await this.completeWorkoutSessionUseCase.execute({
        sessionId,
        notes: body.notes,
        rating: body.rating,
      });

      return {
        success: true,
        data: result,
        message: 'Workout session completed successfully',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error completing workout session';
      if (message.includes('not found')) {
        throw new HttpException(message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('sessions/:id')
  @ApiOperation({
    summary: 'Get workout session details',
    description: 'Retrieves detailed information about a specific workout session',
  })
  @ApiParam({
    name: 'id',
    description: 'Workout session ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Workout session details retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Workout session not found',
  })
  async getWorkoutSession(@Param('id') sessionId: string) {
    try {
      const result = await this.getWorkoutSessionUseCase.execute({ sessionId });

      return {
        success: true,
        data: result,
        message: 'Workout session details retrieved successfully',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error retrieving workout session';
      if (message.includes('not found')) {
        throw new HttpException(message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('sessions')
  @ApiOperation({
    summary: 'Get user workout sessions',
    description: 'Retrieves workout sessions for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Workout sessions retrieved successfully',
  })
  async getUserWorkoutSessions(
    @Query() query: { limit?: string; offset?: string; fromDate?: string; toDate?: string; status?: string },
    @Request() req: { user: { id: string } },
  ) {
    try {
      const result = await this.getUserWorkoutSessionsUseCase.execute({
        userId: req.user.id,
        limit: query.limit ? parseInt(query.limit) : undefined,
        offset: query.offset ? parseInt(query.offset) : undefined,
        fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
        toDate: query.toDate ? new Date(query.toDate) : undefined,
        status: query.status,
      });

      return {
        success: true,
        data: result,
        message: 'Workout sessions retrieved successfully',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error retrieving workout sessions';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get workout statistics',
    description: 'Retrieves workout statistics for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Workout statistics retrieved successfully',
  })
  async getWorkoutStats(
    @Query() query: { period?: string; fromDate?: string; toDate?: string },
    @Request() req: { user: { id: string } },
  ) {
    try {
      const result = await this.getWorkoutStatsUseCase.execute({
        userId: req.user.id,
        period: query.period as any,
        fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
        toDate: query.toDate ? new Date(query.toDate) : undefined,
      });

      return {
        success: true,
        data: result,
        message: 'Workout statistics retrieved successfully',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error retrieving workout statistics';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('sessions/:id/exercises')
  @ApiOperation({
    summary: 'Log exercise completion',
    description: 'Logs an exercise completion within a workout session',
  })
  @ApiParam({
    name: 'id',
    description: 'Workout session ID',
  })
  @ApiResponse({
    status: 201,
    description: 'Exercise logged successfully',
  })
  async logExerciseCompletion(
    @Param('id') sessionId: string,
    @Body() body: { exerciseId: string; sets?: number; reps?: string; weight?: number; duration?: number; notes?: string },
  ) {
    try {
      const result = await this.logExerciseCompletionUseCase.execute({
        sessionId,
        ...body,
      });

      return {
        success: true,
        data: result,
        message: 'Exercise logged successfully',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error logging exercise';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('sessions/:id/pause')
  @ApiOperation({
    summary: 'Pause workout session',
    description: 'Pauses an active workout session',
  })
  @ApiParam({
    name: 'id',
    description: 'Workout session ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Workout session paused successfully',
  })
  async pauseWorkoutSession(@Param('id') sessionId: string) {
    try {
      const result = await this.pauseWorkoutSessionUseCase.execute({ sessionId });

      return {
        success: true,
        data: result,
        message: 'Workout session paused successfully',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error pausing workout session';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('sessions/:id/resume')
  @ApiOperation({
    summary: 'Resume workout session',
    description: 'Resumes a paused workout session',
  })
  @ApiParam({
    name: 'id',
    description: 'Workout session ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Workout session resumed successfully',
  })
  async resumeWorkoutSession(@Param('id') sessionId: string) {
    try {
      const result = await this.resumeWorkoutSessionUseCase.execute({ sessionId });

      return {
        success: true,
        data: result,
        message: 'Workout session resumed successfully',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error resuming workout session';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }
}
