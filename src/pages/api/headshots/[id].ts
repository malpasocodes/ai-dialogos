import type { APIRoute } from 'astro';
import { getGuestHeadshot } from '../../../utils/guests';

export const GET: APIRoute = async ({ params }) => {
  const id = params.id;
  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  const headshot = await getGuestHeadshot(id);
  if (!headshot) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(new Uint8Array(headshot.body), {
    headers: {
      'Content-Type': headshot.contentType,
      // Stored MIME is admin-supplied; stop the browser sniffing it into HTML.
      'X-Content-Type-Options': 'nosniff',
      // Browser caches for an hour; Netlify edge caches longer and serves stale
      // while revalidating. Cache key is the guest id, so admin updates show up
      // within max-age for end users.
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
};
