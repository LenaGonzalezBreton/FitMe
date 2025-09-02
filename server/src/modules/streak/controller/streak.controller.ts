import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
  Request,
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

@ApiTags('Streaks')
@ApiBearerAuth()
@Controller('streaks')
export class StreakController {
  constructor(
    private readonly getStreakDataUseCase: GetStreakDataUseCase,
    private readonly logWorkoutUseCase: LogWorkoutUseCase,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get streak data',
    description: 'Retrieves streak data for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Streak data retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  async getStreakData(@Request() req: { user: { sub: string } }) {
    try {
      const result = await this.getStreakDataUseCase.execute({
        userId: req.user.sub,
      });

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
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Log a workout',
    description: 'Logs a workout for streak tracking',
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
  async logWorkout(
    @Body() body: { duration?: number; intensity?: string; notes?: string },
    @Request() req: { user: { sub: string } },
  ) {
    try {
      const result = await this.logWorkoutUseCase.execute({
        userId: req.user.sub,
        duration: body.duration,
        intensity: body.intensity as any,
        notes: body.notes,
      });

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


