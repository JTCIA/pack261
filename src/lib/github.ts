// GitHub Contents API helpers — used by SSR admin pages to read/write markdown files.
// Requires env vars: GITHUB_TOKEN, and optionally GITHUB_OWNER / GITHUB_REPO / GITHUB_BRANCH.

const OWNER = (import.meta.env.GITHUB_OWNER as string | undefined) ?? 'JTCIA';
const REPO = (import.meta.env.GITHUB_REPO as string | undefined) ?? 'pack261';
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

async function ghFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = import.meta.env.GITHUB_TOKEN as string | undefined;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
    ...init,
    headers: { ...headers, ...((init.headers as Record<string, string>) ?? {}) },
  });
}

export interface GHFile {
  sha: string;
  content: string;
}

export async function getFile(path: string): Promise<GHFile | null> {
  const res = await ghFetch(path);
  if (!res.ok) return null;
  const data = (await res.json()) as { sha: string; content: string };
  return { sha: data.sha, content: fromBase64(data.content) };
}

/** Create or update a file. Pass sha to update an existing file. */
export async function putFile(
  path: string,
  content: string,
  message: string,
  sha?: string,
): Promise<{ ok: boolean; error?: string }> {
  const body: Record<string, unknown> = {
    message,
    content: toBase64(content),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;
  const res = await ghFetch(path, { method: 'PUT', body: JSON.stringify(body) });
  if (res.ok) return { ok: true };
  const err = (await res.json().catch(() => ({}))) as { message?: string };
  return { ok: false, error: err.message ?? `HTTP ${res.status}` };
}

export async function deleteFile(
  path: string,
  sha: string,
  message: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await ghFetch(path, {
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
