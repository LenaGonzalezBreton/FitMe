import { Controller, Get, Put, Body, Request } from '@nestjs/common';
import { GetUserPreferencesUseCase } from '../application/use-cases/get-user-preferences.use-case';
import { UpdateUserPreferencesUseCase } from '../application/use-cases/update-user-preferences.use-case';
import { GetAvailableThemesUseCase } from '../application/use-cases/get-available-themes.use-case';
import { GetAvailableLanguagesUseCase } from '../application/use-cases/get-available-languages.use-case';

@Controller('user-preferences')
export class UserPreferencesController {
  constructor(
    private readonly getUserPreferencesUseCase: GetUserPreferencesUseCase,
    private readonly updateUserPreferencesUseCase: UpdateUserPreferencesUseCase,
    private readonly getAvailableThemesUseCase: GetAvailableThemesUseCase,
    private readonly getAvailableLanguagesUseCase: GetAvailableLanguagesUseCase,
  ) {}

  @Get()
  async getUserPreferences(@Request() req: any) {
    return this.getUserPreferencesUseCase.execute({
      userId: req.user.id,
    });
  }

  @Put()
  async updateUserPreferences(
    @Request() req: any,
    @Body() preferences: {
      theme?: 'LIGHT' | 'DARK' | 'AUTO';
      language?: 'FRENCH' | 'ENGLISH';
      notifications?: {
        email: boolean;
        push: boolean;
        workout: boolean;
        cycle: boolean;
        achievements: boolean;
      };
      privacy?: {
        shareProgress: boolean;
        shareCycle: boolean;
        allowAnalytics: boolean;
      };
    },
  ) {
    return this.updateUserPreferencesUseCase.execute({
      userId: req.user.id,
      ...preferences,
    });
  }

  @Get('themes')
  async getAvailableThemes() {
    return this.getAvailableThemesUseCase.execute();
  }

  @Get('languages')
  async getAvailableLanguages() {
    return this.getAvailableLanguagesUseCase.execute();
  }
}
