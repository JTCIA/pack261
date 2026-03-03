export const prerender = false;

import { getResources, putResources, isGHError } from '../../lib/github.ts';
import type { Resource } from '../../lib/github.ts';
import type { APIContext } from 'astro';

export async function GET({ locals }: APIContext) {
  const token = locals.runtime.env.GITHUB_TOKEN;
  const result = await getResources(token);
  if (!result) {
    return new Response(JSON.stringify({ error: 'Network error connecting to GitHub' }), { status: 502, headers: { 'Content-Type': 'application/json' } });
  }
  if (isGHError(result)) {
    return new Response(JSON.stringify({ error: result.message }), { status: result.status || 500, headers: { 'Content-Type': 'application/json' } });
  }
  return new Response(JSON.stringify({ resources: result.resources, sha: result.sha }), { headers: { 'Content-Type': 'application/json' } });
}

export async function POST({ locals, request }: APIContext) {
  const token = locals.runtime.env.GITHUB_TOKEN;
  let body: { resources: Resource[]; sha: string };
  try {
    body = await request.json() as { resources: Resource[]; sha: string };
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  if (!Array.isArray(body.resources) || typeof body.sha !== 'string') {
    return new Response(JSON.stringify({ error: 'Body must include resources array and sha string' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const result = await putResources(body.resources, body.sha, 'Update resources', token);
  if (!result.ok) {
    return new Response(JSON.stringify({ error: result.error ?? 'GitHub API error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const updated = await getResources(token);
  const newSha = updated && !isGHError(updated) ? updated.sha : body.sha;
  return new Response(JSON.stringify({ ok: true, sha: newSha }), { headers: { 'Content-Type': 'application/json' } });
}
