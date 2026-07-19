ALTER TABLE "guests" ADD COLUMN IF NOT EXISTS "short_bio" text;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN IF NOT EXISTS "position" integer DEFAULT 0 NOT NULL;