---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
---

# Implementation Guide

## Development Setup
**How do we get started?**

### Prerequisites and dependencies
- `pnpm` workspaces remain enabled
- Node.js compatible with both NestJS and Next.js `16.x` (recommended `>=20.9.0`)
- Existing Aura Docker/local-stack services remain available for integration checks
- Current backend and storefront should be green before the migration starts

### Environment setup steps
1. Add **Turborepo** at the repo root and create `turbo.json`
2. Keep `pnpm-workspace.yaml` as the workspace source of truth
3. Move the NestJS app into **`apps/backend`**
4. Keep the storefront in **`apps/storefront`**
5. Reserve **`apps/admin`** for later, either as a placeholder or documented future path
6. Preserve local env defaults such as:
   - backend on `http://localhost:3000`
   - storefront on `http://localhost:3001`
   - API base path `/api/v1`

## Code Structure
**How is the code organized?**

### Recommended target structure
```text
apps/
  backend/
    src/
    prisma/
    test/
    package.json
    nest-cli.json
    tsconfig.json
    tsconfig.build.json
  storefront/
    app/
    components/
    lib/
    package.json
  admin/          # optional placeholder / future app
packages/
  eslint-config/
  typescript-config/
  shared/         # optional later if real reuse appears

turbo.json
pnpm-workspace.yaml
package.json
README.md
docker-compose.yml
```

### Module organization
- The **repo root** should focus on orchestration and shared documentation only.
- Each app owns its own runtime config, scripts, and framework-specific files.
- Shared code should be extracted only if it is truly reused across more than one app.

### Naming conventions
- App folders live under `apps/*`
- Reusable internal packages live under `packages/*`
- Prefer descriptive package names such as `@repo/eslint-config`, `@repo/typescript-config`, `@repo/shared-types`

## Implementation Notes
**Key technical details to remember:**

### Core Features
- **Feature 1: Turborepo orchestration**
  - Root scripts should delegate to `turbo run build`, `turbo run dev`, `turbo run lint`, and `turbo run test`
  - Cache build outputs where appropriate (for example Next.js `.next/**` and NestJS `dist/**`)

- **Feature 2: App separation**
  - Move the backend into `apps/backend` so it no longer owns the repo root
  - Keep the storefront isolated in `apps/storefront`
  - Ensure inter-app communication still targets the backend over `/api/v1`

- **Feature 3: Shared config packages**
  - Centralize ESLint/TypeScript presets first
  - Defer larger shared-code packages until real duplication emerges

### Patterns & Best Practices
- Keep the **root lightweight**: it should orchestrate tasks, not contain app-specific business code
- Avoid cross-app imports except through explicit workspace packages
- Preserve existing app-local commands so debugging remains simple
- Migrate one layer at a time: structure first, then scripts/config, then verification

## Integration Points
**How do pieces connect?**

### API integration details
- `apps/storefront` keeps consuming Aura backend endpoints under `AURA_API_BASE_URL`
- A future `apps/admin` should use the same backend and RBAC model
- No backend contract redesign is needed for the monorepo migration

### Database and infrastructure connections
- Prisma schema/seed workflow likely moves with the backend into `apps/backend/prisma`
- Docker Compose can remain at the root for workspace-level orchestration
- Backend Dockerfile can either move into `apps/backend` or remain root-level with updated build context

### Third-party service setup
- Stripe, Redis, RustFS, and Postgres wiring remain backend concerns
- Turborepo should not change runtime secrets handling; each app keeps its own env scope

## Error Handling
**How do we handle failures?**

- Treat the migration as a path-sensitive change and verify each step before continuing
- If a moved config breaks builds/tests, fix the specific path/reference rather than stacking broad changes
- Keep rollback simple by moving files in clear phases and verifying after each milestone
- Update documentation immediately when a command or path changes

## Performance Considerations
**How do we keep it fast?**

- Use Turborepo caching for `build`, `lint`, `test`, and optional `typecheck`
- Define outputs carefully so cache hits are useful and deterministic
- Avoid unnecessary shared-package churn that would invalidate multiple apps’ caches
- Keep app boundaries clean so only changed projects rerun in CI

## Security Notes
**What security measures are in place?**

- Preserve current secure auth/session handling in the storefront
- Keep secrets in app-scoped env files rather than shared packages
- Avoid exposing backend-only configs to frontend bundles during the migration
- Ensure future admin tooling follows the same RBAC and secure API access patterns already established in Aura
