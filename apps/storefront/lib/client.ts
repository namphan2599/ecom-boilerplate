const DEFAULT_API_BASE_URL = 'http://localhost:3000/api/v1';

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
  }
  return process.env.AURA_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

type FetchOptions<T> = RequestInit & {
  authToken?: string;
  fallback?: () => T;
};

async function readErrorDetail(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      const payload = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(payload.message)) {
        return payload.message.join(', ');
      }
      if (payload.message) {
        return payload.message;
      }
    }
    return await response.text();
  } catch {
    return response.statusText || 'Unknown API error';
  }
}

export async function apiFetch<T>(path: string, options: FetchOptions<T> = {}): Promise<T> {
  const { authToken, fallback, headers, ...rest } = options;
  
  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...rest,
      cache: authToken || rest.method ? 'no-store' : 'force-cache',
      headers: {
        ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
      },
    });

    if (!response.ok) {
      const detail = await readErrorDetail(response);
      throw new Error(`${response.status} ${detail}`.trim());
    }

    return (await response.json()) as T;
  } catch (error) {
    if (fallback) {
      console.warn(`[storefront] Falling back for ${path}:`, error);
      return fallback();
    }
    throw error;
  }
}