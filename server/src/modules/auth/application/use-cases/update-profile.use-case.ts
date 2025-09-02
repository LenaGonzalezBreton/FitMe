import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IUserRepository,
  ProfileType,
  ContextType,
} from '../../domain/auth.repository';
import { USER_REPOSITORY_TOKEN } from '../../tokens';

export interface UpdateProfileRequest {
  userId: string;
  firstName?: string;
  birthDate?: string;
  profileType?: string;
  contextType?: string;
  objective?: string;
  sportFrequency?: string;
  isMenopausal?: boolean;
}

export interface UpdateProfileResponse {
  user: {
    id: string;
    email: string;
    firstName?: string;
    birthDate?: string;
    profileType?: string;
    contextType?: string;
    objective?: string;
    sportFrequency?: string;
    isMenopausal?: boolean;
  };
}

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(request: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    const { userId, ...updateData } = request;

    // Vérifier que l'utilisateur existe
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new NotFoundException('Utilisateur non trouvé.');
    }

    // Valider birthDate si fournie
    if (updateData.birthDate) {
      const birthDate = new Date(updateData.birthDate);
      if (isNaN(birthDate.getTime())) {
        throw new Error('Date de naissance invalide.');
      }

      const now = new Date();
      const age = now.getFullYear() - birthDate.getFullYear();
      if (age < 13 || age > 120) {
        throw new Error("L'âge doit être entre 13 et 120 ans.");
      }
    }

    // Valider profileType si fourni
    if (
      updateData.profileType &&
      !Object.values(ProfileType).includes(
        updateData.profileType as ProfileType,
      )
    ) {
      throw new Error('Type de profil invalide.');
    }

    // Valider contextType si fourni
    if (
      updateData.contextType &&
      !Object.values(ContextType).includes(
        updateData.contextType as ContextType,
      )
    ) {
      throw new Error('Type de contexte invalide.');
    }

    // Mettre à jour le profil
    const updatedUser = await this.userRepository.updateProfile(userId, {
      firstName: updateData.firstName?.trim(),
      birthDate: updateData.birthDate
        ? new Date(updateData.birthDate)
        : undefined,
      profileType: updateData.profileType as ProfileType,
      contextType: updateData.contextType as ContextType,
      objective: updateData.objective?.trim(),
      sportFrequency: updateData.sportFrequency?.trim(),
      isMenopausal: updateData.isMenopausal,
    });

    return {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        birthDate: updatedUser.birthDate?.toISOString().split('T')[0],
        profileType: updatedUser.profileType,
        contextType: updatedUser.contextType,
        objective: updatedUser.objective,
        sportFrequency: updatedUser.sportFrequency,
        isMenopausal: updatedUser.isMenopausal,
      },
    };
  }
}
