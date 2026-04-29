import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import {
  ApiErrorResponseDto,
  ValidationErrorResponseDto,
} from '../common/http/api-error-response.dto';
import { AuthService } from './auth.service';
import type { AuthenticatedUser, AuthTokenResponse } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiBody({
    type: LoginDto,
    description: 'Local login credentials for an admin or customer user.',
    examples: {
      customer: {
        summary: 'Customer login',
        value: {
          email: 'customer@aura.local',
          password: 'Customer123!',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Returns a JWT access token and authenticated user profile.',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        tokenType: 'Bearer',
        expiresIn: '15m',
        user: {
          userId: 'customer-local',
          email: 'customer@aura.local',
          role: 'CUSTOMER',
          displayName: 'Aura Customer',
          provider: 'local',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed for the login request body.',
    type: ValidationErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'The submitted email/password combination is invalid.',
    type: ApiErrorResponseDto,
  })
  login(@Req() req: Request & { user: AuthenticatedUser }): AuthTokenResponse {
    return this.authService.issueToken(req.user);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({
    type: RegisterDto,
    description: 'User registration details',
    examples: {
      default: {
        summary: 'New user registration',
        value: {
          email: 'newuser@example.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Returns a JWT access token and authenticated user profile.',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        tokenType: 'Bearer',
        expiresIn: '15m',
        user: {
          userId: 'new-user-id',
          email: 'newuser@example.com',
          role: 'CUSTOMER',
          displayName: 'John Doe',
          provider: 'local',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed for the registration request body.',
    type: ValidationErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Email already registered.',
    type: ApiErrorResponseDto,
  })
  async register(@Body() dto: RegisterDto): Promise<AuthTokenResponse> {
    return this.authService.register(dto);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Start Google OAuth login' })
  googleLogin(): void {
    // Redirect handled by Passport.
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  googleCallback(
    @Req() req: Request & { user: AuthenticatedUser },
  ): AuthTokenResponse {
    return this.authService.issueToken(req.user);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  @ApiOkResponse({
    description: 'Returns the authenticated user profile from the JWT context.',
    schema: {
      example: {
        userId: 'admin-local',
        email: 'admin@aura.local',
        role: 'ADMIN',
        displayName: 'Aura Admin',
        provider: 'local',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'A valid bearer token is required to access the profile.',
    type: ApiErrorResponseDto,
  })
  profile(
    @Req() req: Request & { user: AuthenticatedUser },
  ): AuthenticatedUser {
    return req.user;
  }
}
