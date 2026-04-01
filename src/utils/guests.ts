import { db } from '../db';
import { guests as guestsTable } from '../db/schema';
import { eq, asc } from 'drizzle-orm';

export interface Guest {
  id: string;
  name: string;
  initials: string;
  bio: string;
  episodeTitle: string;
  headshot: string | null;
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

function toGuest(row: typeof guestsTable.$inferSelect): Guest {
  return {
    id: row.id,
    name: row.name,
    initials: row.initials || deriveInitials(row.name),
    bio: row.bio,
    episodeTitle: row.episodeTitle,
    headshot: row.headshot,
    position: row.position,
  };
}

export async function getGuests(): Promise<Guest[]> {
  const rows = await db.select().from(guestsTable).orderBy(asc(guestsTable.position));
  return rows.map(toGuest);
}

export async function getGuest(id: string): Promise<Guest | undefined> {
  const [row] = await db.select().from(guestsTable).where(eq(guestsTable.id, id));
  return row ? toGuest(row) : undefined;
}

export async function createGuest(data: {
  name: string;
  bio: string;
  episodeTitle: string;
  initials?: string;
  headshot?: string | null;
  position?: number;
}): Promise<Guest> {
  const [row] = await db.insert(guestsTable).values({
    name: data.name,
    initials: data.initials || deriveInitials(data.name),
    bio: data.bio,
    episodeTitle: data.episodeTitle,
    headshot: data.headshot ?? null,
    position: data.position ?? 0,
  }).returning();
  return toGuest(row);
}

export async function updateGuest(id: string, data: {
  name?: string;
  bio?: string;
  episodeTitle?: string;
  initials?: string;
  headshot?: string | null;
  position?: number;
}): Promise<Guest | undefined> {
  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.bio !== undefined) updates.bio = data.bio;
  if (data.episodeTitle !== undefined) updates.episodeTitle = data.episodeTitle;
  if (data.initials !== undefined) updates.initials = data.initials;
  if (data.headshot !== undefined) updates.headshot = data.headshot;
  if (data.position !== undefined) updates.position = data.position;

  // Auto-derive initials if name changed and initials not explicitly set
  if (data.name && !data.initials) {
    updates.initials = deriveInitials(data.name);
  }

  const [row] = await db.update(guestsTable)
    .set(updates)
    .where(eq(guestsTable.id, id))
    .returning();
  return row ? toGuest(row) : undefined;
}

export async function deleteGuest(id: string): Promise<boolean> {
  const result = await db.delete(guestsTable).where(eq(guestsTable.id, id)).returning();
  return result.length > 0;
}
