import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { addToCartAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddToCartButton } from '@/components/catalog/add-to-cart-button';
import { getProductBySlug } from '@/lib/product';
import { getPrimaryPrice } from '@/lib/mappers';
import type { CatalogProductView } from '@/lib/types';
import { getSession } from '@/lib/auth';

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
              <span>{product.category?.name ?? 'Aura'}</span>
              {product.isFeatured && <span>New</span>}
            </div>
            <h1 className="text-[40px] font-semibold tracking-tight text-[var(--color-ink)]">
              {product.name}
            </h1>
            <p className="text-lg leading-relaxed text-[var(--color-ink-muted-80)]">
              {product.description ?? 'A dependable Aura product.'}
            </p>
          </div>

          <div className="text-[28px] font-semibold text-[var(--color-ink)]">
            {price.currencyCode === 'USD' ? '$' : ''}
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

              <AddToCartButton>Add to Bag</AddToCartButton>
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
                      {variantPrice.currencyCode === 'USD' ? '$' : ''}
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