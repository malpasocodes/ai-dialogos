# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project does not follow semantic versioning or cut tagged releases; entries
are grouped by the date the work landed on `main`.

## [Unreleased]

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
