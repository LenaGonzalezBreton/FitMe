import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Req,
  Ip,
  Get,
  Request,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.use-case';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  AuthResponseDto,
  TokenResponseDto,
} from './dto/auth.dto';
import { Public } from '../guards/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  @Public()
  @ApiOperation({ summary: "Inscription d'un nouvel utilisateur" })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Utilisateur inscrit',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Erreur de validation ou utilisateur existant',
  })
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Req() request: ExpressRequest,
    @Ip() ipAddress: string,
  ): Promise<AuthResponseDto> {
    try {
      const result = await this.registerUseCase.execute({
        email: registerDto.email,
        password: registerDto.password,
        firstName: registerDto.firstName,
        profileType: registerDto.profileType,
        contextType: registerDto.contextType,
      });

      // Connecter automatiquement l'utilisateur après l'inscription
      const loginResult = await this.loginUseCase.execute({
        email: registerDto.email,
        password: registerDto.password,
        userAgent: request.headers['user-agent'],
        ipAddress,
      });

      return {
        tokens: {
          accessToken: loginResult.tokens.accessToken,
          refreshToken: loginResult.tokens.refreshToken,
          expiresIn: loginResult.tokens.expiresIn,
        },
        user: result.user,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur lors de l'inscription";
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @Public()
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description: 'Connexion réussie',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Identifiants invalides',
  })
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: ExpressRequest,
    @Ip() ipAddress: string,
  ): Promise<AuthResponseDto> {
    try {
      const result = await this.loginUseCase.execute({
        email: loginDto.email,
        password: loginDto.password,
        userAgent: request.headers['user-agent'],
        ipAddress,
      });

      return {
        tokens: {
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
          expiresIn: result.tokens.expiresIn,
        },
        user: result.user,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erreur lors de la connexion';
      throw new HttpException(message, HttpStatus.UNAUTHORIZED);
    }
  }

  @Public()
  @ApiOperation({ summary: "Rafraîchissement du token d'accès" })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 201,
    description: 'Nouveaux tokens générés',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de rafraîchissement invalide ou expiré',
  })
  @Post('refresh')
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<TokenResponseDto> {
    try {
      const result = await this.refreshTokenUseCase.execute({
        refreshToken: refreshTokenDto.refreshToken,
      });

      return {
        tokens: {
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
          expiresIn: result.tokens.expiresIn,
        },
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur lors du rafraîchissement du token';
      throw new HttpException(message, HttpStatus.UNAUTHORIZED);
    }
  }

  @ApiOperation({ summary: "Récupérer le profil de l'utilisateur connecté" })
  @ApiResponse({ status: 200, description: 'Profil utilisateur retourné' })
  @Get('profile')
  async getProfile(@Request() req: any) {
    return {
      message: 'Accès autorisé !',
      user: req.user,
      timestamp: new Date().toISOString(),
    };
  }

  @ApiOperation({
    summary: 'Route de test publique (aucune authentification requise)',
  })
  @ApiResponse({ status: 200, description: 'Réponse publique' })
  @Get('test-public')
  @Public()
  async testPublic() {
    return {
      message: 'Cette route est publique et accessible sans authentification',
      timestamp: new Date().toISOString(),
    };
  }
}
