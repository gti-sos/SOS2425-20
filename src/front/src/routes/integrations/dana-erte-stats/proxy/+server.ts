// src/routes/api/dana-erte-stats/+server.ts
import type { RequestHandler } from '@sveltejs/kit';

const REMOTE = 'https://sos2425-18.onrender.com/api/v2/dana-erte-stats';

export const GET: RequestHandler = async ({ url, fetch }) => {
  // reenviamos cualquier ?query=… tal cual
  const qs     = url.searchParams.toString();
  const target = REMOTE + (qs ? `?${qs}` : '');

  console.log('Proxy →', target);

  const res  = await fetch(target);
  const body = await res.text();

  return new Response(body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' }
  });
};
