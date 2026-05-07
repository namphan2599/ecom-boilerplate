import Link from 'next/link';
import { getOrderHistory } from '@/lib/order';
import { requireSession } from '@/lib/auth';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const session = await requireSession('/account/orders');
  const { items, total } = await getOrderHistory(session.token);

  return (
    <main className="mx-auto max-w-[980px] px-4 py-12">
      <section className="pb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">Account</p>
        <h1 className="mt-2 text-[34px] font-semibold tracking-[-0.374px] leading-[1.47] text-[var(--color-ink)]">
          Order history
        </h1>
        <p className="mt-2 text-sm text-[var(--color-ink-muted-48)]">
          {session.user.email} · {total} order(s) available from Aura.
        </p>
      </section>

      {items.length === 0 ? (
        <div className="rounded-[var(--rounded-lg)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-10 text-center text-[var(--color-ink-muted-80)]">
          <p>No orders have been created yet for this account.</p>
          <Link href="/products" className="mt-4 inline-block rounded-[var(--rounded-pill)] bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-[var(--color-on-primary)] transition hover:bg-[var(--color-primary-focus)]">
            Start shopping
          </Link>
        </div>
      ) : (
        <section className="space-y-0">
          {items.map((order) => (
            <article key={order.orderNumber} className="border-b border-[var(--color-hairline)] py-6 last:border-0">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-[var(--color-ink)]">{order.orderNumber}</p>
                  <p className="text-sm text-[var(--color-ink-muted-48)]">Placed {formatDateTime(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[var(--color-ink-muted-80)]">{order.status}</p>
                  <p className="text-xs text-[var(--color-ink-muted-48)]">Payment: {order.paymentStatus}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <div className="rounded-[var(--rounded-md)] bg-[var(--color-canvas-parchment)] px-4 py-3 text-[var(--color-ink-muted-80)]">
                  <p className="font-semibold text-[var(--color-ink)]">Total</p>
                  <p>{formatCurrency(order.grandTotal, order.currencyCode)}</p>
                </div>
                <div className="rounded-[var(--rounded-md)] bg-[var(--color-canvas-parchment)] px-4 py-3 text-[var(--color-ink-muted-80)]">
                  <p className="font-semibold text-[var(--color-ink)]">Items</p>
                  <p>{order.items.length} line(s)</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
