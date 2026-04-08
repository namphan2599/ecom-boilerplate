---
phase: deployment
title: Deployment Strategy
description: Define deployment process, infrastructure, and release procedures
---

# Deployment Strategy

## Infrastructure
**Where will the application run?**

- **Development:** local `docker compose` for PostgreSQL, Redis, and LocalStack with the NestJS API started via `pnpm start:dev`
- **Staging:** one containerized API instance plus managed PostgreSQL and Redis for release validation and webhook smoke tests
- **Production:** at least two stateless API instances behind HTTPS load balancing, managed PostgreSQL, managed Redis, and object storage compatible with the configured S3 settings
- **Environment separation:** isolated `.env` values, databases, Redis namespaces, Stripe secrets, and storage buckets per environment

## Deployment Pipeline
**How do we deploy changes?**

### Build Process
1. `pnpm install --frozen-lockfile`
2. `pnpm build`
3. `pnpm test -- --runInBand`
4. `pnpm test:e2e`
5. `pnpm prisma:generate`
6. `pnpm prisma migrate deploy`
7. `pnpm start:prod`

### CI/CD Pipeline
- Block merges unless build, unit/integration tests, and e2e checks pass
- Build one immutable artifact/container image per commit
- Promote the same artifact from staging to production after smoke validation
- Run readiness probes against `/api/v1/health/ready` before shifting traffic

## Environment Configuration
**What settings differ per environment?**

### Development
- `NODE_ENV=development`
- `LOG_LEVEL=debug`
- `STRICT_HEALTH_CHECKS=false`
- Local `DATABASE_URL` / `REDIS_URL` / LocalStack values from `.env.example`

### Staging
- Production-like secrets and webhook configuration with non-production Stripe keys
- `STRICT_HEALTH_CHECKS=true` so dependency failures return non-ready status codes
- Deployment gated by health probe and checkout/webhook smoke tests

### Production
- `NODE_ENV=production`
- `LOG_LEVEL=info`
- `STRICT_HEALTH_CHECKS=true`
- Secrets supplied by the hosting platform or secret manager, never committed to the repo
- Monitoring and alerting attached to log streams plus `/api/v1/health/live` and `/api/v1/health/ready`

## Deployment Steps
**What's the release process?**

1. **Pre-deployment checklist**
   - Confirm `pnpm build`, `pnpm test -- --runInBand`, and `pnpm test:e2e` are green
   - Verify Stripe webhook secrets, JWT secret, DB, and Redis values are present
   - Review any Prisma migrations for compatibility and backup requirements
2. **Deployment execution**
   - Deploy the new artifact
   - Run `pnpm prisma migrate deploy`
   - Start or roll the API instances
3. **Post-deployment validation**
   - Check `/api/v1/health/live` and `/api/v1/health/ready`
   - Open `/api/docs` and confirm the API is reachable
   - Exercise login, cart, checkout-session creation, and webhook delivery
4. **Rollback**
   - Stop traffic to the new release
   - Re-deploy the previous known-good artifact
   - Restore DB from backup only if a destructive migration requires it

## Database Migrations
**How do we handle schema changes?**

- Use Prisma migrations committed to source control
- Apply schema changes with `pnpm prisma migrate deploy` during rollout
- Take a managed database snapshot before risky production migrations
- Prefer additive changes first; remove columns only after application compatibility is confirmed

## Secrets Management
**How do we handle sensitive data?**

- Required secrets include `JWT_SECRET`, Stripe keys, webhook secret, DB credentials, Redis URL, and S3 credentials
- Store secrets in the host platform secret manager or CI/CD vault
- Rotate Stripe and JWT secrets on a schedule and after any exposure event
- Redacted headers such as `Authorization` and cookies stay out of structured request logs

## Rollback Plan
**What if something goes wrong?**

- **Triggers:** failing readiness probe, rising 5xx rate, webhook failures, or order/stock mismatch symptoms
- **Immediate steps:** route traffic back to the previous release, inspect structured logs by `x-request-id`, and validate DB/Redis reachability
- **Communication:** post the incident summary, affected scope, and rollback status to the team channel and incident log

