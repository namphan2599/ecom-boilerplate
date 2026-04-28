import Image from 'next/image';
import Link from 'next/link';
import type { ProductCardModel } from '@/lib/aura/types';
import { PriceBadge } from './price-badge';
import { Button } from '@/components/ui/button';

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
          <PriceBadge
            amount={product.priceAmount}
            currencyCode={product.priceCurrencyCode}
            compareAtAmount={product.compareAtAmount}
          />
          <Button size="sm" variant="ghost" className="text-sm">
            {product.variantCount} options
          </Button>
        </div>
      </div>
    </article>
  );
}