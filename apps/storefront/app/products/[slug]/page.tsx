import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { addToCartAction } from '@/app/actions';
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
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {product.imageUrl ? (
            <div className="relative min-h-80 w-full bg-slate-100">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex min-h-80 items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-cyan-700 text-4xl font-semibold text-white">
              Aura
            </div>
          )}
        </div>

        <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              <span>{product.category?.name ?? 'Aura catalog'}</span>
              {product.isFeatured ? <span>Featured</span> : null}
            </div>
            <h1 className="text-3xl font-semibold text-slate-950">{product.name}</h1>
            <p className="text-sm leading-6 text-slate-600">
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
              <span key={tag.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {tag.name}
              </span>
            ))}
          </div>

          {session ? (
            <form action={addToCartAction} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <input type="hidden" name="returnPath" value={`/products/${product.slug}`} />
              <input type="hidden" name="currencyCode" value={price.currencyCode} />

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Variant
                <select name="sku" className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900">
                  {product.variants.map((variant) => (
                    <option key={variant.id} value={variant.sku}>
                      {variant.title} · {variant.sku}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Quantity
                <input
                  type="number"
                  min={1}
                  name="quantity"
                  defaultValue={1}
                  className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </label>

              <button
                type="submit"
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Add to cart
              </button>
            </form>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              <p>Sign in with the seeded demo account before adding items to the Aura cart.</p>
              <Link
                href={`/login?next=/products/${product.slug}`}
                className="mt-3 inline-flex rounded-full bg-slate-950 px-4 py-2 font-semibold text-white"
              >
                Sign in to buy
              </Link>
            </div>
          )}
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Variant availability</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {product.variants.map((variant) => {
            const variantPrice = getPrimaryPrice({ ...product, variants: [variant] }, price.currencyCode);
            return (
              <div key={variant.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{variant.title}</p>
                    <p className="text-xs text-slate-500">SKU {variant.sku}</p>
                  </div>
                  <PriceBadge
                    amount={variantPrice.amount}
                    currencyCode={variantPrice.currencyCode}
                    compareAtAmount={variantPrice.compareAtAmount}
                  />
                </div>
                <dl className="mt-3 grid gap-2 text-sm text-slate-600">
                  {Object.entries(variant.attributes).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-3">
                      <dt className="capitalize">{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between gap-3">
                    <dt>Inventory on hand</dt>
                    <dd>{variant.inventoryOnHand}</dd>
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
