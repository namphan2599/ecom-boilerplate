import Link from 'next/link';
import { removeCartItemAction, updateCartQuantityAction } from '@/app/actions';
import { getCart } from '@/lib/aura/client';
import { requireSession } from '@/lib/auth/session';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CartPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const session = await requireSession('/cart');
  const params = (searchParams ? await searchParams : {}) ?? {};
  const error = typeof params.error === 'string' ? params.error : '';
  const added = params.added === '1';
  const cart = await getCart(session.token, session.user.userId);

  return (
    <main className="mx-auto max-w-[980px] px-4 py-12">
      <section className="pb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">Your cart</p>
        <h1 className="mt-2 text-[34px] font-semibold tracking-[-0.374px] leading-[1.47] text-[var(--color-ink)]">
          Review Aura cart items
        </h1>
        <p className="mt-2 text-sm text-[var(--color-ink-muted-48)]">
          Signed in as <span className="font-medium text-[var(--color-ink)]">{session.user.email}</span>
        </p>
      </section>

      {added ? (
        <div className="mb-6 rounded-[var(--rounded-md)] border border-[var(--color-hairline)] bg-[var(--color-canvas-parchment)] px-4 py-3 text-sm text-[var(--color-ink-muted-80)]">
          The product was added to your cart.
        </div>
      ) : null}

      {error ? (
        <div className="mb-6 rounded-[var(--rounded-md)] border border-[var(--color-hairline)] bg-[var(--color-surface-pearl)] px-4 py-3 text-sm text-[var(--color-ink-muted-80)]">
          {error}
        </div>
      ) : null}

      {cart.items.length === 0 ? (
        <div className="rounded-[var(--rounded-lg)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-10 text-center text-[var(--color-ink-muted-80)]">
          <p>Your cart is empty.</p>
          <Link href="/products" className="mt-4 inline-block rounded-[var(--rounded-pill)] bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-[var(--color-on-primary)] transition hover:bg-[var(--color-primary-focus)]">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-0">
            {cart.items.map((item) => (
              <article key={`${item.sku}-${item.currencyCode}`} className="border-b border-[var(--color-hairline)] py-6 last:border-0">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-[var(--color-ink)]">{item.productName}</h2>
                    <p className="text-sm text-[var(--color-ink-muted-48)]">{item.variantName} · {item.sku}</p>
                    <p className="text-sm text-[var(--color-ink-muted-80)]">
                      {formatCurrency(item.unitPrice, item.currencyCode)} each
                    </p>
                  </div>

                  <div className="space-y-3">
                    <form action={updateCartQuantityAction} className="flex items-center gap-2">
                      <input type="hidden" name="sku" value={item.sku} />
                      <input
                        type="number"
                        name="quantity"
                        min={0}
                        defaultValue={item.quantity}
                        className="w-20 rounded-[var(--rounded-pill)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-3 py-2 text-sm text-[var(--color-ink)]"
                      />
                      <button
                        type="submit"
                        className="rounded-[var(--rounded-pill)] border border-[var(--color-hairline)] bg-[var(--color-surface-pearl)] px-3 py-2 text-xs font-semibold text-[var(--color-ink-muted-80)]"
                      >
                        Update
                      </button>
                    </form>

                    <form action={removeCartItemAction}>
                      <input type="hidden" name="sku" value={item.sku} />
                      <button type="submit" className="text-sm font-medium text-[var(--color-primary)] hover:underline">
                        Remove item
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="rounded-[var(--rounded-lg)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-6 h-fit">
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Order summary</h2>
            <dl className="mt-4 space-y-3 text-sm text-[var(--color-ink-muted-80)]">
              <div className="flex items-center justify-between gap-3">
                <dt>Currency</dt>
                <dd>{cart.summary.currencyCode}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt>Item count</dt>
                <dd>{cart.summary.itemCount}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt>Distinct items</dt>
                <dd>{cart.summary.distinctItems}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-[var(--color-hairline)] pt-3 text-base font-semibold text-[var(--color-ink)]">
                <dt>Subtotal</dt>
                <dd>{formatCurrency(cart.summary.subtotal, cart.summary.currencyCode)}</dd>
              </div>
            </dl>

            <Link href="/checkout" className="mt-6 inline-flex w-full justify-center rounded-[var(--rounded-pill)] bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-[var(--color-on-primary)] transition hover:bg-[var(--color-primary-focus)]">
              Continue to checkout
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
