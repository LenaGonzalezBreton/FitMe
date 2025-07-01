import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Core imports
import { CoreModule } from '../../core/core.module';

// Domain
// import { IUserRepository } from './domain/auth.repository';

// Application
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';

// Infrastructure
import { PrismaUserRepository } from './infrastructure/prisma-user.repository';
import { PrismaRefreshTokenRepository } from './infrastructure/prisma-refresh-token.repository';

// Controller
import { AuthController } from './controller/auth.controller';

// Guards & Strategies
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// Token string constants for DI
export const USER_REPOSITORY_TOKEN = 'USER_REPOSITORY';
export const REFRESH_TOKEN_REPOSITORY_TOKEN = 'REFRESH_TOKEN_REPOSITORY';

@Module({
  imports: [
    CoreModule,
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
    // Strategies
    JwtStrategy,

    // Guards
    JwtAuthGuard,

    // Use Cases
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,

    // Repository Implementations
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: PrismaUserRepository,
    },
    {
      provide: REFRESH_TOKEN_REPOSITORY_TOKEN,
      useClass: PrismaRefreshTokenRepository,
    },
  ],
  exports: [JwtAuthGuard, JwtStrategy, USER_REPOSITORY_TOKEN, REFRESH_TOKEN_REPOSITORY_TOKEN],
})
export class AuthModule {}
