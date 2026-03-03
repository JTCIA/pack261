export const prerender = false;

import { getReminders, putReminders, isGHError } from '../../lib/github.ts';
import type { Reminder } from '../../lib/github.ts';
import type { APIContext } from 'astro';

export async function GET({ locals }: APIContext) {
  const token = locals.runtime.env.GITHUB_TOKEN;
  const result = await getReminders(token);
  if (!result) {
    return new Response(JSON.stringify({ error: 'Network error connecting to GitHub' }), { status: 502, headers: { 'Content-Type': 'application/json' } });
  }
  if (isGHError(result)) {
    return new Response(JSON.stringify({ error: result.message }), { status: result.status || 500, headers: { 'Content-Type': 'application/json' } });
  }
  return new Response(JSON.stringify({ reminders: result.reminders, sha: result.sha }), { headers: { 'Content-Type': 'application/json' } });
}

export async function POST({ locals, request }: APIContext) {
  const token = locals.runtime.env.GITHUB_TOKEN;
  let body: { reminders: Reminder[]; sha: string };
  try {
    body = await request.json() as { reminders: Reminder[]; sha: string };
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  if (!Array.isArray(body.reminders) || typeof body.sha !== 'string') {
    return new Response(JSON.stringify({ error: 'Body must include reminders array and sha string' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const result = await putReminders(body.reminders, body.sha, 'Update leader reminders', token);
  if (!result.ok) {
    return new Response(JSON.stringify({ error: result.error ?? 'GitHub API error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const updated = await getReminders(token);
  const newSha = updated && !isGHError(updated) ? updated.sha : body.sha;
  return new Response(JSON.stringify({ ok: true, sha: newSha }), { headers: { 'Content-Type': 'application/json' } });
}
