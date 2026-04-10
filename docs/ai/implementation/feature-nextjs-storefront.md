---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
---

# Implementation Guide

## Development Setup
**How do we get started?**

### Prerequisites
- Node.js and `pnpm`
- The Aura backend running locally (`pnpm run docker:up` or host-based API + infra stack)
- Seeded demo data via `pnpm run seed`

### Recommended bootstrap steps
1. Create a Next.js App Router project in **`apps/storefront`**
2. Keep the storefront on **port `3001`** so the backend can continue using `3000`
3. Add a local env file such as `.env.local` with:

```bash
AURA_API_BASE_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_STOREFRONT_URL=http://localhost:3001
```

4. Add workspace scripts for local development, build, lint, and tests

## Code Structure
**How is the code organized?**

```text
apps/storefront/
  app/
    page.tsx
    products/page.tsx
    products/[slug]/page.tsx
    cart/page.tsx
    checkout/page.tsx
    login/page.tsx
    account/orders/page.tsx
    api/auth/login/route.ts
    api/auth/logout/route.ts
  components/
    layout/
    catalog/
    cart/
    auth/
    ui/
  lib/
    aura/client.ts
    aura/mappers.ts
    auth/session.ts
    utils.ts
  middleware.ts
  tests/
```

### Naming conventions
- Use **feature-based component folders** (`catalog`, `cart`, `auth`)
- Keep API-fetching code in `lib/aura/*` rather than inside React components
- Prefer explicit names such as `getCatalogProducts`, `createCheckoutSession`, `requireSession`

## Implementation Notes
**Key technical details to remember:**

### Core Features
- **Catalog browsing**
  - Use server components to fetch product lists and detail pages from Aura
  - Normalize Aura response shapes into simple UI-friendly models before rendering
  - Render product hero media using the backend’s public `imageUrl`

- **Authentication**
  - Proxy login through a Next.js route handler
  - Store Aura JWTs in **httpOnly cookies**
  - Expose only safe session metadata to React components

- **Cart + checkout**
  - Keep cart page dynamic (`no-store`) because it is auth-sensitive and mutation-heavy
  - Use server actions or route handlers for add/update/remove item operations
  - On checkout, call Aura’s session endpoint and redirect the browser to the returned `checkoutUrl`

### Patterns & Best Practices
- Favor **server components for read-heavy pages**, client components for interactive forms/controls
- Centralize error translation so Aura `401`, `403`, `404`, and `422` responses map cleanly to user-facing messages
- Do not duplicate business logic that already exists in Aura (pricing, coupon validation, order calculation)
- Keep the storefront thin: it should orchestrate UI and integration, not re-implement checkout rules

## Integration Points
**How do pieces connect?**

### API integration details
- Public routes can fetch directly from `AURA_API_BASE_URL` on the server
- Protected mutations should go through server-side helpers/route handlers that inject `Authorization: Bearer <token>` from the session cookie
- Checkout success and cancel callbacks should point back to storefront pages, for example:
  - `/checkout/success`
  - `/checkout/cancel`

### Backend contract reminders
- Auth: `POST /auth/login`, `GET /auth/profile`
- Catalog: `GET /catalog/products`, `GET /catalog/products/:slug`, categories/tags endpoints
- Cart: `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:sku`, `DELETE /cart/items/:sku`
- Checkout: `POST /checkout/session`
- Orders: `GET /orders/me`

## Error Handling
**How do we handle failures?**

- Show inline validation feedback for login and cart mutations
- Add route-level error boundaries for catalog and account pages
- Log upstream Aura failures on the server side before returning user-friendly fallback messages
- If a cart item becomes unavailable or checkout fails, present a recovery path (refresh cart, retry checkout, or return to browse)

## Performance Considerations
**How do we keep it fast?**

- Use **revalidation/caching** only for public catalog content
- Keep cart, login, checkout, and order-history requests **uncached**
- Use `next/image` and responsive image sizing for product media
- Avoid over-fetching by keeping page-level data requirements small and typed

## Security Notes
**What security measures are in place?**

- Store tokens in **secure, httpOnly cookies** rather than browser storage
- Avoid exposing private backend URLs or secrets in client-side code
- Restrict protected pages based on session presence and role-aware checks where needed
- Sanitize/escape user-facing content naturally through React rendering and validated backend responses
