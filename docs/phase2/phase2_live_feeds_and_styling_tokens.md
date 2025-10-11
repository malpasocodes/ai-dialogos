# Phase 2 — Live Feeds & Styling Tokens

**Project:** Artificial Intelligence: Shaping the Future of Innovation  
**Generated:** October 10, 2025  
**For:** Codex Development Team

---

## Objectives
- Integrate **live content feeds** (Substack + podcast RSS).  
- Finalize **brand styling tokens** (typography, colors, spacing).  
- Implement **content schemas, SEO, and analytics** to stabilize the site.

---

## Workstream A — Styling Tokens & Component Polish

### A1. Design Tokens (Tailwind)
Define tokens in `tailwind.config.js`:
- `fontFamily.display`, `fontFamily.body`
- `fontSize` scale (xs → 6xl)
- `colors.accent`, `colors.surface`, `colors.muted`
- `spacing` and `radius` scale

Update `global.css` to use tokens; remove inline hex values.

### A2. Theme Variants
- Two preset palettes (e.g., Indigo, Emerald).  
- Toggle via `<html data-theme="">` attribute.

### A3. Component Cleanups
- Buttons: primary / secondary / ghost.  
- Cards: hover + focus ring.  
- Nav: active + keyboard order.

**Done when:**  
All tokens centralized, accessibility ≥95 (Lighthouse).

---

## Workstream B — Live Feeds (Substack + Podcast)

### B1. Substack Essays (Build-time)
- Parse RSS → map to Astro collection: `title`, `link`, `date`, `summary`, `tags`.
- Render 3 on Home; `/substack` lists 20.
- Fallback: cached JSON.

### B2. Podcast Episodes (Build-time)
- Parse RSS → map to `title`, `slug`, `date`, `duration`, `audioUrl`, `summary`, `image`.
- Individual episode pages + `/podcast` index.

### B3. Refresh Strategy
- Build-time only.  
- Optional Netlify Build Hook for manual refresh.

**Done when:**  
Feeds render dynamically with cached fallback.

---

## Workstream C — Content Schemas, SEO, and Search

### C1. Schemas
Use Astro Content Collections (zod):
- Collections: `modules`, `lessons`, `resources`, `podcast`, `events`.
- Required: `title`, `summary`, `tags[]`, `updated`.

### C2. SEO & JSON-LD
- `<Seo>` component (title, desc, canonical, OG/Twitter).
- JSON-LD types: `Book`, `PodcastSeries`, `PodcastEpisode`, `LearningResource`, `Course`.

### C3. Search Overlay Enhancements
- Pagefind facets: `type`, `module`, `level`.
- Keyboard accessible overlay (`Cmd/Ctrl+K`).

**Done when:**  
Valid schemas, SEO/JSON-LD live, search filters usable by keyboard.

---

## Workstream D — Analytics, Privacy, Deploy

### D1. Analytics
- Use Plausible or GA4.  
- Track: `subscribe_substack`, `download_resource`, `click_buy_book`, `play_episode`.

### D2. Netlify Config
```toml
[build]
  command = "npm run build"
  publish = "dist"
[build.environment]
  NODE_VERSION = "20"
```

**Done when:**  
Events track properly and Netlify builds cleanly.

---

## Tickets for Codex

1. Add design tokens & theme variants  
2. Integrate Substack RSS (build-time)  
3. Integrate Podcast RSS (build-time)  
4. Define content collection schemas (zod)  
5. Enhance search overlay with facets & keyboard nav  
6. Add SEO & JSON-LD component  
7. Wire analytics events  
8. Verify Netlify build & caching strategy  

---

## Acceptance Checklist
- [ ] Tokens centralized; two theme presets toggle correctly  
- [ ] Home shows 3 latest Substack + 3 latest podcast episodes  
- [ ] `/substack` and `/podcast` list pages render dynamically  
- [ ] Content validates against schemas  
- [ ] Search overlay filters by `type`, `module`, `level`  
- [ ] SEO metadata & JSON-LD present on all templates  
- [ ] Analytics events firing correctly  
- [ ] Netlify build green, Pagefind index present

---

**Prepared by:** [Your Name]  
**Next Milestone:** Phase 3 — Educator Portal & Advanced Resources
