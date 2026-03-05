export const prerender = false;

import { getCalendar, putCalendar, calendarEventId, isGHError } from '../../lib/github.ts';
import type { CalendarEvent } from '../../lib/github.ts';
import type { APIContext } from 'astro';

export async function POST({ locals, request }: APIContext) {
  const token = locals.runtime.env.GITHUB_TOKEN;

  let body: { events: Omit<CalendarEvent, 'id'>[] };
  try {
    body = await request.json() as { events: Omit<CalendarEvent, 'id'>[] };
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!Array.isArray(body.events) || body.events.length === 0) {
    return new Response(JSON.stringify({ error: 'No events provided' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const raw = await getCalendar(token);
  if (!raw || isGHError(raw)) {
    return new Response(
      JSON.stringify({ error: isGHError(raw) ? raw.message : 'Network error connecting to GitHub' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const newEvents: CalendarEvent[] = body.events.map(e => ({
    id:          calendarEventId(),
    date:        e.date,
    title:       e.title,
    location:    e.location    ?? '',
    type:        e.type        as CalendarEvent['type'],
    description: e.description ?? '',
    den:         e.den         ?? '',
  }));

  const n = newEvents.length;
  const result = await putCalendar(
    [...raw.events, ...newEvents],
    raw.sha,
    `Bulk import ${n} calendar event${n !== 1 ? 's' : ''}`,
    token,
  );

  if (!result.ok) {
    return new Response(JSON.stringify({ error: result.error ?? 'GitHub API error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true, count: n }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
