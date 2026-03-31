import type { APIRoute } from 'astro';
import { getGuests, saveGuests } from '../../../utils/guests';
import type { Guest } from '../../../utils/guests';

function isAdmin(locals: App.Locals): boolean {
  const { userId } = locals.auth();
  return !!userId && userId === import.meta.env.ADMIN_USER_ID;
}

export const GET: APIRoute = async () => {
  const guests = getGuests();
  return new Response(JSON.stringify(guests), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ locals, request }) => {
  if (!isAdmin(locals)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const body = await request.json();
  const { name, initials, bio, episodeTitle } = body as Partial<Guest>;

  if (!name || !initials || !bio || !episodeTitle) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  const guests = getGuests();
  const id = `guest_${Date.now()}`;
  const newGuest: Guest = { id, name, initials, bio, episodeTitle, headshot: null };
  guests.push(newGuest);
  saveGuests(guests);

  return new Response(JSON.stringify(newGuest), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
