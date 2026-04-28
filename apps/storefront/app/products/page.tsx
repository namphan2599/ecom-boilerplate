import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/catalog/product-card';
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
    <div className="space-y-8">
      <section className="rounded-3xl border border-[#e0e0e0] bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0066cc]">Store</p>
        <h1 className="mt-2 text-4xl font-semibold text-[#1d1d1f]">Browse Aura products</h1>
        <p className="mt-2 max-w-2xl text-base text-[#86868b]">
          Filter by category or keyword while the storefront pulls from Aura&apos;s public catalog endpoints.
        </p>

        <form className="mt-6 flex flex-wrap gap-3" method="get">
          <Input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search hoodies, tees, featured..."
          />
          <select
            name="category"
            defaultValue={category}
            className="flex h-11 rounded-2xl border border-[#e0e0e0] bg-white px-4 py-3 text-sm text-[#1d1d1f] outline-none transition-colors focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20"
          >
            <option value="">All categories</option>
            {categories.map((item: { id: string; slug: string; name: string }) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
          <Button type="submit">Apply filters</Button>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-[#86868b]">{filtered.length} product(s) shown</p>
          {(query || category) && (
            <Link href="/products" className="text-sm font-medium text-[#0066cc] hover:text-[#0055aa]">
              Clear filters
            </Link>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#e0e0e0] bg-[#f5f5f7] p-8 text-center text-[#86868b]">
            No products matched the current filters.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={toProductCard(product)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}