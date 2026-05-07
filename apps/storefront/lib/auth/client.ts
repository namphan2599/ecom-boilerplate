const API_URL = process.env.AURA_API_BASE_URL ?? 'http://localhost:3000/api/v1';

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: unknown = null;
    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }
    throw new ApiError(
      response.status,
      (errorData as { message?: string })?.message ?? 'An error occurred',
      errorData
    );
  }

  if (response.status === 204 || response.status === 201) {
    const text = await response.text();
    if (!text) return {} as T;
    return JSON.parse(text);
  }

  const text = await response.text();
  if (!text) return {} as T;
  return JSON.parse(text);
}

export const authClient = {
  login: async <T>(email: string, password: string): Promise<T> => {
    return request<T>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async <T>(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<T> => {
    return request<T>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};