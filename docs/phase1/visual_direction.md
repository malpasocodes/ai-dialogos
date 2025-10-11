# Phase 1 — Visual Direction Board (AI-Innov)

## Brand Attributes
- **Tone:** forward-looking, rigorous, educator-friendly.
- **Voice:** confident, clear, optimistic about applied AI.
- **Keywords:** innovation, accessibility, trust, community.

## Typography
- **Primary Sans:** Inter (variable) — flexible for UI, strong legibility.
- **Secondary Serif:** Source Serif 4 — use for pull quotes and long-form excerpts.
- **Display Accent:** Space Grotesk — limited use for numerals, highlight stats.
- **Type Scale:** 12, 14, 16 base body; 24/32 for section headings; 48/60 for hero.
- **Accessibility:** Maintain 1.6 line height, avoid all caps for large blocks.

## Color Palette
- **Base Background:** `#F7F7FB` (cool neutral)
- **Primary Text:** `#1F2430` (deep blue-gray)
- **Primary Accent:** `#5E4BFF` (electric indigo) for CTAs and highlights
- **Secondary Accent:** `#FFB758` (warm amber) for supporting visuals
- **Success/Status:** `#2DB673`
- **Error:** `#E45151`
- **Neutral Surfaces:** `#FFFFFF`, `#E5E7F1`, `#C8CDDD`
- **Contrast Guidance:** Ensure primary accent on light background meets 4.5:1; fallback to `#3C30C8` for small text.

## Imagery & Illustration
- Blend editorial photography of educators and students with abstract AI illustrations.
- Use subtle grain overlays to soften geometric vector art.
- Favor inclusive, diverse representation with authentic classroom settings.
- Introduce animated linework or dot matrices hinting at data/AI.

## Iconography
- Rounded-corner monochrome icons with 2px stroke.
- Theme categories: education tools, AI/tech elements, collaboration.
- Provide filled versions for hover states (color shifts to accent).

## Layout & Components
- Grid: 12-column desktop (max width 1200px), 4-column tablet, single-column mobile.
- Spacing rhythm: 8pt base increments; large sections use 96–120px vertical padding.
- Cards: 16px corner radius, soft shadow (`0 12px 24px rgba(31,36,48,0.06)`).
- Buttons: primary (accent solid), secondary (outline), tertiary (text + icon).
- Use sticky header with glassmorphism effect (blur + translucent surface).

## Motion
- Micro-interactions at 150–200ms ease-out.
- Hero background gradient shift on scroll (subtle).
- Card hover: elevation + accent border flash.
- Staggered entrance animations for resource cards (mobile disables on prefers-reduced-motion).

## Accessibility & Inclusion
- Honor `prefers-reduced-motion`.
- Avoid color-only status indicators; pair icons or text.
- Provide transcript and alt text patterns ready for content integration.

## Asset Checklist for High Fidelity
- Define typography tokens in design system.
- Swatch palette ready for Tailwind theme (`primary/50–900`, neutrals, semantic).
- Collect 6–8 reference images and 3 UI inspiration screenshots.
- Produce component specs for hero, card grid, filter controls, audio player.
