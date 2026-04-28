'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';
import { ProductCard } from '@/components/catalog/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ProductCardModel } from '@/lib/aura/types';

interface ProductListProps {
  products: ProductCardModel[];
  categories: { id: string; slug: string; name: string }[];
}

export function ProductList({ products, categories }: ProductListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const query = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? '';

  const [searchValue, setSearchValue] = useState(query);

  useEffect(() => {
    setSearchValue(query);
  }, [query]);

  const filtered = filterClientProducts(products, query, category);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get('q') as string;
    const category = formData.get('category') as string;

    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);

    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  const handleClear = () => {
    startTransition(() => {
      router.push('/products');
    });
  };

  return (
    <div className="min-h-screen bg-[var(--color-canvas)]">
      <section className="px-6 py-12 text-center">
        <h1 className="text-[56px] font-semibold tracking-tight text-[var(--color-ink)]">
          Store
        </h1>
        <p className="mt-4 text-lg text-[var(--color-ink-muted-80)]">
          The best of Aura. Curated for you.
        </p>
      </section>

      <section className="mx-auto max-w-2xl px-6 pb-12">
        <form onSubmit={handleSearch} className="flex gap-3">
          <Input
            type="search"
            name="q"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search products..."
            className="flex-1"
          />
          <select
            name="category"
            defaultValue={category}
            className="rounded-pill border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-4 py-3 text-sm text-[var(--color-ink)]"
          >
            <option value="">All</option>
            {categories.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
          <Button type="submit">Search</Button>
        </form>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-[var(--color-ink-muted-80)]">
            {isPending ? 'Loading...' : `${filtered.length} products`}
          </p>
          {(query || category) && (
            <button
              onClick={handleClear}
              className="text-sm text-[var(--color-primary)]"
            >
              Clear
            </button>
          )}
        </div>

        {isPending ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-lg bg-[var(--color-divider-soft)]" />
                <div className="mt-4 space-y-2">
                  <div className="h-4 w-20 rounded bg-[var(--color-divider-soft)]" />
                  <div className="h-5 w-32 rounded bg-[var(--color-divider-soft)]" />
                  <div className="h-4 w-40 rounded bg-[var(--color-divider-soft)]" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--color-hairline)] bg-[var(--color-surface-pearl)] p-12 text-center text-[var(--color-ink-muted-80)]">
            No products found.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function filterClientProducts(
  products: ProductCardModel[],
  query: string,
  category: string
): ProductCardModel[] {
  return products.filter((product) => {
    const matchesQuery =
      !query ||
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description?.toLowerCase().includes(query.toLowerCase());
    const matchesCategory =
      !category || product.categorySlug === category;
    return matchesQuery && matchesCategory;
  });
}