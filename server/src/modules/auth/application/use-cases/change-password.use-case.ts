import {
  Injectable,
  Inject,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IUserRepository } from '../../domain/auth.repository';
import { USER_REPOSITORY_TOKEN } from '../../tokens';

export interface ChangePasswordRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(request: ChangePasswordRequest): Promise<void> {
    const { userId, currentPassword, newPassword } = request;

    // Vérifier que l'utilisateur existe
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new NotFoundException('Utilisateur non trouvé.');
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      existingUser.passwordHash,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Mot de passe actuel incorrect.');
    }

    // Valider le nouveau mot de passe
    if (!newPassword || newPassword.length < 8) {
      throw new Error(
        'Le nouveau mot de passe doit contenir au moins 8 caractères.',
      );
    }

    // Vérifier que le nouveau mot de passe est différent de l'ancien
    const isSamePassword = await bcrypt.compare(
      newPassword,
      existingUser.passwordHash,
    );
    if (isSamePassword) {
      throw new Error(
        "Le nouveau mot de passe doit être différent de l'ancien.",
      );
    }

    // Hasher le nouveau mot de passe
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Mettre à jour le mot de passe
    await this.userRepository.updatePassword(userId, newPasswordHash);
  }
}
