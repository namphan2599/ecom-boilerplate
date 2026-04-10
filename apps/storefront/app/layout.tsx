import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { PageShell } from '@/components/layout/page-shell';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { getSession } from '@/lib/auth/session';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Aura Storefront',
    template: '%s | Aura Storefront',
  },
  description:
    'Next.js storefront scaffold for the Aura e-commerce backend and checkout flow.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 text-slate-950">
        <div className="flex min-h-screen flex-col">
          <SiteHeader user={session?.user ?? null} />
          <PageShell>{children}</PageShell>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
