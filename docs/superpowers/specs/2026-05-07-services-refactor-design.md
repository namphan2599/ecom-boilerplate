# Services Refactoring Design

## Overview
Refactor `lib/aura/` and `lib/auth/` into flat domain services following KISS principle.

## New Structure

```
lib/
  client.ts      # Base fetch + error handling (extracted from aura/client.ts)
  types.ts       # All shared types (from aura/types.ts)
  product.ts    # getProduct*, getCatalog*, getCategories, getTags
  cart.ts       # getCart, addCartItem, updateCartItem, removeCartItem
  auth.ts       # loginWithPassword, registerWithPassword, getSession, getProfile, requireSession + session helpers
  checkout.ts   # createCheckoutSession
  order.ts      # getOrderHistory
  fallback.ts  # Fallback data (from aura/fallback-data.ts)
```

## Principles (KISS)
- One file per domain
- Flat structure (no subfolders)
- Base client + types shared, domain services import from them
- Auth combines session helpers with auth methods

## Breaking Changes to Update
- Update all imports: `@/lib/aura/client` → `@/lib/product` or `@/lib/cart` etc.
- Remove `lib/aura/` folder after migration
- Remove `lib/auth/` folder after migration

## Migration Order
1. Create `lib/client.ts` and `lib/types.ts`
2. Create domain services (`product.ts`, `cart.ts`, `auth.ts`, `checkout.ts`, `order.ts`, `fallback.ts`)
3. Update all imports across the app
4. Remove old folders