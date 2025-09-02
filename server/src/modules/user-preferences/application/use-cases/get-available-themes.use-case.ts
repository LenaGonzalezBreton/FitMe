import { Injectable } from '@nestjs/common';

export interface ThemeOption {
  value: 'LIGHT' | 'DARK' | 'AUTO';
  label: string;
  description: string;
}

export interface GetAvailableThemesResponse {
  success: boolean;
  data: ThemeOption[];
  message: string;
}

@Injectable()
export class GetAvailableThemesUseCase {
  async execute(): Promise<GetAvailableThemesResponse> {
    const themes: ThemeOption[] = [
      {
        value: 'LIGHT',
        label: 'Clair',
        description: 'Thème clair pour une utilisation en journée',
      },
      {
        value: 'DARK',
        label: 'Sombre',
        description: 'Thème sombre pour une utilisation nocturne',
      },
      {
        value: 'AUTO',
        label: 'Automatique',
        description: 'S\'adapte automatiquement à votre système',
      },
    ];

    return {
      success: true,
      data: themes,
      message: 'Available themes retrieved successfully',
    };
  }
}
