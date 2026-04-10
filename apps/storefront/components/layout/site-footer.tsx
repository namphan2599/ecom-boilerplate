export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white/90">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-600 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
        <p>Built for Aura storefront validation on top of the `/api/v1` backend.</p>
        <p>Demo credentials are available in the root README and seeding docs.</p>
      </div>
    </footer>
  );
}
