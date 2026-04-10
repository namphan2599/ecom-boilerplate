---
phase: planning
title: Project Planning & Task Breakdown
description: Break down work into actionable tasks and estimate timeline
---

# Project Planning & Task Breakdown

## Milestones
**What are the major checkpoints?**

- [x] **Milestone 1: Frontend foundation ready** — Next.js app scaffolded, workspace wiring/env contract documented, Aura client helpers in place
- [x] **Milestone 2: Shopper journey working** — catalog, PDP, login, cart, and checkout redirect flows integrated with `/api/v1`
- [x] **Milestone 3: Account + polish complete** — order history, loading/error states, tests, and README/dev scripts finished

## Task Breakdown
**What specific work needs to be done?**

### Phase 1: Foundation
- [x] **Task 1.1:** Create the Next.js app scaffold (recommended location: `apps/storefront`) with TypeScript, ESLint, and App Router
- [x] **Task 1.2:** Add workspace/dev scripts and environment configuration (`AURA_API_BASE_URL`, storefront port, optional public app URL)
- [x] **Task 1.3:** Build shared Aura fetch utilities, typed response models, and auth cookie/session helpers
- [x] **Task 1.4:** Add the base app shell (header, footer, navigation, loading/error boundaries)

### Phase 2: Core Features
- [x] **Task 2.1:** Implement landing page + product listing page backed by `GET /catalog/products`
- [x] **Task 2.2:** Implement product detail page backed by `GET /catalog/products/:slug`
- [x] **Task 2.3:** Implement login flow backed by `POST /auth/login` and `GET /auth/profile`
- [x] **Task 2.4:** Implement authenticated cart page and cart item mutations backed by Aura cart endpoints
- [x] **Task 2.5:** Implement checkout review + hosted redirect using `POST /checkout/session`
- [x] **Task 2.6:** Implement authenticated order history page backed by `GET /orders/me`

### Phase 3: Integration & Polish
- [x] **Task 3.1:** Add robust loading, empty, and error states across catalog/cart/account flows
- [x] **Task 3.2:** Add unit/integration/e2e coverage for the core journeys and route handlers
- [x] **Task 3.3:** Document local startup, seeded demo credentials, and backend integration assumptions in the repo README or frontend README
- [x] **Task 3.4:** Run review gates (`/review-requirements`, `/review-design`) and then proceed with `/execute-plan`

## Execution Status (2026-04-10)

- `apps/storefront` is now scaffolded as a Next.js App Router app with Aura-specific routes for `/`, `/products`, `/products/[slug]`, `/login`, `/cart`, `/checkout`, and `/account/orders`.
- Secure auth cookie handling, protected route enforcement, cart/checkout server actions, and fallback-friendly Aura API helpers are implemented.
- Local workspace scripts and frontend env defaults are documented via root `package.json`, `pnpm-workspace.yaml`, and `apps/storefront/.env.example`.
- Verification evidence:
  - `pnpm --dir apps/storefront build` ✅
  - `pnpm --dir apps/storefront lint` ✅
  - `pnpm --dir apps/storefront test` ✅ (`2/2` files, `6/6` tests)
  - `pnpm build` ✅
  - `pnpm test -- --runInBand` ✅ (`8/8` suites, `34/34` tests)

## Dependencies
**What needs to happen in what order?**

- The Aura backend API and docs remain the **source of truth** for request/response shapes
- Local development depends on the existing Docker stack (`api`, `postgres`, `redis`, `rustfs`) being available
- Seeded demo data should be present before validating browse/cart/checkout UI flows
- Auth/session helpers must exist before protected cart/order pages can be completed
- Checkout success/cancel URLs depend on the agreed storefront hostname/port

## Timeline & Estimates
**When will things be done?**

### Estimated effort
- **Phase 1: Foundation** — 1 to 1.5 engineering days
- **Phase 2: Core features** — 2 to 3 engineering days
- **Phase 3: Integration & polish** — 1 to 1.5 engineering days

### Overall estimate
- **Total:** ~4 to 6 engineering days for a solid v1 scaffold
- Add a small buffer if design polish, admin views, or contract fixes are pulled into scope during implementation

## Risks & Mitigation
**What could go wrong?**

- **Risk:** Backend payload assumptions drift from the real controllers/services  
  **Mitigation:** keep typed fetch mappers close to the current `/api/v1` contract and verify against Swagger/examples early

- **Risk:** Port or workspace setup conflicts with the existing Nest app  
  **Mitigation:** reserve a non-conflicting storefront port (recommended `3001`) and add explicit scripts/docs

- **Risk:** JWT handling is implemented insecurely in the browser  
  **Mitigation:** keep token storage in httpOnly cookies via Next.js route handlers rather than `localStorage`

- **Risk:** Checkout/order flows are blocked by missing seed data or external dependencies  
  **Mitigation:** rely on the documented demo seed workflow and validate against the local Docker stack early

## Resources Needed
**What do we need to succeed?**

- One engineer comfortable with **Next.js App Router** and TypeScript
- Access to the running Aura backend and seeded demo accounts:
  - `admin@aura.local` / `Admin123!`
  - `customer@aura.local` / `Customer123!`
- Local Node.js + pnpm setup and the documented Docker services
- Existing Aura API docs/Swagger examples for quick contract verification
