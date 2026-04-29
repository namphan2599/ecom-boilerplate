# AGENTS.md — Aura E-Commerce Monorepo

## Quick Start

```bash
pnpm install
pnpm db:up          # Docker: PostgreSQL:55432, Redis:56379, RustFS:9100
pnpm prisma:generate
pnpm --dir apps/backend exec prisma db push
pnpm seed          # demo data
pnpm dev           # backend:3000, storefront:3001
```

## Verification Order

```bash
pnpm lint → pnpm typecheck → pnpm test
```

## Testing

```bash
# Backend (Jest)
pnpm backend:test -- --runInBand           # single file: --testPathPattern=filename
pnpm backend:test:e2e                      # requires Docker infra

# Storefront (Vitest)
pnpm storefront:test
```

## App Entrypoints

| App | Command | Port |
|-----|---------|------|
| backend | `pnpm start:dev` | 3000 |
| storefront | `pnpm storefront:dev` | 3001 |

## Monorepo Commands

```bash
pnpm --dir apps/backend exec <command>   # run in specific app
pnpm <app>:dev                        # e.g., pnpm backend:dev
```

## Database

```bash
pnpm prisma:generate         # after schema changes or pull
pnpm prisma:migrate:dev   # create migration
pnpm prisma:studio       # GUI at localhost:5555
```

## Demo Credentials

- Admin: `admin@aura.local` / `Admin123!`
- Customer: `customer@aura.local` / `Customer123!`

## Environment

Required vars (see `apps/backend/.env.example`):
- `DATABASE_URL`
- `REDIS_URL`
- `S3_*` (for media uploads)

Storefront needs `AURA_API_BASE_URL=http://localhost:3000/api/v1`.