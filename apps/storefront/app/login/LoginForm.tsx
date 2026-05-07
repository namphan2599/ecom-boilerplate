'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface LoginFormProps {
  next: string;
  error?: string;
}

export function LoginForm({ next, error }: LoginFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get('email'));
    const password = String(formData.get('password'));

    setFieldError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        setFieldError(err.message || 'Login failed');
        return;
      }

      router.push(next);
    } catch (e) {
      console.error('Login error:', e);
      setFieldError('Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
      <input type="hidden" name="next" value={next} />

      {fieldError && (
        <div className="rounded-[var(--rounded-md)] border border-[var(--color-hairline)] bg-[var(--color-surface-pearl)] px-4 py-3 text-sm text-[var(--color-ink-muted-80)]">
          {fieldError}
        </div>
      )}

      <label className="grid gap-2 text-sm font-medium text-[var(--color-ink)]">
        Email
        <input
          type="email"
          name="email"
          defaultValue="customer@aura.local"
          required
          disabled={loading}
          className="rounded-[var(--rounded-pill)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-4 py-3 text-[17px] text-[var(--color-ink)] disabled:opacity-50"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-[var(--color-ink)]">
        Password
        <input
          type="password"
          name="password"
          defaultValue="Customer123!"
          required
          disabled={loading}
          className="rounded-[var(--rounded-pill)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-4 py-3 text-[17px] text-[var(--color-ink)] disabled:opacity-50"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-[var(--rounded-pill)] bg-[var(--color-primary)] px-5 py-3 text-[17px] font-semibold text-[var(--color-on-primary)] transition hover:bg-[var(--color-primary-focus)] disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>

      <p className="mt-5 text-center text-sm text-[var(--color-ink-muted-48)]">
        Don't have an account?{' '}
        <Link href="/register" className="font-medium text-[var(--color-primary)] hover:underline">
          Create one
        </Link>
      </p>

      <Link href="/products" className="mt-6 inline-block text-sm font-medium text-[var(--color-primary)] hover:underline">
        Continue browsing as guest
      </Link>
    </form>
  );
}