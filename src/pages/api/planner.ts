// Planner API — GET returns tasks, POST replaces all tasks.
// Protected by Cloudflare Access (same as all /admin/* routes).

export const prerender = false;

import { getPlanner, putPlanner, isGHError } from '../../lib/github.ts';
import type { PlannerTask } from '../../lib/github.ts';
import type { APIContext } from 'astro';

export async function GET({ locals }: APIContext) {
  const token = locals.runtime.env.GITHUB_TOKEN;
  const result = await getPlanner(token);
  if (!result) {
    return new Response(JSON.stringify({ error: 'Network error connecting to GitHub' }), { status: 502, headers: { 'Content-Type': 'application/json' } });
  }
  if (isGHError(result)) {
    return new Response(JSON.stringify({ error: result.message }), { status: result.status || 500, headers: { 'Content-Type': 'application/json' } });
  }
  return new Response(JSON.stringify({ tasks: result.tasks, sha: result.sha }), { headers: { 'Content-Type': 'application/json' } });
}

export async function POST({ locals, request }: APIContext) {
  const token = locals.runtime.env.GITHUB_TOKEN;
  let body: { tasks: PlannerTask[]; sha: string };
  try {
    body = await request.json() as { tasks: PlannerTask[]; sha: string };
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  if (!Array.isArray(body.tasks) || typeof body.sha !== 'string') {
    return new Response(JSON.stringify({ error: 'Body must include tasks array and sha string' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const result = await putPlanner(body.tasks, body.sha, 'Update planner tasks', token);
  if (!result.ok) {
    return new Response(JSON.stringify({ error: result.error ?? 'GitHub API error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  // Re-fetch to return the new sha so the client stays in sync
  const updated = await getPlanner(token);
  const newSha = updated && !isGHError(updated) ? updated.sha : body.sha;
  return new Response(JSON.stringify({ ok: true, sha: newSha }), { headers: { 'Content-Type': 'application/json' } });
}
