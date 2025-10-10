# Astro Phase 1 Starter

A minimal Astro starter to visualize the homepage and top-level pages for the **AI: Shaping the Future of Innovation** book site.

## What’s included
- Astro pages for: Home, Book, Educators, Resources, Podcast, Events, About, Search
- Components: Layout, Hero, Card, CardGrid
- Content collections for modules, lessons, resources, podcast episodes, and events (with sample entries)
- Tailwind utility styles with simple design tokens
- Dark theme with accessible contrast
- Pagefind wired via `postbuild` (CLI will generate index from `dist/`)

## Getting started
```bash
# 1) Install deps
npm i

# 2) Run dev server
npm run dev

# 3) Build & preview
npm run build
npm run preview
```

> Note: This starter references `/src/styles/global.css` directly in `Layout.astro`. Tailwind will process it automatically during dev/build.

## Next steps
- Build the Pagefind-powered search overlay with type/module facets.
- Hook the live Substack feed and surface recent essays on the homepage.
- Replace the placeholder audio URLs with real podcast embeds or a custom player.
- Expand the design token system (typography scale, color ramps, buttons) and evaluate shadcn/ui.
- Define taxonomy metadata (`tags.yml`) and add more content entries for lessons/resources.

---

**Generated:** 2025-10-10
