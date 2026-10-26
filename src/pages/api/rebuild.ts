import type { APIRoute } from 'astro';

function isAdmin(locals: App.Locals): boolean {
  const { userId } = locals.auth();
  const adminId = import.meta.env.ADMIN_USER_ID;
  return !!userId && !!adminId && userId === adminId;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// Fires the Netlify build hook so new Substack posts / YouTube episodes get picked up.
// The hook URL is a secret (anyone holding it can trigger builds), so it stays server-side.
export const POST: APIRoute = async ({ locals }) => {
  try {
    if (!isAdmin(locals)) return json({ error: 'Unauthorized' }, 401);

    const hookUrl = import.meta.env.NETLIFY_BUILD_HOOK_URL;
    if (!hookUrl) return json({ error: 'NETLIFY_BUILD_HOOK_URL is not configured' }, 500);

    const res = await fetch(hookUrl, { method: 'POST' });
    if (!res.ok) return json({ error: `Build hook returned ${res.status}` }, 502);

    return json({ ok: true }, 202);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return json({ error: message }, 500);
  }
};
