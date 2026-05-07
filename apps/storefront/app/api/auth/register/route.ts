import { NextRequest, NextResponse } from 'next/server';
import { registerWithPassword } from '@/lib/auth';
import { ACCESS_TOKEN_COOKIE, buildAuthCookieOptions } from '@/lib/auth';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const contentType = request.headers.get('content-type') ?? '';
  const wantsJson = contentType.includes('application/json');

  let email = '';
  let password = '';
  let firstName: string | undefined;
  let lastName: string | undefined;
  let nextPath = '/products';

  if (wantsJson) {
    const payload = (await request.json()) as {
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
      next?: string;
    };

    email = payload.email ?? '';
    password = payload.password ?? '';
    firstName = payload.firstName;
    lastName = payload.lastName;
    nextPath = payload.next ?? nextPath;
  } else {
    const formData = await request.formData();
    email = String(formData.get('email') ?? '');
    password = String(formData.get('password') ?? '');
    firstName = String(formData.get('firstName') ?? '') || undefined;
    lastName = String(formData.get('lastName') ?? '') || undefined;
    nextPath = String(formData.get('next') ?? nextPath);
  }

  if (!nextPath.startsWith('/')) {
    nextPath = '/products';
  }

  try {
    const result = await registerWithPassword({
      email,
      password,
      firstName,
      lastName,
    });

    const response = wantsJson
      ? NextResponse.json({ user: result.user })
      : NextResponse.redirect(new URL(nextPath, request.url));

    response.cookies.set(
      ACCESS_TOKEN_COOKIE,
      result.accessToken,
      buildAuthCookieOptions(),
    );

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed.';

    if (wantsJson) {
      return NextResponse.json({ message }, { status: 409 });
    }

    const registerUrl = new URL('/register', request.url);
    registerUrl.searchParams.set('error', message);
    registerUrl.searchParams.set('next', nextPath);
    return NextResponse.redirect(registerUrl);
  }
}