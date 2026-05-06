import { ConflictException } from '@nestjs/common';
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