export const prerender = false;

import { getDocuments, putDocuments, isGHError } from '../../../lib/github.ts';
import type { Document } from '../../../lib/github.ts';
import type { APIContext } from 'astro';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export async function GET({ locals }: APIContext) {
  const token = locals.runtime.env.GITHUB_TOKEN;
  const result = await getDocuments(token);
  if (!result) {
    return new Response(JSON.stringify({ error: 'Network error connecting to GitHub' }), { status: 502, headers: JSON_HEADERS });
  }
  if (isGHError(result)) {
    return new Response(JSON.stringify({ error: result.message }), { status: result.status || 500, headers: JSON_HEADERS });
  }
  return new Response(JSON.stringify({ documents: result.documents, sha: result.sha }), { headers: JSON_HEADERS });
}

/** DELETE: remove a document from R2 and from the metadata list. */
export async function DELETE({ locals, request }: APIContext) {
  const token = locals.runtime.env.GITHUB_TOKEN;
  const bucket = locals.runtime.env.DOCUMENTS;

  if (!bucket) {
    return new Response(JSON.stringify({ error: 'R2 bucket not bound' }), { status: 500, headers: JSON_HEADERS });
  }

  let body: { id: string; sha: string };
  try {
    body = await request.json() as { id: string; sha: string };
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: JSON_HEADERS });
  }

  if (!body.id || !body.sha) {
    return new Response(JSON.stringify({ error: 'Body must include id and sha' }), { status: 400, headers: JSON_HEADERS });
  }

  // Load current metadata
  const current = await getDocuments(token);
  if (!current) {
    return new Response(JSON.stringify({ error: 'Network error connecting to GitHub' }), { status: 502, headers: JSON_HEADERS });
  }
  if (isGHError(current)) {
    return new Response(JSON.stringify({ error: current.message }), { status: current.status || 500, headers: JSON_HEADERS });
  }

  const doc = current.documents.find((d: Document) => d.id === body.id);
  if (!doc) {
    return new Response(JSON.stringify({ error: 'Document not found' }), { status: 404, headers: JSON_HEADERS });
  }

  // Delete from R2
  await bucket.delete(doc.r2Key);

  // Remove from metadata and save
  const updated = current.documents.filter((d: Document) => d.id !== body.id);
  const saveResult = await putDocuments(updated, body.sha, `Delete document: ${doc.name}`, token);
  if (!saveResult.ok) {
    return new Response(JSON.stringify({ error: saveResult.error ?? 'GitHub API error' }), { status: 500, headers: JSON_HEADERS });
  }

  // Return new sha
  const refreshed = await getDocuments(token);
  const newSha = refreshed && !isGHError(refreshed) ? refreshed.sha : body.sha;
  return new Response(JSON.stringify({ ok: true, sha: newSha }), { headers: JSON_HEADERS });
}
