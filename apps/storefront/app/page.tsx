import Link from 'next/link';
import { ProductCard } from '@/components/catalog/product-card';
import { Button } from '@/components/ui/button';
import { getCatalogProducts } from '@/lib/product';
import { toProductCard } from '@/lib/mappers';

export default async function Home() {
  const { items } = await getCatalogProducts();
  const allProducts = items.slice(0, 8);

  return (
    <main>
      {/* Hero Banner */}
      <section className="flex min-h-[60vh] flex-col items-center justify-center bg-[var(--color-canvas)] py-[80px] text-center">
        <h1 className="mt-4 text-[56px] font-semibold tracking-tight text-[var(--color-ink)]">
          Aura Store
        </h1>
        <p className="mt-4 max-w-xl text-[24px] text-[var(--color-ink-muted-80)]">
          Curated essentials for modern living.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/products">
            <Button>Shop Now</Button>
          </Link>
        </div>
      </section>

      {/* Products Grid */}
      <section className="bg-[var(--color-canvas-parchment)] px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-8 text-center text-[34px] font-semibold text-[var(--color-ink)]">
            All Products
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={toProductCard(product)} />
            ))}
          </div>
          {items.length > 8 && (
            <div className="mt-12 text-center">
              <Link href="/products">
                <Button variant="secondary">View All Products</Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}