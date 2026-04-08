---
phase: requirements
title: Requirements & Problem Understanding
description: Clarify the problem space, gather requirements, and define success criteria
---

# Requirements & Problem Understanding

## Problem Statement
**What problem are we solving?**

Teams often start e-commerce backends from a minimal NestJS starter and spend significant time re-implementing the same commerce primitives: catalog modeling, inventory controls, role separation, discounting, checkout orchestration, and order lifecycle management. This slows delivery and increases the risk of inconsistent security, payment handling, and stock correctness.

`Aura-Core` solves this by providing a production-ready modular monolith boilerplate for a modern storefront API. The main users are:

- **Admins** who manage products, variants, stock, discounts, and order fulfillment
- **Customers** who browse products, manage carts, checkout, and review order history
- **Developers** who need a maintainable, observable foundation with clear module boundaries and local infrastructure support

## Goals & Objectives
**What do we want to achieve?**

### Primary goals
- Deliver a **NestJS modular monolith** that is ready for real-world e-commerce implementation
- Support a rich product catalog with **categories, tags, and SKU-based variations**
- Prevent overselling using a dedicated **inventory reservation and stock adjustment flow**
- Enforce **RBAC** for `ADMIN` and `CUSTOMER` roles
- Support **persistent carts**, coupons, Stripe checkout, and webhook-driven order updates
- Provide clear DX foundations: **Swagger**, Docker local infra, exception handling, logging, and DTO validation

### Secondary goals
- Keep module boundaries explicit so the monolith can scale operationally and organizationally
- Favor idempotent payment and inventory flows for resilience under retry and concurrency
- Prepare the project for S3-compatible media storage and support email/password plus Google OAuth in v1
- Support multi-currency pricing from the first release

### Non-goals
- Building a storefront UI in this phase
- Multi-vendor marketplace support
- ERP/WMS integrations, advanced shipping carrier integrations, or tax engine implementation
- Subscription billing or installment payment flows

## User Stories & Use Cases
**How will users interact with the solution?**

- As an **admin**, I want to create products with category, tags, and size/color variants so that the catalog is merchandised accurately.
- As an **admin**, I want stock to update safely during checkout so that I do not oversell fast-moving items.
- As an **admin**, I want to create coupons with expiration dates and usage caps so that I can run promotions safely.
- As an **authenticated customer**, I want my cart to persist between sessions so that I can continue checkout later.
- As an **authenticated customer**, I want to apply valid discount codes during checkout so that I receive the expected promotion.
- As an **authenticated customer**, I want to pay securely and see my order status update after Stripe confirms or rejects payment.
- As a **customer**, I want to sign in with email/password or Google so that checkout remains fast and secure.
- As a **customer**, I want to see my order history so that I can track past purchases.

### Edge cases to consider
- Concurrent checkout attempts for the same low-stock SKU
- Duplicate or delayed Stripe webhook delivery
- Coupon expiration or usage limits being exceeded during checkout
- Admins deactivating a product or variant that still exists in carts

## Success Criteria
**How will we know when we're done?**

- Products, categories, tags, and variants can be created and queried via documented APIs
- Inventory reservations prevent overselling during concurrent checkouts
- Admin-only endpoints reject customer tokens and customer endpoints expose only owned order history
- Coupons support both **percentage** and **fixed amount** discounts with expiration and usage limits
- Cart state is persisted in Redis and survives API restarts within TTL boundaries
- Stripe webhook events transition orders between `PENDING`, `PAID`, `SHIPPED`, `DELIVERED`, and `CANCELLED`
- Pricing and checkout flows support multi-currency from the first release
- Failed, expired, or cancelled payments release reserved stock immediately
- Swagger/OpenAPI docs cover public/admin APIs and are available from local development
- `docker-compose.yml` boots PostgreSQL, Redis, and LocalStack for local development

### Acceptance criteria
- The repository contains a `schema.prisma` covering products, variations, coupons, orders, and related entities
- An `InventoryService` implements reservation/confirmation/release logic
- A Stripe webhook controller exists for asynchronous payment success/failure processing

## Constraints & Assumptions
**What limitations do we need to work within?**

- Backend framework is **NestJS** with a modular monolith architecture
- Primary database is **PostgreSQL** accessed via **Prisma**
- **Redis** is used for cart/session caching and fast ephemeral coordination
- Payments are handled through **Stripe**; media storage targets an **S3-compatible** provider
- The initial implementation assumes a single region and a single store/tenant
- Authentication is JWT-first with **email/password plus Google OAuth** in v1 via Passport
- Checkout requires an authenticated customer account; guest checkout is out of scope for v1
- Taxes and shipping use simple internal rules / flat rates in the first release

## Questions & Open Items
**What do we still need to clarify?**

No blocking requirement gaps remain for implementation readiness.

Items intentionally deferred:
- Product reviews, wishlists, and returns stay out of v1 and can be revisited in a later milestone.
- If partial capture/refund workflows are added later, inventory release rules should be revisited for those states.
