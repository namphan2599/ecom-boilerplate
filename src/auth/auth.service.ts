import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppRole } from '../common/auth/role.enum';

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
  private readonly fallbackUsers = [
    {
      id: 'admin-local',
      email: 'admin@aura.local',
      password: 'Admin123!',
      role: AppRole.ADMIN,
      displayName: 'Aura Admin',
    },
    {
      id: 'customer-local',
      email: 'customer@aura.local',
      password: 'Customer123!',
      role: AppRole.CUSTOMER,
      displayName: 'Aura Customer',
    },
  ] as const;

  constructor(private readonly jwtService: JwtService) {}

  validateLocalUser(email: string, password: string): AuthenticatedUser {
    const normalizedEmail = email.trim().toLowerCase();
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
