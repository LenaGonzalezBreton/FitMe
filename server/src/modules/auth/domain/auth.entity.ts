interface PrismaUser {
  id: string;
  email: string;
  passwordHash: string;
  firstName?: string | null;
  birthDate?: Date | null;
  experienceLevel?: string | null;
  onboardingCompleted?: boolean;
  profileType?: string | null;
  contextType?: string | null;
  objective?: string | null;
  sportFrequency?: string | null;
  isMenopausal?: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

export class AuthUser {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly onboardingCompleted: boolean,
    public readonly firstName?: string,
    public readonly birthDate?: Date,
    public readonly experienceLevel?: string,
    public readonly profileType?: string,
    public readonly contextType?: string,
    public readonly objective?: string,
    public readonly sportFrequency?: string,
    public readonly isMenopausal?: boolean,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  static fromPrismaUser(user: PrismaUser): AuthUser {
    return new AuthUser(
      user.id,
      user.email,
      user.passwordHash,
      user.onboardingCompleted ?? false,
      user.firstName ?? undefined,
      user.birthDate ?? undefined,
      user.experienceLevel ?? undefined,
      user.profileType ?? undefined,
      user.contextType ?? undefined,
      user.objective ?? undefined,
      user.sportFrequency ?? undefined,
      user.isMenopausal ?? undefined,
      user.createdAt,
      user.updatedAt,
    );
  }
}

export class AuthTokens {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string,
    public readonly expiresIn: number,
  ) {}
}

export class AuthSession {
  constructor(
    public readonly userId: string,
    public readonly userAgent?: string,
    public readonly ipAddress?: string,
  ) {}
}
