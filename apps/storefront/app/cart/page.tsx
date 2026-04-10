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
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Your cart</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Review Aura cart items</h1>
        <p className="mt-2 text-sm text-slate-600">
          Signed in as <span className="font-medium text-slate-900">{session.user.email}</span>
        </p>
      </section>

      {added ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          The product was added to your cart.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      {cart.items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
          <p>Your cart is empty.</p>
          <Link href="/products" className="mt-4 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-4">
            {cart.items.map((item) => (
              <article key={`${item.sku}-${item.currencyCode}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-slate-950">{item.productName}</h2>
                    <p className="text-sm text-slate-600">{item.variantName} · {item.sku}</p>
                    <p className="text-sm text-slate-600">
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
                        className="w-20 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                      />
                      <button
                        type="submit"
                        className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                      >
                        Update
                      </button>
                    </form>

                    <form action={removeCartItemAction}>
                      <input type="hidden" name="sku" value={item.sku} />
                      <button type="submit" className="text-sm font-medium text-rose-700 hover:text-rose-800">
                        Remove item
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Order summary</h2>
            <dl className="mt-4 space-y-3 text-sm text-slate-600">
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
              <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3 text-base font-semibold text-slate-950">
                <dt>Subtotal</dt>
                <dd>{formatCurrency(cart.summary.subtotal, cart.summary.currencyCode)}</dd>
              </div>
            </dl>

            <Link href="/checkout" className="mt-6 inline-flex w-full justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              Continue to checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
