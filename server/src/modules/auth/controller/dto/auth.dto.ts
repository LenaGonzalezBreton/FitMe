import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
    }),
    description: 'Informations utilisateur',
  })
  user: {
    id: string;
    email: string;
    firstName?: string;
    profileType?: string;
    contextType?: string;
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
