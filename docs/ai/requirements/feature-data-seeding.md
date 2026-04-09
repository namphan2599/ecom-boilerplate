---
phase: requirements
title: Requirements & Problem Understanding
description: Clarify the problem space, gather requirements, and define success criteria
---

# Requirements & Problem Understanding

## Problem Statement
**What problem are we solving?**

The codebase currently relies on **scattered fallback/demo data** across services such as `AuthService`, `CatalogService`, `DiscountsService`, and `InventoryService`. That helps local execution, but it does not provide a single, repeatable way to populate a real Prisma/PostgreSQL database with known users, products, coupons, and other fixtures.

This creates friction for:

- **Developers** onboarding or resetting local environments
- **QA/testers** who need a stable demo dataset to validate flows repeatedly
- **Demo/staging operators** who need predictable admin/customer accounts and catalog inventory

The new feature adds a dedicated **data seeding module** so the application can bootstrap canonical sample data through one documented workflow instead of ad hoc in-memory defaults.

## Goals & Objectives
**What do we want to achieve?**

### Primary goals
- Add a dedicated module/command for **idempotent data seeding**
- Seed core entities needed for local development and demos:
  - admin and customer users
  - categories and tags
  - products, variants, and price books
  - discount coupons
- Ensure the seed workflow is **safe to re-run** without creating duplicates
- Keep the seeded dataset aligned with existing API examples and e2e expectations

### Secondary goals
- Support repeatable environment setup after `prisma migrate` or DB resets
- Centralize fixture definitions so future features can extend them consistently
- Reduce manual setup time for Swagger-based testing and demos

### Non-goals
- Importing large production catalogs or third-party ERP data
- Building a customer-facing admin UI for seeding
- Backfilling or migrating existing production data
- Generating realistic long-term order history in v1

## User Stories & Use Cases
**How will users interact with the solution?**

- As a **developer**, I want to run one command and get a usable demo dataset so that I can start building immediately.
- As a **QA engineer**, I want stable seeded users, products, and coupons so that my test cases remain repeatable.
- As a **demo operator**, I want a known admin account and sample catalog so that product, cart, and checkout flows can be shown quickly.
- As a **maintainer**, I want seed logic in one module so that new features can extend the dataset without duplicating fixture code.

### Edge cases to consider
- Running the seed command multiple times should not create duplicates
- The database may already contain user-created records that must not be deleted accidentally
- Some environments may not have optional integrations configured (Stripe, RustFS, Redis)
- Seed data should stay usable even when the app is running in fallback-friendly local mode

## Success Criteria
**How will we know when we're done?**

- A documented seed command can populate a fresh local database with the canonical demo dataset
- Re-running the seed workflow produces the same intended records without duplication
- Seeded admin/customer credentials are usable for auth flows and Swagger testing
- The catalog includes representative categories, tags, products, variants, and prices
- Coupons used in examples/tests are available after seeding
- Tests and docs cover the new seeding flow and expected fixture set

### Acceptance criteria
- A new seeding module/service exists and is wired into a CLI/scripted workflow
- Seeding uses **stable unique keys** (`email`, `slug`, `sku`, `code`) so records are updated, not duplicated
- The workflow is intentionally limited to **non-production** or explicit operator usage
- README/docs explain how to run and verify the seeded dataset

## Constraints & Assumptions
**What limitations do we need to work within?**

- The project remains a **NestJS modular monolith** using **Prisma + PostgreSQL**
- Existing schema models (`User`, `Category`, `Tag`, `Product`, `Coupon`, etc.) should be reused rather than redesigned
- The seeding flow should prefer **idempotent upserts** over destructive resets
- No public HTTP endpoint is required in v1; a CLI/scripted workflow is sufficient
- Default credentials and fixture values are for **local/demo use only** and must not be treated as production secrets

## Questions & Open Items
**What do we still need to clarify?**

No blocking gaps remain for implementation readiness.

Items to confirm during implementation:
- Whether the canonical entrypoint should be `pnpm seed`, `pnpm db:seed`, or Prisma’s `prisma db seed`
- Whether v1 should seed only auth/catalog/coupons or also include demo orders/reservations
- Whether product media should use placeholder `imageUrl` values until richer seeded media assets are introduced later
