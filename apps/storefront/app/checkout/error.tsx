'use client';

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-[980px] px-4 py-12">
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
        <h2 className="text-xl font-semibold">Unable to load checkout.</h2>
        <p className="mt-2 text-sm">{error.message}</p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-4 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
        >
          Try again
        </button>
      </div>
    </main>
  );
}