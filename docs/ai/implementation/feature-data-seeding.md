---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
---

# Implementation Guide

## Development Setup
**How do we get started?**

- Ensure dependencies are installed with `pnpm install`
- Confirm `DATABASE_URL` points to a local/dev PostgreSQL instance
- Apply migrations before seeding (`pnpm prisma:migrate:dev` or equivalent)
- Run the seed workflow through the agreed script entrypoint, e.g. `pnpm seed`

## Code Structure
**How is the code organized?**

Suggested structure:

```text
src/
  seeding/
    seeding.module.ts
    seeding.service.ts
    fixtures/
      users.fixtures.ts
      catalog.fixtures.ts
      coupons.fixtures.ts
prisma/
  seed.ts
```

### Module organization
- `SeedingModule` should depend on `PrismaModule`
- `SeedingService` should coordinate all seed groups and expose a single `seed()` method
- Fixture data should live in dedicated files rather than being hard-coded inline across services

## Implementation Notes
**Key technical details to remember:**

### Core Features
- **User seeding**: create or update the canonical admin/customer accounts using stable emails and expected roles
- **Catalog seeding**: create categories, tags, products, variants, and prices using stable slugs and SKUs
- **Coupon seeding**: upsert known codes used in tests/demos (for example `AURA20`)
- **Profile support**: keep the design open for `minimal` and `demo` datasets if the fixture volume grows

### Patterns & Best Practices
- Prefer **Prisma `upsert`** or `connectOrCreate` over destructive delete/recreate flows
- Keep fixture identifiers stable and human-readable
- Use **transactions** for related writes when partial failure would leave the dataset inconsistent
- Keep seed definitions **deterministic** so repeated runs are predictable
- Align seeded credentials and product examples with existing docs and e2e expectations

## Integration Points
**How do pieces connect?**

- **Prisma**: primary persistence layer for all seeded records
- **Auth flows**: seeded users should match the credentials expected in login/e2e scenarios
- **Catalog/cart/checkout flows**: seeded products, SKUs, and coupons should support existing regression tests and Swagger demos
- **Inventory**: if inventory remains DB-backed on variants, seed `inventoryOnHand` directly with product variants instead of using ad hoc runtime-only state

## Error Handling
**How do we handle failures?**

- Fail fast if the database is unavailable or not configured
- Log a clear per-step summary (users, catalog, coupons) and a final success/failure status
- Surface operator-friendly errors when a relation or unique constraint blocks seeding unexpectedly
- Avoid deleting non-seeded records unless an explicit reset mode is introduced later

## Performance Considerations
**How do we keep it fast?**

- Batch fixture writes where possible
- Avoid re-writing unchanged records unnecessarily on every run
- Keep the default dataset small but representative
- Separate minimal/demo profiles if heavier seed sets are introduced later

## Security Notes
**What security measures are in place?**

- Do not expose seeding as a public HTTP endpoint in v1
- Treat default seeded credentials as **local/demo-only** values
- Add a production/environment safety check before running the workflow
- Keep secrets and password hashing logic consistent with the existing auth approach
