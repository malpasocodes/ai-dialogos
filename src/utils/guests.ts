import { db } from '../db';
import { guests as guestsTable } from '../db/schema';
import { eq, asc, sql } from 'drizzle-orm';

export interface Guest {
  id: string;
  name: string;
  initials: string;
  bio: string;
  shortBio: string | null;
  episodeTitle: string;
  hasHeadshot: boolean;
  position: number;
}

function deriveInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('');
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
      position: guestsTable.position,
      hasHeadshot: sql<boolean>`${guestsTable.headshot} IS NOT NULL`,
    })
    .from(guestsTable)
    .orderBy(asc(guestsTable.position));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    initials: row.initials || deriveInitials(row.name),
    bio: row.bio,
    shortBio: row.shortBio,
    episodeTitle: row.episodeTitle,
    position: row.position,
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
      position: guestsTable.position,
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
    position: row.position,
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
  episodeTitle: string;
  initials?: string;
  headshot?: string | null;
  position?: number;
}): Promise<Guest> {
  const [row] = await db.insert(guestsTable).values({
    name: data.name,
    initials: data.initials || deriveInitials(data.name),
    bio: data.bio,
    shortBio: data.shortBio ?? null,
    episodeTitle: data.episodeTitle,
    headshot: data.headshot ?? null,
    position: data.position ?? 0,
  }).returning();
  return {
    id: row.id,
    name: row.name,
    initials: row.initials || deriveInitials(row.name),
    bio: row.bio,
    shortBio: row.shortBio,
    episodeTitle: row.episodeTitle,
    position: row.position,
    hasHeadshot: row.headshot !== null,
  };
}

export async function updateGuest(id: string, data: {
  name?: string;
  bio?: string;
  shortBio?: string | null;
  episodeTitle?: string;
  initials?: string;
  headshot?: string | null;
  position?: number;
}): Promise<Guest | undefined> {
  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.bio !== undefined) updates.bio = data.bio;
  if (data.shortBio !== undefined) updates.shortBio = data.shortBio;
  if (data.episodeTitle !== undefined) updates.episodeTitle = data.episodeTitle;
  if (data.initials !== undefined) updates.initials = data.initials;
  if (data.headshot !== undefined) updates.headshot = data.headshot;
  if (data.position !== undefined) updates.position = data.position;

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
    position: row.position,
    hasHeadshot: row.headshot !== null,
  };
}

export async function deleteGuest(id: string): Promise<boolean> {
  const result = await db.delete(guestsTable).where(eq(guestsTable.id, id)).returning();
  return result.length > 0;
}
