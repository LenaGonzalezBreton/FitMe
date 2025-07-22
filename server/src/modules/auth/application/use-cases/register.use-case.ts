import { Injectable, Inject, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  IUserRepository,
  CreateUserData,
  ProfileType,
  ContextType,
} from '../../domain/auth.repository';
import { USER_REPOSITORY_TOKEN } from '../../tokens';

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  profileType?: string;
  contextType?: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    firstName?: string;
    profileType?: string;
    contextType?: string;
    onboardingCompleted: boolean;
    experienceLevel?: string;
  };
}

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(request: RegisterRequest): Promise<RegisterResponse> {
    const { email, password, firstName, profileType, contextType } = request;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà.');
    }

    // Valider le mot de passe
    if (!password || password.length < 8) {
      throw new Error('Le mot de passe doit contenir au moins 8 caractères.');
    }

    // Hasher le mot de passe
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Créer les données utilisateur
    const userData: CreateUserData = {
      email: email.toLowerCase().trim(),
      passwordHash,
      firstName: firstName?.trim(),
      profileType: (profileType as ProfileType) || ProfileType.FEMALE,
      contextType: (contextType as ContextType) || ContextType.CYCLE,
    };

    // Créer l'utilisateur
    const user = await this.userRepository.create(userData);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        profileType: user.profileType,
        contextType: user.contextType,
        onboardingCompleted: user.onboardingCompleted,
        experienceLevel: user.experienceLevel,
      },
    };
  }
}
