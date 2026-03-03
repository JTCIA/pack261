// Auth middleware — protects all /admin routes.
//
// Session tokens are HMAC-SHA256 signed: `login:expiry.signature`
// Issued after successful GitHub OAuth (collaborator check in /api/auth).
// Requires ADMIN_SECRET env var. If unset, access is allowed (dev mode).
//
// Required env vars (set in Cloudflare Workers):
//   ADMIN_SECRET        — random string, sign session tokens (generate once, never share)
//   GITHUB_CLIENT_ID    — from your GitHub OAuth App
//   GITHUB_CLIENT_SECRET — from your GitHub OAuth App

import type { MiddlewareHandler } from 'astro';

export const COOKIE_NAME = 'pack261_session';

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Create a signed session token. */
export async function makeSession(secret: string, login: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
  const payload = `${login}:${exp}`;
  const sig = await hmac(secret, payload);
  return `${payload}.${sig}`;
}

async function verifySession(secret: string, token: string): Promise<boolean> {
  const dot = token.lastIndexOf('.');
  if (dot < 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const [, expStr] = payload.split(':');
  const exp = parseInt(expStr, 10);
  if (isNaN(exp) || Date.now() / 1000 > exp) return false;
  return sig === (await hmac(secret, payload));
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { pathname } = context.url;

  // Only guard /admin routes
  if (!pathname.startsWith('/admin')) return next();

  // Login and logout are always accessible
  if (pathname.startsWith('/admin/login') || pathname.startsWith('/admin/logout')) return next();

  const secret = import.meta.env.ADMIN_SECRET as string | undefined;

  // Dev mode: no secret set → allow through
  if (!secret) return next();

  const token = context.cookies.get(COOKIE_NAME)?.value;
  const valid = token ? await verifySession(secret, token) : false;

  if (!valid) {
    const url = new URL('/admin/login', context.url);
    url.searchParams.set('redirect', pathname);
    return context.redirect(url.toString());
  }

  return next();
};
