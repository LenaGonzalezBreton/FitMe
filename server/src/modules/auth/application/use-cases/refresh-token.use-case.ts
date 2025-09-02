import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthTokens } from '../../domain/auth.entity';
import { IRefreshTokenRepository } from '../../domain/auth.repository';
import { REFRESH_TOKEN_REPOSITORY_TOKEN } from '../../tokens';
import * as crypto from 'crypto';

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  tokens: AuthTokens;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(REFRESH_TOKEN_REPOSITORY_TOKEN)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    // Hacher le token de rafraîchissement pour le rechercher
    const tokenHash = crypto
      .createHash('sha256')
      .update(request.refreshToken)
      .digest('hex');

    // Vérifier si le token existe et n'est pas révoqué
    const storedToken =
      await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (
      !storedToken ||
      storedToken.revoked ||
      storedToken.expiresAt < new Date()
    ) {
      throw new UnauthorizedException(
        'Token de rafraîchissement invalide ou expiré',
      );
    }

    // Vérifier la validité du JWT (structure et signature)
    let payload: any;
    try {
      payload = this.jwtService.verify(request.refreshToken);
    } catch (error) {
      throw new UnauthorizedException('Token de rafraîchissement invalide');
    }

    // Vérifier que l'userId correspond
    if (payload.sub !== storedToken.userId) {
      throw new UnauthorizedException('Token de rafraîchissement invalide');
    }

    // Révoquer l'ancien token
    await this.refreshTokenRepository.revokeByTokenHash(tokenHash);

    // Générer de nouveaux tokens
    const tokens = await this.generateTokens(payload.sub);

    // Sauvegarder le nouveau refresh token
    const newRefreshTokenHash = crypto
      .createHash('sha256')
      .update(tokens.refreshToken)
      .digest('hex');
    const refreshExpiresIn = this.configService.get(
      'JWT_REFRESH_EXPIRES_IN',
      '7d',
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 jours par défaut

    await this.refreshTokenRepository.create(
      payload.sub,
      newRefreshTokenHash,
      expiresAt,
    );

    return { tokens };
  }

  private async generateTokens(userId: string): Promise<AuthTokens> {
    const payload = { sub: userId };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return new AuthTokens(accessToken, refreshToken, 15 * 60);
  }
}
