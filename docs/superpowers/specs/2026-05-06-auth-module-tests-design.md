# Auth Module Test Design

## Overview

Add unit tests for auth module (AuthService + AuthController) following existing backend test patterns.

## Test Structure

| File | Coverage |
|------|----------|
| `auth.service.spec.ts` | AuthService business logic |
| `auth.controller.spec.ts` | AuthController HTTP tests |

Pattern: Direct instantiation with fallback seed data (no mocking Prisma).

---

## AuthService Test Cases

### validateLocalUser()

| Test | Input | Expected |
|------|-------|----------|
| Success with valid credentials | Email + password (DB user) | AuthenticatedUser |
| Success with fallback user | `customer@aura.local` / `Customer123!` | AuthenticatedUser |
| Invalid password | Valid email, wrong password | UnauthorizedException |
| Unknown email | Non-existent email | UnauthorizedException |

### issueToken()

| Test | Expected |
|------|----------|
| Token response shape | accessToken, tokenType: "Bearer", expiresIn, user |
| JWT payload | sub: userId, email, role |

### register()

| Test | Input | Expected |
|------|-------|----------|
| Success | New email + password | AuthTokenResponse |
| Duplicate email | Existing email | ConflictException |

### createGoogleUser()

| Test | Input | Expected |
|------|-------|----------|
| Full profile | Google profile with email | AuthenticatedUser (provider: google) |
| Minimal profile | Google ID only | AuthenticatedUser (email: `google-{id}@aura.local`) |

---

## AuthController Test Cases

### POST /auth/login

- Calls AuthService.validateLocalUser() + issueToken()
- Returns 200 with token

### POST /auth/register

- Calls AuthService.register()
- Returns 201 with token
- Duplicate email → 409 Conflict

---

## Implementation Notes

- Use `SEED_LOCAL_USERS` from `users.fixtures` for fallback validation
- Mock JwtService for issueToken tests (or call real JWT sign)
- Use real bcrypt compare for password validation tests
- Controller tests: use supertest or minimal HTTP test approach