import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';
import {
  IRefreshTokenRepository,
  RefreshTokenData,
} from '../domain/auth.repository';

@Injectable()
export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshTokenData | null> {
    const token = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: tokenHash },
    });

    if (!token) {
      return null;
    }

    return {
      id: token.id,
      userId: token.userId,
      tokenHash: token.tokenHash,
      expiresAt: token.expiresAt,
      revoked: token.revoked,
    };
  }

  async revokeByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
  }

  async revokeByTokenHash(tokenHash: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { tokenHash: tokenHash },
      data: { revoked: true },
    });
  }
}

