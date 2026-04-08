---
phase: planning
title: Project Planning & Task Breakdown
description: Break down work into actionable tasks and estimate timeline
---

# Project Planning & Task Breakdown

## Milestones
**What are the major checkpoints?**

- [x] Milestone 1: Requirements and architecture documented for `Aura-Core`
- [ ] Milestone 2: Core domain modules scaffolded with Prisma schema and local infrastructure
- [ ] Milestone 3: Checkout, webhook, and inventory workflows verified with tests and docs

## Task Breakdown
**What specific work needs to be done?**

### Phase 1: Foundation
- [x] Task 1.1: Add infrastructure configuration (`docker-compose.yml`, `.env.example`, Prisma bootstrap)
- [x] Task 1.2: Introduce shared NestJS concerns: exception filter, logging, validation, Swagger bootstrap
- [x] Task 1.3: Set up auth baseline with JWT, Passport, and role decorators/guards

### Phase 2: Core Features
- [x] Task 2.1: Model `User`, `Product`, `Category`, `Tag`, `ProductVariant`, `Coupon`, `Order`, and `OrderItem` in Prisma
- [x] Task 2.2: Implement catalog CRUD and admin-only product management
- [x] Task 2.3: Implement Redis-backed cart persistence and cart pricing snapshot logic
- [x] Task 2.4: Implement inventory reservation, confirmation, and release flows
- [x] Task 2.5: Implement discount validation and usage limit enforcement
- [x] Task 2.6: Implement Stripe checkout/session creation and webhook processing
- [ ] Task 2.7: Implement order history and admin order status management

### Phase 3: Integration & Polish
- [ ] Task 3.1: Add OpenAPI docs, example requests, and error response schemas
- [ ] Task 3.2: Add unit, integration, and e2e tests for critical commerce flows
- [ ] Task 3.3: Add observability hooks, health checks, and deployment notes

## Dependencies
**What needs to happen in what order?**

- Prisma schema and migrations must land before repository-backed services can be completed
- RBAC and authentication need to exist before admin/customer route separation can be enforced
- Inventory reservation should be implemented before final checkout confirmation logic
- Stripe webhook handling depends on persisted orders and an idempotency/event audit model
- LocalStack and S3 wiring can be stubbed early but finalized after media upload requirements are confirmed

## Timeline & Estimates
**When will things be done?**

| Phase | Scope | Estimate |
| --- | --- | --- |
| Phase 1 | Infra, shared platform concerns, auth skeleton | 1-2 days |
| Phase 2 | Core commerce modules and DB modeling | 4-6 days |
| Phase 3 | Testing, docs, and polish | 2-3 days |

**Total estimate:** ~7-11 working days for a solid boilerplate baseline.

## Risks & Mitigation
**What could go wrong?**

- **Concurrent stock race conditions** → use transactional reservation logic and idempotent release/confirm flows
- **Webhook duplication or out-of-order events** → persist event IDs and ignore already-processed events
- **Coupon abuse or edge-case rounding bugs** → centralize pricing calculations and add integration tests
- **Scope creep** → keep the first release focused on the mandatory boilerplate capabilities only

## Resources Needed
**What do we need to succeed?**

- NestJS, Prisma, PostgreSQL, Redis, Stripe, and LocalStack setup
- A seeded admin account and representative product fixture data
- Test Stripe secrets/webhook secret for local development
- Time for concurrency and payment failure-path testing before launch readiness
