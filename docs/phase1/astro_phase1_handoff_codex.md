# Astro Phase 1 Starter — Handoff to Codex

**Project:** Artificial Intelligence: Shaping the Future of Innovation  
**Purpose:** Companion website for book launch (De Gruyter, 2025).  
**Generated:** October 10, 2025

---

## Overview

This package contains a working **Astro Phase-1 starter** implementing the visual structure and top-level navigation for the book website. It replaces the need for Figma mockups by providing live, inspectable layouts directly in Astro.

### Goals for this phase
- Validate layout hierarchy and basic visuals.
- Confirm navigation and component consistency.
- Provide a code baseline for Phase 2 (content modeling and high-fidelity design).

---

## Included in the ZIP (`astro-phase1-starter.zip`)

### Framework & Setup
- **Framework:** Astro + Tailwind CSS
- **Theme:** Dark, neutral base with accessible contrast
- **Components:** Layout, Hero, Card, CardGrid
- **Pages:** Home, Book, Educators, Resources, Podcast, Events, About, Search
- **Search:** Pagefind CLI stub integrated via postbuild
- **Hosting target:** Vercel or Netlify

### Layout & UX Notes
- Hero section with CTAs: “Buy Book,” “Subscribe Substack,” “Listen Podcast,” “Explore Educator Hub.”
- Three grid sections for featured resources, Substack essays, and podcast highlights.
- Responsive layout using Tailwind grid utilities.
- Accessible nav, skip-link, and color contrast guards.
- Footer includes newsletter signup and social/contact placeholders.

---

## Installation & Usage

```bash
# 1. Extract the archive
unzip astro-phase1-starter.zip
cd astro-phase1-starter

# 2. Install dependencies
npm install

# 3. Run local development server
npm run dev

# 4. Build and preview production output
npm run build
npm run preview
```

---

## Next Steps for Codex

1. **Review layout and responsiveness.**
   - Confirm the visual tone and spacing meet design intent.
   - Validate accessibility and mobile presentation.

2. **Enhance with content collections.**
   - Add Astro `src/content/` collections for:
     - `modules` (six book parts)
     - `lessons`
     - `resources`
     - `podcast` episodes
     - `events`
   - Include frontmatter schema definitions and metadata validation.

3. **Integrate Pagefind search UI.**
   - Build a simple search overlay with filters for `type` and `module` facets.

4. **Embed dynamic content.**
   - Connect Substack feed (RSS or API) for essays.
   - Add podcast player embeds (Spotify, Apple, or custom iframe).

5. **Apply brand styling tokens.**
   - Finalize typography scale, accent palette, and button styles.
   - Optional: Integrate shadcn/ui for refined component design.

6. **Prepare for Phase 2: Content Modeling & Integration.**
   - Define Astro collections schema files.
   - Establish `tags.yml` for taxonomy.
   - Draft initial educator resources for content tests.

---

## Deliverable Summary

| Item | Description |
|------|--------------|
| `astro-phase1-starter.zip` | Minimal Astro project with top-level layouts and styling |
| Pages | Home, Book, Educators, Resources, Podcast, Events, About, Search |
| Components | Layout, Hero, Card, CardGrid |
| Tools | Tailwind CSS, Pagefind stub, dark theme |
| Goal | Visual validation + baseline for content system |

---

**Maintainer:** [Your Name]  
**For:** Codex Development Team  
**Next Milestone:** Phase 2 — Content Modeling and High-Fidelity Design
