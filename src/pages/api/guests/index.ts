import type { APIRoute } from 'astro';
import { getGuests, createGuest } from '../../../utils/guests';

function isAdmin(locals: App.Locals): boolean {
  const { userId } = locals.auth();
  const adminId = import.meta.env.ADMIN_USER_ID;
  return !!userId && !!adminId && userId === adminId;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const GET: APIRoute = async () => {
  try {
    const guests = await getGuests();
    return new Response(JSON.stringify(guests), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ locals, request }) => {
  try {
    if (!isAdmin(locals)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const bio = formData.get('bio') as string;
    const shortBio = formData.get('shortBio') as string | null;
    const episodeTitle = formData.get('episodeTitle') as string;
    const initials = formData.get('initials') as string | null;
    const imageFile = formData.get('headshot') as File | null;
    const positionStr = formData.get('position') as string | null;

    if (!name || !bio || !episodeTitle) {
      return new Response(JSON.stringify({ error: 'Name, bio, and episode title are required' }), { status: 400 });
    }

    let headshot: string | null = null;
    if (imageFile && imageFile.size > 0) {
      if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
        return new Response(JSON.stringify({ error: 'Unsupported image type' }), { status: 400 });
      }
      const buffer = await imageFile.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      headshot = `data:${imageFile.type};base64,${base64}`;
    }

    const guest = await createGuest({
      name,
      bio,
      shortBio: shortBio?.trim() || null,
      episodeTitle,
      initials: initials || undefined,
      headshot,
      position: positionStr ? parseInt(positionStr, 10) : undefined,
    });

    return new Response(JSON.stringify(guest), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
