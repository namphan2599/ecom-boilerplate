import Link from 'next/link';
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
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Catalog</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Browse Aura products</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Filter by category or keyword while the storefront pulls from Aura’s public catalog endpoints.
        </p>

        <form className="mt-5 grid gap-3 md:grid-cols-[1fr_220px_140px]" method="get">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search hoodies, tees, featured..."
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-cyan-500"
          />
          <select
            name="category"
            defaultValue={category}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500"
          >
            <option value="">All categories</option>
            {categories.map((item: { id: string; slug: string; name: string }) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Apply filters
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-600">{filtered.length} product(s) shown</p>
          {(query || category) && (
            <Link href="/products" className="text-sm font-medium text-cyan-700 hover:text-cyan-800">
              Clear filters
            </Link>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
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
