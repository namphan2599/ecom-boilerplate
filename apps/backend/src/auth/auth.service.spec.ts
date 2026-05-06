import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { SEED_LOCAL_USERS } from '../seeding/fixtures/users.fixtures';

describe('AuthService', () => {
  let service: AuthService;
  let mockJwtService: Partial<JwtService>;

  beforeEach(() => {
    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-token'),
    };
    service = new AuthService(mockJwtService as JwtService, {
      isReady: () => false,
    } as any);
  });

  describe('validateLocalUser', () => {
    it('validates fallback customer user successfully', async () => {
      const user = await service.validateLocalUser('customer@aura.local', 'Customer123!');
      
      expect(user.email).toBe('customer@aura.local');
      expect(user.role).toBe('CUSTOMER');
      expect(user.provider).toBe('local');
    });

    it('validates fallback admin user successfully', async () => {
      const user = await service.validateLocalUser('admin@aura.local', 'Admin123!');
      
      expect(user.email).toBe('admin@aura.local');
      expect(user.role).toBe('ADMIN');
    });

    it('throws on invalid password', async () => {
      await expect(
        service.validateLocalUser('customer@aura.local', 'wrongpassword')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws on unknown email', async () => {
      await expect(
        service.validateLocalUser('unknown@example.com', 'Password123!')
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('issueToken', () => {
    it('returns token response with expected shape', () => {
      const user = {
        userId: 'test-id',
        email: 'test@aura.local',
        role: 'CUSTOMER' as const,
        provider: 'local' as const,
      };
      
      const token = service.issueToken(user);
      
      expect(token.accessToken).toBe('mock-token');
      expect(token.tokenType).toBe('Bearer');
      expect(token.expiresIn).toBe('15m');
      expect(token.user).toEqual(user);
    });
  });

  describe('createGoogleUser', () => {
    it('creates user from full Google profile', () => {
      const profile = {
        id: 'google-123',
        emails: [{ value: 'user@gmail.com' }],
        displayName: 'Google User',
      };
      
      const user = service.createGoogleUser(profile);
      
      expect(user.userId).toBe('google:google-123');
      expect(user.email).toBe('user@gmail.com');
      expect(user.displayName).toBe('Google User');
      expect(user.provider).toBe('google');
      expect(user.role).toBe('CUSTOMER');
    });

    it('creates user with generated email when profile has none', () => {
      const profile = { id: 'google-456' };
      
      const user = service.createGoogleUser(profile);
      
      expect(user.email).toBe('google-google-456@aura.local');
      expect(user.displayName).toBe('google-google-456@aura.local');
    });
  });
});