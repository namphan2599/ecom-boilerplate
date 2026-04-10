import Link from 'next/link';
import type { AuthenticatedUser } from '@/lib/aura/types';
import { formatRoleLabel } from '@/lib/utils';

const navigation = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/cart', label: 'Cart' },
  { href: '/account/orders', label: 'Orders' },
];

export function SiteHeader({ user }: { user: AuthenticatedUser | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold text-slate-950">
            Aura Storefront
          </Link>

          <nav className="hidden items-center gap-4 text-sm text-slate-600 md:flex">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-cyan-700">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <div className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 sm:block">
                <span className="font-medium text-slate-900">{user.displayName ?? user.email}</span>
                <span className="ml-2 text-slate-500">{formatRoleLabel(user.role)}</span>
              </div>
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="rounded-full border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-slate-950 px-4 py-2 font-medium text-white transition hover:bg-slate-800"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
