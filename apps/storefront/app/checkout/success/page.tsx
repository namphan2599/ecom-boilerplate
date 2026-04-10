import Link from 'next/link';

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center text-emerald-900 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Checkout returned</p>
      <h1 className="mt-3 text-3xl font-semibold">Success callback reached the storefront.</h1>
      <p className="mt-3 text-sm leading-6">
        Aura’s hosted checkout flow can now route users back here after payment completion.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/account/orders" className="rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white">
          View orders
        </Link>
        <Link href="/products" className="rounded-full border border-emerald-300 px-5 py-3 text-sm font-semibold text-emerald-800">
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
