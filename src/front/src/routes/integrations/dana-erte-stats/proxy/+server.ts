// src/routes/api/dana-erte-stats/+server.ts
import type { RequestHandler } from '@sveltejs/kit';

// Punto final de la API remota a la que vamos a reenviar
const REMOTE = 'https://sos2425-18.onrender.com/api/v2/dana-erte-stats';

export const GET: RequestHandler = async ({ url, fetch }) => {
  // 1) Conservamos cualquier parámetro de consulta (?foo=bar)
  const qs = url.searchParams.toString();
  // 2) Construimos la URL completa apuntando al servicio remoto
  const target = REMOTE + (qs ? `?${qs}` : '');

  console.log('Proxy →', target);

  // 3) Hacemos la petición al endpoint remoto
  const res = await fetch(target);
  // 4) Leemos la respuesta como texto (JSON en crudo)
  const body = await res.text();

  // 5) Reenviamos esa misma respuesta al cliente manteniendo el código de estado y forzando JSON
  return new Response(body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' }
  });
};
