import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = (searchParams ? await searchParams : {}) ?? {};
  const error = typeof params.error === 'string' ? params.error : '';
  const nextPath =
    typeof params.next === 'string' && params.next.startsWith('/')
      ? params.next
      : '/products';

  const session = await getSession();
  if (session) {
    redirect(nextPath);
  }

  return (
    <main className="mx-auto max-w-[980px] px-4 py-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <section className="bg-[var(--color-surface-tile-1)] px-8 py-10 text-[var(--color-on-dark)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary-on-dark)]">Create account</p>
          <h1 className="mt-3 text-[34px] font-semibold tracking-[-0.374px] leading-[1.47]">
            Join Aura to start shopping.
          </h1>
          <p className="mt-4 max-w-xl text-[17px] leading-[1.47] text-[var(--color-body-muted)]">
            Create an account to save your cart, track orders, and enjoy a personalized shopping experience.
          </p>

          <div className="mt-8 rounded-[var(--rounded-lg)] border border-[var(--color-hairline)]/20 bg-[var(--color-surface-tile-2)] p-5 text-[14px] text-[var(--color-body-muted)]">
            <p className="font-semibold text-[var(--color-on-dark)]">Why create an account?</p>
            <ul className="mt-3 list-disc pl-4 space-y-1">
              <li>Save items to your cart for later</li>
              <li>Track order history and status</li>
              <li>Faster checkout experience</li>
              <li>Access exclusive deals</li>
            </ul>
          </div>
        </section>

        <section className="border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-8 py-10">
          <h2 className="text-[24px] font-semibold text-[var(--color-ink)]">Create your account</h2>
          <p className="mt-2 text-sm text-[var(--color-ink-muted-48)]">Fill in your details to get started.</p>

          {error ? (
            <div className="mt-4 rounded-[var(--rounded-md)] border border-[var(--color-hairline)] bg-[var(--color-surface-pearl)] px-4 py-3 text-sm text-[var(--color-ink-muted-80)]">
              {error}
            </div>
          ) : null}

          <form action="/api/auth/register" method="post" className="mt-6 grid gap-4">
            <input type="hidden" name="next" value={nextPath} />

            <label className="grid gap-2 text-sm font-medium text-[var(--color-ink)]">
              Email
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                required
                className="rounded-[var(--rounded-pill)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-4 py-3 text-[17px] text-[var(--color-ink)]"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[var(--color-ink)]">
              Password
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                required
                minLength={3}
                className="rounded-[var(--rounded-pill)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-4 py-3 text-[17px] text-[var(--color-ink)]"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-[var(--color-ink)]">
              Confirm Password
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                required
                minLength={8}
                className="rounded-[var(--rounded-pill)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-4 py-3 text-[17px] text-[var(--color-ink)]"
              />
            </label>

            <button
              type="submit"
              className="mt-2 rounded-[var(--rounded-pill)] bg-[var(--color-primary)] px-5 py-3 text-[17px] font-semibold text-[var(--color-on-primary)] transition hover:bg-[var(--color-primary-focus)]"
            >
              Create account
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[var(--color-ink-muted-48)]">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-[var(--color-primary)] hover:underline">
              Sign in
            </Link>
          </p>

          <Link href="/products" className="mt-6 inline-block text-sm font-medium text-[var(--color-primary)] hover:underline">
            Continue browsing as guest
          </Link>
        </section>
      </div>
    </main>
  );
}