import Link from 'next/link';

const subNavLinks = [
  { href: '/store/overview', label: 'Overview' },
  { href: '/store/new', label: 'New' },
  { href: '/store/bestsellers', label: 'Bestsellers' },
  { href: '/store/deals', label: 'Deals' },
];

interface SubNavProps {
  category: string;
}

export function SubNav({ category }: SubNavProps) {
  return (
    <nav className="fixed top-11 left-0 right-0 z-40 flex h-[52px] w-full items-center justify-between border-b border-[var(--color-hairline)] bg-[var(--color-canvas-parchment)]/80 px-4 backdrop-blur-md">
      <div className="flex items-center gap-6">
        <h1 className="text-[21px] font-semibold text-[var(--color-ink)]">{category}</h1>

        <div className="hidden items-center gap-5 md:flex">
          {subNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-normal text-[var(--color-ink-muted-80)] transition hover:text-[var(--color-ink)]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/store/buy"
          className="rounded-pill bg-[var(--color-primary)] px-4 py-1.5 text-sm font-normal text-[var(--color-on-primary)] transition hover:bg-[var(--color-primary-focus)]"
        >
          Buy
        </Link>
      </div>
    </nav>
  );
}