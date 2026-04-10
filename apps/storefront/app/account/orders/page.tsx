import Link from 'next/link';
import { getOrderHistory } from '@/lib/aura/client';
import { requireSession } from '@/lib/auth/session';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const session = await requireSession('/account/orders');
  const { items, total } = await getOrderHistory(session.token);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Account</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Order history</h1>
        <p className="mt-2 text-sm text-slate-600">
          {session.user.email} · {total} order(s) available from Aura.
        </p>
      </section>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
          <p>No orders have been created yet for this account.</p>
          <Link href="/products" className="mt-4 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((order) => (
            <article key={order.orderNumber} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{order.orderNumber}</p>
                  <p className="text-sm text-slate-600">Placed {formatDateTime(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700">{order.status}</p>
                  <p className="text-xs text-slate-500">Payment: {order.paymentStatus}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="font-medium text-slate-900">Total</p>
                  <p>{formatCurrency(order.grandTotal, order.currencyCode)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="font-medium text-slate-900">Items</p>
                  <p>{order.items.length} line(s)</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
