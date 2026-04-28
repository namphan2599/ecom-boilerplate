# Apple-Style Storefront UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Apple-design-inspired UI for storefront homepage, products catalog, and product detail pages with shadcn components

**Architecture:** Foundation-first approach - build design tokens → core components → navigation → page layouts. All using shadcn components styled to Apple specs from DESIGN.md.

**Tech Stack:** Next.js 16, Tailwind CSS 4, shadcn v4, React 19

---

## File Structure

```
apps/storefront/
├── app/
│   ├── globals.css          # Apple design tokens (colors, typography, spacing)
│   ├── layout.tsx          # Root layout with Apple nav
│   ├── page.tsx            # Homepage with product tiles
│   └── products/
│       ├── page.tsx        # Products catalog
│       └── [slug]/
│           └── page.tsx    # Product detail
├── components/
│   ├── ui/               # shadcn components (button, input, card)
│   └── layout/
│       ├── global-nav.tsx  # Apple black nav bar
│       └── sub-nav.tsx    # Frosted sub-nav
└── lib/
    └── tokens.css        # CSS custom properties for Apple design
```

---

## Task 1: Design Tokens (Tailwind)

**Files:**
- Modify: `apps/storefront/app/globals.css`

- [ ] **Step 1: Replace globals.css with Apple design tokens**

Replace the current `globals.css` with:

```css
@import 'tailwindcss';

:root {
  /* Brand & Accent */
  --color-primary: #0066cc;
  --color-primary-focus: #0071e3;
  --color-primary-on-dark: #2997ff;
  
  /* Text */
  --color-ink: #1d1d1f;
  --color-body-on-dark: #ffffff;
  --color-body-muted: #cccccc;
  --color-ink-muted-80: #333333;
  --color-ink-muted-48: #7a7a7a;
  
  /* Surfaces - Light */
  --color-canvas: #ffffff;
  --color-canvas-parchment: #f5f5f7;
  --color-surface-pearl: #fafafc;
  
  /* Surfaces - Dark */
  --color-surface-tile-1: #272729;
  --color-surface-tile-2: #2a2a2c;
  --color-surface-tile-3: #252527;
  --color-surface-black: #000000;
  --color-surface-chip-translucent: #d2d2d7;
  
  /* Borders */
  --color-divider-soft: #f0f0f0;
  --color-hairline: #e0e0e0;
  
  /* On Colors */
  --color-on-primary: #ffffff;
  --color-on-dark: #ffffff;
}

@theme inline {
  /* Colors */
  --color-primary: var(--color-primary);
  --color-primary-focus: var(--color-primary-focus);
  --color-primary-on-dark: var(--color-primary-on-dark);
  --color-ink: var(--color-ink);
  --color-body-on-dark: var(--color-body-on-dark);
  --color-body-muted: var(--color-body-muted);
  --color-canvas: var(--color-canvas);
  --color-canvas-parchment: var(--color-canvas-parchment);
  --color-surface-pearl: var(--color-surface-pearl);
  --color-surface-tile-1: var(--color-surface-tile-1);
  --color-surface-tile-2: var(--color-surface-tile-2);
  --color-surface-tile-3: var(--color-surface-tile-3);
  --color-surface-black: var(--color-surface-black);
  --color-surface-chip-translucent: var(--color-surface-chip-translucent);
  --color-on-primary: var(--color-on-primary);
  --color-on-dark: var(--color-on-dark);
  --color-ink-muted-80: var(--color-ink-muted-80);
  --color-hairline: var(--color-hairline);
  
  /* Typography */
  --font-sf-display: "SF Pro Display", system-ui, -apple-system, sans-serif;
  --font-sf-text: "SF Pro Text", system-ui, -apple-system, sans-serif;
  
  /* Spacing */
  --spacing-xxs: 4px;
  --spacing-xs: 8px;
  --spacing-sm: 12px;
  --spacing-md: 17px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-xxl: 48px;
  --spacing-section: 80px;
  
  /* Border Radius */
  --radius-none: 0px;
  --radius-xs: 5px;
  --radius-sm: 8px;
  --radius-md: 11px;
  --radius-lg: 18px;
  --radius-pill: 9999px;
  --radius-full: 9999px;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: var(--color-canvas);
  color: var(--color-ink);
  font-family: var(--font-sf-text);
  font-size: 17px;
  line-height: 1.47;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-sf-display);
  font-weight: 600;
  letter-spacing: -0.28px;
}

a {
  color: var(--color-primary);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

button,
input,
select {
  font: inherit;
}
```

- [ ] **Step 2: Commit**

```bash
cd apps/storefront
git add app/globals.css
git commit -m "feat: add Apple design tokens to globals.css"
```

---

## Task 2: shadcn Components Setup

**Files:**
- Create: `apps/storefront/components.json`
- Create: `apps/storefront/components/ui/button.tsx`
- Create: `apps/storefront/components/ui/input.tsx`
- Create: `apps/storefront/components/ui/card.tsx`
- Modify: `apps/storefront/package.json`

- [ ] **Step 1: Initialize shadcn**

Create `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": false
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

- [ ] **Step 2: Create button component**

Create `apps/storefront/components/ui/button.tsx`:

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-pill text-sm font-normal transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-focus)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-focus)] active:scale-[0.95]",
        secondary:
          "bg-transparent text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-[var(--color-surface-pearl)] active:scale-[0.95]",
        ghost:
          "bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-divider-soft)]",
        outline:
          "border border-[var(--color-hairline)] bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-surface-pearl)]",
        dark:
          "bg-[var(--color-ink)] text-[var(--color-on-dark)] hover:bg-[var(--color-ink-muted-80)] active:scale-[0.95]",
      },
      size: {
        default: "h-11 px-[22px] py-[11px]",
        sm: "h-9 px-4 text-sm",
        lg: "h-14 px-[28px] text-lg font-light",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

- [ ] **Step 3: Create input component**

Create `apps/storefront/components/ui/input.tsx`:

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-pill border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-5 py-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted-48)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-focus)] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
```

- [ ] **Step 4: Create card component**

Create `apps/storefront/components/ui/card.tsx`:

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)]",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardContent };
```

- [ ] **Step 5: Create lib/utils.ts if not exists**

Create `apps/storefront/lib/utils.ts`:

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 6: Update package.json with dependencies**

Add to `package.json` dependencies:

```json
{
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.5.0"
  }
}
```

Run: `pnpm install`

- [ ] **Step 7: Commit**

```bash
cd apps/storefront
git add components.json components/ui/button.tsx components/ui/input.tsx components/ui/card.tsx lib/utils.ts package.json
git commit -m "feat: add shadcn components (button, input, card)"
```

---

## Task 3: Navigation Components

**Files:**
- Create: `apps/storefront/components/layout/global-nav.tsx`
- Create: `apps/storefront/components/layout/sub-nav.tsx`
- Modify: `apps/storefront/components/layout/site-header.tsx`
- Modify: `apps/storefront/app/layout.tsx`

- [ ] **Step 1: Create GlobalNav component**

Create `apps/storefront/components/layout/global-nav.tsx`:

```tsx
import Link from "next/link";
import { ShoppingBag, Search } from "lucide-react";

const navLinks = [
  { href: "/", label: "Store" },
  { href: "/products", label: "Mac" },
  { href: "/products", label: "iPad" },
  { href: "/products", label: "iPhone" },
  { href: "/products", label: "Watch" },
  { href: "/products", label: "AirPods" },
  { href: "/products", label: "TV & Home" },
];

export function GlobalNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-11 bg-[var(--color-surface-black)]">
      <div className="mx-auto flex h-full max-w-full items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-[var(--color-on-dark)] hover:opacity-80"
          >
            Aura
          </Link>
          <div className="hidden gap-5 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="text-xs text-[var(--color-body-muted)] hover:text-[var(--color-on-dark)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-[var(--color-body-muted)] hover:text-[var(--color-on-dark)]">
            <Search className="h-4 w-4" />
          </button>
          <Link href="/cart" className="text-[var(--color-body-muted)] hover:text-[var(--color-on-dark)]">
            <ShoppingBag className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Create SubNav component**

Create `apps/storefront/components/layout/sub-nav.tsx`:

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubNavProps {
  category?: string;
  className?: string;
}

const categoryLinks = [
  { href: "/products", label: "Store" },
  { href: "/products", label: "Mac" },
  { href: "/products", label: "iPad" },
  { href: "/products", label: "iPhone" },
  { href: "/products", label: "Watch" },
  { href: "/products", label: "AirPods" },
];

export function SubNav({ category = "Store", className }: SubNavProps) {
  return (
    <div
      className={cn(
        "sticky top-11 z-40 flex h-[52px] items-center justify-between border-b border-[var(--color-hairline)] bg-[var(--color-canvas-parchment)]/80 backdrop-blur-md",
        className
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-full items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <span className="text-[21px] font-semibold text-[var(--color-ink)]">
            {category}
          </span>
          <div className="hidden gap-4 md:flex">
            {categoryLinks.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="text-sm text-[var(--color-ink-muted-80)] hover:text-[var(--color-ink)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <Button size="sm" className="rounded-pill">
          Buy
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update SiteHeader to use Apple nav**

Replace `apps/storefront/components/layout/site-header.tsx`:

```tsx
import Link from "next/link";
import type { AuthenticatedUser } from "@/lib/aura/types";
import { GlobalNav } from "./global-nav";
import { SubNav } from "./sub-nav";

interface SiteHeaderProps {
  user: AuthenticatedUser | null;
}

export function SiteHeader({ user }: SiteHeaderProps) {
  return (
    <header>
      <GlobalNav />
      <SubNav />
      <div className="pt-[103px]" />
    </header>
  );
}
```

- [ ] **Step 4: Update layout.tsx to use updated SiteHeader**

The layout already uses SiteHeader via `app/layout.tsx`, no changes needed there.

- [ ] **Step 5: Add lucide-react to package.json**

Add to dependencies:
```json
{
  "dependencies": {
    "lucide-react": "^0.468.0"
  }
}
```

Run: `pnpm install`

- [ ] **Step 6: Commit**

```bash
cd apps/storefront
git add components/layout/global-nav.tsx components/layout/sub-nav.tsx components/layout/site-header.tsx package.json
git commit -m "feat: add Apple-style global nav and sub-nav"
```

---

## Task 4: Homepage Implementation

**Files:**
- Modify: `apps/storefront/app/page.tsx`

- [ ] **Step 1: Replace homepage with Apple-style tiles**

Replace `apps/storefront/app/page.tsx` with Apple product tiles:

```tsx
import Link from "next/link";
import Image from "next/image";
import { ProductCard } from "@/components/catalog/product-card";
import { Button } from "@/components/ui/button";
import { getCatalogProducts } from "@/lib/aura/client";
import { toProductCard } from "@/lib/aura/mappers";

export default async function Home() {
  const { items } = await getCatalogProducts();
  const featuredProducts = items.filter((p) => p.isFeatured).slice(0, 4);

  return (
    <main>
      {/* Hero Tile - Light */}
      <section className="flex min-h-[80vh] flex-col items-center justify-center bg-[var(--color-canvas)] py-[80px] text-center">
        <span className="text-sm font-semibold uppercase tracking-widest text-[var(--color-ink-muted-48)]">
          New
        </span>
        <h1 className="mt-4 text-[56px] font-semibold tracking-tight text-[var(--color-ink)]">
          Aura Studio
        </h1>
        <p className="mt-4 max-w-xl text-[28px] text-[var(--color-ink)]">
          Think different. Shop different.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/products">
            <Button>Learn more</Button>
          </Link>
          <Link href="/products">
            <Button variant="secondary">Buy</Button>
          </Link>
        </div>
      </section>

      {/* Product Tile 1 - Dark */}
      <section className="flex min-h-[80vh] flex-col items-center justify-center bg-[var(--color-surface-tile-1)] py-[80px] text-center">
        <span className="text-sm font-semibold uppercase tracking-widest text-[var(--color-body-muted)]">
          New
        </span>
        <h2 className="mt-4 text-[40px] font-semibold text-[var(--color-on-dark)]">
          iPhone
        </h2>
        <p className="mt-2 text-[24px] font-light text-[var(--color-body-muted)]">
          TITANIUM. So strong. So light. So Pro.
        </p>
        <div className="mt-6 flex gap-4">
          <Link href="/products">
            <Button>Learn more</Button>
          </Link>
          <Link href="/products">
            <Button variant="secondary">Buy</Button>
          </Link>
        </div>
        {/* Product image with shadow */}
        <div className="mt-12 relative h-64 w-64">
          <div className="h-full w-full bg-gradient-to-br from-gray-600 to-gray-800 shadow-[rgba(0,0,0,0.22)_3px_5px_30px]" />
        </div>
      </section>

      {/* Product Tile 2 - Light */}
      <section className="flex min-h-[80vh] flex-col items-center justify-center bg-[var(--color-canvas)] py-[80px] text-center">
        <h2 className="text-[40px] font-semibold text-[var(--color-ink)]">
          MacBook Air
        </h2>
        <p className="mt-2 text-[24px] font-light text-[var(--color-ink-muted-80)]">
          Lean. Mean. M3 machine.
        </p>
        <div className="mt-6 flex gap-4">
          <Link href="/products">
            <Button>Learn more</Button>
          </Link>
          <Link href="/products">
            <Button variant="secondary">Buy</Button>
          </Link>
        </div>
      </section>

      {/* Product Tile 3 - Dark */}
      <section className="flex min-h-[80vh] flex-col items-center justify-center bg-[var(--color-surface-tile-2)] py-[80px] text-center">
        <h2 className="text-[40px] font-semibold text-[var(--color-on-dark)]">
          Apple Watch
        </h2>
        <p className="mt-2 text-[21px] font-semibold text-[var(--color-primary-on-dark)]">
          Series 9
        </p>
        <p className="mt-2 text-[24px] font-light text-[var(--color-body-muted)]">
         Smarter. Brighter. Mightier.
        </p>
        <div className="mt-6 flex gap-4">
          <Link href="/products">
            <Button>Learn more</Button>
          </Link>
          <Link href="/products">
            <Button variant="secondary">Buy</Button>
          </Link>
        </div>
      </section>

      {/* Featured Products Grid - Parchment */}
      <section className="bg-[var(--color-canvas-parchment)] px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-8 text-center text-[34px] font-semibold text-[var(--color-ink)]">
            Explore Aura
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={toProductCard(product)} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd apps/storefront
git add app/page.tsx
git commit -m "feat: implement Apple-style homepage with product tiles"
```

---

## Task 5: Products Catalog Page

**Files:**
- Modify: `apps/storefront/app/products/page.tsx`
- Modify: `apps/storefront/components/catalog/product-card.tsx`

- [ ] **Step 1: Update ProductCard to Apple style**

Replace `apps/storefront/components/catalog/product-card.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import type { ProductCardModel } from "@/lib/aura/types";
import { Button } from "@/components/ui/button";

export function ProductCard({ product }: { product: ProductCardModel }) {
  return (
    <article className="group">
      <Link href={`/products/${product.slug}`}>
        {product.imageUrl ? (
          <div className="relative mb-4 aspect-square overflow-hidden rounded-lg bg-[var(--color-divider-soft)]">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              unoptimized
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="mb-4 flex aspect-square items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-surface-tile-1)] to-[var(--color-surface-tile-2)]">
            <span className="text-lg font-semibold text-[var(--color-on-dark)]">Aura</span>
          </div>
        )}
      </Link>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[var(--color-surface-pearl)] px-2.5 py-1 text-xs font-medium text-[var(--color-ink-muted-80)]">
            {product.categoryLabel}
          </span>
          {product.featured && (
            <span className="text-xs font-semibold text-[var(--color-primary)]">
              New
            </span>
          )}
        </div>

        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="text-[17px] font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-primary)]">
            {product.name}
          </h3>
        </Link>

        <p className="line-clamp-2 text-sm text-[var(--color-ink-muted-80)]">
          {product.description}
        </p>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[17px] font-semibold text-[var(--color-ink)]">
            {product.priceCurrencyCode === "USD" ? "$" : ""}
            {product.priceAmount.toFixed(2)}
          </span>
          <Button size="sm" variant="ghost" className="text-sm">
            {product.variantCount} options
          </Button>
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Update products page with Apple style**

Replace `apps/storefront/app/products/page.tsx`:

```tsx
import Link from "next/link";
import { ProductCard } from "@/components/catalog/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCatalogProducts, getCategories } from "@/lib/aura/client";
import { filterProducts, toProductCard } from "@/lib/aura/mappers";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = (searchParams ? await searchParams : {}) ?? {};
  const query = typeof params.q === "string" ? params.q : "";
  const category = typeof params.category === "string" ? params.category : "";

  const [{ items }, categories] = await Promise.all([
    getCatalogProducts(),
    getCategories(),
  ]);

  const filtered = filterProducts(items, query, category);

  return (
    <div className="min-h-screen bg-[var(--color-canvas)]">
      {/* Header */}
      <section className="px-6 py-12 text-center">
        <h1 className="text-[56px] font-semibold tracking-tight text-[var(--color-ink)]">
          Store
        </h1>
        <p className="mt-4 text-lg text-[var(--color-ink-muted-80)]">
          The best of Aura. Curated for you.
        </p>
      </section>

      {/* Search */}
      <section className="mx-auto max-w-2xl px-6 pb-12">
        <form className="flex gap-3" method="get">
          <Input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search products..."
            className="flex-1"
          />
          <select
            name="category"
            defaultValue={category}
            className="rounded-pill border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-4 py-3 text-sm text-[var(--color-ink)]"
          >
            <option value="">All</option>
            {categories.map((item: { id: string; slug: string; name: string }) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
          <Button type="submit">Search</Button>
        </form>
      </section>

      {/* Products Grid */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-[var(--color-ink-muted-80)]">
            {filtered.length} products
          </p>
          {(query || category) && (
            <Link href="/products" className="text-sm text-[var(--color-primary)]">
              Clear
            </Link>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--color-hairline)] bg-[var(--color-surface-pearl)] p-12 text-center text-[var(--color-ink-muted-80)]">
            No products found.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={toProductCard(product)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd apps/storefront
git add app/products/page.tsx components/catalog/product-card.tsx
git commit -m "feat: implement Apple-style products catalog page"
```

---

## Task 6: Product Detail Page

**Files:**
- Modify: `apps/storefront/app/products/[slug]/page.tsx`

- [ ] **Step 1: Update product detail page with Apple style**

Replace `apps/storefront/app/products/[slug]/page.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { addToCartAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProductBySlug } from "@/lib/aura/client";
import { getPrimaryPrice } from "@/lib/aura/mappers";
import type { CatalogProductView } from "@/lib/aura/types";
import { getSession } from "@/lib/auth/session";

type Params = Promise<{ slug: string }>;

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  let product: CatalogProductView;

  try {
    product = await getProductBySlug(slug);
  } catch {
    notFound();
  }

  const session = await getSession();
  const price = getPrimaryPrice(product);

  return (
    <div className="min-h-screen bg-[var(--color-canvas)]">
      {/* Breadcrumb */}
      <section className="px-6 py-4">
        <Link
          href="/products"
          className="text-sm text-[var(--color-primary)] hover:underline"
        >
          ← Back to Store
        </Link>
      </section>

      {/* Product Hero */}
      <div className="grid gap-12 px-6 pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-24">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-[var(--color-surface-pearl)]">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              unoptimized
              className="object-cover shadow-[rgba(0,0,0,0.22)_3px_5px_30px]"
            />
          ) : (
            <div className="flex items-center justify-center bg-gradient-to-br from-[var(--color-surface-tile-1)] to-[var(--color-surface-tile-2)]">
              <span className="text-4xl font-semibold text-[var(--color-on-dark)]">
                Aura
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-muted-80)]">
              <span>{product.category?.name ?? "Aura"}</span>
              {product.isFeatured && <span>New</span>}
            </div>
            <h1 className="text-[40px] font-semibold tracking-tight text-[var(--color-ink)]">
              {product.name}
            </h1>
            <p className="text-lg leading-relaxed text-[var(--color-ink-muted-80)]">
              {product.description ?? "A dependable Aura product."}
            </p>
          </div>

          <div className="text-[28px] font-semibold text-[var(--color-ink)]">
            {price.currencyCode === "USD" ? "$" : ""}
            {price.amount.toFixed(2)}
          </div>

          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full bg-[var(--color-surface-pearl)] px-3 py-1 text-sm text-[var(--color-ink-muted-80)]"
              >
                {tag.name}
              </span>
            ))}
          </div>

          {/* Add to Cart */}
          {session ? (
            <form action={addToCartAction} className="space-y-4 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-surface-pearl)] p-6">
              <input type="hidden" name="returnPath" value={`/products/${product.slug}`} />
              <input type="hidden" name="currencyCode" value={price.currencyCode} />

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-ink)]">Option</label>
                <select
                  name="sku"
                  className="w-full rounded-pill border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-4 py-3 text-sm text-[var(--color-ink)]"
                >
                  {product.variants.map((variant) => (
                    <option key={variant.id} value={variant.sku}>
                      {variant.title} · {variant.sku}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-ink)]">
                  Quantity
                </label>
                <Input
                  type="number"
                  name="quantity"
                  min={1}
                  defaultValue={1}
                />
              </div>

              <Button type="submit" className="w-full">
                Add to Bag
              </Button>
            </form>
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--color-hairline)] bg-[var(--color-surface-pearl)] p-6">
              <p className="mb-4 text-[var(--color-ink-muted-80)]">
                Sign in to purchase.
              </p>
              <Link href={`/login?next=/products/${product.slug}`}>
                <Button>Sign in to buy</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Variants Table */}
      <section className="border-t border-[var(--color-hairline)] bg-[var(--color-canvas-parchment)] px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-6 text-[28px] font-semibold text-[var(--color-ink)]">
            Technical Specifications
          </h2>
          <div className="space-y-4">
            {product.variants.map((variant) => {
              const variantPrice = getPrimaryPrice(
                { ...product, variants: [variant] },
                price.currencyCode
              );
              return (
                <div
                  key={variant.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-4"
                >
                  <div>
                    <p className="font-semibold text-[var(--color-ink)]">
                      {variant.title}
                    </p>
                    <p className="text-sm text-[var(--color-ink-muted-48)]">
                      SKU {variant.sku}
                    </p>
                    <div className="mt-2 space-y-1">
                      {Object.entries(variant.attributes).map(([key, value]) => (
                        <p key={key} className="text-sm text-[var(--color-ink-muted-80)]">
                          <span className="capitalize">{key}</span>: {value}
                        </p>
                      ))}
                      <p className="text-sm text-[var(--color-ink-muted-48)]">
                        Stock: {variant.inventoryOnHand}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-[var(--color-ink)]">
                      {variantPrice.currencyCode === "USD" ? "$" : ""}
                      {variantPrice.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd apps/storefront
git add "app/products/[slug]/page.tsx"
git commit -m "feat: implement Apple-style product detail page"
```

---

## Task 7: Verify Implementation

**Files:**
- Run: `apps/storefront` dev server and tests

- [ ] **Step 1: Run typecheck**

Run: `cd apps/storefront && pnpm typecheck`

Expected: No errors

- [ ] **Step 2: Run lint**

Run: `cd apps/storefront && pnpm lint`

Expected: No errors

- [ ] **Step 3: Run tests**

Run: `cd apps/storefront && pnpm test`

Expected: All tests pass

- [ ] **Step 4: Test dev server**

Run: `cd apps/storefront && pnpm dev`

Expected: Dev server starts without errors

- [ ] **Step 5: Commit final**

```bash
git add -A
git commit -m "feat: complete Apple-style storefront UI implementation"
```

---

## Plan Complete

The implementation follows the Apple design spec from DESIGN.md:

- ✅ Design tokens (colors, typography, spacing) in globals.css
- ✅ shadcn components (button, input, card) styled to Apple specs
- ✅ Apple-style navigation (global nav + sub-nav)
- ✅ Homepage with alternating light/dark product tiles
- ✅ Products catalog with Apple utility cards
- ✅ Product detail with product shadow and Apple styling

**Key Apple principles applied:**
- Single Action Blue (#0066cc) for all interactive elements
- Typography: 17px body, SF Pro Display for headlines
- Single drop-shadow only on product imagery
- Pill buttons (rounded-pill)
- Tiles alternate light/dark as section dividers