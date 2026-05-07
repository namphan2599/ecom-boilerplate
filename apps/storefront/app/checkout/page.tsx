import Link from 'next/link';
import { startCheckoutAction } from '@/app/actions';
import { getCart } from '@/lib/cart';
import { requireSession } from '@/lib/auth';
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
      <main className="mx-auto max-w-[980px] px-4 py-12">
        <div className="rounded-[var(--rounded-lg)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-10 text-center text-[var(--color-ink-muted-80)]">
          <p>Your cart is empty, so checkout is not ready yet.</p>
          <Link href="/products" className="mt-4 inline-block rounded-[var(--rounded-pill)] bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-[var(--color-on-primary)]">
            Browse products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[980px] px-4 py-12">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-6 py-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">Hosted checkout</p>
          <h1 className="mt-2 text-[34px] font-semibold tracking-[-0.374px] leading-[1.47] text-[var(--color-ink)]">
            Confirm your Aura order
          </h1>
          <p className="mt-2 text-sm text-[var(--color-ink-muted-48)]">
            Checkout stays on the backend side for pricing, discounts, tax, shipping, and Stripe session creation.
          </p>

          {error ? (
            <div className="mt-4 rounded-[var(--rounded-md)] border border-[var(--color-hairline)] bg-[var(--color-surface-pearl)] px-4 py-3 text-sm text-[var(--color-ink-muted-80)]">
              {error}
            </div>
          ) : null}

          <div className="mt-6 space-y-0">
            {cart.items.map((item) => (
              <div key={`${item.sku}-${item.currencyCode}`} className="flex items-center justify-between border-b border-[var(--color-hairline)] py-4 last:border-0">
                <div>
                  <p className="font-medium text-[var(--color-ink)]">{item.productName}</p>
                  <p className="text-sm text-[var(--color-ink-muted-48)]">{item.variantName} · Qty {item.quantity}</p>
                </div>
                <p className="font-semibold text-[var(--color-ink)]">{formatCurrency(item.lineTotal, item.currencyCode)}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-6 py-8 h-fit">
          <h2 className="text-[21px] font-semibold text-[var(--color-ink)]">Payment handoff</h2>
          <p className="mt-2 text-sm text-[var(--color-ink-muted-48)]">
            Signed in as <span className="font-medium text-[var(--color-ink)]">{session.user.email}</span>
          </p>

          <form action={startCheckoutAction} className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-[var(--color-ink)]">
              Optional coupon code
              <input
                type="text"
                name="couponCode"
                placeholder="AURA20"
                className="rounded-[var(--rounded-pill)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-4 py-3 text-[17px] text-[var(--color-ink)]"
              />
            </label>

            <dl className="space-y-2 rounded-[var(--rounded-md)] bg-[var(--color-canvas-parchment)] p-4 text-sm text-[var(--color-ink-muted-80)]">
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
              className="rounded-[var(--rounded-pill)] bg-[var(--color-primary)] px-5 py-3 text-[17px] font-semibold text-[var(--color-on-primary)] transition hover:bg-[var(--color-primary-focus)]"
            >
              Continue to Stripe checkout
            </button>
          </form>
        </aside>
      </div>
    </main>
  );
}
