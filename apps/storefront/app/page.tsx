import Link from 'next/link';
import { ProductCard } from '@/components/catalog/product-card';
import { getCatalogProducts } from '@/lib/aura/client';
import { toProductCard } from '@/lib/aura/mappers';

export default async function Home() {
  const { items, total } = await getCatalogProducts();
  const featuredProducts = items.filter((product) => product.isFeatured).slice(0, 3);

  return (
    <div className="bg-white text-neutral-900 min-h-screen font-sans selection:bg-neutral-900 selection:text-white">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center pt-32 pb-24 px-6 sm:px-12 lg:px-24 text-center">
        <div className="max-w-3xl space-y-8">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-500">
            Aura Minimalist
          </span>
          <h1 className="text-5xl md:text-7xl font-light tracking-tight leading-tight text-neutral-900">
            Simplicity in <br className="hidden md:inline" /> every detail.
          </h1>
          <p className="text-lg text-neutral-500 max-w-xl mx-auto font-light leading-relaxed">
            Curated collections designed to elevate your everyday. Explore our essential pieces that bring harmony to modern living.
          </p>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/products"
              className="w-full sm:w-auto px-8 py-4 bg-neutral-900 text-white text-xs font-medium tracking-widest uppercase transition-all hover:bg-neutral-800"
            >
              Shop Collection
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white text-neutral-900 border border-neutral-200 text-xs font-medium tracking-widest uppercase transition-all hover:border-neutral-900"
            >
              Client Login
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="px-6 pb-24 sm:px-12 lg:px-24 max-w-7xl mx-auto">
        <h2 className="text-2xl font-light tracking-wide text-neutral-900 mb-10">Explore Collections</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[ 'Living', 'Dining', 'Workspace', 'Accents' ].map((category, idx) => (
            <Link key={idx} href={`/categories/${category.toLowerCase()}`} className="group block text-center">
              <div className="aspect-square bg-neutral-100 flex items-center justify-center overflow-hidden mb-4 transition-colors group-hover:bg-neutral-200">
                <span className="text-neutral-400 font-light text-sm uppercase tracking-widest">{category} image</span>
              </div>
              <span className="text-xs uppercase tracking-widest text-neutral-900">{category}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Carousel Section */}
      <section className="px-6 pb-24 sm:px-12 lg:px-24 w-full">
        <div className="flex items-center justify-between gap-6 mb-10 max-w-7xl mx-auto">
          <h2 className="text-2xl font-light tracking-wide text-neutral-900">New Arrivals</h2>
          <div className="flex gap-2">
            <button aria-label="Previous" className="p-2 border border-neutral-200 text-neutral-400 hover:text-neutral-900 hover:border-neutral-900 transition-colors">
              <span className="font-light">←</span>
            </button>
            <button aria-label="Next" className="p-2 border border-neutral-200 text-neutral-400 hover:text-neutral-900 hover:border-neutral-900 transition-colors">
              <span className="font-light">→</span>
            </button>
          </div>
        </div>
        <div className="flex overflow-x-hidden gap-6 max-w-7xl mx-auto">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="min-w-[70vw] sm:min-w-[40vw] md:min-w-[25vw] flex-shrink-0 group cursor-pointer">
              <div className="aspect-[3/4] bg-neutral-100 flex items-center justify-center mb-4 transition-colors group-hover:bg-neutral-200/80">
                <span className="text-neutral-400 text-sm font-light uppercase tracking-widest">Placeholder {item}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Collection */}
      <section className="px-6 py-24 sm:px-12 lg:px-24 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-end justify-between gap-6 mb-16">
          <div className="space-y-3">
            <h2 className="text-2xl font-light tracking-wide text-neutral-900">Featured Curations</h2>
            <p className="text-sm text-neutral-500 font-light">Explore highlighting selections for the season.</p>
          </div>
          <Link
            href="/products"
            className="group flex items-center text-xs font-medium uppercase tracking-widest text-neutral-900 transition-colors hover:text-neutral-500"
          >
            <span className="relative overflow-hidden inline-block pb-1">
              View All
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-neutral-900 transition-transform origin-left group-hover:scale-x-0"></span>
            </span>
            <span className="ml-2 font-light">→</span>
          </Link>
        </div>

        <div className="grid gap-x-8 gap-y-16 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={toProductCard(product)} />
          ))}
        </div>
      </section>

      {/* Brand Ethos */}
      <section className="bg-neutral-50 py-32 px-6 sm:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl font-light tracking-tight text-neutral-900">
            A commitment to enduring design.
          </h2>
          <p className="text-lg text-neutral-500 font-light leading-relaxed">
            We believe in objects that last. Crafted with precision, our products strip away the unnecessary, leaving only what matters. Functionality and aesthetic, perfectly balanced.
          </p>
        </div>
      </section>

    </div>
  );
}
