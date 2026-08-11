# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
section types (Added / Changed / Fixed / Removed / Security / Docs), but since
every push to `main` deploys immediately there is no `[Unreleased]` section:
entries go directly under a `## YYYY-MM-DD` heading for the date they land.

## 2026-08-11

### Removed
- The Zapier/Make RSS watcher as a rebuild trigger. It keyed on the Substack
  publish event, but the YouTube episode is usually not in the playlist yet at
  that moment, so the "instant" rebuild shipped a half-complete update and a
  second rebuild was needed anyway. One less external dependency.

### Changed
- `.github/workflows/scheduled-rebuild.yml` cron from daily (06:00 UTC) to
  hourly, so dropping the instant trigger caps worst-case content lag at about
  an hour instead of a day. The repo is public, so Actions minutes are free and
  the job takes ~6s.

### Docs
- Rewrote `docs/auto-rebuild-setup.md` around the hourly cron plus a manual
  `gh workflow run scheduled-rebuild.yml --ref main` after the playlist add,
  which is when content is actually complete. Documents two gotchas found while
  debugging the 2026-08-11 episode: the YouTube playlist feed is served with
  `max-age=900` (a stale read looks identical to "video not in playlist" — use a
  cache-busting query param to check), and unlisted/private videos are omitted
  from the playlist feed entirely. Also notes that GitHub delays scheduled runs
  under load and disables schedules in public repos after 60 days without a
  commit.
- Updated `CLAUDE.md` and `docs/spinoff-uncommon-books.md` to match.

## 2026-07-20

### Added
- Guest bio for Eulalia Flo (Equinix) published to the `guests` table at
  position 7. No episode title yet, so the card renders as "Coming soon".
- Headshot for Eulalia Flo written to her `headshot` column (48 KB data URL,
  305x313 JPEG — already under the 384px ceiling, so no resize was needed).
  Original retained locally in the gitignored `scripts/backup-headshots/`.
- Mobile navigation (`src/components/MobileNav.tsx`): a hamburger button shown
  below the `md` breakpoint opens a slide-in sheet with every nav item,
  dropdown groups flattened under their parent label as section headings.
  Previously `MainNav` was `hidden md:flex` with no mobile fallback, so the
  entire menu was unreachable on phones.
- Theme picker inside the mobile menu, so switching themes stays available on
  small screens now that the header theme dropdown is desktop-only.

### Changed
- Theme state extracted to `src/lib/theme.ts` (`useTheme`, `applyTheme`,
  `themes`), shared by `ThemeSelector` and `MobileNav`. Instances stay in sync
  via a `themechange` window event.
- Header packs down on small screens: brand drops to `text-lg` with tighter
  tracking and `whitespace-nowrap` (it was wrapping to two lines), the "Sign
  In" link no longer wraps, and the theme dropdown is `hidden md:block`.

### Fixed
- Hamburger was unreachable at 320px wide: the header row overflowed and the
  "Sign In" link overlapped the button, swallowing taps. Verified with
  Playwright at 320/390/412px that the trigger is fully in-viewport, has a
  44px tap target, and the page has no horizontal overflow.

## 2026-07-19

### Added
- Optional `episode_url` column on `guests` (migration `0002`): when set, the
  episode title on the guest card links out to it (new-tab). Editable in the
  admin form and via `--episode-url` in `scripts/upsert-guest-bio.mjs`.
- `guest-bio` Claude Code agent (`.claude/agents/guest-bio.md`): given a guest
  name and LinkedIn URL, researches the guest, drafts a full bio + short bio in
  house style (plain text only), and publishes them to the guests table via the
  new `scripts/upsert-guest-bio.mjs` (case-insensitive name upsert, `--dry-run`
  support, rejects HTML). Documented in `CLAUDE.md`; `.gitignore` now excludes
  `.claude/settings.local.json`.
- Optional `short_bio` column on `guests` (Drizzle migration `0001`), editable
  via a new "Short Bio" field in the admin guest form and accepted by the
  guest POST/PUT API routes.

### Changed
- Changelog entries are now filed directly under dated sections instead of
  accumulating in `[Unreleased]` (this site deploys on every push, so nothing
  stays unreleased); `CLAUDE.md` instruction updated to match.
- Guests page intro no longer says the podcast "will lead off in May and June
  2026" — episodes have published; the copy is now evergreen.
- `episode_title` is now nullable, and a null title is the convention for
  upcoming guests: cards render a "Coming soon" badge instead of a title, the
  admin form and guest APIs no longer require an episode title, and the
  upsert script defaults new guests to null (previously "Episode TBD" — Matt
  Sigelman's placeholder row was cleaned up accordingly).
- Guest cards on `/podcast/guests` now show a 2–3 line bio preview (curated
  short bio, or the full bio clamped to three lines) with a native
  `<details>` "Read more" toggle that expands the full bio in place, instead
  of always rendering the entire bio.
- Made migrations `0000`/`0001` idempotent (`IF NOT EXISTS`) so
  `drizzle-kit migrate` can adopt the existing database, which had been
  synced with `db:push` and had no migration-tracking table.

### Fixed
- Guest bios in the database contained literal `<em>` tags (visible on the page
  since bios became HTML-escaped) — cleaned all four existing bios to plain
  text and backfilled their previously empty short bios.

### Docs
- Added `docs/spinoff-uncommon-books.md` — phased plan for spinning this site
  off into "Uncommon Books for Uncommon Readers" (fork, fresh services, feed
  repoint, `guests` → `authors` rename, rebrand). Plan only; no code changes.

## 2026-07-18

### Added
- Homepage now lists published podcast episodes from the AI-Dialogos YouTube
  playlist, fetched at build time via the playlist RSS feed (no API key) with a
  JSON snapshot fallback in `src/data/youtube-cache.json` — same pattern as the
  Substack feed. New `src/utils/youtube.ts` and `EpisodeCard.astro`; episode
  cards link out to YouTube (thumbnail, date, summary).

### Changed
- Homepage hero CTA now points at the YouTube playlist ("Watch on YouTube");
  the podcast section links to Apple Podcasts and Spotify for audio.

### Docs
- Added a note in `CLAUDE.md` requiring `CHANGELOG.md` to be updated with every commit.

## 2026-06-30

### Security
- Hardened headshot uploads and serving (upload validation and cached binary endpoint).
- Hardened the admin gate and escaped guest bios to prevent injection.

## 2026-06-01

### Changed
- Replaced the on-site podcast with direct links to listening services
  (Apple Podcasts, Spotify, Substack). Removed the feed-merge episode-pulling code.

### Added
- Spotify and Apple Podcasts listen links on podcast pages.
- Surfaced podcast + video episodes from Substack and YouTube feeds (later superseded).

## 2026-05-23

### Changed
- Served guest headshots via a cached endpoint (`GET /api/headshots/[id]`) instead
  of inlining base64 — fixed the ~1.4 MB HTML payload on the guests list.

### Removed
- Dropped unused dependencies and dead code.

### Docs
- Added the major-version migration planning doc (`docs/major-version-migration.md`).

## 2026-04-01

### Added
- `position` field to control guest card display order.
- Rich text (bold, italics, links) in guest bios.

### Changed
- Replaced hardcoded colors with theme-aware tokens.
- Replaced the custom CSS nav dropdown with the shadcn NavigationMenu.
- Simplified the footer to copyright-only.

## 2026-03-31

### Added
- Clerk authentication with a sign-in page and admin route.
- Admin CRUD for podcast guests.
- Podcast dropdown menu with Overview and Guests pages.

### Changed
- Switched guest storage to Neon Postgres with Drizzle ORM (after filesystem and
  Netlify Blobs approaches failed on Netlify's read-only serverless filesystem).

### Fixed
- Added Clerk middleware so `Astro.locals.auth()` resolves on Netlify.
- Fixed 404s on API routes by removing conflicting Netlify redirects.

## 2026-02-21

### Changed
- Rebranded to ai-dialogos.com; removed legacy educational content.
- Pointed the Substack feed at `aidialogos`.

### Added
- Auto-rebuild on new Substack posts (see `docs/auto-rebuild-setup.md`).

## 2026-01-15

### Added
- Multi-theme dropdown selector (`dark | light | emerald | ocean`).

### Changed
- Completed the Phase 1 baseline alignment refactor (dependencies, configs, shadcn).

## 2025-12-12

### Added
- AI-DIALOGOS series page and volumes section with cover imagery.

### Changed
- Simplified navigation and removed unused sections.
