import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';
import {
  IAuthSessionRepository,
  CreateSessionData,
  SessionData,
} from '../domain/auth.repository';

@Injectable()
export class PrismaAuthSessionRepository implements IAuthSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(sessionData: CreateSessionData): Promise<string> {
    const session = await this.prisma.authSession.create({
      data: {
        userId: sessionData.userId,
        userAgent: sessionData.userAgent,
        ipAddress: sessionData.ipAddress,
        lastSeen: new Date(),
      },
    });

    return session.id;
  }

  async findByUserId(userId: string): Promise<SessionData[]> {
    const sessions = await this.prisma.authSession.findMany({
      where: { userId, isActive: true },
      orderBy: { lastSeen: 'desc' },
    });

    return sessions.map((session: any) => ({
      id: session.id,
      userId: session.userId,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      lastSeen: session.lastSeen,
      isActive: session.isActive,
    }));
  }

  async updateLastSeen(sessionId: string): Promise<void> {
    await this.prisma.authSession.update({
      where: { id: sessionId },
      data: { lastSeen: new Date() },
    });
  }

  async deactivateSession(sessionId: string): Promise<void> {
    await this.prisma.authSession.update({
      where: { id: sessionId },
      data: { isActive: false },
    });
  }

  async deactivateAllUserSessions(userId: string): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: { userId },
      data: { isActive: false },
    });
  }
}
