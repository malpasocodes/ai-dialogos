import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const guests = pgTable('guests', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  initials: text('initials'),
  bio: text('bio').notNull(),
  episodeTitle: text('episode_title').notNull(),
  headshot: text('headshot'),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
});
