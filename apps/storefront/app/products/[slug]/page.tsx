import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { addToCartAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PriceBadge } from '@/components/catalog/price-badge';
import { getProductBySlug } from '@/lib/aura/client';
import { getPrimaryPrice } from '@/lib/aura/mappers';
import type { CatalogProductView } from '@/lib/aura/types';
import { getSession } from '@/lib/auth/session';

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
    <div className="space-y-16">
      <div>
        <Link
          href="/store"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#0066cc] hover:underline"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9.5 3.5L4.5 7L9.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Store
        </Link>
      </div>

      <div className="grid gap-16 lg:grid-cols-[1.2fr_1fr] lg:gap-24">
        <div className="relative">
          <div className="overflow-hidden rounded-[32px] bg-[#f5f5f7]">
            {product.imageUrl ? (
              <div className="relative aspect-square w-full">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-cyan-700 text-4xl font-semibold text-white">
                Aura
              </div>
            )}
          </div>
          <div className="pointer-events-none absolute inset-0 rounded-[32px] shadow-[rgba(0,0,0,0.22)_3px_5px_30px]" />
        </div>

        <div className="flex flex-col justify-center space-y-8">
          <div className="space-y-4">
            <p className="text-lg font-semibold text-[#86868b]">{product.category?.name ?? 'Aura Catalog'}</p>
            <h1 className="text-5xl font-semibold leading-[1.1] text-[#1d1d1f]">{product.name}</h1>
            <p className="text-xl leading-relaxed text-[#86868b]">
              {product.description ?? 'A dependable Aura catalog item ready for local storefront integration.'}
            </p>
          </div>

          <PriceBadge
            amount={price.amount}
            currencyCode={price.currencyCode}
            compareAtAmount={price.compareAtAmount}
          />

          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full bg-[#f5f5f7] px-4 py-1.5 text-sm font-medium text-[#86868b]"
              >
                {tag.name}
              </span>
            ))}
          </div>

          {session ? (
            <form action={addToCartAction} className="space-y-5 rounded-3xl border border-[#d2d2d7] p-6">
              <input type="hidden" name="returnPath" value={`/products/${product.slug}`} />
              <input type="hidden" name="currencyCode" value={price.currencyCode} />

              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#1d1d1f]">Select Model</label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <label
                      key={variant.id}
                      className="cursor-pointer rounded-full border border-[#d2d2d7] px-4 py-2 text-sm font-medium text-[#1d1d1f] hover:border-[#0066cc] hover:text-[#0066cc]"
                    >
                      <input type="radio" name="sku" value={variant.sku} className="sr-only" />
                      {variant.title}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#1d1d1f]">Quantity</label>
                <Input
                  type="number"
                  min={1}
                  name="quantity"
                  defaultValue={1}
                  className="max-w-32"
                />
              </div>

              <Button type="submit" className="w-full rounded-full text-base">
                Add to Bag
              </Button>
            </form>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#d2d2d7] bg-[#f5f5f7] p-6">
              <p className="text-[#86868b]">Sign in with the seeded demo account before adding items to the Aura cart.</p>
              <Link
                href={`/login?next=/products/${product.slug}`}
                className="mt-4 inline-flex rounded-full bg-[#0071e3] px-6 py-3 text-base font-semibold text-white hover:bg-[#0077ed]"
              >
                Sign in to buy
              </Link>
            </div>
          )}
        </div>
      </div>

      <section className="rounded-3xl border border-[#d2d2d7] bg-[#f5f5f7] p-8">
        <h2 className="text-4xl font-semibold text-[#1d1d1f]">Technical Specifications</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {product.variants.map((variant) => {
            const variantPrice = getPrimaryPrice({ ...product, variants: [variant] }, price.currencyCode);
            return (
              <div key={variant.id} className="rounded-2xl border border-[#d2d2d7] bg-white p-6">
                <div className="mb-4 flex items-center justify-between border-b border-[#d2d2d7] pb-4">
                  <div>
                    <p className="text-lg font-semibold text-[#1d1d1f]">{variant.title}</p>
                    <p className="text-sm text-[#86868b]">Model {variant.sku}</p>
                  </div>
                  <PriceBadge
                    amount={variantPrice.amount}
                    currencyCode={variantPrice.currencyCode}
                    compareAtAmount={variantPrice.compareAtAmount}
                  />
                </div>
                <dl className="space-y-3">
                  {Object.entries(variant.attributes).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <dt className="text-sm font-medium text-[#86868b] capitalize">{key}</dt>
                      <dd className="text-sm font-medium text-[#1d1d1f]">{value}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2">
                    <dt className="text-sm font-medium text-[#86868b]">Availability</dt>
                    <dd className="text-sm font-medium text-[#1d1d1f]">{variant.inventoryOnHand} in stock</dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}