import type { MiddlewareHandler } from 'astro';

export const COOKIE_NAME = 'pack261_auth';

/** HMAC-free token: SHA-256(password + salt). Good enough for a pack website. */
export async function makeToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`pack261-leader:${password}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { pathname } = context.url;

  // Only guard /admin routes
  if (!pathname.startsWith('/admin')) return next();

  // Login and logout pages are always accessible
  if (pathname.startsWith('/admin/login') || pathname.startsWith('/admin/logout')) return next();

  const adminPassword = import.meta.env.ADMIN_PASSWORD as string | undefined;

  // If no password is configured (local dev), allow through
  if (!adminPassword) return next();

  const token = context.cookies.get(COOKIE_NAME)?.value;
  const expected = await makeToken(adminPassword);

  if (token !== expected) {
    const url = new URL('/admin/login', context.url);
    url.searchParams.set('redirect', pathname);
    return context.redirect(url.toString());
  }

  return next();
};
