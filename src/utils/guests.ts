import { getStore } from '@netlify/blobs';
import seedData from '../data/guests.json';

export interface Guest {
  id: string;
  name: string;
  initials: string;
  bio: string;
  episodeTitle: string;
  headshot: string | null;
}

const STORE_NAME = 'guests';
const BLOB_KEY = 'guests-list';

export async function getGuests(): Promise<Guest[]> {
  try {
    const store = getStore(STORE_NAME);
    const data = await store.get(BLOB_KEY);
    if (data) {
      return JSON.parse(data) as Guest[];
    }
  } catch {
    // Blobs not available (local dev without netlify dev) — fall through to seed data
  }
  return seedData as Guest[];
}

export async function saveGuests(guests: Guest[]): Promise<void> {
  const store = getStore(STORE_NAME);
  await store.set(BLOB_KEY, JSON.stringify(guests));
}
