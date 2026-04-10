import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Not found</p>
      <h1 className="mt-3 text-3xl font-semibold text-slate-950">That Aura page does not exist.</h1>
      <p className="mt-3 text-slate-600">
        The requested product or route could not be found. Return to the catalog and try again.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/products" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
          Browse products
        </Link>
        <Link href="/" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">
          Back home
        </Link>
      </div>
    </div>
  );
}
