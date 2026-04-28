import Image from 'next/image';
import Link from 'next/link';
import type { ProductCardModel } from '@/lib/aura/types';
import { PriceBadge } from './price-badge';

export function ProductCard({ product }: { product: ProductCardModel }) {
  return (
    <article className="overflow-hidden rounded-[18px] border border-[#e0e0e0] bg-white transition hover:shadow-lg">
      <Link href={`/products/${product.slug}`} className="block">
        {product.imageUrl ? (
          <div className="relative h-52 w-full bg-[#f5f5f7]">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              unoptimized
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        ) : (
          <div className="flex h-52 items-center justify-center bg-linear-to-br from-[#1d1d1f] via-[#434344] to-[#0066cc] text-lg font-semibold text-white">
            Aura
          </div>
        )}
      </Link>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-[#f5f5f7] px-2.5 py-1 text-xs font-medium text-[#1d1d1f]">
              {product.categoryLabel}
            </span>
            {product.featured ? (
              <span className="rounded-full bg-[#0066cc]/10 px-2.5 py-1 text-xs font-semibold text-[#0066cc]">
                Featured
              </span>
            ) : null}
          </div>

          <Link href={`/products/${product.slug}`} className="block text-lg font-semibold text-[#1d1d1f] hover:text-[#0066cc]">
            {product.name}
          </Link>

          <p className="line-clamp-2 text-sm text-[#86868b]">{product.description}</p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <PriceBadge
            amount={product.priceAmount}
            currencyCode={product.priceCurrencyCode}
            compareAtAmount={product.compareAtAmount}
          />
          <span className="text-xs text-[#86868b]">{product.variantCount} variant(s)</span>
        </div>
      </div>
    </article>
  );
}