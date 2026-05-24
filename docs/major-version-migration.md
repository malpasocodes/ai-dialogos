# Major Version Migration Plan

Planning doc for the major-version dependency bumps that were deliberately deferred during the May 2026 dependency cleanup (commit `774f27b`). Each section is independently reviewable.

**Source of truth for upstream behavior:** I describe expected impact based on what these projects have historically changed between majors and the shape of *this* codebase. Before executing any migration, read the upstream changelog for the target version — these notes are for scoping, not as a substitute for the official migration guide.

---

## Current versions vs. targets

| Package | Current | Target | Risk |
|---|---|---|---|
| `astro` | 5.18 | 6.x | Medium |
| `@astrojs/netlify` | 6.6 | 7.x | Medium |
| `@astrojs/react` | 4.4 | 5.x | Low |
| `@clerk/astro` | 2.17 | 3.x | **High** (auth-critical) |
| `tailwindcss` | 3.4 | 4.x | Medium (config rewrite) |
| `lucide-react` | 0.562 | 1.x | Low |

---

## Why migrate

Concrete benefits, per package:

- **Tailwind 4** — The biggest payoff. New Oxide engine is roughly 5–10× faster to build, hot reload is near-instant, and config collapses from `tailwind.config.js + postcss.config.js + autoprefixer` into a single CSS file with `@theme`. Lightning CSS handles vendor prefixing automatically. Less config, faster feedback loop.
- **Astro 6 + adapter 7** — Newer build pipeline, ongoing image-service improvements, and continued security/perf patches. Staying on a supported major also keeps the ecosystem (integrations, adapters) aligned — eventually `@clerk/astro` or shadcn will start pinning to Astro 6+.
- **Clerk 3** — Latest auth APIs and security patches. The v3 middleware is cleaner (fewer footguns around `auth()` invocation) and Clerk's support window for v2 will eventually close.
- **`@astrojs/react` 5** — Proper React 19 alignment. Removes the small mismatch where the integration was built against React 18's peer range but works fine with 19.
- **`lucide-react` 1.x** — Signals a stable API contract (no more 0.x churn) and improved tree-shaking — should shrink the JS shipped to islands using icons.

Cross-cutting benefit: staying within ~1 major behind upstream keeps future migrations small. Falling further behind makes the eventual catch-up exponentially harder (especially Tailwind 3 → 5, which would be a much bigger jump than 3 → 4).

---

## Recommended sequencing

These migrations have soft dependencies on each other. Suggested order:

1. **`lucide-react` 1.x** — smallest blast radius, do first as a warm-up.
2. **`@astrojs/react` 5.x** — should be a peer-dep alignment with React 19; trivial if so.
3. **`tailwindcss` 4.x** — independent of the rest; do it on its own branch so visual regressions are easy to isolate.
4. **`@astrojs/netlify` 7.x + `astro` 6.x together** — adapter majors usually align with Astro majors; doing them separately risks an intermediate incompatible state.
5. **`@clerk/astro` 3.x** — last. It's auth-critical and the only thing that, if broken, locks you out of the admin UI.

Do each on its own branch with its own deploy preview. Don't bundle them.

---

## 1. `lucide-react` 0.562 → 1.x

### What this codebase uses

Nine icons across six files:

```
Moon, Sun         — ThemeSwitcher.tsx
Palette, Check    — ThemeSelector.tsx
X, Circle,
ChevronDown,
ChevronUp,
ChevronRight     — components/ui/* (shadcn-generated)
```

### What changes

Lucide reset to v1.0; the surface area is essentially the same but the version reset signals API stabilization. The most likely breaking changes:

- Some icon names may have been renamed (lucide periodically renames icons to match the design system). Most common ones (`Check`, `X`, `Chevron*`) are stable.
- Tree-shaking behavior may have improved; bundle size should *decrease*, not increase.

### Migration steps

```bash
npm install lucide-react@latest
npm run build
```

### Verification

- Theme switcher renders Moon/Sun icons.
- Theme selector dropdown renders Palette + Check.
- Any shadcn component using X/Chevrons (dialog close button, dropdowns, navigation menu) renders correctly.

### Effort: 15 minutes

---

## 2. `@astrojs/react` 4 → 5

### What this codebase uses

React 19 is already installed. React islands: `MainNav`, `UserButton`, `ThemeSwitcher`, `ThemeSelector`, `GuestManager`, the shadcn UI primitives. No SSR-specific React APIs used.

### What changes

Astro's React integration v5 aligns peer deps with React 19 and (likely) Astro 6. It may also drop legacy compat layers.

### Migration steps

```bash
npm install @astrojs/react@latest
npm run build
```

### Verification

- All React islands hydrate (use browser devtools React panel).
- `<UserButton />` from Clerk still renders (this is a React island that uses `@clerk/astro/react`).

### Effort: 15 minutes, *unless* it forces Astro 6 as a peer (then merge with item 4).

---

## 3. `tailwindcss` 3 → 4

### What changes (biggest)

Tailwind 4 is a significant rewrite:

- **No more `tailwind.config.js`** — config moves into CSS via `@theme {}` blocks.
- **No more `@astrojs/tailwind` integration** — replaced by Vite plugin (`@tailwindcss/vite`).
- **No more `postcss.config.js` + `autoprefixer`** — built in via Lightning CSS.
- Class compilation engine is faster (Oxide) but slightly different — some arbitrary-value edge cases changed.

### What's at risk in this codebase

The current setup is friendly to v4 because everything theme-related already lives in CSS variables in `src/styles/global.css`:

```css
--background: hsl(...);
--foreground: hsl(...);
--primary: hsl(...);
...
```

The `tailwind.config.js` mostly *maps* these CSS variables to Tailwind tokens (`background: 'hsl(var(--background))'`). In v4, this mapping is done with `@theme` directly:

```css
@theme {
  --color-background: hsl(var(--background));
  --color-primary: hsl(var(--primary));
  ...
}
```

The 16 theme color tokens, the `borderRadius` extensions, and the two `fontFamily` entries all translate 1:1.

### Concerns specific to this codebase

- `tailwindcss-animate` (used in plugins) needs a v4-compatible release or replacement. There's a community port `tw-animate-css` that's the de-facto replacement. **Verify it exists and is maintained before starting.**
- The multi-theme system (`data-theme="dark|light|emerald|ocean"`) needs v4's `@variant` for the theme-conditional styles. Should be straightforward — the v4 docs have a worked example for `data-theme` patterns.
- `darkMode: ['class']` becomes a `@variant dark` in CSS.

### Migration steps

1. `npm uninstall tailwindcss @astrojs/tailwind postcss autoprefixer tailwindcss-animate`
2. `npm install tailwindcss@latest @tailwindcss/vite tw-animate-css` (or current equivalent)
3. In `astro.config.mjs`: remove the `tailwind()` integration, add Vite plugin via the `vite` option.
4. Delete `tailwind.config.js` and `postcss.config.js`.
5. In `src/styles/global.css`: replace `@tailwind base/components/utilities` with `@import "tailwindcss"`; add a `@theme {}` block that re-declares the color/radius/font tokens; convert `darkMode` + multi-theme selectors to `@variant` rules.
6. Rebuild and walk every page visually. The site is small (~10 pages) so this is tractable.

### Verification

- Every page renders with correct colors and typography.
- Theme switcher (dark/light/emerald/ocean) all four themes work.
- Animations from `tailwindcss-animate` (dropdowns, dialogs opening/closing) still play.
- No console warnings about unknown utility classes.

### Effort: 2–4 hours

### Rollback

Cleanly revertible — config and CSS changes are co-located in 3–4 files.

---

## 4. `astro` 5 → 6 + `@astrojs/netlify` 6 → 7

Treat these as one migration — adapter majors typically pin to a specific Astro major.

### What likely changes

Based on Astro's typical major-version pattern:

- Removal of APIs deprecated in v5.x. Run `astro check` after upgrade to surface any.
- Possible changes to the Image service / `<Image>` component defaults.
- Possible content collections API tweaks (this site has a `src/content/` directory — worth checking what's in it).
- Adapter v7 may change function output (e.g., default to edge runtime, change `Cache-Control` passthrough semantics).

### What's at risk in this codebase

- The new `/api/headshots/[id]` endpoint relies on the adapter passing through `Cache-Control` and binary `Response` bodies. Verify this still works after v7 — it's the single most performance-sensitive endpoint.
- `Astro.response.headers.set('Cache-Control', ...)` in `podcast/guests.astro` similarly relies on adapter passthrough.
- `Astro.locals.auth()` (Clerk middleware) must continue to work — this is technically Clerk's concern but Astro 6 changes to `Astro.locals` typing could surface issues.
- The `prerender = true` flag on most pages should be unchanged but worth confirming output structure.

### Migration steps

1. Read the official Astro 6 and `@astrojs/netlify` 7 changelogs end-to-end first.
2. `npm install astro@latest @astrojs/netlify@latest`
3. `npx astro check` (will need `@astrojs/check` + `typescript` installed) — fix any deprecation/breaking-change errors.
4. `npm run build` — must succeed.
5. Deploy to a Netlify branch preview (do NOT push to `main`).

### Verification

- All prerendered pages serve correctly from CDN (check `cf-cache-status` or equivalent header on Netlify).
- `/podcast/guests` SSR page loads in <500ms.
- `/api/headshots/{id}` returns binary with correct `Content-Type` and `Cache-Control` headers (test with `curl -I`).
- Admin sign-in flow works end-to-end.
- POST to `/api/guests` (admin upload) works.

### Effort: 3–6 hours including upstream changelog reading and deploy-preview testing.

### Rollback

`git revert` + `npm install` brings it back. Netlify will redeploy from the reverted commit.

---

## 5. `@clerk/astro` 2 → 3

### What this codebase uses

| Location | What |
|---|---|
| `src/middleware.ts` | `clerkMiddleware()` from `@clerk/astro/server` |
| `src/components/UserButton.tsx` | `useAuth`, `UserButton` from `@clerk/astro/react` |
| `src/pages/sign-in.astro` | `SignIn` from `@clerk/astro/components` |
| `src/pages/admin/*.astro` | `Astro.locals.auth().userId` for admin gate |
| `src/pages/api/guests/**.ts` | Same `locals.auth().userId` check |

The whole admin surface depends on this working. If it breaks, you cannot sign in to fix it from the admin UI — you'd need to revert and redeploy.

### What likely changes

Clerk has historically rewritten middleware between majors. Things to expect:

- `clerkMiddleware()` API may have changed (new parameter shape, new helper for `protect()`).
- `Astro.locals.auth()` may have been replaced with `Astro.locals.auth` (property instead of function) or vice versa — Clerk has flipped on this before.
- `useAuth()` from `@clerk/astro/react` may have moved.
- `SignIn` component prop names may have changed (e.g., `forceRedirectUrl` → `fallbackRedirectUrl` or similar).

### Migration steps

1. **Critical:** Read the official Clerk Astro v3 migration guide carefully. Half the work is mechanical renames described there.
2. Branch.
3. `npm install @clerk/astro@latest`
4. Update `src/middleware.ts` per the migration guide.
5. Update `Astro.locals.auth()` call sites if the API shape changed (5 places identified above).
6. Update `useAuth()` import in `UserButton.tsx` if moved.
7. Update `<SignIn>` prop names in `sign-in.astro`.
8. Update `<UserButton>` if anything changed.
9. `npm run build` and `astro check`.

### Verification (mandatory end-to-end before merge)

Test on a Netlify branch preview, **not** local dev:

- Anonymous visitor → `/podcast/guests` works.
- Anonymous visitor → `/admin` redirects to `/sign-in`.
- Sign in as admin → land on `/admin`.
- `/admin/guests` loads the guest list.
- Edit a guest, save, see the change.
- Add a new guest with a headshot, see it on `/podcast/guests`.
- Sign out, confirm `/admin` is locked again.

### Effort: 2–4 hours, dominated by the verification matrix above.

### Rollback

Same as Astro: `git revert` + `npm install` + redeploy. Don't merge until the verification matrix is fully green on the preview.

---

## Total time budget

If everything goes smoothly: **8–14 hours of focused work**, spread across 5 branches and 5 deploy previews. Plan for double that if Clerk or Tailwind throw surprises.

## When to do this

There's no urgent reason to migrate right now:

- The Astro 5 / Clerk 2 / Tailwind 3 stack is supported, secure (post-cleanup), and performing well.
- The user-visible site is fast (~10 KB HTML on the guests page after the May fix).
- Vulnerability surface is clean (8 dev-only moderates).

Reasons that would tip toward doing it:

- Need a feature only available in Astro 6 / Tailwind 4.
- Clerk announces a security advisory for v2.x.
- An upstream dep (e.g., shadcn primitives) pins to a newer peer.

Otherwise, this is a **quarterly maintenance task**, not an urgent one.
