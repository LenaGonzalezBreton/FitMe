import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';
import {
  IUserRepository,
  CreateUserData,
  UpdateProfileData,
  OnboardingProfileData,
} from '../domain/auth.repository';
import { AuthUser } from '../domain/auth.entity';
import { $Enums } from '@prisma/client';

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

  async updateOnboardingProfile(
    userId: string,
    data: OnboardingProfileData,
  ): Promise<AuthUser> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        objective: data.objective,
        experienceLevel: data.experienceLevel,
        isMenopausal: data.isMenopausal,
        onboardingCompleted: data.onboardingCompleted,
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

  async updateProfile(
    userId: string,
    profileData: UpdateProfileData,
  ): Promise<AuthUser> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: profileData.firstName,
        birthDate: profileData.birthDate,
        profileType: profileData.profileType as any,
        contextType: profileData.contextType as any,
        objective: profileData.objective,
        sportFrequency: profileData.sportFrequency as $Enums.SportFrequency,
        isMenopausal: profileData.isMenopausal,
      },
    });

    return AuthUser.fromPrismaUser({
      ...user,
      passwordHash: user.passwordHash,
    });
  }
}
