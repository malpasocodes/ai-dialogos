import { db } from '../db';
import { guests as guestsTable } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

export interface Guest {
  id: string;
  name: string;
  initials: string;
  bio: string;
  shortBio: string | null;
  episodeTitle: string | null;
  episodeUrl: string | null;
  hasHeadshot: boolean;
}

function deriveInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('');
}

// Episode titles start with their number ("#5: …", "# 5: …").
function episodeNumber(title: string | null): number | null {
  const match = title?.match(/^\s*#\s*(\d+)/);
  return match ? Number(match[1]) : null;
}

// Display order is automatic: upcoming guests (no episode title yet) first,
// newest added first; then guests by episode number, newest episode first;
// then any guest whose title has no number. Ties go by name.
function compareGuests(
  a: { name: string; episodeTitle: string | null; createdAt: Date | null },
  b: { name: string; episodeTitle: string | null; createdAt: Date | null },
): number {
  const rank = (g: typeof a) => (!g.episodeTitle?.trim() ? 0 : episodeNumber(g.episodeTitle) !== null ? 1 : 2);
  const byRank = rank(a) - rank(b);
  if (byRank !== 0) return byRank;
  if (rank(a) === 0) {
    const byCreated = (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
    if (byCreated !== 0) return byCreated;
  }
  if (rank(a) === 1) {
    const byEpisode = episodeNumber(b.episodeTitle)! - episodeNumber(a.episodeTitle)!;
    if (byEpisode !== 0) return byEpisode;
  }
  return a.name.localeCompare(b.name);
}

export async function getGuests(): Promise<Guest[]> {
  const rows = await db
    .select({
      id: guestsTable.id,
      name: guestsTable.name,
      initials: guestsTable.initials,
      bio: guestsTable.bio,
      shortBio: guestsTable.shortBio,
      episodeTitle: guestsTable.episodeTitle,
      episodeUrl: guestsTable.episodeUrl,
      createdAt: guestsTable.createdAt,
      hasHeadshot: sql<boolean>`${guestsTable.headshot} IS NOT NULL`,
    })
    .from(guestsTable);

  return rows.sort(compareGuests).map((row) => ({
    id: row.id,
    name: row.name,
    initials: row.initials || deriveInitials(row.name),
    bio: row.bio,
    shortBio: row.shortBio,
    episodeTitle: row.episodeTitle,
    episodeUrl: row.episodeUrl,
    hasHeadshot: Boolean(row.hasHeadshot),
  }));
}

export async function getGuest(id: string): Promise<Guest | undefined> {
  const [row] = await db
    .select({
      id: guestsTable.id,
      name: guestsTable.name,
      initials: guestsTable.initials,
      bio: guestsTable.bio,
      shortBio: guestsTable.shortBio,
      episodeTitle: guestsTable.episodeTitle,
      episodeUrl: guestsTable.episodeUrl,
      hasHeadshot: sql<boolean>`${guestsTable.headshot} IS NOT NULL`,
    })
    .from(guestsTable)
    .where(eq(guestsTable.id, id));

  if (!row) return undefined;
  return {
    id: row.id,
    name: row.name,
    initials: row.initials || deriveInitials(row.name),
    bio: row.bio,
    shortBio: row.shortBio,
    episodeTitle: row.episodeTitle,
    episodeUrl: row.episodeUrl,
    hasHeadshot: Boolean(row.hasHeadshot),
  };
}

export interface HeadshotData {
  contentType: string;
  body: Buffer;
}

// Parse a `data:<mime>;base64,<payload>` URL into mime + raw bytes.
export async function getGuestHeadshot(id: string): Promise<HeadshotData | undefined> {
  const [row] = await db
    .select({ headshot: guestsTable.headshot })
    .from(guestsTable)
    .where(eq(guestsTable.id, id));

  if (!row?.headshot) return undefined;

  const match = row.headshot.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return undefined;
  return {
    contentType: match[1],
    body: Buffer.from(match[2], 'base64'),
  };
}

export async function createGuest(data: {
  name: string;
  bio: string;
  shortBio?: string | null;
  episodeTitle?: string | null;
  episodeUrl?: string | null;
  initials?: string;
  headshot?: string | null;
}): Promise<Guest> {
  const [row] = await db.insert(guestsTable).values({
    name: data.name,
    initials: data.initials || deriveInitials(data.name),
    bio: data.bio,
    shortBio: data.shortBio ?? null,
    episodeTitle: data.episodeTitle ?? null,
    episodeUrl: data.episodeUrl ?? null,
    headshot: data.headshot ?? null,
  }).returning();
  return {
    id: row.id,
    name: row.name,
    initials: row.initials || deriveInitials(row.name),
    bio: row.bio,
    shortBio: row.shortBio,
    episodeTitle: row.episodeTitle,
    episodeUrl: row.episodeUrl,
    hasHeadshot: row.headshot !== null,
  };
}

export async function updateGuest(id: string, data: {
  name?: string;
  bio?: string;
  shortBio?: string | null;
  episodeTitle?: string | null;
  episodeUrl?: string | null;
  initials?: string;
  headshot?: string | null;
}): Promise<Guest | undefined> {
  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.bio !== undefined) updates.bio = data.bio;
  if (data.shortBio !== undefined) updates.shortBio = data.shortBio;
  if (data.episodeTitle !== undefined) updates.episodeTitle = data.episodeTitle;
  if (data.episodeUrl !== undefined) updates.episodeUrl = data.episodeUrl;
  if (data.initials !== undefined) updates.initials = data.initials;
  if (data.headshot !== undefined) updates.headshot = data.headshot;

  if (data.name && !data.initials) {
    updates.initials = deriveInitials(data.name);
  }

  const [row] = await db.update(guestsTable)
    .set(updates)
    .where(eq(guestsTable.id, id))
    .returning();

  if (!row) return undefined;
  return {
    id: row.id,
    name: row.name,
    initials: row.initials || deriveInitials(row.name),
    bio: row.bio,
    shortBio: row.shortBio,
    episodeTitle: row.episodeTitle,
    episodeUrl: row.episodeUrl,
    hasHeadshot: row.headshot !== null,
  };
}

export async function deleteGuest(id: string): Promise<boolean> {
  const result = await db.delete(guestsTable).where(eq(guestsTable.id, id)).returning();
  return result.length > 0;
}
