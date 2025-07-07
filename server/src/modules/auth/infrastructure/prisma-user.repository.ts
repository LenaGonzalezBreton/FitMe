import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';
import { IUserRepository, CreateUserData } from '../domain/auth.repository';
import { AuthUser } from '../domain/auth.entity';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user
      ? AuthUser.fromPrismaUser({ ...user, passwordHash: user.passwordHash })
      : null;
  }

  async findById(userId: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    return user
      ? AuthUser.fromPrismaUser({ ...user, passwordHash: user.passwordHash })
      : null;
  }

  async create(userData: CreateUserData): Promise<AuthUser> {
    const user = await this.prisma.user.create({
      data: {
        email: userData.email,
        passwordHash: userData.passwordHash,
        firstName: userData.firstName,
        profileType: userData.profileType as any,
        contextType: userData.contextType as any,
      },
    });

    return AuthUser.fromPrismaUser({
      ...user,
      passwordHash: user.passwordHash,
    });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: passwordHash },
    });
  }
}
