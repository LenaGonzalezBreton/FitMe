import { Injectable, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  IUserRepository,
  IRefreshTokenRepository,
} from '../../domain/auth.repository';
import { AuthTokens } from '../../domain/auth.entity';
import {
  USER_REPOSITORY_TOKEN,
  REFRESH_TOKEN_REPOSITORY_TOKEN,
} from '../../tokens';

export interface LoginRequest {
  email: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface LoginResponse {
  tokens: AuthTokens;
  user: {
    id: string;
    email: string;
    firstName?: string;
    profileType?: string;
    contextType?: string;
  };
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY_TOKEN)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    // Trouver l'utilisateur par email
    const user = await this.userRepository.findByEmail(request.email);
    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(
      request.password,
      user.passwordHash,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    if (!isPasswordValid) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Révoquer tous les anciens refresh tokens de l'utilisateur (optionnel)
    await this.refreshTokenRepository.revokeByUserId(user.id);

    // Générer les tokens
    const tokens = await this.generateTokens(user.id);

    return {
      tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        profileType: user.profileType,
        contextType: user.contextType,
      },
    };
  }

  private async generateTokens(userId: string): Promise<AuthTokens> {
    // Payload pour le JWT
    const payload = { sub: userId };

    // Générer l'access token
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '15m'),
    });

    // Générer le refresh token (version simplifiée - juste un JWT plus long)
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    // Sauvegarder le refresh token dans la base de données
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 jours par défaut

    await this.refreshTokenRepository.create(userId, tokenHash, expiresAt);

    return new AuthTokens(
      accessToken,
      refreshToken,
      15 * 60, // 15 minutes en secondes
    );
  }
}
