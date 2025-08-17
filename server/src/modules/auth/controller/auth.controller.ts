import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Req,
  Ip,
  Get,
  Put,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.use-case';
import { UpdateProfileUseCase } from '../application/use-cases/update-profile.use-case';
import { ChangePasswordUseCase } from '../application/use-cases/change-password.use-case';
import { GetSettingsUseCase } from '../application/use-cases/get-settings.use-case';
import { UpdateSettingsUseCase } from '../application/use-cases/update-settings.use-case';
import { GetPreferencesUseCase } from '../application/use-cases/get-preferences.use-case';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  AuthResponseDto,
  TokenResponseDto,
  UpdateProfileDto,
  ProfileResponseDto,
  ChangePasswordDto,
  SettingsResponseDto,
  UpdateSettingsDto,
  UpdateSettingsResponseDto,
  PreferencesResponseDto,
  UpdateWorkoutPreferencesDto,
  UpdateNotificationPreferencesDto,
  OnboardingDto,
} from './dto/auth.dto';
import { Public } from '../guards/public.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CompleteOnboardingUseCase } from '../application/use-cases/complete-onboarding.use-case';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,

    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly getSettingsUseCase: GetSettingsUseCase,
    private readonly updateSettingsUseCase: UpdateSettingsUseCase,
    private readonly getPreferencesUseCase: GetPreferencesUseCase,

    private readonly completeOnboardingUseCase: CompleteOnboardingUseCase,
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

  @Post('onboarding')
  @ApiOperation({ summary: "Compléter le questionnaire d'onboarding" })
  @ApiResponse({
    status: 200,
    description: 'Profil utilisateur mis à jour avec succès.',
  })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
  async completeOnboarding(
    @Request() req: any,
    @Body() onboardingDto: OnboardingDto,
  ) {
    try {
      const userId = req.user.id;
      const updatedUser = await this.completeOnboardingUseCase.execute({
        userId,
        ...onboardingDto,
      });

      return {
        success: true,
        message: 'Profil mis à jour avec succès.',
        user: updatedUser,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la mise à jour du profil.';
      const statusCode =
        error instanceof NotFoundException
          ? HttpStatus.NOT_FOUND
          : HttpStatus.BAD_REQUEST;
      throw new HttpException(message, statusCode);
    }
  }

  @ApiOperation({ summary: "Récupérer le profil de l'utilisateur connecté" })
  @ApiResponse({
    status: 200,
    description: 'Profil utilisateur retourné',
    type: ProfileResponseDto,
  })
  @Get('profile')
  getProfile(@Request() req: any): ProfileResponseDto {
    const user = req.user;
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        birthDate: user.birthDate?.toISOString().split('T')[0],
        profileType: user.profileType,
        contextType: user.contextType,
        objective: user.objective,
        sportFrequency: user.sportFrequency,
        isMenopausal: user.isMenopausal,
        onboardingCompleted: user.onboardingCompleted,
        experienceLevel: user.experienceLevel,
      },
    };
  }

  @ApiOperation({
    summary: "Mettre à jour le profil de l'utilisateur connecté",
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({
    status: 200,
    description: 'Profil mis à jour avec succès',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides ou erreur de validation',
  })
  @Put('profile')
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @Request() req: any,
  ): Promise<ProfileResponseDto> {
    try {
      const result = await this.updateProfileUseCase.execute({
        userId: req.user.id,
        firstName: updateProfileDto.firstName,
        birthDate: updateProfileDto.birthDate,
        profileType: updateProfileDto.profileType,
        contextType: updateProfileDto.contextType,
        objective: updateProfileDto.objective,
        sportFrequency: updateProfileDto.sportFrequency,
        isMenopausal: updateProfileDto.isMenopausal,
      });

      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la mise à jour du profil';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @ApiOperation({
    summary: "Changer le mot de passe de l'utilisateur connecté",
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Mot de passe mis à jour avec succès',
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides ou erreur de validation',
  })
  @ApiResponse({
    status: 401,
    description: 'Mot de passe actuel incorrect',
  })
  @Post('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req: any,
  ): Promise<{ message: string }> {
    try {
      await this.changePasswordUseCase.execute({
        userId: req.user.id,
        currentPassword: changePasswordDto.currentPassword,
        newPassword: changePasswordDto.newPassword,
      });

      return { message: 'Mot de passe mis à jour avec succès' };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur lors du changement de mot de passe';

      if (
        error.message.includes('incorrect') ||
        error.message.includes('Mot de passe actuel incorrect')
      ) {
        throw new HttpException(message, HttpStatus.UNAUTHORIZED);
      }

      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @ApiOperation({
    summary: "Récupérer tous les paramètres de l'utilisateur connecté",
  })
  @ApiResponse({
    status: 200,
    description: 'Paramètres utilisateur récupérés avec succès',
    type: SettingsResponseDto,
  })
  @Get('settings')
  async getSettings(@Request() req: any): Promise<SettingsResponseDto> {
    try {
      const result = await this.getSettingsUseCase.execute(req.user.id);
      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la récupération des paramètres';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @ApiOperation({
    summary: "Mettre à jour les paramètres de l'utilisateur connecté",
  })
  @ApiBody({ type: UpdateSettingsDto })
  @ApiResponse({
    status: 200,
    description: 'Paramètres mis à jour avec succès',
    type: UpdateSettingsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides ou erreur de validation',
  })
  @Put('settings')
  async updateSettings(
    @Body() updateSettingsDto: UpdateSettingsDto,
    @Request() req: any,
  ): Promise<UpdateSettingsResponseDto> {
    try {
      const result = await this.updateSettingsUseCase.execute({
        userId: req.user.id,
        settings: updateSettingsDto.settings,
        reminders: updateSettingsDto.reminders,
        objectives: updateSettingsDto.objectives,
        featureFlags: updateSettingsDto.featureFlags,
      });

      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la mise à jour des paramètres';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @ApiOperation({
    summary: "Récupérer toutes les préférences de l'utilisateur connecté",
  })
  @ApiResponse({
    status: 200,
    description: 'Préférences utilisateur récupérées avec succès',
    type: PreferencesResponseDto,
  })
  @Get('preferences')
  async getPreferences(@Request() req: any): Promise<PreferencesResponseDto> {
    try {
      const result = await this.getPreferencesUseCase.execute(req.user.id);
      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la récupération des préférences';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @ApiOperation({ summary: "Mettre à jour les préférences d'entraînement" })
  @ApiBody({ type: UpdateWorkoutPreferencesDto })
  @ApiResponse({
    status: 200,
    description: "Préférences d'entraînement mises à jour avec succès",
    type: UpdateSettingsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides ou erreur de validation',
  })
  @Put('preferences/workouts')
  async updateWorkoutPreferences(
    @Body() updateWorkoutPreferencesDto: UpdateWorkoutPreferencesDto,
    @Request() req: any,
  ): Promise<UpdateSettingsResponseDto> {
    try {
      // Filtrer uniquement les rappels liés aux workouts
      const workoutReminders = updateWorkoutPreferencesDto.reminders?.filter(
        (r) =>
          ['EXERCISE', 'WORKOUT_SCHEDULE'].includes(r.type) ||
          r.type === 'EXERCISE',
      );

      const result = await this.updateSettingsUseCase.execute({
        userId: req.user.id,
        objectives: updateWorkoutPreferencesDto.objectives,
        reminders: workoutReminders,
      });

      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour des préférences d'entraînement";
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @ApiOperation({ summary: 'Mettre à jour les préférences de notifications' })
  @ApiBody({ type: UpdateNotificationPreferencesDto })
  @ApiResponse({
    status: 200,
    description: 'Préférences de notifications mises à jour avec succès',
    type: UpdateSettingsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides ou erreur de validation',
  })
  @Put('preferences/notifications')
  async updateNotificationPreferences(
    @Body() updateNotificationPreferencesDto: UpdateNotificationPreferencesDto,
    @Request() req: any,
  ): Promise<UpdateSettingsResponseDto> {
    try {
      // Filtrer uniquement les rappels liés aux notifications
      const notificationReminders =
        updateNotificationPreferencesDto.reminders?.filter((r) =>
          [
            'PERIOD_START',
            'OVULATION',
            'MEDICATION',
            'MOOD_TRACKING',
            'SYMPTOM_LOGGING',
            'WATER_INTAKE',
            'SLEEP_REMINDER',
          ].includes(r.type),
        );

      let settings = undefined;
      if (
        updateNotificationPreferencesDto.generalEnabled !== undefined ||
        updateNotificationPreferencesDto.defaultTime !== undefined
      ) {
        settings = {
          notificationEnabled: updateNotificationPreferencesDto.generalEnabled,
          notificationTime: updateNotificationPreferencesDto.defaultTime,
        };
      }

      const result = await this.updateSettingsUseCase.execute({
        userId: req.user.id,
        settings,
        reminders: notificationReminders,
      });

      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la mise à jour des préférences de notifications';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
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
