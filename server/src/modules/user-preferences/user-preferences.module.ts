import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';

// Application Use Cases
import { GetUserPreferencesUseCase } from './application/use-cases/get-user-preferences.use-case';
import { UpdateUserPreferencesUseCase } from './application/use-cases/update-user-preferences.use-case';
import { GetAvailableThemesUseCase } from './application/use-cases/get-available-themes.use-case';
import { GetAvailableLanguagesUseCase } from './application/use-cases/get-available-languages.use-case';

// Infrastructure Repositories
import { PrismaUserPreferencesRepository } from './infrastructure/prisma-user-preferences.repository';

// Controller
import { UserPreferencesController } from './controller/user-preferences.controller';

// Tokens for DI
import { USER_PREFERENCES_REPOSITORY_TOKEN } from './tokens';

@Module({
  imports: [CoreModule],
  controllers: [UserPreferencesController],
  providers: [
    // Use Cases
    GetUserPreferencesUseCase,
    UpdateUserPreferencesUseCase,
    GetAvailableThemesUseCase,
    GetAvailableLanguagesUseCase,

    // Repository Implementations
    {
      provide: USER_PREFERENCES_REPOSITORY_TOKEN,
      useClass: PrismaUserPreferencesRepository,
    },
  ],
  exports: [
    GetUserPreferencesUseCase,
    UpdateUserPreferencesUseCase,
    GetAvailableThemesUseCase,
    GetAvailableLanguagesUseCase,
    USER_PREFERENCES_REPOSITORY_TOKEN,
  ],
})
export class UserPreferencesModule {}

