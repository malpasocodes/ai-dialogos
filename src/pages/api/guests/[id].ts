import type { APIRoute } from 'astro';
import { updateGuest, deleteGuest } from '../../../utils/guests';

function isAdmin(locals: App.Locals): boolean {
  const { userId } = locals.auth();
  return !!userId && userId === import.meta.env.ADMIN_USER_ID;
}

export const PUT: APIRoute = async ({ locals, params, request }) => {
  if (!isAdmin(locals)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const formData = await request.formData();
  const name = formData.get('name') as string;
  const bio = formData.get('bio') as string;
  const episodeTitle = formData.get('episodeTitle') as string;
  const initials = formData.get('initials') as string | null;
  const imageFile = formData.get('headshot') as File | null;
  const removeHeadshot = formData.get('removeHeadshot') === 'true';

  if (!name || !bio || !episodeTitle) {
    return new Response(JSON.stringify({ error: 'Name, bio, and episode title are required' }), { status: 400 });
  }

  let headshot: string | null | undefined = undefined;
  if (removeHeadshot) {
    headshot = null;
  } else if (imageFile && imageFile.size > 0) {
    const buffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    headshot = `data:${imageFile.type};base64,${base64}`;
  }

  const guest = await updateGuest(params.id!, {
    name,
    bio,
    episodeTitle,
    initials: initials || undefined,
    headshot,
  });

  if (!guest) {
    return new Response(JSON.stringify({ error: 'Guest not found' }), { status: 404 });
  }

  return new Response(JSON.stringify(guest), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ locals, params }) => {
  if (!isAdmin(locals)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const deleted = await deleteGuest(params.id!);
  if (!deleted) {
    return new Response(JSON.stringify({ error: 'Guest not found' }), { status: 404 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
