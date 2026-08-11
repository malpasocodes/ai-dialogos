# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Companion site for the **AI Essentials for Leaders** book series (ai-dialogos.com). Astro 5 in SSR (`output: 'server'`) deployed to Netlify, with a small admin surface backed by Neon Postgres. Most pages are `prerender: true`; dynamic surface is the guests list, the admin pages, and a few API routes.

## Commands

```bash
npm run dev           # Runs `netlify dev` — use this, not astro dev. Clerk middleware + API routes depend on the Netlify runtime.
npm run dev:astro     # Plain `astro dev` fallback (auth/serverless behavior won't match prod).
npm run build         # astro build (postbuild runs Pagefind on dist/)
npm run preview       # astro preview

npm run db:generate   # drizzle-kit generate — produce a migration from schema changes
npm run db:migrate    # drizzle-kit migrate — apply migrations
npm run db:push       # drizzle-kit push — sync schema without a migration (dev only)
npm run db:studio     # drizzle-kit studio
```

No linter and no test runner are wired up (`npm run lint` is a placeholder). Don't claim either ran.

Path alias: `@/*` → `src/*` (tsconfig strict).

## Required environment

`.env` is gitignored. Local dev and Netlify both need:

- `DATABASE_URL` — Neon Postgres connection string (pooled URL).
- `PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` — Clerk auth.
- `ADMIN_USER_ID` — single Clerk user id allowed to hit admin routes / mutating APIs.
- Optional: `SUBSTACK_RSS_URL`, `PLAUSIBLE_DOMAIN`.

## Architecture

### Rendering model
- `astro.config.mjs` sets `output: 'server'` with the Netlify adapter. Public marketing pages are marked `prerender: true` individually; anything that reads the DB or `Astro.locals.auth()` runs at request time.
- React islands are mounted explicitly: `client:load` for nav/theming, `client:only="react"` for Clerk's `UserButton` (Clerk components must not SSR).
- Tailwind via `@astrojs/tailwind` with `applyBaseStyles: false` — base styles live in `src/styles/global.css`. Theming is CSS-variable-driven with four themes (`dark | light | emerald | ocean`) selected via `data-theme` on the root.

### Auth (Clerk)
- `src/middleware.ts` is just `clerkMiddleware()` — **required**, without it `Astro.locals.auth()` is undefined on Netlify.
- Admin gate pattern (used in `src/pages/admin/*.astro` and every mutating API route): compare `locals.auth().userId` against `import.meta.env.ADMIN_USER_ID`. There's no role system — it's literally one user id.
- Read-only API routes (e.g. `GET /api/guests`) are intentionally public.

### Data layer
- Drizzle ORM over Neon Postgres. Schema in `src/db/schema.ts`, client in `src/db/index.ts`, migrations in `drizzle/`.
- Single table today: `guests`. Display order is controlled by the `position` integer column (ascending).
- Read paths go through `src/utils/guests.ts` — `getGuests()` deliberately excludes the binary `headshot` column and returns `hasHeadshot: boolean` instead. **Don't reintroduce inline base64 in list queries** — that's what caused the ~1.4 MB HTML payload the May 2026 cleanup fixed.

### Headshots
- Uploaded as base64 `data:` URLs into the `headshot` column (admin form is multipart; encoding happens in the POST/PUT handlers).
- Served as binary via `GET /api/headshots/[id]` with `Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800` so Netlify's edge caches them. Cache key is the guest id; admin edits propagate within `max-age`.
- Public guests page references `<img src="/api/headshots/{id}" loading="lazy">`.

### External feeds (Substack essays)
- `src/utils/substack.ts` fetches the Substack RSS feed (`https://aidialogos.substack.com/feed`) at **build time** with an in-process memo, powering the `/substack` essays list and the homepage "Latest Substack" cards. If the live fetch fails or returns empty, it falls back to the JSON snapshot in `src/data/substack-cache.json`.
- **The podcast is not hosted on-site**, but the homepage lists episodes. `src/utils/youtube.ts` fetches the YouTube playlist RSS feed (`https://www.youtube.com/feeds/videos.xml?playlist_id=PL2QoJOg_E8XBA9C_6uvNcUSOhQ2VEq9pn`, no API key, newest ~15 entries) at build time with the same memo + fallback pattern, falling back to `src/data/youtube-cache.json`. Episode cards link out to YouTube watch URLs; publishing flow is Substack → routes video to YouTube and audio to Spotify/Apple.
- The Podcast nav menu links straight out to the listening services (Apple Podcasts `id1884134654`, Spotify show `033qQQeIiEKw63qWMdFmPI`, the Substack podcast page) — those URLs are hardcoded in the nav (`src/layouts/Layout.astro`) and duplicated on the homepage (`src/pages/index.astro`). Only `/podcast/guests` lives under `/podcast`.
- Consequence: **new Substack posts and podcast episodes don't appear until the site rebuilds.** A Netlify build hook is triggered by an hourly GitHub Actions cron (`.github/workflows/`), or manually with `gh workflow run scheduled-rebuild.yml --ref main` — the manual trigger is the reliable path, since the YouTube episode is usually not in the playlist yet when Substack publishes. Details in `docs/auto-rebuild-setup.md`.

### Page structure
- Top-level routes: `index`, `about`, `book`, `series`, `substack`, `search`, `podcast/guests`, `volumes/*`, `sign-in`, `admin/*`, `api/*`. (The Podcast nav menu otherwise links out to external listening services; there is no on-site `/podcast` index or episode page.)
- Nav lives in `src/layouts/Layout.astro` (server-side definition passed to the `MainNav` React island).

## Operational notes

- **Keep `CHANGELOG.md` current.** Every time you make a commit, add a matching entry under a `## YYYY-MM-DD` section for today's date at the top of `CHANGELOG.md`, creating that section if it doesn't exist (Keep a Changelog section types: Added / Changed / Fixed / Removed / Security / Docs). There is no `[Unreleased]` section — every push deploys, so entries are dated immediately. Include the changelog edit in the same commit as the change it describes.
- **Don't bypass the admin gate** by loosening the `userId === ADMIN_USER_ID` check — it's the only auth on mutating endpoints.
- Netlify's serverless filesystem is read-only. Past attempts to persist guest data to JSON files or Netlify Blobs both failed in production; Postgres is the only durable path. Don't reach for `writeFileSync` in request handlers.
- `scripts/seed-guests.mjs` and `scripts/resize-headshot.sh` are one-off operational tools, not part of the app runtime.
- `scripts/upsert-guest-bio.mjs` publishes a guest's bio + short bio directly to the DB (by name, case-insensitive; creates the guest if missing). It's the write path used by the `guest-bio` agent (`.claude/agents/guest-bio.md`) — invoked when the user provides a guest name + LinkedIn URL to publish a bio. Bios are plain text only (the page escapes HTML).
- The deferred major-version upgrades (Astro 6, Clerk 3, Tailwind 4, etc.) are scoped in `docs/major-version-migration.md`. Read that before starting any of them — it documents specific files that touch each dep.
