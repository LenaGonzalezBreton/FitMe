import { Injectable } from '@nestjs/common';

export interface LanguageOption {
  value: 'FRENCH' | 'ENGLISH';
  label: string;
  nativeName: string;
  description: string;
}

export interface GetAvailableLanguagesResponse {
  success: boolean;
  data: LanguageOption[];
  message: string;
}

@Injectable()
export class GetAvailableLanguagesUseCase {
  async execute(): Promise<GetAvailableLanguagesResponse> {
    const languages: LanguageOption[] = [
      {
        value: 'FRENCH',
        label: 'Français',
        nativeName: 'Français',
        description: 'Langue française',
      },
      {
        value: 'ENGLISH',
        label: 'English',
        nativeName: 'English',
        description: 'English language',
      },
    ];

    return {
      success: true,
      data: languages,
      message: 'Available languages retrieved successfully',
    };
  }
}
