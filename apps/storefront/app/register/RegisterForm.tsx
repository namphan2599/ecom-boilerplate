'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface RegisterFormProps {
  next: string;
  error?: string;
}

export function RegisterForm({ next, error }: RegisterFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get('email'));
    const password = String(formData.get('password'));
    const confirmPassword = String(formData.get('confirmPassword'));
    const firstName = String(formData.get('firstName') || '');
    const lastName = String(formData.get('lastName') || '');

    if (password !== confirmPassword) {
      setFieldError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setFieldError('Password must be at least 8 characters');
      return;
    }

    setFieldError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setFieldError(err.message || 'Registration failed');
        return;
      }

      router.push(next);
    } catch (e) {
      console.error('Register error:', e);
      setFieldError('Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
      <input type="hidden" name="next" value={next} />

      {(fieldError || error) && (
        <div className="rounded-[var(--rounded-md)] border border-[var(--color-hairline)] bg-[var(--color-surface-pearl)] px-4 py-3 text-sm text-[var(--color-ink-muted-80)]">
          {fieldError || error}
        </div>
      )}

      <label className="grid gap-2 text-sm font-medium text-[var(--color-ink)]">
        Email
        <input
          type="email"
          name="email"
          placeholder="you@example.com"
          required
          disabled={loading}
          className="rounded-[var(--rounded-pill)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-4 py-3 text-[17px] text-[var(--color-ink)] disabled:opacity-50"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="grid gap-2 text-sm font-medium text-[var(--color-ink)]">
          First name
          <input
            type="text"
            name="firstName"
            placeholder="John"
            disabled={loading}
            className="rounded-[var(--rounded-pill)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-4 py-3 text-[17px] text-[var(--color-ink)] disabled:opacity-50"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-[var(--color-ink)]">
          Last name
          <input
            type="text"
            name="lastName"
            placeholder="Doe"
            disabled={loading}
            className="rounded-[var(--rounded-pill)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-4 py-3 text-[17px] text-[var(--color-ink)] disabled:opacity-50"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-[var(--color-ink)]">
        Password
        <input
          type="password"
          name="password"
          placeholder="Create a password"
          required
          minLength={8}
          disabled={loading}
          className="rounded-[var(--rounded-pill)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-4 py-3 text-[17px] text-[var(--color-ink)] disabled:opacity-50"
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
          disabled={loading}
          className="rounded-[var(--rounded-pill)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-4 py-3 text-[17px] text-[var(--color-ink)] disabled:opacity-50"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-[var(--rounded-pill)] bg-[var(--color-primary)] px-5 py-3 text-[17px] font-semibold text-[var(--color-on-primary)] transition hover:bg-[var(--color-primary-focus)] disabled:opacity-50"
      >
        {loading ? 'Creating account...' : 'Create account'}
      </button>

      <p className="mt-5 text-center text-sm text-[var(--color-ink-muted-48)]">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-[var(--color-primary)] hover:underline">
          Sign in
        </Link>
      </p>

      <Link href="/products" className="mt-6 inline-block text-sm font-medium text-[var(--color-primary)] hover:underline">
        Continue browsing as guest
      </Link>
    </form>
  );
}