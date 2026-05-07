# Cart Button & Add-to-Cart Animation Design

## Overview
Add a cart button to the site header with item count badge and hover dropdown. Implement fly-to-cart animation on product detail page add-to-cart button.

## Components

### 1. CartButton (`components/layout/cart-button.tsx`)
- Shopping bag icon (Lucide or inline SVG)
- Badge showing total item count (red circle, top-right of icon)
- Hover: dropdown panel with cart items list (max 3-5 items)
- Click: navigate to /cart

**UI:**
```
[Bag Icon] [3]  ← badge shows count
     ↓ hover
+-----------+
| Item 1    |
| Item 2    |
| Item 3    |
+-----------+
```

### 2. CartContext (`lib/cart/context.tsx`)
- React context for cart state
- `items`: CartItem[]
- `totalCount`: computed from items
- `addItem(product, quantity)`: optimistic update
- `removeItem(sku)`: optimistic update

### 3. Fly-to-Cart Animation
- On form submit: capture button position, create flying element
- Flying element: small product thumbnail or bag icon
- Animate from button → cart icon position (fixed)
- On complete: trigger badge pulse animation

## Files to Modify
- `components/layout/site-header.tsx` - add CartButton
- `app/actions.ts` - (existing, possibly add client-side hook)
- `app/products/[slug]/page.tsx` - add animation

## Dependencies
- Lucide React for icons (already in use?)
- CSS animations (no framer-motion to keep light)

## Animation Spec (Fly-to-Cart)
1. User clicks "Add to Bag"
2. Capture: button rect, cart icon rect
3. Create floating element at button position
4. Animate: translate + scale to cart icon
5. Duration: 600ms ease-out
6. On complete: badge pulse (scale 1 → 1.3 → 1)