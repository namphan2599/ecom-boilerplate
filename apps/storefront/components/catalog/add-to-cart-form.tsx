'use client';

import { useState } from 'react';
import { AddToCartButton } from './add-to-cart-button';
import { Input } from '@/components/ui/input';
import type { CatalogProductView } from '@/lib/types';

interface AddToCartFormProps {
  product: CatalogProductView;
  currencyCode: string;
}

export function AddToCartForm({ product, currencyCode }: AddToCartFormProps) {
  const [sku, setSku] = useState(product.variants[0]?.sku ?? '');
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="space-y-4 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-surface-pearl)] p-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--color-ink)]">Option</label>
        <select
          value={sku}
          onChange={(e) => setSku(e.target.value)}
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
        <label className="text-sm font-medium text-[var(--color-ink)]">Quantity</label>
        <Input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          min={1}
        />
      </div>

      <AddToCartButton sku={sku} quantity={quantity} currencyCode={currencyCode}>
        Add to Bag
      </AddToCartButton>
    </div>
  );
}