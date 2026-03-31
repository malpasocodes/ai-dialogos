import type { APIRoute } from 'astro';
import { getGuests, saveGuests } from '../../../utils/guests';
import type { Guest } from '../../../utils/guests';

function isAdmin(locals: App.Locals): boolean {
  const { userId } = locals.auth();
  return !!userId && userId === import.meta.env.ADMIN_USER_ID;
}

export const PUT: APIRoute = async ({ locals, params, request }) => {
  if (!isAdmin(locals)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const guests = getGuests();
  const index = guests.findIndex((g) => g.id === params.id);
  if (index === -1) {
    return new Response(JSON.stringify({ error: 'Guest not found' }), { status: 404 });
  }

  const body = await request.json();
  const { name, initials, bio, episodeTitle } = body as Partial<Guest>;

  if (!name || !initials || !bio || !episodeTitle) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  guests[index] = { ...guests[index], name, initials, bio, episodeTitle };
  saveGuests(guests);

  return new Response(JSON.stringify(guests[index]), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ locals, params }) => {
  if (!isAdmin(locals)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const guests = getGuests();
  const index = guests.findIndex((g) => g.id === params.id);
  if (index === -1) {
    return new Response(JSON.stringify({ error: 'Guest not found' }), { status: 404 });
  }

  guests.splice(index, 1);
  saveGuests(guests);

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
