import { Injectable, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IUserRepository, CreateUserData } from '../../domain/auth.repository';
import { USER_REPOSITORY_TOKEN } from '../../auth.module';

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
  };
}

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(request: RegisterRequest): Promise<RegisterResponse> {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    // Valider le mot de passe
    if (!request.password || request.password.length < 8) {
      throw new Error('Le mot de passe doit contenir au moins 8 caractères');
    }

    // Hasher le mot de passe
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(request.password, saltRounds);

    // Créer les données utilisateur
    const userData: CreateUserData = {
      email: request.email.toLowerCase().trim(),
      passwordHash,
      firstName: request.firstName?.trim(),
      profileType: request.profileType as ProfileType || 'FEMALE',
      contextType: request.contextType as ContextType || 'CYCLE',
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
      },
    };
  }
}
