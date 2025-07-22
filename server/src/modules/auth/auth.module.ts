import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Core imports
import { CoreModule } from '../../core/core.module';
import { CycleModule } from '../cycle/cycle.module';

// Domain
// import { IUserRepository } from './domain/auth.repository';

// Application
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';

import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case';
import { GetSettingsUseCase } from './application/use-cases/get-settings.use-case';
import { UpdateSettingsUseCase } from './application/use-cases/update-settings.use-case';
import { GetPreferencesUseCase } from './application/use-cases/get-preferences.use-case';
=======
import { CompleteOnboardingUseCase } from './application/use-cases/complete-onboarding.use-case';


// Infrastructure
import { PrismaUserRepository } from './infrastructure/prisma-user.repository';
import { PrismaRefreshTokenRepository } from './infrastructure/prisma-refresh-token.repository';
import { PrismaUserSettingsRepository } from './infrastructure/prisma-user-settings.repository';

// Controller
import { AuthController } from './controller/auth.controller';

// Guards & Strategies
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// Token string constants for DI
import {
  USER_REPOSITORY_TOKEN,
  REFRESH_TOKEN_REPOSITORY_TOKEN,
  USER_SETTINGS_REPOSITORY_TOKEN,
} from './tokens';

@Module({
  imports: [
    CoreModule,
    ConfigModule,
    CycleModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'your-secret-key'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    JwtAuthGuard,
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase
    UpdateProfileUseCase,
    ChangePasswordUseCase,
    GetSettingsUseCase,
    UpdateSettingsUseCase,
    GetPreferencesUseCase,

    CompleteOnboardingUseCase,

    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: PrismaUserRepository,
    },
    {
      provide: REFRESH_TOKEN_REPOSITORY_TOKEN,
      useClass: PrismaRefreshTokenRepository,
    },
    {
      provide: USER_SETTINGS_REPOSITORY_TOKEN,
      useClass: PrismaUserSettingsRepository,
    },
  ],
  exports: [
    JwtAuthGuard,
    JwtStrategy,
    USER_REPOSITORY_TOKEN,
    REFRESH_TOKEN_REPOSITORY_TOKEN,
  ],
})
export class AuthModule {}
