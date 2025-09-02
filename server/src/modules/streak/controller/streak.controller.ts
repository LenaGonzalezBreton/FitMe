import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GetStreakDataUseCase } from '../application/use-cases/get-streak-data.use-case';
import { LogWorkoutUseCase } from '../application/use-cases/log-workout.use-case';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@ApiTags('Streak')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('streak')
export class StreakController {
  constructor(
    private readonly getStreakDataUseCase: GetStreakDataUseCase,
    private readonly logWorkoutUseCase: LogWorkoutUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get user streak data',
    description: 'Retrieves the current streak and workout statistics for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Streak data retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  async getStreakData(@Request() req: { user: { id: string } }) {
    try {
      const result = await this.getStreakDataUseCase.execute({ userId: req.user.id });
      return {
        success: true,
        data: result,
        message: 'Streak data retrieved successfully',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error retrieving streak data';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('log-workout')
  @ApiOperation({
    summary: 'Log a workout completion',
    description: 'Logs a workout completion to update streak data',
  })
  @ApiResponse({
    status: 201,
    description: 'Workout logged successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  async logWorkout(@Request() req: { user: { id: string } }) {
    try {
      const result = await this.logWorkoutUseCase.execute({ userId: req.user.id });
      return {
        success: true,
        data: result,
        message: 'Workout logged successfully',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error logging workout';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }
}


