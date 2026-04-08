---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
---

# Testing Strategy

## Test Coverage Goals
**What level of testing do we aim for?**

- **Unit coverage target:** 100% of new or changed business-logic branches in inventory, discounts, and webhook handling
- **Integration scope:** checkout pricing, coupon validation, order creation, and stock reservation/release
- **End-to-end scope:** admin catalog management, customer cart/checkout, and order history retrieval

## Unit Tests
**What individual components need testing?**

### Inventory module
- [x] Reserve stock when sellable quantity is sufficient
- [x] Reject reservation when requested quantity exceeds sellable stock
- [x] Release reservations back to inventory on checkout failure or timeout
- [x] Confirm reservations and prevent double-confirmation

### Discounts / checkout module
- [x] Apply percentage coupon correctly with max-discount rules if configured
- [x] Apply fixed-amount coupon without producing negative totals
- [x] Reject expired, inactive, or usage-capped coupons

### Payments module
- [ ] Accept valid Stripe success event payloads and route to order update logic
- [ ] Ignore duplicate webhook event IDs idempotently
- [ ] Handle payment failure events by cancelling the order and releasing reservation

## Integration Tests
**How do we test component interactions?**

- [ ] Checkout creates a `PENDING` order and inventory reservation
- [ ] Successful webhook transitions order to `PAID` and consumes reservation
- [ ] Failed payment transitions order to `CANCELLED` and restores reserved stock
- [ ] Admin-only endpoints reject customer tokens

## End-to-End Tests
**What user flows need validation?**

- [ ] Admin creates a product with size/color variants and inventory
- [ ] Customer adds item to cart, applies coupon, and starts checkout
- [ ] Stripe success webhook updates the order and customer history endpoint reflects the final status
- [ ] Customer can view only their own orders while admins can view fulfillment queues

## Test Data
**What data do we use for testing?**

- Seed one admin user, one customer user, two products, and multiple variants
- Create coupon fixtures for valid, expired, and usage-capped scenarios
- Use deterministic Stripe webhook fixture payloads and signature stubs in tests
- Use isolated PostgreSQL schemas / test DB plus ephemeral Redis namespaces per suite

## Test Reporting & Coverage
**How do we verify and communicate test results?**

- Run `pnpm test -- --coverage` for unit coverage reporting
- Run `pnpm test:e2e` for API workflow verification
- Track any gaps below target coverage and justify them in PR notes
- Capture manual checkout/webhook smoke test evidence during release review

## Manual Testing
**What requires human validation?**

- Swagger endpoint discoverability and example payload readability
- Stripe CLI or test dashboard webhook delivery in local development
- Error messaging for invalid coupons, out-of-stock items, and unauthorized access
- Basic accessibility and usability review if an admin UI is added later

## Performance Testing
**How do we validate performance?**

- Simulate concurrent checkout requests for the same low-stock SKU
- Stress test cart reads/writes in Redis-backed flows
- Measure order and inventory query latency under seeded catalog load

## Bug Tracking
**How do we manage issues?**

- Categorize bugs by `catalog`, `inventory`, `checkout`, `payments`, and `orders`
- Treat oversell, payment state mismatch, and authorization bugs as **high severity**
- Re-run the critical checkout regression suite on every release candidate
