# User Registration Design

## Overview

Add user self-registration to Aura backend. New users register with email/password and immediately receive a JWT token for login.

## Endpoint

`POST /auth/register`

## Request Body

```typescript
{
  email: string;        // required, valid email
  password: string;     // required, min 8 chars
  firstName?: string;    // optional
  lastName?: string;     // optional
}
```

## Response (201 Created)

```typescript
{
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: {
    userId: string;
    email: string;
    role: 'CUSTOMER';
    displayName: string;   // "FirstName LastName" or email
    provider: 'local';
  }
}
```

## Data Flow

1. Normalize email (trim, lowercase)
2. Hash password with bcrypt (12 rounds)
3. Create User record in Prisma with role=CUSTOMER, isActive=true
4. Issue JWT token
5. Return token + user profile

## Error Handling

| Status | Scenario |
|--------|----------|
| 400 | Validation failed (invalid email, password < 8 chars) |
| 409 | Email already exists (DB unique constraint violation) |
| 500 | Unexpected server error |

## Components

1. **RegisterDto** - request validation with class-validator
2. **AuthService.register()** - create user, hash password, issue token
3. **AuthController.register()** - POST endpoint with Swagger docs

## Dependencies

- bcryptjs (already in project for password comparison)
- class-validator for DTO validation
- Prisma for User model

## Acceptance Criteria

- [ ] POST /auth/register returns 201 with JWT on success
- [ ] Password is hashed before storing
- [ ] New users get CUSTOMER role
- [ ] Duplicate email returns 409
- [ ] Invalid input returns 400 with validation errors