# Spin-off plan: "Uncommon Books for Uncommon Readers"

A step-by-step plan for creating a separate website based on this one
(ai-dialogos.com). Decisions baked in:

- **Data model:** authors/contributors (people-centric — closest to the current
  `guests` schema, least rework).
- **Feeds:** keep the Substack + podcast machinery, repointed to new sources.
- **Scope of this doc:** plan only. No code changes have been made.

The architecture transfers wholesale (Astro 5 SSR + Netlify + Clerk + Neon
Postgres + a single-admin CRUD surface). The work is: fork, stand up fresh
external services, repoint feeds, rename the data model, and swap
branding/content.

## Phase 0 — Fork the repo

1. `git clone ai-dialogos uncommon-books` into a sibling directory.
2. Reset history for a clean start: `rm -rf .git && git init` (or keep history).
3. Edit `package.json` → new `name`, `version` reset to `0.1.0`.
4. Point `git remote` at the new GitHub repo.
5. Copy `.env` → fill with **new** values (Phase 1). Keep it gitignored.

## Phase 1 — Stand up fresh external services

Nothing here is shared with the live site. Do these first so the app boots.

1. **Neon** — new project → new `DATABASE_URL` (pooled). Run `npm run db:push`
   after the schema rename in Phase 3.
2. **Clerk** — new application → new `PUBLIC_CLERK_PUBLISHABLE_KEY`,
   `CLERK_SECRET_KEY`. Sign in once, grab your Clerk user id → `ADMIN_USER_ID`.
3. **Netlify** — new site linked to the new repo. Set all env vars in the site
   config. Create a build hook.
4. **GitHub Actions** — `.github/workflows/scheduled-rebuild.yml`: repoint the
   build-hook secret to the new Netlify hook.
5. Set `SITE_URL` (new domain) and `PLAUSIBLE_DOMAIN` (optional).

Env vars to reset: `DATABASE_URL`, `PUBLIC_CLERK_PUBLISHABLE_KEY`,
`CLERK_SECRET_KEY`, `ADMIN_USER_ID`, `SUBSTACK_RSS_URL`, `PLAUSIBLE_DOMAIN`,
`SITE_URL`.

## Phase 2 — Repoint the feeds (keep-and-repoint)

1. **Substack** — set `SUBSTACK_RSS_URL` to the new publication's `/feed`. The
   default in `src/utils/substack.ts:23` is only a fallback, but update it too
   for clarity.
2. **Cache snapshot** — regenerate/replace `src/data/substack-cache.json` (the
   offline fallback). Either empty the entries and let the first live build
   populate, or paste a fresh snapshot.
3. **Podcast IDs** — replace the hardcoded Apple/Spotify/Substack links in:
   - `src/layouts/Layout.astro` (nav dropdown, ~lines 18–20)
   - `src/pages/index.astro` (Apple Podcasts URL, ~line 11, + homepage podcast CTA)

   Replace Apple show id `id1884134654`, Spotify show id
   `033qQQeIiEKw63qWMdFmPI`, and the Substack podcast URL.

## Phase 3 — Rename the data model (`guests` → `authors`)

The existing schema (name, bio, headshot, position, `hasHeadshot`) fits a
people-centric model almost as-is. Rename for clarity across the repo in one pass:

| File | Change |
|---|---|
| `src/db/schema.ts` | Rename `guests` table + type exports → `authors` |
| `src/utils/guests.ts` | → `authors.ts`; `getGuests()` → `getAuthors()`; keep the `hasHeadshot` / no-base64-in-list rule |
| `src/pages/api/guests/*` | → `api/authors/*` (index + `[id]`) |
| `src/pages/api/headshots/[id].ts` | Keep endpoint; update table/query references |
| `src/components/GuestManager.tsx` | → `AuthorManager.tsx`; update fetch paths + labels |
| `src/pages/admin/guests.astro` | → `admin/authors.astro`; update imports |
| `src/pages/podcast/guests.astro` | Rename/relabel to the public listing (e.g. `/authors`) |
| `src/pages/admin/index.astro` | Update dashboard links |

Then `npm run db:generate` + `npm run db:push` (or `db:migrate`) against the new
Neon DB. Preserve the **admin gate pattern** (`userId === ADMIN_USER_ID`) and the
**cached headshot endpoint** exactly — don't reintroduce inline base64 in list
queries.

> Minimum-churn alternative: keep the `guests` table name internally and only
> relabel the UI. A clean rename is recommended for long-term clarity.

## Phase 4 — Branding & content swap

Hardcoded branding touchpoints:

- `astro.config.mjs:9` — `site`
- `src/components/Seo.astro:29,34` — default `SITE_URL` + meta description
- `src/layouts/Layout.astro:2,48` — page title default + `AI-DIALOGOS` brand text; revise nav labels
- `src/pages/index.astro:62–65` — hero title/subtitle/CTAs
- `images/` — logo, favicon, cover art

Content pages to rewrite or remove:

- `about.astro`, `series.astro`, `book.astro` — all "AI Essentials for Leaders / De Gruyter Brill / co-editors" copy
- `volumes/rethinking-business-strategy.astro`, `volumes/shaping-the-future-of-innovation.astro` — repurpose as book/collection pages or delete
- `src/content/config.ts` — adjust if you add a books content collection

## Phase 5 — Theme / visual identity

The four CSS-variable themes in `src/styles/global.css`
(`dark | light | emerald | ocean`) transfer for free. A new look is mostly
editing those token values + `tailwind.config.js`.
`ThemeSelector.tsx`/`ThemeSwitcher.tsx` need no change unless you rename themes.

## Phase 6 — Verify & launch

1. `npm run dev` (runs `netlify dev` — required for Clerk middleware + API routes).
2. Smoke-test: sign in → admin CRUD for authors → headshot upload → public
   listing → Substack cards → podcast links.
3. `npm run build` (Pagefind postbuild indexes `dist/`).
4. Point DNS at the new Netlify site; confirm the cron build hook fires.

## Effort estimate

- Phases 0–2 (fork + services + feed repoint): **~half a day**
- Phase 3 (`guests` → `authors` rename + migration): **~half to one day**
- Phases 4–5 (content + theme): **design-driven, open-ended**

## Watch-outs (carried from this repo's hard-won lessons)

- Netlify's filesystem is read-only — Postgres is the only durable store. No
  `writeFileSync` in request handlers.
- Keep `hasHeadshot` in list queries; never inline base64 (that caused the
  ~1.4 MB HTML payload the May 2026 cleanup fixed).
- `clerkMiddleware()` in `src/middleware.ts` is mandatory or
  `Astro.locals.auth()` is undefined on Netlify.
