---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
---

# Testing Strategy

## Test Coverage Goals
**What level of testing do we aim for?**

- Unit coverage for all new seeding orchestration logic and environment guards
- Integration coverage for idempotent database writes across the core fixture groups
- End-to-end validation that the seeded dataset works with auth and catalog flows
- Alignment with the requirements/design acceptance criteria for repeatability and safety

## Unit Tests
**What individual components need testing?**

### `SeedingService`
- [ ] Test case 1: first run creates the canonical fixture groups successfully
- [ ] Test case 2: second run updates/reuses records instead of creating duplicates
- [ ] Additional coverage: environment guard behavior for production or disabled contexts

### Fixture builders / helpers
- [ ] Test case 1: stable emails, slugs, SKUs, and coupon codes are generated as expected
- [ ] Test case 2: optional profile selection returns the intended fixture subset
- [ ] Additional coverage: password-hash and relation-mapping helpers if introduced

## Integration Tests
**How do we test component interactions?**

- [ ] Run the seed workflow against a test database and verify admin/customer users exist
- [ ] Verify seeded products, variants, and price rows are present and linked correctly
- [ ] Verify seeded coupon codes are usable by the checkout/discount logic
- [ ] Re-run the seed workflow and assert counts remain stable (idempotency)

## End-to-End Tests
**What user flows need validation?**

- [ ] User flow 1: login with the seeded admin account and access admin-only catalog routes
- [ ] User flow 2: login with the seeded customer account and access cart/checkout flows
- [ ] Critical path testing: public catalog includes representative seeded products
- [ ] Regression of adjacent features: seeded coupon and product fixtures continue to satisfy existing e2e assumptions

## Test Data
**What data do we use for testing?**

- Canonical admin and customer credentials
- At least one seeded category, one tag, and two seeded products with known SKUs
- One or more seeded coupons (such as `AURA20`)
- A clean test database or isolated schema for repeatable verification

## Test Reporting & Coverage
**How do we verify and communicate test results?**

- Validate with `pnpm test -- --runInBand` and relevant integration/e2e commands
- Capture the seed command output summary as evidence during implementation
- Note any intentional gaps if a full DB-backed integration harness is deferred initially

## Manual Testing
**What requires human validation?**

- Run the seed command on a fresh local database and confirm the summary output is correct
- Log into Swagger using the seeded admin/customer credentials
- Check that seeded catalog data appears in `GET /api/v1/catalog/products`

## Performance Testing
**How do we validate performance?**

- Confirm the default seed run completes quickly on a local machine
- Watch for repeated-write or transaction slowdowns when the dataset grows

## Bug Tracking
**How do we manage issues?**

- Track fixture drift or duplicate-record bugs as regressions
- Treat non-idempotent behavior as a release blocker for this feature
- Re-run the seed workflow after fixes to confirm deterministic results
