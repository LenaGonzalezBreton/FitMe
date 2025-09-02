import { Injectable } from '@nestjs/common';
import { WORKOUT_SESSION_REPOSITORY_TOKEN } from '../../tokens';
import { Inject } from '@nestjs/common';

export interface GetUserWorkoutSessionsRequest {
  userId: string;
  limit?: number;
  offset?: number;
  fromDate?: Date;
  toDate?: Date;
  status?: string;
}

export interface GetUserWorkoutSessionsResponse {
  sessions: Array<{
    id: string;
    programId?: string;
    title?: string;
    startTime: Date;
    endTime?: Date;
    totalDuration?: number;
    status: string;
    notes?: string;
    rating?: number;
    exerciseCount: number;
  }>;
  total: number;
  limit: number;
  offset: number;
}

@Injectable()
export class GetUserWorkoutSessionsUseCase {
  constructor(
    @Inject(WORKOUT_SESSION_REPOSITORY_TOKEN)
    private readonly workoutSessionRepository: any,
  ) {}

  async execute(request: GetUserWorkoutSessionsRequest): Promise<GetUserWorkoutSessionsResponse> {
    const { userId, limit = 20, offset = 0, fromDate, toDate, status } = request;

    const result = await this.workoutSessionRepository.findByUserId({
      userId,
      limit,
      offset,
      fromDate,
      toDate,
      status,
    });

    const sessions = result.sessions.map((session: any) => ({
      id: session.id,
      programId: session.programId,
      title: session.title,
      startTime: session.startTime,
      endTime: session.endTime,
      totalDuration: session.totalDuration,
      status: session.status,
      notes: session.notes,
      rating: session.rating,
      exerciseCount: session.exerciseCount || 0,
    }));

    return {
      sessions,
      total: result.total,
      limit,
      offset,
    };
  }
}

