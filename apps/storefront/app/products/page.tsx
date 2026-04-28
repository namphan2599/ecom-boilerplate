import Link from 'next/link';
import { ProductCard } from '@/components/catalog/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCatalogProducts, getCategories } from '@/lib/aura/client';
import { filterProducts, toProductCard } from '@/lib/aura/mappers';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = (searchParams ? await searchParams : {}) ?? {};
  const query = typeof params.q === 'string' ? params.q : '';
  const category = typeof params.category === 'string' ? params.category : '';

  const [{ items }, categories] = await Promise.all([
    getCatalogProducts(),
    getCategories(),
  ]);

  const filtered = filterProducts(items, query, category);

  return (
    <div className="min-h-screen bg-[var(--color-canvas)]">
      {/* Header */}
      <section className="px-6 py-12 text-center">
        <h1 className="text-[56px] font-semibold tracking-tight text-[var(--color-ink)]">
          Store
        </h1>
        <p className="mt-4 text-lg text-[var(--color-ink-muted-80)]">
          The best of Aura. Curated for you.
        </p>
      </section>

      {/* Search */}
      <section className="mx-auto max-w-2xl px-6 pb-12">
        <form className="flex gap-3" method="get">
          <Input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search products..."
            className="flex-1"
          />
          <select
            name="category"
            defaultValue={category}
            className="rounded-pill border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-4 py-3 text-sm text-[var(--color-ink)]"
          >
            <option value="">All</option>
            {categories.map((item: { id: string; slug: string; name: string }) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
          <Button type="submit">Search</Button>
        </form>
      </section>

      {/* Products Grid */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-[var(--color-ink-muted-80)]">
            {filtered.length} products
          </p>
          {(query || category) && (
            <Link href="/products" className="text-sm text-[var(--color-primary)]">
              Clear
            </Link>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--color-hairline)] bg-[var(--color-surface-pearl)] p-12 text-center text-[var(--color-ink-muted-80)]">
            No products found.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={toProductCard(product)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}