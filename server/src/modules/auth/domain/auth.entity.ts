interface PrismaUser {
  id: string;
  email: string;
  passwordHash: string;
  firstName?: string | null;
  profileType?: string | null;
  contextType?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class AuthUser {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly firstName?: string,
    public readonly profileType?: string,
    public readonly contextType?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  static fromPrismaUser(user: PrismaUser): AuthUser {
    return new AuthUser(
      user.id,
      user.email,
      user.passwordHash,
      user.firstName ?? undefined,
      user.profileType ?? undefined,
      user.contextType ?? undefined,
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
