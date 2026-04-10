import type { Request } from 'express';
import { AuthService } from './auth.service';
import type { AuthenticatedUser, AuthTokenResponse } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(req: Request & {
        user: AuthenticatedUser;
    }): AuthTokenResponse;
    googleLogin(): void;
    googleCallback(req: Request & {
        user: AuthenticatedUser;
    }): AuthTokenResponse;
    profile(req: Request & {
        user: AuthenticatedUser;
    }): AuthenticatedUser;
}
