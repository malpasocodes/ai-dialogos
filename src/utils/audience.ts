import { db } from '../db';
import { audienceSnapshots } from '../db/schema';
import { desc, sql } from 'drizzle-orm';
import { YOUTUBE_CHANNEL_ID } from './youtube';

export const PLATFORMS = ['youtube', 'substack', 'spotify', 'apple'] as const;
export type Platform = (typeof PLATFORMS)[number];
export type SnapshotSource = 'api' | 'manual';

export interface Snapshot {
  id: string;
  platform: Platform;
  count: number;
  recordedOn: string; // YYYY-MM-DD
  source: SnapshotSource;
}

export interface PlatformSummary {
  platform: Platform;
  latest: Snapshot | null;
  previous: Snapshot | null;
}

export function isPlatform(value: unknown): value is Platform {
  return typeof value === 'string' && (PLATFORMS as readonly string[]).includes(value);
}

// One row per platform per day: re-recording the same day overwrites it.
export async function recordSnapshot(input: {
  platform: Platform;
  count: number;
  source: SnapshotSource;
  recordedOn?: string;
}): Promise<void> {
  await db
    .insert(audienceSnapshots)
    .values({
      platform: input.platform,
      count: input.count,
      source: input.source,
      ...(input.recordedOn ? { recordedOn: input.recordedOn } : {}),
    })
    .onConflictDoUpdate({
      target: [audienceSnapshots.platform, audienceSnapshots.recordedOn],
      set: { count: input.count, source: input.source, createdAt: sql`now()` },
    });
}

export async function getHistory(limit = 200): Promise<Snapshot[]> {
  const rows = await db
    .select({
      id: audienceSnapshots.id,
      platform: audienceSnapshots.platform,
      count: audienceSnapshots.count,
      recordedOn: audienceSnapshots.recordedOn,
      source: audienceSnapshots.source,
    })
    .from(audienceSnapshots)
    .orderBy(desc(audienceSnapshots.recordedOn), desc(audienceSnapshots.createdAt))
    .limit(limit);

  return rows.filter((r) => isPlatform(r.platform)) as Snapshot[];
}

// Latest and previous snapshot per platform, derived from history (newest first).
export function summarize(history: Snapshot[]): PlatformSummary[] {
  return PLATFORMS.map((platform) => {
    const rows = history.filter((r) => r.platform === platform);
    return { platform, latest: rows[0] ?? null, previous: rows[1] ?? null };
  });
}

// Channel subscriber count from the YouTube Data API. YouTube rounds this to
// three significant figures. Returns null if the key is unset, the request
// fails, or the channel hides its count.
export async function fetchYouTubeSubscribers(): Promise<number | null> {
  const key = import.meta.env.YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY;
  if (!key) return null;

  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/channels');
    url.searchParams.set('part', 'statistics');
    url.searchParams.set('id', YOUTUBE_CHANNEL_ID);
    url.searchParams.set('key', key);

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      console.warn(`[audience] YouTube API returned HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();
    const stats = data?.items?.[0]?.statistics;
    if (!stats || stats.hiddenSubscriberCount) return null;

    const count = Number(stats.subscriberCount);
    return Number.isFinite(count) ? count : null;
  } catch (err) {
    console.warn('[audience] YouTube API request failed:', err);
    return null;
  }
}
