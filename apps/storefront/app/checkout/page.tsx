import Link from 'next/link';
import { startCheckoutAction } from '@/app/actions';
import { getCart } from '@/lib/aura/client';
import { requireSession } from '@/lib/auth/session';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const session = await requireSession('/checkout');
  const params = (searchParams ? await searchParams : {}) ?? {};
  const error = typeof params.error === 'string' ? params.error : '';
  const cart = await getCart(session.token, session.user.userId);

  if (cart.items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
        <p>Your cart is empty, so checkout is not ready yet.</p>
        <Link href="/products" className="mt-4 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Hosted checkout</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Confirm your Aura order</h1>
        <p className="mt-2 text-sm text-slate-600">
          Checkout stays on the backend side for pricing, discounts, tax, shipping, and Stripe session creation.
        </p>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          {cart.items.map((item) => (
            <div key={`${item.sku}-${item.currencyCode}`} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3">
              <div>
                <p className="font-medium text-slate-950">{item.productName}</p>
                <p className="text-sm text-slate-600">{item.variantName} · Qty {item.quantity}</p>
              </div>
              <p className="font-semibold text-slate-950">{formatCurrency(item.lineTotal, item.currencyCode)}</p>
            </div>
          ))}
        </div>
      </section>

      <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Payment handoff</h2>
        <p className="mt-2 text-sm text-slate-600">
          Signed in as <span className="font-medium text-slate-900">{session.user.email}</span>
        </p>

        <form action={startCheckoutAction} className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Optional coupon code
            <input
              type="text"
              name="couponCode"
              placeholder="AURA20"
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
            />
          </label>

          <dl className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <div className="flex items-center justify-between gap-3">
              <dt>Subtotal</dt>
              <dd>{formatCurrency(cart.summary.subtotal, cart.summary.currencyCode)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt>Items</dt>
              <dd>{cart.summary.itemCount}</dd>
            </div>
          </dl>

          <button
            type="submit"
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Continue to Stripe checkout
          </button>
        </form>
      </aside>
    </div>
  );
}
