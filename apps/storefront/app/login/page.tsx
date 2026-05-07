import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { LoginForm } from './LoginForm';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({
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
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary-on-dark)]">Demo access</p>
          <h1 className="mt-3 text-[34px] font-semibold tracking-[-0.374px] leading-[1.47]">
            Sign in to test Aura's cart and checkout flows.
          </h1>
          <p className="mt-4 max-w-xl text-[17px] leading-[1.47] text-[var(--color-body-muted)]">
            The storefront keeps JWTs in a secure cookie and uses Aura's existing <code className="text-[var(--color-primary-on-dark)]">/api/v1/auth/login</code> and <code className="text-[var(--color-primary-on-dark)]">/auth/profile</code> endpoints.
          </p>

          <div className="mt-8 rounded-[var(--rounded-lg)] border border-[var(--color-hairline)]/20 bg-[var(--color-surface-tile-2)] p-5 text-[14px] text-[var(--color-body-muted)]">
            <p className="font-semibold text-[var(--color-on-dark)]">Seeded demo credentials</p>
            <div className="mt-3 space-y-1">
              <p><code className="text-[var(--color-primary-on-dark)]">customer@aura.local</code> / <code className="text-[var(--color-primary-on-dark)]">Customer123!</code></p>
              <p><code className="text-[var(--color-primary-on-dark)]">admin@aura.local</code> / <code className="text-[var(--color-primary-on-dark)]">Admin123!</code></p>
            </div>
          </div>
        </section>

<section className="border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-8 py-10">
          <h2 className="text-[24px] font-semibold text-[var(--color-ink)]">Welcome back</h2>
          <p className="mt-2 text-sm text-[var(--color-ink-muted-48)]">Use the local Aura seed account to continue to cart, checkout, and orders.</p>

          {error ? (
            <div className="mt-4 rounded-[var(--rounded-md)] border border-[var(--color-hairline)] bg-[var(--color-surface-pearl)] px-4 py-3 text-sm text-[var(--color-ink-muted-80)]">
              {error}
            </div>
          ) : null}

          <LoginForm next={nextPath} error={error} />
</section>
      </div>
    </main>
  );
}