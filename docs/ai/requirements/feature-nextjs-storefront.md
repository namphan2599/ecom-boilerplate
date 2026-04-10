---
phase: requirements
title: Requirements & Problem Understanding
description: Clarify the problem space, gather requirements, and define success criteria
---

# Requirements & Problem Understanding

## Problem Statement
**What problem are we solving?**

Aura already exposes a solid e-commerce backend (`/api/v1`) for auth, catalog, cart, checkout, and orders, but it does **not yet have a real frontend storefront**. Today, developers and reviewers mostly validate flows through Swagger, seeded credentials, or direct API calls.

This creates friction for:

- **Shoppers/customers**, who have no browser-based catalog and checkout journey
- **Developers**, who need a realistic UI integration surface for the backend modules already in place
- **QA/demo stakeholders**, who need a fast way to validate the full browse-to-checkout experience end to end

The new feature will scaffold a **Next.js storefront frontend** for Aura so the backend can be exercised through a modern web UI instead of API tooling alone.

## Goals & Objectives
**What do we want to achieve?**

### Primary goals
- Scaffold a **Next.js App Router** frontend dedicated to Aura storefront use cases
- Integrate the frontend with the existing Aura backend at **`/api/v1`**
- Support the core v1 shopper flows:
  - browse catalog products
  - view product detail pages
  - log in with email/password
  - add/update/remove cart items
  - create hosted Stripe checkout sessions
  - view personal order history after checkout
- Establish an implementation-ready frontend structure, env contract, and integration plan that fits the current Dockerized local stack

### Secondary goals
- Provide a polished demo-friendly landing page and responsive layout shell
- Reuse public product `imageUrl` media already served by the backend
- Respect Aura role-aware auth (`ADMIN` / `CUSTOMER`) so protected pages can be extended later
- Create clear docs so `/review-requirements`, `/review-design`, and `/execute-plan` can proceed without re-discovery

### Non-goals
- Building a full admin dashboard/back office in v1
- Replacing hosted Stripe Checkout with a custom PCI-sensitive payment UI
- Launching a native mobile app
- Finalizing production CDN/SEO/analytics strategy beyond basic readiness

## User Stories & Use Cases
**How will users interact with the solution?**

- As a **shopper**, I want to browse products and categories so that I can discover items to buy.
- As a **shopper**, I want to open a product page and see pricing, variants, inventory-friendly messaging, and hero media so that I can decide what to purchase.
- As a **customer**, I want to log in and manage my cart so that I can prepare an order across sessions.
- As a **customer**, I want to apply a coupon and start hosted checkout so that I can pay securely through Stripe.
- As a **customer**, I want to view my order history so that I can confirm whether an order was placed successfully.
- As a **developer/demo operator**, I want the frontend to work against the seeded Aura backend so that demos and local validation are fast and repeatable.

### Key workflows and edge cases
- Guest users can browse the catalog, but checkout and order history require authentication
- Cart requests must handle expired or unavailable SKUs gracefully
- Checkout success/cancel URLs should route back to storefront pages cleanly
- If Aura is unavailable, the storefront should show actionable error states instead of a blank crash page
- Admin sign-in should remain compatible with the same auth/session model, even if admin-only screens are deferred from v1 scope

## Success Criteria
**How will we know when we're done?**

- A documented **Next.js storefront scaffold** exists and can run locally alongside the Aura backend
- The frontend supports the core routes needed for implementation:
  - `/`
  - `/products`
  - `/products/[slug]`
  - `/cart`
  - `/checkout`
  - `/login`
  - `/account/orders`
- The app consumes Aura’s existing endpoints under **`http://localhost:3000/api/v1`** via a clear env contract
- Protected user flows work with Aura JWT auth and show the authenticated profile/cart/order state correctly
- The checkout flow redirects the user to the hosted `checkoutUrl` returned by the backend
- Documentation, testing scope, and task breakdown are complete enough to start implementation immediately after review

### Acceptance criteria
- A feature-specific doc set exists under `docs/ai/{requirements,design,planning,implementation,testing}/feature-nextjs-storefront.md`
- The frontend plan is explicitly aligned with current backend modules: `auth`, `catalog`, `cart`, `payments/orders`, and media-backed `imageUrl`
- Local development avoids port collision with the API by running the storefront on a separate port (assumption: **`3001`**)
- Implementation choices preserve secure token handling and do not require backend contract redesign in v1

## Constraints & Assumptions
**What limitations do we need to work within?**

- Aura remains the **backend source of truth**; the frontend should adapt to the current API instead of redefining it
- The existing backend local stack already occupies **port `3000`**, so the storefront should default to another port such as **`3001`**
- Checkout in v1 uses Aura’s existing **hosted Stripe session redirect** flow
- Public catalog pages may use caching/revalidation, while cart/checkout/account pages should remain dynamic and uncached
- The scaffold should use **TypeScript** and **Next.js App Router**
- Tailwind CSS is assumed as the fastest default styling foundation unless a different UI stack is chosen during implementation review

## Questions & Open Items
**What do we still need to clarify?**

No blocking questions remain for implementation readiness.

Items to confirm during execution:
- Whether the storefront should live in-repo at `apps/storefront` or as a sibling repo/workspace
- Whether minimal admin-facing pages (for example, an order queue view) belong in v1 or should stay deferred
- Whether the landing page should use placeholder Aura branding assets initially or wait for custom design input
