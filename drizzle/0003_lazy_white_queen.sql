CREATE TABLE "audience_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"platform" text NOT NULL,
	"count" integer NOT NULL,
	"recorded_on" date DEFAULT now() NOT NULL,
	"source" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "audience_snapshots_platform_day" ON "audience_snapshots" USING btree ("platform","recorded_on");