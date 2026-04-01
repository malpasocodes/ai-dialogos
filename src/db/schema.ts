import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const guests = pgTable('guests', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  initials: text('initials'),
  bio: text('bio').notNull(),
  episodeTitle: text('episode_title').notNull(),
  headshot: text('headshot'),
  createdAt: timestamp('created_at').defaultNow(),
});
