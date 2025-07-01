import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: "Format d'email invalide" })
  email: string;

  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  password: string;

  @IsOptional()
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Le type de profil doit être une chaîne de caractères' })
  profileType?: string;

  @IsOptional()
  @IsString({
    message: 'Le type de contexte doit être une chaîne de caractères',
  })
  contextType?: string;
}

export class LoginDto {
  @IsEmail({}, { message: "Format d'email invalide" })
  email: string;

  @IsString({ message: 'Le mot de passe est requis' })
  password: string;
}

export class RefreshTokenDto {
  @IsString({ message: 'Le token de rafraîchissement est requis' })
  refreshToken: string;
}

export class AuthResponseDto {
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  user: {
    id: string;
    email: string;
    firstName?: string;
    profileType?: string;
    contextType?: string;
  };
}

export class TokenResponseDto {
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}
