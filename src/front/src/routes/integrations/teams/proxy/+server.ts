import type { RequestHandler } from '@sveltejs/kit';

const REMOTE = 'https://api-football-v1.p.rapidapi.com/v3/standings';

export const GET: RequestHandler = async ({ url, fetch }) => {
  const qs = url.searchParams.toString();
  const target = `${REMOTE}${qs ? `?${qs}` : ''}`;

  console.log('Proxy →', target);

  const response = await fetch(target, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': 'b1258f1f0fmsh4a41fefa679cdbcp17a760jsn7570e2be7aa0', // ⬅️ Reemplaza con tu clave real
      'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
    }
  });

  const body = await response.text();

  return new Response(body, {
    status: response.status,
    headers: { 'Content-Type': 'application/json' }
  });
};
