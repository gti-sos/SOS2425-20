import type { RequestHandler } from '@sveltejs/kit';

const REMOTE = 'https://covid-193.p.rapidapi.com/statistics';

export const GET: RequestHandler = async ({ url, fetch }) => {
  const qs = url.searchParams.toString();
  const target = REMOTE + (qs ? `?${qs}` : '');
  
  console.log('Proxy →', target);

  const response = await fetch(target, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': '2c001ce06cmsh489140de8de67d7p1f0f32jsncf17ff25ca89',
      'x-rapidapi-host': 'covid-193.p.rapidapi.com'
    }
  });

  const body = await response.text();

  return new Response(body, {
    status: response.status,
    headers: { 'Content-Type': 'application/json' }
  });
};
