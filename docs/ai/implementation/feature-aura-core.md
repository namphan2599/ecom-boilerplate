---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
---

# Implementation Guide

## Development Setup
**How do we get started?**

1. Start local dependencies with `docker compose up -d`.
2. Configure environment variables for:
   - `DATABASE_URL`
   - `REDIS_URL`
   - `JWT_SECRET`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`
3. Generate Prisma client and run migrations once the Prisma toolchain is installed.
4. Launch the NestJS API in watch mode and expose Swagger in non-production environments.

## Code Structure
**How is the code organized?**

```text
src/
  auth/
  catalog/
  cart/
  common/
    decorators/
    filters/
    guards/
  discounts/
  inventory/
  orders/
  payments/
  storage/
prisma/
  schema.prisma
docs/ai/
  requirements/
  design/
  planning/
  implementation/
  testing/
```

### Naming conventions
- Module names remain singular and domain-driven (`inventory`, `payments`, `orders`)
- Variant SKUs are the operational identity for purchasable stock
- Controllers expose REST resources; services own business rules and orchestration

## Implementation Notes
**Key technical details to remember:**

### Core Features
- **Catalog**: keep `Product` as the merchandising parent and `ProductVariant` as the purchasable stock unit.
- **Inventory**: reserve stock during checkout creation; only convert reservation into a stock deduction after Stripe success.
- **Coupons**: centralize validation and price calculation so every checkout path uses the same logic.
- **Checkout**: create orders in `PENDING` state first, then finalize via Stripe webhooks.
- **Orders**: persist pricing snapshots so order history remains stable even if catalog data changes later.

### Patterns & Best Practices
- Use **service-level transactions** for stock and order transitions.
- Keep controllers thin and move branching logic into dedicated services.
- Add idempotency around webhook handling and state transitions.
- Prefer explicit DTOs for every request/response pair.

## Integration Points
**How do pieces connect?**

- `prisma/schema.prisma` defines products, variations, coupons, orders, and reservations
- `src/inventory/inventory.service.ts` owns sellable stock calculations and reservation workflows
- `src/payments/stripe-webhook.controller.ts` receives signed Stripe webhook events and delegates to payment/order services
- `docker-compose.yml` provides PostgreSQL, Redis, and LocalStack for local parity

## Error Handling
**How do we handle failures?**

- Use a global exception filter to normalize API error responses
- Log structured request context for checkout, webhook, and stock mutation paths
- Return safe client-facing messages while preserving internal error metadata in logs
- Treat duplicate webhook events as no-op successes after audit logging

## Performance Considerations
**How do we keep it fast?**

- Cache cart state in Redis and optionally cache catalog reads for anonymous browsing
- Add indexes on SKU, slug, order status, and coupon code fields
- Keep webhook handlers short and idempotent so retries remain safe
- Avoid N+1 queries when loading orders with items and variants

## Security Notes
**What security measures are in place?**

- Protect admin routes with RBAC decorators and guards
- Validate all request DTOs at the API boundary
- Verify Stripe webhook signatures before processing
- Never trust client-side price totals; recompute totals server-side on checkout
- Keep secrets in environment variables or a managed secret store
