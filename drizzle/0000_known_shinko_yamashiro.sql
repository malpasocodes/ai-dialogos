CREATE TABLE IF NOT EXISTS "guests" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"initials" text,
	"bio" text NOT NULL,
	"episode_title" text NOT NULL,
	"headshot" text,
	"created_at" timestamp DEFAULT now()
);
