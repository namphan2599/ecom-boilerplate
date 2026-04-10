import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';

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
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_420px]">
      <section className="rounded-3xl bg-slate-950 p-8 text-white shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Demo access</p>
        <h1 className="mt-3 text-3xl font-semibold">Sign in to test Aura’s cart and checkout flows.</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
          The storefront keeps JWTs in a secure cookie and uses Aura’s existing `/api/v1/auth/login` and `/auth/profile` endpoints.
        </p>

        <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
          <p className="font-semibold text-white">Seeded demo credentials</p>
          <div>
            <p>`customer@aura.local` / `Customer123!`</p>
            <p>`admin@aura.local` / `Admin123!`</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-950">Welcome back</h2>
        <p className="mt-2 text-sm text-slate-600">Use the local Aura seed account to continue to cart, checkout, and orders.</p>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        <form action="/api/auth/login" method="post" className="mt-5 grid gap-4">
          <input type="hidden" name="next" value={nextPath} />

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              name="email"
              defaultValue="customer@aura.local"
              required
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              name="password"
              defaultValue="Customer123!"
              required
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
            />
          </label>

          <button
            type="submit"
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Sign in
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-500">
          After login, the storefront will redirect you to <code>{nextPath}</code>.
        </p>

        <Link href="/products" className="mt-6 inline-flex text-sm font-medium text-cyan-700 hover:text-cyan-800">
          Continue browsing as guest →
        </Link>
      </section>
    </div>
  );
}
