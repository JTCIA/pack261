export const prerender = false;

import { getDocuments, isGHError } from '../../../lib/github.ts';
import type { Document } from '../../../lib/github.ts';
import type { APIContext } from 'astro';

/** GET /api/documents/:id?disposition=inline|attachment
 *
 *  Streams the file from R2. Defaults to 'attachment' (download).
 *  Pass ?disposition=inline to open in browser (e.g. for PDFs / images).
 */
export async function GET({ locals, params, url }: APIContext) {
  const token = locals.runtime.env.GITHUB_TOKEN;
  const bucket = locals.runtime.env.DOCUMENTS;

  if (!bucket) {
    return new Response('R2 bucket not bound', { status: 500 });
  }

  const id = params.id as string;
  const disposition = url.searchParams.get('disposition') === 'inline' ? 'inline' : 'attachment';

  // Look up metadata to find the R2 key
  const meta = await getDocuments(token);
  if (!meta) return new Response('Network error', { status: 502 });
  if (isGHError(meta)) return new Response(meta.message, { status: meta.status || 500 });

  const doc = meta.documents.find((d: Document) => d.id === id);
  if (!doc) return new Response('Not found', { status: 404 });

  const object = await bucket.get(doc.r2Key);
  if (!object) return new Response('File not found in storage', { status: 404 });

  const safeName = encodeURIComponent(doc.name).replace(/'/g, '%27');
  return new Response(object.body as ReadableStream, {
    headers: {
      'Content-Type': doc.contentType || 'application/octet-stream',
      'Content-Disposition': `${disposition}; filename="${safeName}"; filename*=UTF-8''${safeName}`,
      'Content-Length': String(doc.size),
      'Cache-Control': 'private, no-store',
    },
  });
}
