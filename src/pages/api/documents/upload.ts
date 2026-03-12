export const prerender = false;

import { getDocuments, putDocuments, isGHError } from '../../../lib/github.ts';
import type { Document } from '../../../lib/github.ts';
import type { APIContext } from 'astro';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'text/plain',
  'text/csv',
]);

const MAX_SIZE = 100 * 1024 * 1024; // 100 MB

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200);
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export async function POST({ locals, request }: APIContext) {
  const token = locals.runtime.env.GITHUB_TOKEN;
  const bucket = locals.runtime.env.DOCUMENTS;

  if (!bucket) {
    return new Response(JSON.stringify({ error: 'R2 bucket not bound' }), { status: 500, headers: JSON_HEADERS });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(JSON.stringify({ error: 'Expected multipart/form-data' }), { status: 400, headers: JSON_HEADERS });
  }

  const file = formData.get('file');
  const category = (formData.get('category') as string | null)?.trim() || 'General';
  const sha = formData.get('sha') as string | null;

  if (!(file instanceof File)) {
    return new Response(JSON.stringify({ error: 'Missing file field' }), { status: 400, headers: JSON_HEADERS });
  }
  if (!sha) {
    return new Response(JSON.stringify({ error: 'Missing sha field' }), { status: 400, headers: JSON_HEADERS });
  }
  if (file.size > MAX_SIZE) {
    return new Response(JSON.stringify({ error: 'File exceeds 50 MB limit' }), { status: 413, headers: JSON_HEADERS });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return new Response(JSON.stringify({ error: `File type not allowed: ${file.type}` }), { status: 415, headers: JSON_HEADERS });
  }

  const id = uid();
  const safeName = sanitizeFilename(file.name);
  const r2Key = `docs/${id}/${safeName}`;

  // Upload to R2
  const arrayBuffer = await file.arrayBuffer();
  await bucket.put(r2Key, arrayBuffer, {
    httpMetadata: { contentType: file.type },
    customMetadata: { originalName: file.name, category },
  });

  // Load current metadata and append
  const current = await getDocuments(token);
  if (!current) {
    await bucket.delete(r2Key); // rollback
    return new Response(JSON.stringify({ error: 'Network error connecting to GitHub' }), { status: 502, headers: JSON_HEADERS });
  }
  if (isGHError(current)) {
    await bucket.delete(r2Key); // rollback
    return new Response(JSON.stringify({ error: current.message }), { status: current.status || 500, headers: JSON_HEADERS });
  }

  const newDoc: Document = {
    id,
    name: file.name,
    category,
    r2Key,
    size: file.size,
    contentType: file.type,
    uploadedAt: new Date().toISOString(),
  };

  const updatedDocs = [...current.documents, newDoc];
  const saveResult = await putDocuments(updatedDocs, sha, `Upload document: ${file.name}`, token);
  if (!saveResult.ok) {
    await bucket.delete(r2Key); // rollback
    return new Response(JSON.stringify({ error: saveResult.error ?? 'GitHub API error' }), { status: 500, headers: JSON_HEADERS });
  }

  // Return the new sha
  const refreshed = await getDocuments(token);
  const newSha = refreshed && !isGHError(refreshed) ? refreshed.sha : sha;
  return new Response(JSON.stringify({ ok: true, document: newDoc, sha: newSha }), { headers: JSON_HEADERS });
}
