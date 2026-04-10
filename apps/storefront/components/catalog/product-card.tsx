import Image from 'next/image';
import Link from 'next/link';
import type { ProductCardModel } from '@/lib/aura/types';
import { PriceBadge } from './price-badge';

export function ProductCard({ product }: { product: ProductCardModel }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="block">
        {product.imageUrl ? (
          <div className="relative h-52 w-full bg-slate-100">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-52 items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-cyan-700 text-lg font-semibold text-white">
            Aura
          </div>
        )}
      </Link>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              {product.categoryLabel}
            </span>
            {product.featured ? (
              <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">
                Featured
              </span>
            ) : null}
          </div>

          <Link href={`/products/${product.slug}`} className="block text-lg font-semibold text-slate-950 hover:text-cyan-700">
            {product.name}
          </Link>

          <p className="line-clamp-2 text-sm text-slate-600">{product.description}</p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <PriceBadge
            amount={product.priceAmount}
            currencyCode={product.priceCurrencyCode}
            compareAtAmount={product.compareAtAmount}
          />
          <span className="text-xs text-slate-500">{product.variantCount} variant(s)</span>
        </div>
      </div>
    </article>
  );
}
