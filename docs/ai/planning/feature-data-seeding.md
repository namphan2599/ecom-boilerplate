---
phase: planning
title: Project Planning & Task Breakdown
description: Break down work into actionable tasks and estimate timeline
---

# Project Planning & Task Breakdown

## Milestones
**What are the major checkpoints?**

- [x] Milestone 1: Seeding foundation and execution workflow are in place
- [x] Milestone 2: Canonical demo data is seeded across auth, catalog, and discounts
- [x] Milestone 3: Tests, docs, and local developer guidance are complete

## Task Breakdown
**What specific work needs to be done?**

### Phase 1: Foundation
- [x] Task 1.1: Audit current fallback/demo fixtures in `auth`, `catalog`, `discounts`, and `inventory` to define one canonical seed dataset
- [x] Task 1.2: Add a `SeedingModule` + `SeedingService` and wire a CLI entrypoint/script for local execution
- [x] Task 1.3: Add environment guardrails and structured summary logging for seed runs

### Phase 2: Core Features
- [x] Task 2.1: Implement idempotent user and auth-identity seeding for admin/customer logins
- [x] Task 2.2: Implement category, tag, product, variant, and price seeding using stable slugs/SKUs
- [x] Task 2.3: Implement coupon seeding aligned with checkout/demo scenarios
- [x] Task 2.4: Optionally add profile-based fixture sets (`minimal` vs `demo`) if the command surface needs it

### Phase 3: Integration & Polish
- [x] Task 3.1: Add automated tests for idempotency, fixture coverage, and environment guards
- [x] Task 3.2: Update README/docs with setup, command usage, and default seeded credentials
- [x] Task 3.3: Verify the workflow on a fresh database reset and capture run output as evidence

## Dependencies
**What needs to happen in what order?**

- `PrismaService` connectivity and current migrations must be in place before real DB seeding can be verified
- Canonical fixture design should be finalized before writing idempotency tests to avoid churn
- If password hashes are stored in the database, hashing utilities (`bcryptjs`) must be reused consistently with auth expectations
- Docs and e2e scenarios should depend on the final seeded credential and fixture naming decisions

## Timeline & Estimates
**When will things be done?**

- **Phase 1**: ~0.5 day
- **Phase 2**: ~1 day
- **Phase 3**: ~0.5 day
- **Total estimate**: ~2 focused development days, with small buffer for fixture tuning and DB reset validation

## Risks & Mitigation
**What could go wrong?**

- **Risk:** Re-running the seed command creates duplicates  
  **Mitigation:** Use Prisma `upsert`/`connectOrCreate` patterns with stable unique keys

- **Risk:** Seed data drifts away from auth/docs/tests  
  **Mitigation:** Reuse the same canonical emails, slugs, SKUs, and coupon codes referenced across examples and tests

- **Risk:** Seed logic is run unintentionally in production  
  **Mitigation:** Add explicit environment safety checks and avoid exposing a public endpoint

- **Risk:** Fixture creation order causes relational failures  
  **Mitigation:** Seed dependency groups in sequence and wrap related writes in transactions where useful

## Resources Needed
**What do we need to succeed?**

- Access to the local Postgres instance configured by `DATABASE_URL`
- Current Prisma schema and generated client
- Existing auth/catalog/coupon example values from the codebase
- Test commands for unit/integration/e2e validation after the seed workflow is added
