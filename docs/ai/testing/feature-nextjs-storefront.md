---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
---

# Testing Strategy

## Test Coverage Goals
**What level of testing do we aim for?**

- **Unit test target:** 100% of new/changed frontend utility code where practical
- **Integration test scope:** auth/session, catalog fetch mapping, cart mutations, and checkout handoff
- **End-to-end scope:** key shopper journeys from browse to hosted checkout redirect
- All tests should align with the acceptance criteria defined in `feature-nextjs-storefront.md`

## Unit Tests
**What individual components need testing?**

### Aura client and session helpers
- [ ] `lib/aura/client.ts` handles success and error responses correctly
- [ ] `lib/aura/mappers.ts` normalizes catalog/cart/order payloads into UI models
- [ ] `lib/auth/session.ts` reads/writes/clears auth cookies safely

### UI components
- [ ] Product card and product detail components render price/media/variant data correctly
- [ ] Login form handles validation and failed-auth states cleanly
- [ ] Cart summary and quantity controls update totals and edge states correctly

## Integration Tests
**How do we test component interactions?**

- [ ] Login route handler successfully proxies `POST /api/v1/auth/login` and stores the session cookie
- [ ] Protected cart requests include the Aura bearer token and return the cart snapshot
- [ ] Checkout action sends `{ couponCode?, successUrl?, cancelUrl? }` and receives a hosted redirect payload
- [ ] Order history page loads seeded customer orders correctly from `GET /api/v1/orders/me`

## End-to-End Tests
**What user flows need validation?**

- [ ] Guest user lands on the homepage, browses `/products`, and opens a PDP
- [ ] Customer logs in with seeded credentials and adds a SKU to the cart
- [ ] Customer starts checkout and is redirected to the hosted `checkoutUrl`
- [ ] Authenticated customer opens `/account/orders` and sees order history or an empty state
- [ ] Regression check: unauthenticated access to `/cart`, `/checkout`, and `/account/orders` is redirected or blocked appropriately

## Test Data
**What data do we use for testing?**

- Use the existing Aura seeded demo dataset from `pnpm run seed`
- Rely on canonical users:
  - `customer@aura.local` / `Customer123!`
  - `admin@aura.local` / `Admin123!`
- Use seeded catalog products, variants, and coupon examples such as `AURA20`

## Test Reporting & Coverage
**How do we verify and communicate test results?**

- Add frontend commands similar to:
  - `pnpm --filter storefront test -- --coverage`
  - `pnpm --filter storefront test:e2e`
  - `pnpm --filter storefront build`
- Capture coverage and any known gaps before merge
- Treat successful local build + test execution as the implementation completion gate

## Manual Testing
**What requires human validation?**

- Responsive layout checks on desktop and mobile widths
- Accessibility smoke checks for navigation, forms, and CTA buttons
- Manual walkthrough of browse → login → cart → checkout redirect → order history
- Verification that product hero media and multi-currency prices render clearly

## Performance Testing
**How do we validate performance?**

- Run a basic Lighthouse/Web Vitals pass on the landing page and products page
- Confirm cart and checkout pages remain responsive without stale cached data
- Watch for oversized media or unnecessary client-side bundles during the scaffold phase

## Bug Tracking
**How do we manage issues?**

- Log integration issues by endpoint/route (`auth`, `catalog`, `cart`, `checkout`, `orders`)
- Prioritize regressions that block the shopper journey over cosmetic polish
- Add regression tests for any contract mismatch or auth/session bug discovered during implementation
