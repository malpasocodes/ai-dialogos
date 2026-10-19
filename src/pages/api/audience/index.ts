import type { APIRoute } from 'astro';
import { getHistory, summarize, recordSnapshot, isPlatform } from '../../../utils/audience';

function isAdmin(locals: App.Locals): boolean {
  const { userId } = locals.auth();
  const adminId = import.meta.env.ADMIN_USER_ID;
  return !!userId && !!adminId && userId === adminId;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// Audience numbers are private, so unlike GET /api/guests this read is admin-only.
export const GET: APIRoute = async ({ locals }) => {
  try {
    if (!isAdmin(locals)) return json({ error: 'Unauthorized' }, 401);
    const history = await getHistory();
    return json({ summary: summarize(history), history });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return json({ error: message }, 500);
  }
};

export const POST: APIRoute = async ({ locals, request }) => {
  try {
    if (!isAdmin(locals)) return json({ error: 'Unauthorized' }, 401);

    const body = await request.json().catch(() => null);
    const platform = body?.platform;
    const count = body?.count;
    const recordedOn = body?.recordedOn;

    if (!isPlatform(platform)) {
      return json({ error: 'Platform must be youtube, substack, spotify, or apple' }, 400);
    }
    if (!Number.isInteger(count) || count < 0) {
      return json({ error: 'Count must be a non-negative whole number' }, 400);
    }
    if (recordedOn !== undefined && (typeof recordedOn !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(recordedOn) || Number.isNaN(Date.parse(recordedOn)))) {
      return json({ error: 'Date must be YYYY-MM-DD' }, 400);
    }

    await recordSnapshot({ platform, count, recordedOn, source: 'manual' });
    const history = await getHistory();
    return json({ summary: summarize(history), history }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return json({ error: message }, 500);
  }
};
