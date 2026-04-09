import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AppRole } from '../common/auth/role.enum';
import { SEED_LOCAL_USERS } from '../seeding/fixtures/users.fixtures';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: AppRole;
  displayName?: string;
  provider: 'local' | 'google';
}

export interface AuthTokenResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: AuthenticatedUser;
}

@Injectable()
export class AuthService {
  private readonly fallbackUsers = SEED_LOCAL_USERS;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async validateLocalUser(
    email: string,
    password: string,
  ): Promise<AuthenticatedUser> {
    const normalizedEmail = email.trim().toLowerCase();

    if (this.prisma.isReady()) {
      const user = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (user?.passwordHash && user.isActive) {
        const isPasswordValid = await compare(password, user.passwordHash);

        if (isPasswordValid) {
          return {
            userId: user.id,
            email: user.email,
            role: user.role as AppRole,
            displayName:
              [user.firstName, user.lastName].filter(Boolean).join(' ') ||
              user.email,
            provider: 'local',
          };
        }
      }
    }

    const user = this.fallbackUsers.find(
      (candidate) =>
        candidate.email.toLowerCase() === normalizedEmail &&
        candidate.password === password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
      provider: 'local',
    };
  }

  issueToken(user: AuthenticatedUser): AuthTokenResponse {
    const accessToken = this.jwtService.sign({
      sub: user.userId,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
      user,
    };
  }

  createGoogleUser(profile: {
    id: string;
    emails?: Array<{ value: string }>;
    displayName?: string;
  }): AuthenticatedUser {
    const email = profile.emails?.[0]?.value ?? `google-${profile.id}@aura.local`;

    return {
      userId: `google:${profile.id}`,
      email,
      role: AppRole.CUSTOMER,
      displayName: profile.displayName ?? email,
      provider: 'google',
    };
  }
}
