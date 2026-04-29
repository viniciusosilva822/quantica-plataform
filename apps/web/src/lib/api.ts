const baseUrl = () =>
  typeof window === 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export type ApiOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  cookieHeader?: string;
};

export const api = async <T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> => {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (opts.cookieHeader) headers.cookie = opts.cookieHeader;
  const res = await fetch(`${baseUrl()}${path}`, {
    method: opts.method ?? 'GET',
    credentials: 'include',
    cache: 'no-store',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    let detail: unknown = null;
    try {
      detail = await res.json();
    } catch {}
    const err = new Error(
      (detail as { error?: string })?.error ?? `HTTP ${res.status}`,
    ) as Error & { status?: number; detail?: unknown };
    err.status = res.status;
    err.detail = detail;
    throw err;
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
};
