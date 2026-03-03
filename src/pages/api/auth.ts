// GitHub OAuth proxy for Decap CMS only.
//
// Decap CMS (at /cms/) opens GET /api/auth as a popup to start the GitHub OAuth flow.
// After GitHub redirects back with ?code=..., this endpoint exchanges the code for
// an access token and sends it back to the CMS via postMessage.
//
// Access control is handled entirely by Cloudflare Access — this endpoint is excluded
// from Access policies so the OAuth popup can reach it without a CF session cookie.
//
// Required env vars (Cloudflare Workers):
//   GITHUB_CLIENT_ID     — from your GitHub OAuth App
//   GITHUB_CLIENT_SECRET — from your GitHub OAuth App

export const prerender = false;

export async function GET({ url }: { url: URL }) {
  const clientId     = import.meta.env.GITHUB_CLIENT_ID     as string | undefined;
  const clientSecret = import.meta.env.GITHUB_CLIENT_SECRET as string | undefined;

  if (!clientId || !clientSecret) {
    return new Response('GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET env vars are not set.', { status: 500 });
  }

  const code = url.searchParams.get('code');

  // ── Start OAuth (no code yet — open by Decap CMS popup) ───────────────────
  if (!code) {
    const params = new URLSearchParams({
      client_id:    clientId,
      redirect_uri: `${url.origin}/api/auth`,
      scope:        'repo',
      state:        crypto.randomUUID(),
    });
    return Response.redirect(`https://github.com/login/oauth/authorize?${params}`, 302);
  }

  // ── GitHub callback — exchange code for token ─────────────────────────────
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body:    JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  });

  const tokenData = await tokenRes.json() as { access_token?: string; error?: string; error_description?: string };

  if (!tokenData.access_token) {
    const msg = tokenData.error_description ?? tokenData.error ?? 'unknown error';
    return cmsMessage(`authorization:github:error:${msg}`);
  }

  // ── Send token back to Decap CMS via postMessage ──────────────────────────
  const msg = 'authorization:github:success:' + JSON.stringify({ token: tokenData.access_token, provider: 'github' });
  return cmsMessage(msg);
}

/** Returns an HTML page that sends a postMessage to the opener (Decap CMS popup pattern). */
function cmsMessage(message: string) {
  const html = `<!DOCTYPE html><html><head><title>Authenticating…</title></head><body><script>
(function () {
  var msg = ${JSON.stringify(message)};
  function receive(e) { window.opener.postMessage(msg, e.origin); }
  window.addEventListener('message', receive, false);
  window.opener.postMessage('authorizing:github', '*');
})();
<\/script></body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}
