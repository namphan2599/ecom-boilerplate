# Auth Module Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add unit tests for AuthService and AuthController

**Architecture:** Direct service instantiation with fallback seed data (matching existing backend test patterns)

**Tech Stack:** Jest, NestJS testing utilities

---

## File Structure

| File | Action |
|------|--------|
| `apps/backend/src/auth/auth.service.spec.ts` | Create |
| `apps/backend/src/auth/auth.controller.spec.ts` | Create |

---

## Task 1: AuthService Tests

**Files:**
- Create: `apps/backend/src/auth/auth.service.spec.ts`

- [ ] **Step 1: Write auth.service.spec.ts**

```typescript
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
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `pnpm --dir apps/backend test --testPathPattern=auth.service.spec.ts --runInBand`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/auth/auth.service.spec.ts
git commit -m "test: add AuthService unit tests"
```

---

## Task 2: AuthController Tests

**Files:**
- Create: `apps/backend/src/auth/auth.controller.spec.ts`

- [ ] **Step 1: Write auth.controller.spec.ts**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AuthController } from './auth.controller';
import { AuthService, AuthTokenResponse } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: Partial<AuthService>;

  beforeEach(async () => {
    mockAuthService = {
      validateLocalUser: jest.fn(),
      issueToken: jest.fn(),
      register: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('login', () => {
    it('issues token for authenticated user', () => {
      const mockUser = {
        userId: 'customer-local',
        email: 'customer@aura.local',
        role: 'CUSTOMER' as const,
        provider: 'local' as const,
      };
      const mockToken: AuthTokenResponse = {
        accessToken: 'token',
        tokenType: 'Bearer',
        expiresIn: '15m',
        user: mockUser,
      };

      (mockAuthService.issueToken as jest.Mock).mockReturnValue(mockToken);

      const result = controller.login({ user: mockUser } as any);

      expect(mockAuthService.issueToken).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockToken);
    });
  });

  describe('register', () => {
    it('registers new user and returns token', async () => {
      const registerDto = {
        email: 'newuser@test.com',
        password: 'Password123!',
        firstName: 'New',
        lastName: 'User',
      };
      const mockToken: AuthTokenResponse = {
        accessToken: 'token',
        tokenType: 'Bearer',
        expiresIn: '15m',
        user: {
          userId: 'new-id',
          email: 'newuser@test.com',
          role: 'CUSTOMER' as const,
          provider: 'local' as const,
        },
      };

      (mockAuthService.register as jest.Mock).mockResolvedValue(mockToken);

      const result = await controller.register(registerDto as any);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockToken);
    });

    it('throws ConflictException on duplicate email', async () => {
      const registerDto = {
        email: 'existing@test.com',
        password: 'Password123!',
      };

      (mockAuthService.register as jest.Mock).mockRejectedValue(
        new ConflictException('An account with this email already exists')
      );

      await expect(controller.register(registerDto as any)).rejects.toThrow(ConflictException);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `pnpm --dir apps/backend test --testPathPattern=auth.controller.spec.ts --runInBand`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/backend/src/auth/auth.controller.spec.ts
git commit -m "test: add AuthController unit tests"
```

---

## Spec Coverage Check

| Requirement | Task |
|--------------|------|
| validateLocalUser() tests | Task 1 |
| issueToken() tests | Task 1 |
| register() tests | Task 1 |
| createGoogleUser() tests | Task 1 |
| POST /auth/login | Task 2 |
| POST /auth/register | Task 2 |

All requirements covered.