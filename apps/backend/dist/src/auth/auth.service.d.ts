import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
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
export declare class AuthService {
    private readonly jwtService;
    private readonly prisma;
    private readonly fallbackUsers;
    constructor(jwtService: JwtService, prisma: PrismaService);
    validateLocalUser(email: string, password: string): Promise<AuthenticatedUser>;
    issueToken(user: AuthenticatedUser): AuthTokenResponse;
    createGoogleUser(profile: {
        id: string;
        emails?: Array<{
            value: string;
        }>;
        displayName?: string;
    }): AuthenticatedUser;
}
