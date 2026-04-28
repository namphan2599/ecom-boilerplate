import Link from 'next/link';
import { Search, ShoppingBag } from 'lucide-react';

const navLinks = [
  { href: '/store', label: 'Store' },
  { href: '/products', label: 'Products' },
  { href: '/services', label: 'Services' },
  { href: '/support', label: 'Support' },
];

export function GlobalNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex h-11 w-full items-center justify-between bg-[var(--color-surface-black)] px-4">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center">
          <span className="text-sm font-medium text-[var(--color-on-dark)]">Aura</span>
        </Link>

        <div className="hidden items-center gap-5 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-normal text-[var(--color-body-muted)] transition hover:text-[var(--color-on-dark)]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button type="button" className="text-[var(--color-body-muted)] transition hover:text-[var(--color-on-dark)]">
          <Search className="h-4 w-4" />
        </button>
        <Link href="/cart" className="text-[var(--color-body-muted)] transition hover:text-[var(--color-on-dark)]">
          <ShoppingBag className="h-4 w-4" />
        </Link>
      </div>
    </nav>
  );
}