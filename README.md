# Aura Monorepo

Aura is an e-commerce workspace managed with **`pnpm` workspaces** and **Turborepo**.

## Workspace layout

```text
apps/
  backend/      # NestJS API + Prisma + tests
  storefront/   # Next.js shopper UI
packages/
  eslint-config/
  typescript-config/
```

> `apps/admin` is intentionally reserved for a future admin site and is not part of the current implementation scope.

## Getting started

```bash
pnpm install
```

### Repo-wide commands

```bash
# run backend + storefront together
pnpm dev

# verify the full workspace
pnpm build
pnpm lint
pnpm test
pnpm typecheck
```

### App-specific commands

```bash
# backend
pnpm start:dev
pnpm backend:test
pnpm backend:test:e2e

# storefront
pnpm storefront:dev
pnpm storefront:lint
pnpm storefront:test
pnpm storefront:build
```

## Local Docker stack

```bash
# infrastructure only (PostgreSQL + Redis + RustFS)
pnpm db:up

# full stack in Docker (API + PostgreSQL + Redis + RustFS)
pnpm docker:up

# follow API logs
pnpm docker:logs
```

Local endpoints:

- API docs: `http://localhost:3000/api/docs`
- Health: `http://localhost:3000/api/v1/health/ready`
- Storefront: `http://localhost:3001`
- PostgreSQL: `localhost:55432`
- Redis: `localhost:56379`
- RustFS API: `http://localhost:9100`
- RustFS console: `http://localhost:9101`

## Backend (`apps/backend`)

The Aura API remains the source of truth for auth, catalog, cart, checkout, orders, and media storage.

```bash
# host-based backend dev
pnpm start:dev

# production-style build
pnpm backend:build
```

## Storefront (`apps/storefront`)

The shopper-facing Next.js storefront continues to consume Aura at `/api/v1`.

```bash
AURA_API_BASE_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_STOREFRONT_URL=http://localhost:3001
```

## Seed demo data

```bash
# start local infrastructure if running the API on the host
pnpm db:up

# apply the schema (or use your normal migration flow)
pnpm prisma:generate
pnpm --dir apps/backend exec prisma db push

# seed canonical local/demo fixtures
pnpm seed
```

Default demo credentials:

- `admin@aura.local` / `Admin123!`
- `customer@aura.local` / `Customer123!`

Optional profiles:

```bash
pnpm seed -- --profile=minimal
pnpm --dir apps/backend exec prisma db seed -- --profile=demo
```

