# Services Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Refactor lib folder from aura/ + auth/ to flat domain services (product.ts, cart.ts, auth.ts, etc.)

**Architecture:** Flat structure with one file per domain. client.ts contains base fetch, types.ts contains all shared types.

---

## Files to Create

- Create: `lib/client.ts` - Base fetch client
- Create: `lib/types.ts` - All shared types  
- Create: `lib/product.ts` - Product + catalog services
- Create: `lib/cart.ts` - Cart services
- Create: `lib/auth.ts` - Auth + session services
- Create: `lib/checkout.ts` - Checkout services
- Create: `lib/order.ts` - Order services
- Create: `lib/fallback.ts` - Fallback data

## Files to Update

- Modify: `apps/storefront/app/layout.tsx:7` - Update imports
- Modify: `apps/storefront/app/page.tsx:4-5` - Update imports
- Modify: `apps/storefront/app/products/[slug]/page.tsx:8-11` - Update imports
- Modify: `apps/storefront/app/products/page.tsx:1-2` - Update imports
- Modify: `apps/storefront/app/actions.ts:5-11` - Update imports
- Modify: `apps/storefront/app/api/auth/login/route.ts` - Update imports
- Modify: `apps/storefront/app/api/auth/register/route.ts` - Update imports
- Modify: `apps/storefront/app/api/cart/route.ts` - Update imports
- Modify: `apps/storefront/lib/cart/context.tsx` - Update imports
- Modify: `apps/storefront/app/cart/page.tsx` - Update imports

## Tasks

### Task 1: Create base client and types

- [ ] **Step 1: Create `lib/client.ts`**

Extract base fetch from aura/client.ts:
```ts
import 'server-only';

const DEFAULT_API_BASE_URL = 'http://localhost:3000/api/v1';

export function getApiBaseUrl(): string {
  return process.env.AURA_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

type FetchOptions<T> = RequestInit & {
  authToken?: string;
  fallback?: () => T;
};

async function readErrorDetail(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      const payload = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(payload.message)) {
        return payload.message.join(', ');
      }
      if (payload.message) {
        return payload.message;
      }
    }
    return await response.text();
  } catch {
    return response.statusText || 'Unknown API error';
  }
}

export async function apiFetch<T>(path: string, options: FetchOptions<T> = {}): Promise<T> {
  const { authToken, fallback, headers, ...rest } = options;
  
  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...rest,
      cache: authToken || rest.method ? 'no-store' : 'force-cache',
      headers: {
        ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
      },
    });

    if (!response.ok) {
      const detail = await readErrorDetail(response);
      throw new Error(`${response.status} ${detail}`.trim());
    }

    return (await response.json()) as T;
  } catch (error) {
    if (fallback) {
      console.warn(`[storefront] Falling back for ${path}:`, error);
      return fallback();
    }
    throw error;
  }
}
```

- [ ] **Step 2: Create `lib/types.ts`**

Copy all types from aura/types.ts (no changes needed, just move file).

- [ ] **Step 3: Commit**

```bash
git add lib/client.ts lib/types.ts
git commit -m "refactor: extract base client and types"
```

### Task 2: Create product service

- [ ] **Step 1: Create `lib/product.ts`**

```ts
import 'server-only';
import { apiFetch } from './client';
import { FALLBACK_PRODUCTS, FALLBACK_CATEGORIES, FALLBACK_TAGS } from './fallback';
import type { CatalogListResponse, CatalogProductView } from './types';

export async function getCatalogProducts(): Promise<CatalogListResponse> {
  return apiFetch<CatalogListResponse>('/catalog/products', {
    fallback: () => ({ items: FALLBACK_PRODUCTS, total: FALLBACK_PRODUCTS.length }),
  });
}

export async function getProductBySlug(slug: string): Promise<CatalogProductView> {
  return apiFetch<CatalogProductView>(`/catalog/products/${encodeURIComponent(slug)}`, {
    fallback: () => {
      const product = FALLBACK_PRODUCTS.find((item) => item.slug === slug);
      if (!product) {
        throw new Error(`Product ${slug} was not found.`);
      }
      return product;
    },
  });
}

export async function getCategories() {
  return apiFetch('/catalog/categories', {
    fallback: () => FALLBACK_CATEGORIES,
  });
}

export async function getTags() {
  return apiFetch('/catalog/tags', {
    fallback: () => FALLBACK_TAGS,
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/product.ts
git commit -m "refactor: extract product service"
```

### Task 3: Create cart service

- [ ] **Step 1: Create `lib/cart.ts`**

```ts
import 'server-only';
import { apiFetch } from './client';
import { createEmptyCart } from './fallback';
import type { CartView } from './types';

export async function getCart(authToken: string, userId = 'customer-local'): Promise<CartView> {
  return apiFetch<CartView>('/cart', {
    authToken,
    fallback: () => createEmptyCart(userId),
  });
}

export async function addCartItem(
  authToken: string,
  payload: { sku: string; quantity: number; currencyCode?: string },
): Promise<CartView> {
  return apiFetch<CartView>('/cart/items', {
    method: 'POST',
    authToken,
    body: JSON.stringify(payload),
  });
}

export async function updateCartItem(
  authToken: string,
  sku: string,
  payload: { quantity: number },
): Promise<CartView> {
  return apiFetch<CartView>(`/cart/items/${encodeURIComponent(sku)}`, {
    method: 'PATCH',
    authToken,
    body: JSON.stringify(payload),
  });
}

export async function removeCartItem(authToken: string, sku: string): Promise<CartView> {
  return apiFetch<CartView>(`/cart/items/${encodeURIComponent(sku)}`, {
    method: 'DELETE',
    authToken,
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/cart.ts
git commit -m "refactor: extract cart service"
```

### Task 4: Create auth service (merge auth/ folder)

- [ ] **Step 1: Create `lib/auth.ts`**

```ts
import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiFetch } from './client';
import { getProfile } from './product';
import type { StorefrontSession, AuthTokenResponse, LoginInput, RegisterInput, AuthenticatedUser } from './types';

export const ACCESS_TOKEN_COOKIE = 'aura_access_token';

export function buildAuthCookieOptions(maxAge = 60 * 60) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  };
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getSession(): Promise<StorefrontSession | null> {
  const token = await getAuthToken();
  if (!token) return null;

  const user = await getProfile(token);
  if (!user) return null;

  return { token, user };
}

export async function requireSession(nextPath: string): Promise<StorefrontSession> {
  const session = await getSession();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return session;
}

export async function loginWithPassword(input: LoginInput): Promise<AuthTokenResponse> {
  return apiFetch<AuthTokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function registerWithPassword(input: RegisterInput): Promise<AuthTokenResponse> {
  return apiFetch<AuthTokenResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getProfile(authToken: string): Promise<AuthenticatedUser | null> {
  try {
    return await apiFetch<AuthenticatedUser>('/auth/profile', { authToken });
  } catch (error) {
    console.warn('[storefront] Unable to load profile:', error);
    return null;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/auth.ts
git commit -m "refactor: merge auth service (session + auth methods)"
```

### Task 5: Create checkout and order services

- [ ] **Step 1: Create `lib/checkout.ts`**

```ts
import 'server-only';
import { apiFetch } from './client';
import type { HostedCheckoutSessionView } from './types';

export async function createCheckoutSession(
  authToken: string,
  payload: { couponCode?: string; successUrl?: string; cancelUrl?: string },
): Promise<HostedCheckoutSessionView> {
  return apiFetch<HostedCheckoutSessionView>('/checkout/session', {
    method: 'POST',
    authToken,
    body: JSON.stringify(payload),
  });
}
```

- [ ] **Step 2: Create `lib/order.ts`**

```ts
import 'server-only';
import { apiFetch } from './client';
import type { OrderListResponse } from './types';

export async function getOrderHistory(authToken: string): Promise<OrderListResponse> {
  return apiFetch<OrderListResponse>('/orders/me', {
    authToken,
    fallback: () => ({ items: [], total: 0 }),
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/checkout.ts lib/order.ts
git commit -m "refactor: add checkout and order services"
```

### Task 6: Create fallback data

- [ ] **Step 1: Create `lib/fallback.ts`**

Move content from aura/fallback-data.ts.

- [ ] **Step 2: Commit**

```bash
git add lib/fallback.ts
git commit -m "refactor: move fallback data"
```

### Task 7: Update all imports

- [ ] **Step 1: Update `app/layout.tsx`**

Change:
```ts
import { getProfile, getCart } from '@/lib/aura/client';
```
To:
```ts
import { getProfile } from '@/lib/auth';
import { getCart } from '@/lib/cart';
```

- [ ] **Step 2: Update `app/page.tsx`**

Change:
```ts
import { getCatalogProducts } from '@/lib/aura/client';
```
To:
```ts
import { getCatalogProducts } from '@/lib/product';
```

- [ ] **Step 3: Update `app/products/[slug]/page.tsx`**

Change:
```ts
import { getProductBySlug } from '@/lib/aura/client';
import { getPrimaryPrice } from '@/lib/aura/mappers';
import type { CatalogProductView } from '@/lib/aura/types';
import { getSession } from '@/lib/auth/session';
```
To:
```ts
import { getProductBySlug, getCategories, getTags } from '@/lib/product';
import { getSession } from '@/lib/auth';
import type { CatalogProductView } from '@/lib/types';
```

- [ ] **Step 4: Update `app/products/page.tsx`**

Change:
```ts
import { getCatalogProducts, getCategories } from '@/lib/aura/client';
import { toProductCard } from '@/lib/aura/mappers';
```
To:
```ts
import { getCatalogProducts, getCategories } from '@/lib/product';
```

- [ ] **Step 5: Update `app/actions.ts`**

Change imports from aura/client and auth/session to new services.

- [ ] **Step 6: Update other files as needed**

Run typecheck to find remaining issues:
```bash
cd apps/storefront && npm run typecheck
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor: update imports to new services"
```

### Task 8: Remove old folders

- [ ] **Step 1: Remove lib/aura/ and lib/auth/**

```bash
rm -rf lib/aura lib/auth
```

- [ ] **Step 2: Commit**

```bash
git commit -m "refactor: remove aura/ and auth/ folders"
```

---

## Execution

**Plan complete.**