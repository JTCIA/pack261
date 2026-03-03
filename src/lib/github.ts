// GitHub Contents API helpers — used by SSR admin pages to read/write markdown files.
//
// IMPORTANT: pass `token` explicitly from `Astro.locals.runtime.env.GITHUB_TOKEN`.
// Do NOT use import.meta.env.GITHUB_TOKEN — Vite replaces that reference at build
// time (before Cloudflare injects secrets), so it is always undefined at runtime.

const OWNER  = (import.meta.env.GITHUB_OWNER  as string | undefined) ?? 'JTCIA';
const REPO   = (import.meta.env.GITHUB_REPO   as string | undefined) ?? 'pack261';
const BRANCH = (import.meta.env.GITHUB_BRANCH as string | undefined) ?? 'main';

function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function fromBase64(b64: string): string {
  const binary = atob(b64.replace(/\n/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function ghFetch(path: string, token: string | undefined, init: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token.trim()}`;
  return fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
    ...init,
    headers: { ...headers, ...((init.headers as Record<string, string>) ?? {}) },
  });
}

export interface GHFile {
  sha: string;
  content: string;
}

export interface GHError {
  status: number;
  message: string;
}

/** Returns the file, or a GHError describing why it failed, or null on network error. */
export async function getFile(path: string, token?: string): Promise<GHFile | GHError | null> {
  let res: Response;
  try {
    res = await ghFetch(path, token);
  } catch {
    return null;
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let message: string;
    try {
      const body = JSON.parse(text) as { message?: string };
      message = body.message ?? text.slice(0, 200) || `HTTP ${res.status}`;
    } catch {
      message = text.slice(0, 200) || `HTTP ${res.status}`;
    }
    return { status: res.status, message };
  }
  const data = (await res.json()) as { sha: string; content: string };
  return { sha: data.sha, content: fromBase64(data.content) };
}

export function isGHError(v: unknown): v is GHError {
  return v !== null && typeof v === 'object' && 'status' in (v as object);
}

/**
 * Returns a human-readable explanation of why a GitHub API call failed.
 * Pass the token so we can tell the user when it's simply missing.
 */
export function ghErrorMessage(err: GHError | null, token: string | undefined): string {
  if (!token) {
    return 'GITHUB_TOKEN is not set. In your Cloudflare Pages project go to Settings → Environment variables and add GITHUB_TOKEN for the Production environment, then redeploy.';
  }
  if (!err) return 'Network error connecting to GitHub.';
  if (err.status === 401) return `GitHub auth failed (HTTP 401) — the token is invalid or expired. Regenerate it and update the Cloudflare Pages environment variable.`;
  if (err.status === 403) return `GitHub access denied (HTTP 403) — make sure GITHUB_TOKEN has "repo" scope (or "contents: read & write" for a fine-grained token). GitHub says: "${err.message}"`;

  if (err.status === 404) return `Not found in the GitHub repo (HTTP 404) — check that the file exists on the default branch of ${OWNER}/${REPO}.`;
  return `GitHub API error: ${err.message} (HTTP ${err.status})`;
}

/** Create or update a file. Pass sha to update an existing file. */
export async function putFile(
  path: string,
  content: string,
  message: string,
  sha?: string,
  token?: string,
): Promise<{ ok: boolean; error?: string }> {
  const body: Record<string, unknown> = {
    message,
    content: toBase64(content),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;
  const res = await ghFetch(path, token, { method: 'PUT', body: JSON.stringify(body) });
  if (res.ok) return { ok: true };
  const err = (await res.json().catch(() => ({}))) as { message?: string };
  return { ok: false, error: err.message ?? `HTTP ${res.status}` };
}

export async function deleteFile(
  path: string,
  sha: string,
  message: string,
  token?: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await ghFetch(path, token, {
    method: 'DELETE',
    body: JSON.stringify({ message, sha, branch: BRANCH }),
  });
  if (res.ok) return { ok: true };
  const err = (await res.json().catch(() => ({}))) as { message?: string };
  return { ok: false, error: err.message ?? `HTTP ${res.status}` };
}

// ── Front matter helpers ─────────────────────────────────────────────────────

export function parseFrontMatter(raw: string): { fm: Record<string, string | boolean>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { fm: {}, body: raw };

  const fm: Record<string, string | boolean> = {};
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon < 0) continue;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '');
    fm[key] = val === 'true' ? true : val === 'false' ? false : val;
  }
  return { fm, body: match[2].trim() };
}

export function buildAnnouncementMd(fields: {
  title: string;
  date: string;
  category: string;
  pinned: boolean;
  summary: string;
  author: string;
  body: string;
}): string {
  const q = (s: string) => `"${s.replace(/"/g, '\\"')}"`;
  return `---
title: ${q(fields.title)}
date: ${fields.date}
category: ${fields.category}
pinned: ${fields.pinned}
summary: ${q(fields.summary)}
author: ${q(fields.author)}
---

${fields.body}
`;
}

export function buildDocMd(fields: {
  title: string;
  description: string;
  section: string;
  order: number;
  lastUpdated: string;
  body: string;
}): string {
  const q = (s: string) => `"${s.replace(/"/g, '\\"')}"`;
  const lines = [
    `title: ${q(fields.title)}`,
    fields.description ? `description: ${q(fields.description)}` : null,
    `section: ${q(fields.section)}`,
    `order: ${fields.order}`,
    fields.lastUpdated ? `lastUpdated: ${fields.lastUpdated}` : null,
  ].filter(Boolean);
  return `---\n${lines.join('\n')}\n---\n\n${fields.body}\n`;
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Calendar helpers ──────────────────────────────────────────────────────────

export interface CalendarEvent {
  id: string;
  date: string;       // YYYY-MM-DD
  title: string;
  location: string;
  type: 'meeting' | 'camping' | 'deadline' | 'event' | 'special';
  description: string;
}

const CALENDAR_PATH = 'src/data/calendar.json';

export async function getCalendar(token?: string): Promise<{ events: CalendarEvent[]; sha: string } | GHError | null> {
  const file = await getFile(CALENDAR_PATH, token);
  if (!file || isGHError(file)) return file;
  try {
    const events = JSON.parse(file.content) as CalendarEvent[];
    return { events, sha: file.sha };
  } catch {
    return { status: 0, message: 'calendar.json contains invalid JSON' };
  }
}

export async function putCalendar(
  events: CalendarEvent[],
  sha: string,
  message: string,
  token?: string,
): Promise<{ ok: boolean; error?: string }> {
  const content = JSON.stringify(events, null, 2) + '\n';
  return putFile(CALENDAR_PATH, content, message, sha, token);
}

/** Generate a short unique ID for a new calendar event. */
export function calendarEventId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}
