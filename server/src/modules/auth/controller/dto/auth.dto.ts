import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectiveType, ExperienceLevel } from '../../domain/auth.repository';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Adresse email',
  })
  @IsEmail({}, { message: "Format d'email invalide" })
  email: string;

  @ApiProperty({
    example: 'motdepasse123',
    minLength: 8,
    description: 'Mot de passe (min 8 caractères)',
  })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  password: string;

  @ApiProperty({
    example: 'Jane',
    required: false,
    description: 'Prénom',
  })
  @IsOptional()
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  firstName?: string;

  @ApiProperty({
    example: 'FEMALE',
    required: false,
    description: 'Type de profil',
  })
  @IsOptional()
  @IsString({ message: 'Le type de profil doit être une chaîne de caractères' })
  profileType?: string;

  @ApiProperty({
    example: 'CYCLE',
    required: false,
    description: 'Type de contexte',
  })
  @IsOptional()
  @IsString({
    message: 'Le type de contexte doit être une chaîne de caractères',
  })
  contextType?: string;
}

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Adresse email',
  })
  @IsEmail({}, { message: "Format d'email invalide" })
  email: string;

  @ApiProperty({
    example: 'motdepasse123',
    description: 'Mot de passe',
  })
  @IsString({ message: 'Le mot de passe est requis' })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIs...',
    description: 'Token de rafraîchissement JWT',
  })
  @IsString({ message: 'Le token de rafraîchissement est requis' })
  refreshToken: string;
}

export class AuthResponseDto {
  @ApiProperty({
    type: () => ({
      accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
      refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
      expiresIn: { type: 'number', example: 900 },
    }),
    description: 'Tokens JWT retournés après authentification',
  })
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  @ApiProperty({
    type: () => ({
      id: { type: 'string', example: 'cuid_example' },
      email: { type: 'string', example: 'user@example.com' },
      firstName: { type: 'string', example: 'Jane' },
      profileType: { type: 'string', example: 'FEMALE' },
      contextType: { type: 'string', example: 'CYCLE' },
      onboardingCompleted: { type: 'boolean', example: false },
      experienceLevel: { type: 'string', example: 'INTERMEDIATE' },
    }),
    description: 'Informations utilisateur',
  })
  user: {
    id: string;
    email: string;
    firstName?: string;
    profileType?: string;
    contextType?: string;
    onboardingCompleted: boolean;
    experienceLevel?: string;
  };
}

export class TokenResponseDto {
  @ApiProperty({
    type: () => ({
      accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
      refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
      expiresIn: { type: 'number', example: 900 },
    }),
    description: 'Tokens JWT retournés après rafraîchissement',
  })
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export class OnboardingDto {
  @ApiProperty({
    enum: ObjectiveType,
    example: ObjectiveType.GENERAL_FITNESS,
    description: "Objectif principal de l'utilisateur",
  })
  @IsEnum(ObjectiveType)
  objective: ObjectiveType;

  @ApiProperty({
    enum: ExperienceLevel,
    example: ExperienceLevel.INTERMEDIATE,
    description: "Niveau d'expérience sportive de l'utilisateur",
  })
  @IsEnum(ExperienceLevel)
  experienceLevel: ExperienceLevel;

  @ApiProperty({
    example: false,
    description: "Indique si l'utilisatrice est en ménopause",
  })
  @IsBoolean()
  isMenopausal: boolean;

  @ApiProperty({
    required: false,
    example: 28,
    description: 'Durée moyenne du cycle menstruel en jours',
  })
  @IsOptional()
  @IsInt()
  @Min(20)
  @Max(45)
  averageCycleLength?: number;

  @ApiProperty({
    required: false,
    example: 5,
    description: 'Durée moyenne des règles en jours',
  })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(10)
  averagePeriodLength?: number;
}
