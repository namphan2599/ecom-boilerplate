import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center text-amber-900 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Checkout cancelled</p>
      <h1 className="mt-3 text-3xl font-semibold">No problem — your cart is still available.</h1>
      <p className="mt-3 text-sm leading-6">
        Return to checkout when you are ready or adjust the cart contents first.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/checkout" className="rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white">
          Return to checkout
        </Link>
        <Link href="/cart" className="rounded-full border border-amber-300 px-5 py-3 text-sm font-semibold text-amber-800">
          Back to cart
        </Link>
      </div>
    </div>
  );
}
