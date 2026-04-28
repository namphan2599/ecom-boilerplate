import Link from 'next/link';
import { ProductCard } from '@/components/catalog/product-card';
import { Button } from '@/components/ui/button';
import { getCatalogProducts } from '@/lib/aura/client';
import { toProductCard } from '@/lib/aura/mappers';

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