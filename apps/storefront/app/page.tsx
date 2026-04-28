import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-[var(--color-canvas)] min-h-screen text-[var(--color-ink)]">
      {/* Hero Tile - Light */}
      <section className="flex min-h-[80vh] flex-col items-center justify-center bg-[var(--color-canvas)] py-[80px] text-center">
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--color-ink-muted-48)] mb-4">
          New
        </span>
        <h1 className="text-[56px] font-semibold tracking-tight leading-tight text-[var(--color-ink)]">
          Aura Studio
        </h1>
        <p className="text-[24px] font-normal text-[var(--color-ink-muted-80)] mt-4 max-w-xl">
          A curated space for creative expression. Designed to inspire every moment.
        </p>
        <div className="flex gap-4 mt-8">
          <Link
            href="/learn"
            className="rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] px-6 py-3 text-sm font-medium hover:bg-[var(--color-primary-focus)] transition-colors"
          >
            Learn more
          </Link>
          <Link
            href="/buy"
            className="rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] px-6 py-3 text-sm font-medium hover:bg-[var(--color-primary-focus)] transition-colors"
          >
            Buy
          </Link>
        </div>
      </section>

      {/* Product Tile 1 - Dark (iPhone-style) */}
      <section className="flex min-h-[80vh] flex-col items-center justify-center bg-[var(--color-surface-tile-1)] py-[80px] text-center text-[var(--color-body-on-dark)]">
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--color-body-muted)] mb-4">
          New
        </span>
        <h2 className="text-[40px] font-semibold tracking-tight text-[var(--color-on-dark)]">
          iPhone
        </h2>
        <p className="text-[24px] font-normal text-[var(--color-body-muted)] mt-4 max-w-xl">
          Built for Apple Intelligence. Pro-level camera. Game-changing performance.
        </p>
        <div className="flex gap-4 mt-8">
          <Link
            href="/learn-iphone"
            className="rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] px-6 py-3 text-sm font-medium hover:bg-[var(--color-primary-focus)] transition-colors"
          >
            Learn more
          </Link>
          <Link
            href="/buy-iphone"
            className="rounded-full bg-transparent border border-[var(--color-primary)] text-[var(--color-primary-on-dark)] px-6 py-3 text-sm font-medium hover:bg-[var(--color-primary)] hover:text-[var(--color-on-primary)] transition-colors"
          >
            Buy
          </Link>
        </div>
      </section>

      {/* Product Tile 2 - Light (MacBook-style) */}
      <section className="flex min-h-[80vh] flex-col items-center justify-center bg-[var(--color-canvas)] py-[80px] text-center text-[var(--color-ink)]">
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--color-ink-muted-48)] mb-4">
          New
        </span>
        <h2 className="text-[40px] font-semibold tracking-tight text-[var(--color-ink)]">
          MacBook Air
        </h2>
        <p className="text-[24px] font-normal text-[var(--color-ink-muted-80)] mt-4 max-w-xl">
          Lean. Mean. M4 machine. Supercharged by M4.
        </p>
        <div className="flex gap-4 mt-8">
          <Link
            href="/learn-macbook"
            className="rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] px-6 py-3 text-sm font-medium hover:bg-[var(--color-primary-focus)] transition-colors"
          >
            Learn more
          </Link>
          <Link
            href="/buy-macbook"
            className="rounded-full bg-transparent border border-[var(--color-primary)] text-[var(--color-primary)] px-6 py-3 text-sm font-medium hover:bg-[var(--color-primary)] hover:text-[var(--color-on-primary)] transition-colors"
          >
            Buy
          </Link>
        </div>
      </section>

      {/* Product Tile 3 - Dark (Apple Watch-style) */}
      <section className="flex min-h-[80vh] flex-col items-center justify-center bg-[var(--color-surface-tile-1)] py-[80px] text-center text-[var(--color-body-on-dark)]">
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--color-body-muted)] mb-4">
          New
        </span>
        <h2 className="text-[40px] font-semibold tracking-tight text-[var(--color-on-dark)]">
          Apple Watch
        </h2>
        <p className="text-[24px] font-normal text-[var(--color-body-muted)] mt-4 max-w-xl">
          Smarter. Brighter. Mightier. The ultimate device for a healthy life.
        </p>
        <div className="flex gap-4 mt-8">
          <Link
            href="/learn-watch"
            className="rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] px-6 py-3 text-sm font-medium hover:bg-[var(--color-primary-focus)] transition-colors"
          >
            Learn more
          </Link>
          <Link
            href="/buy-watch"
            className="rounded-full bg-transparent border border-[var(--color-primary)] text-[var(--color-primary-on-dark)] px-6 py-3 text-sm font-medium hover:bg-[var(--color-primary)] hover:text-[var(--color-on-primary)] transition-colors"
          >
            Buy
          </Link>
        </div>
      </section>

      {/* Featured Products Grid - Parchment background */}
      <section className="bg-[var(--color-canvas-parchment)] px-6 py-16">
        <h2 className="text-[28px] font-semibold text-center mb-12">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-[var(--color-canvas)] rounded-lg p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="aspect-square bg-[var(--color-divider-soft)] rounded-lg mb-4 flex items-center justify-center">
                <span className="text-[var(--color-ink-muted-48)] text-sm">Product Image</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Product {item}</h3>
              <p className="text-[var(--color-ink-muted-48)] text-sm mb-4">
                Premium design for everyday excellence.
              </p>
              <span className="text-[var(--color-ink)] font-medium">From $999</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}