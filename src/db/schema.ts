import { pgTable, text, timestamp, integer, date, uniqueIndex } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const guests = pgTable('guests', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  initials: text('initials'),
  bio: text('bio').notNull(),
  shortBio: text('short_bio'),
  episodeTitle: text('episode_title'),
  episodeUrl: text('episode_url'),
  headshot: text('headshot'),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// One subscriber/follower count per platform per day. YouTube is recorded
// from the Data API; the rest are typed in from each platform's dashboard.
export const audienceSnapshots = pgTable(
  'audience_snapshots',
  {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    platform: text('platform').notNull(),
    count: integer('count').notNull(),
    recordedOn: date('recorded_on').notNull().defaultNow(),
    source: text('source').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (t) => [uniqueIndex('audience_snapshots_platform_day').on(t.platform, t.recordedOn)],
);
