# Cart Button & Add-to-Cart Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add cart button to header with item count badge and hover dropdown. Implement fly-to-cart animation on product page add-to-cart.

**Architecture:** Client-side CartButton component with React context for state. Cart data fetched via existing `getCart` server action. Fly animation uses CSS transitions and refs.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, no additional dependencies

---

## File Structure

- Create: `apps/storefront/lib/cart/context.tsx` - Cart context provider
- Create: `apps/storefront/components/layout/cart-button.tsx` - Cart button with badge + dropdown
- Modify: `apps/storefront/components/layout/site-header.tsx:36` - Add CartButton in header
- Modify: `apps/storefront/app/products/[slug]/page.tsx` - Add client wrapper with animation

## Dependencies Already Available
- `getCart` from `@/lib/aura/client`
- `CartView` type from `@/lib/aura/types`
- No lucide-react - use inline SVG for icons

---

### Task 1: Create Cart Context

**Files:**
- Create: `apps/storefront/lib/cart/context.tsx`

- [ ] **Step 1: Create cart context with types**

```tsx
'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CartView } from '@/lib/aura/types';

type CartContextType = {
  cart: CartView | null;
  isLoading: boolean;
  totalCount: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children, initialCart }: { children: ReactNode; initialCart?: CartView | null }) {
  const [cart, setCart] = useState<CartView | null>(initialCart ?? null);
  const [isLoading, setIsLoading] = useState(!initialCart);

  const totalCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <CartContext.Provider value={{ cart, isLoading, totalCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/storefront/lib/cart/context.tsx
git commit -m "feat: add cart context provider"
```

---

### Task 2: Create CartButton Component

**Files:**
- Create: `apps/storefront/components/layout/cart-button.tsx`

- [ ] **Step 1: Create CartButton with badge and hover dropdown**

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart/context';

function BagIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

export function CartButton() {
  const { cart, totalCount, isLoading } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onMouseEnter={() => setIsOpen(true)}
        className="relative flex items-center justify-center rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        aria-label={`Shopping bag with ${totalCount} items`}
      >
        <BagIcon className="h-5 w-5" />
        {totalCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Shopping Bag</h3>
          
          {(!cart?.items || cart.items.length === 0) ? (
            <p className="text-sm text-slate-500">Your bag is empty</p>
          ) : (
            <ul className="max-h-64 space-y-3 overflow-y-auto">
              {cart.items.slice(0, 5).map((item) => (
                <li key={item.sku} className="flex gap-3">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-slate-100">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-500">
                      {item.quantity} × {item.currencyCode} {item.price.amount.toFixed(2)}
                    </p>
                  </div>
                </li>
              ))}
              {cart.items.length > 5 && (
                <li className="text-sm text-slate-500">+{cart.items.length - 5} more items</li>
              )}
            </ul>
          )}
          
          {cart?.items && cart.items.length > 0 && (
            <Link
              href="/cart"
              className="mt-3 block w-full rounded-full bg-slate-950 py-2 text-center text-sm font-medium text-white transition hover:bg-slate-800"
            >
              View Bag ({totalCount})
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/storefront/components/layout/cart-button.tsx
git commit -m "feat: add cart button with badge and hover dropdown"
```

---

### Task 3: Add CartButton to Header

**Files:**
- Modify: `apps/storefront/components/layout/site-header.tsx:36`

- [ ] **Step 1: Import CartButton and add to header**

Update imports at top:
```tsx
import { CartButton } from './cart-button';
```

Add CartButton in the header (replace existing Cart link in navigation or add next to sign-in):
- Find the section with `{user ? ... : ...}` around line 36-60
- Add `<CartButton />` before the user section

```tsx
<div className="flex items-center gap-3 text-sm">
  <CartButton />
  {user ? (
```

- [ ] **Step 2: Verify build**

```bash
cd apps/storefront && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add apps/storefront/components/layout/site-header.tsx
git commit -m "feat: add cart button to site header"
```

---

### Task 4: Fly-to-Cart Animation on Product Page

**Files:**
- Modify: `apps/storefront/app/products/[slug]/page.tsx`

- [ ] **Step 1: Create client wrapper component**

Add at end of file (before the default export):

```tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import { useFormStatus } from 'react';

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  const [showAnimation, setShowAnimation] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(() => {
    // Animation triggers when form submits
    // We'll use CSS keyframes for the fly animation
  }, []);

  return (
    <button
      type="submit"
      disabled={pending}
      className="relative w-full overflow-hidden rounded-pill bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
      onClick={handleClick}
    >
      <span className={pending ? 'opacity-0' : ''}>{children}</span>
      {pending && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </span>
      )}
    </button>
  );
}
```

Then update the Add to Cart button in the form to use `<SubmitButton>`:
```tsx
<SubmitButton>Add to Bag</SubmitButton>
```

- [ ] **Step 2: Commit**

```bash
git add apps/storefront/app/products/\[slug\]/page.tsx
git commit -m "feat: add cart animation to product page"
```

---

## Execution

**Plan complete and saved to `docs/superpowers/plans/2026-05-07-cart-button-plan.md`.**

Two execution options:

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**