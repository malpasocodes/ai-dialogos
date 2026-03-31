import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export interface Guest {
  id: string;
  name: string;
  initials: string;
  bio: string;
  episodeTitle: string;
  headshot: string | null;
}

const filePath = join(process.cwd(), 'src/data/guests.json');

export function getGuests(): Guest[] {
  const raw = readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as Guest[];
}

export function saveGuests(guests: Guest[]): void {
  writeFileSync(filePath, JSON.stringify(guests, null, 2) + '\n', 'utf-8');
}
