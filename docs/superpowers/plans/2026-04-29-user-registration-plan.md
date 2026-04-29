# User Registration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add user self-registration endpoint that creates a User record with hashed password and returns JWT token.

**Architecture:** New endpoint POST /auth/register in existing auth module. Uses bcrypt for hashing, class-validator for DTO, Prisma for persistence.

**Tech Stack:** NestJS, Prisma, bcryptjs, class-validator, Jest

---

### Task 1: Create RegisterDto

**Files:**
- Create: `apps/backend/src/auth/dto/register.dto.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  it('should be defined', () => {
    expect(new RegisterDto()).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm backend:test -- --testPathPattern=register.dto`
Expected: FAIL (file not found)

- [ ] **Step 3: Write minimal implementation**

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John', required: false })
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsString()
  lastName?: string;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm backend:test -- --testPathPattern=register.dto`
Expected: PASS

- [ ] **Step 5: Commit**

---

### Task 2: Add register method to AuthService

**Files:**
- Modify: `apps/backend/src/auth/auth.service.ts`
- Test: existing auth.service.spec.ts or create new

- [ ] **Step 1: Write the failing test**

```typescript
describe('AuthService', () => {
  describe('register', () => {
    it('should create a new user and return token', async () => {
      const result = await authService.register({
        email: 'newuser@test.com',
        password: 'Password123!',
        firstName: 'New',
        lastName: 'User',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.user.email).toBe('newuser@test.com');
      expect(result.user.role).toBe('CUSTOMER');
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm backend:test -- --testPathPattern=auth.service`
Expected: FAIL (register method not defined)

- [ ] **Step 3: Add import for hash**

In auth.service.ts, add import:
```typescript
import { hash } from 'bcryptjs';
```

- [ ] **Step 4: Write register method**

Add to AuthService class:
```typescript
async register(data: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<AuthTokenResponse> {
  const normalizedEmail = data.email.trim().toLowerCase();
  const passwordHash = await hash(data.password, 12);

  const user = await this.prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: AppRole.CUSTOMER,
      isActive: true,
    },
  });

  const authenticatedUser: AuthenticatedUser = {
    userId: user.id,
    email: user.email,
    role: user.role as AppRole,
    displayName:
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      user.email,
    provider: 'local',
  };

  return this.issueToken(authenticatedUser);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm backend:test -- --testPathPattern=auth.service`
Expected: PASS

- [ ] **Step 6: Commit**

---

### Task 3: Add register endpoint to AuthController

**Files:**
- Modify: `apps/backend/src/auth/auth.controller.ts`

- [ ] **Step 1: Add RegisterDto import**

At top of file, add:
```typescript
import { RegisterDto } from './dto/register.dto';
```

- [ ] **Step 2: Add register endpoint**

After login() method, add endpoint code (see Step 3 below for the full implementation).

- [ ] **Step 3: Add register endpoint with @Body**

Wait — the register endpoint doesn't use a guard. It should call authService.register() directly with the body. Let me fix:

```typescript
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
async register(
  @Req() req: Request & { user: AuthenticatedUser },
): Promise<AuthTokenResponse> {
  const registerDto = req.body as RegisterDto;
  return this.authService.register(registerDto);
}
```

Actually this is wrong too — need to use @Body() decorator. Let me correct:

- [ ] **Step 3: Add register endpoint with @Body**

Add import and method:
```typescript
import { Body, Post } from '@nestjs/common';

// ... in the class:

@Post('register')
@ApiOperation({ summary: 'Register a new user account' })
@ApiBody({
  type: RegisterDto,
  description: 'User registration details',
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
async register(@Body() dto: RegisterDto): Promise<AuthTokenResponse> {
  return this.authService.register(dto);
}
```

- [ ] **Step 4: Add ApiConflictResponse import**

Check that ApiConflictResponse is imported, or use ApiResponse with status: 409.

```typescript
import { ApiConflictResponse, ApiResponse, ... } from '@nestjs/swagger';
```

- [ ] **Step 5: Test the endpoint**

Run: `pnpm backend:dev`
Then in another terminal:
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Password123!"}'
```

Expected: 201 with JWT token

- [ ] **Step 6: Commit**

---

### Task 4: Handle duplicate email (409 Conflict)

**Files:**
- Modify: `apps/backend/src/auth/auth.service.ts`

- [ ] **Step 1: Write test for duplicate email**

```typescript
it('should throw ConflictException if email exists', async () => {
  await expect(() =>
    authService.register({
      email: 'existing-user@aura.local',
      password: 'Password123!',
    }),
  ).rejects.toThrow('Email already registered');
});
```

- [ ] **Step 2: Run test to verify it fails**

Expected: FAIL (no error thrown)

- [ ] **Step 3: Add Prisma.PrismaClientKnownRequestError handling**

In register method, wrap user.create in try-catch:

```typescript
import { ConflictException, ... } from '@nestjs/common';
import { Prisma } from '@prisma/client';

try {
  const user = await this.prisma.user.create({
    data: { ... },
  });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw new ConflictException('Email already registered');
    }
  }
  throw error;
}
```

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Commit**

---

## Verification

After all tasks:

```bash
pnpm lint
pnpm typecheck
pnpm backend:test
```

Manual test:
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test2@test.com","password":"Password123!"}'
# Should return 201 with JWT

curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test2@test.com","password":"Password123!"}'
# Should return 409 Conflict
```

## File Summary

| Action | File |
|--------|------|
| Create | `apps/backend/src/auth/dto/register.dto.ts` |
| Modify | `apps/backend/src/auth/auth.service.ts` |
| Modify | `apps/backend/src/auth/auth.controller.ts` |