export default function CheckoutLoading() {
  return (
    <main className="mx-auto max-w-[980px] px-4 py-12">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-6 py-8">
          <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-10 w-64 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-4 w-96 animate-pulse rounded bg-slate-200" />
          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between border-b border-[var(--color-hairline)] py-4">
                <div className="space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                </div>
                <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </section>
        <aside className="border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-6 py-8 h-fit">
          <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-4 w-48 animate-pulse rounded bg-slate-200" />
          <div className="mt-6 space-y-3">
            <div className="h-20 animate-pulse rounded-[var(--rounded-md)] bg-slate-200" />
            <div className="h-12 animate-pulse rounded-[var(--rounded-pill)] bg-slate-200" />
          </div>
        </aside>
      </div>
    </main>
  );
}