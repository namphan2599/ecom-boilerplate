import Link from 'next/link';
import { ProductCard } from '@/components/catalog/product-card';
import { getCatalogProducts } from '@/lib/aura/client';
import { toProductCard } from '@/lib/aura/mappers';

export default async function Home() {
  const { items, total } = await getCatalogProducts();
  const featuredProducts = items.filter((product) => product.isFeatured).slice(0, 3);

  return (
    <div className="space-y-12">
      <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl">
        <div className="grid gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[1.3fr_0.7fr] lg:px-10 lg:py-12">
          <div className="space-y-5">
            <span className="inline-flex rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              Aura x Next.js
            </span>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
              A production-ready storefront shell for the Aura e-commerce backend.
            </h1>
            <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
              Browse the catalog, sign in with the seeded demo account, manage a cart, and hand off checkout to Aura’s hosted Stripe session flow.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/products"
                className="rounded-full bg-cyan-400 px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Browse products
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-white/20 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Sign in with demo data
              </Link>
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl bg-white/5 p-4 text-sm text-slate-200">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">API source of truth</p>
              <p className="mt-2 font-mono text-sm text-cyan-200">http://localhost:3000/api/v1</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Frontend routes</p>
              <p className="mt-2">`/products`, `/cart`, `/checkout`, `/account/orders`</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Demo readiness</p>
              <p className="mt-2">{total} catalog product(s) available now.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Featured products</p>
            <h2 className="text-2xl font-semibold text-slate-950">Start with Aura’s hero catalog entries</h2>
          </div>
          <Link href="/products" className="text-sm font-medium text-cyan-700 hover:text-cyan-800">
            View full catalog →
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={toProductCard(product)} />
          ))}
        </div>
      </section>
    </div>
  );
}
