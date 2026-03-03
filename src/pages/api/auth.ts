// GitHub OAuth proxy — used by both Decap CMS (popup flow) and the admin portal (redirect flow).
//
// CMS flow:   Decap CMS opens GET /api/auth as a popup (no ?code). We redirect to GitHub.
//             GitHub sends the user back to GET /api/auth?code=...&state=...
//             We exchange the code, then postMessage the token back to the CMS popup.
//
// Portal flow: Login page opens GET /api/auth?mode=portal&redirect=/admin
//              Same GitHub round-trip, but on success we set a signed session cookie
//              and redirect the browser to the original destination.

export const prerender = false;

import { makeSession, COOKIE_NAME } from '../../middleware.ts';

const OWNER = (import.meta.env.GITHUB_OWNER as string | undefined) ?? 'JTCIA';
const REPO  = (import.meta.env.GITHUB_REPO  as string | undefined) ?? 'pack261';

export async function GET({ url }: { url: URL }) {
  const clientId     = import.meta.env.GITHUB_CLIENT_ID     as string | undefined;
  const clientSecret = import.meta.env.GITHUB_CLIENT_SECRET as string | undefined;

  if (!clientId || !clientSecret) {
    return new Response('GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET env vars are not set.', { status: 500 });
  }

  const code       = url.searchParams.get('code');
  const stateParam = url.searchParams.get('state') ?? '';

  // ── Start OAuth (no code yet) ──────────────────────────────────────────────
  if (!code) {
    const mode     = url.searchParams.get('mode') ?? 'cms';
    const redirect = url.searchParams.get('redirect') ?? '/admin';
    const state    = btoa(JSON.stringify({ mode, redirect, nonce: crypto.randomUUID() }));

    const params = new URLSearchParams({
      client_id:    clientId,
      redirect_uri: `${url.origin}/api/auth`,
      scope:        'repo',
      state,
    });

    return Response.redirect(`https://github.com/login/oauth/authorize?${params}`, 302);
  }

  // ── OAuth callback (code received) ────────────────────────────────────────
  let mode     = 'cms';
  let redirect = '/admin';

  try {
    const parsed = JSON.parse(atob(stateParam));
    mode     = parsed.mode     ?? 'cms';
    redirect = parsed.redirect ?? '/admin';
  } catch { /* bad state — default to cms */ }

  // Exchange code for access token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body:    JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  });

  const tokenData = await tokenRes.json() as { access_token?: string; error?: string; error_description?: string };

  if (!tokenData.access_token) {
    const msg = tokenData.error_description ?? tokenData.error ?? 'unknown error';
    if (mode === 'portal') return Response.redirect(`/admin/login?error=oauth_failed`, 302);
    return cmsError(`GitHub OAuth failed: ${msg}`);
  }

  const token = tokenData.access_token;

  // ── Admin portal: verify collaborator access then issue session cookie ──────
  if (mode === 'portal') {
    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
    });

    if (!userRes.ok) return Response.redirect('/admin/login?error=user_fetch_failed', 302);
    const { login } = await userRes.json() as { login: string };

    const collabRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/collaborators/${login}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } },
    );

    // 204 = is a collaborator; anything else = access denied
    if (collabRes.status !== 204) {
      return Response.redirect('/admin/login?error=not_authorized', 302);
    }

    const secret = (import.meta.env.ADMIN_SECRET as string | undefined) ?? 'dev-secret';
    const sessionToken = await makeSession(secret, login);

    const headers = new Headers({ Location: redirect });
    headers.append(
      'Set-Cookie',
      `${COOKIE_NAME}=${sessionToken}; Path=/; HttpOnly; ${import.meta.env.PROD ? 'Secure; ' : ''}SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`,
    );
    return new Response(null, { status: 302, headers });
  }

  // ── CMS mode: return postMessage page so Decap CMS popup gets the token ────
  const payload = JSON.stringify({ token, provider: 'github' });
  const html = `<!DOCTYPE html><html><head><title>Authenticating…</title></head><body><script>
(function () {
  var payload = ${JSON.stringify('authorization:github:success:' + payload)};
  function receive(e) { window.opener.postMessage(payload, e.origin); }
  window.addEventListener('message', receive, false);
  window.opener.postMessage('authorizing:github', '*');
})();
<\/script></body></html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}

function cmsError(msg: string) {
  const html = `<!DOCTYPE html><html><body><script>
window.opener.postMessage('authorization:github:error:${msg.replace(/'/g, "\\'")}', '*');
<\/script></body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}
