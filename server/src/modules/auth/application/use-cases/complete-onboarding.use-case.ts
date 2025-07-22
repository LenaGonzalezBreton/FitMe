import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IUserRepository,
  OnboardingProfileData,
  ObjectiveType,
  ExperienceLevel,
} from '../../domain/auth.repository';
import {
  ICycleProfileConfigRepository,
  UpdateCycleProfileConfigData,
} from '../../../cycle/domain/cycle.repository';
import { USER_REPOSITORY_TOKEN } from '../../tokens';
import { CYCLE_PROFILE_CONFIG_REPOSITORY_TOKEN } from '../../../cycle/tokens';
import { AuthUser } from '../../domain/auth.entity';

export interface CompleteOnboardingRequest {
  userId: string;
  objective: ObjectiveType;
  experienceLevel: ExperienceLevel;
  isMenopausal: boolean;
  averageCycleLength?: number;
  averagePeriodLength?: number;
}

@Injectable()
export class CompleteOnboardingUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(CYCLE_PROFILE_CONFIG_REPOSITORY_TOKEN)
    private readonly cycleConfigRepository: ICycleProfileConfigRepository,
  ) {}

  async execute(request: CompleteOnboardingRequest): Promise<AuthUser> {
    const {
      userId,
      objective,
      experienceLevel,
      isMenopausal,
      averageCycleLength,
      averagePeriodLength,
    } = request;

    // 1. Vérifier si l'utilisateur existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException("L'utilisateur n'a pas été trouvé.");
    }

    // 2. Mettre à jour le profil utilisateur
    const userProfileData: OnboardingProfileData = {
      objective,
      experienceLevel,
      isMenopausal,
      onboardingCompleted: true,
    };
    const updatedUser = await this.userRepository.updateOnboardingProfile(
      userId,
      userProfileData,
    );

    // 3. Mettre à jour la configuration du cycle si nécessaire
    if (!isMenopausal) {
      const cycleConfigData: UpdateCycleProfileConfigData = {
        averageCycleLength,
        averagePeriodLength,
        isCycleTrackingEnabled: true,
      };

      const existingConfig =
        await this.cycleConfigRepository.findByUserId(userId);
      if (existingConfig) {
        await this.cycleConfigRepository.update(userId, cycleConfigData);
      } else {
        await this.cycleConfigRepository.create({
          userId,
          ...cycleConfigData,
        });
      }
    }

    return updatedUser;
  }
}
