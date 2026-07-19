ALTER TABLE "guests" ALTER COLUMN "episode_title" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN IF NOT EXISTS "episode_url" text;