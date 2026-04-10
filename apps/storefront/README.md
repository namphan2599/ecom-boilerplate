# Aura Storefront (`apps/storefront`)

This Next.js App Router app provides a shopper-facing frontend scaffold for the Aura e-commerce backend.

## Local development

From the repo root:

```bash
# start the NestJS backend and supporting services (choose the mode you use locally)
pnpm run docker:up
# or
pnpm run start:dev

# in another terminal, start the storefront on port 3001
pnpm storefront:dev
```

Open:

- Storefront: `http://localhost:3001`
- Aura API docs: `http://localhost:3000/api/docs`

## Environment

Copy the example values into `.env.local` if you want local overrides:

```bash
AURA_API_BASE_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_STOREFRONT_URL=http://localhost:3001
```

## Demo credentials

Use the seeded local accounts:

- `customer@aura.local` / `Customer123!`
- `admin@aura.local` / `Admin123!`

## Verification commands

```bash
pnpm storefront:lint
pnpm storefront:test
pnpm storefront:build
```

## Current storefront scope

- Landing page + product catalog browse
- Product detail page
- Login via Aura `/auth/login`
- Authenticated cart management
- Hosted checkout redirect
- Authenticated order history

