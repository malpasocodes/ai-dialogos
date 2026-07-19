import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';
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
