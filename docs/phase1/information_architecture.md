# Phase 1 — Information Architecture (AI-Innov)

AI-Innov is the branded companion site connecting the book, Substack, and podcast. The IA below reflects that brand across all touchpoints.

## Sitemap Overview
- `Home`
  - Hero: book positioning, CTA to educators resources
  - Latest Substack entries (3 up)
  - Featured podcast episode
  - Resource sampler (download cards)
  - Upcoming events teaser
- `Book`
  - Book summary
  - Table of contents
  - Sample chapter preview
  - Purchase links (De Gruyter, Amazon, indie bookstores)
  - Author endorsements pull-quotes
- `Educators Hub`
  - Overview (pitch to educators + highlight key assets)
  - Lesson plan library
  - Slide decks
  - Discussion prompts
  - Request/support form
- `Resources`
  - Filterable resource grid
  - Resource detail pages with metadata (type, tags, download)
  - Integration highlights (Substack, podcast, datasets)
- `Podcast`
  - Episode list (cards with summary and CTA)
  - Embedded audio player
  - Subscribe links (Apple, Spotify, RSS)
- `Substack`
  - Embedded feed
  - Category filters
  - Subscribe CTA
- `Events`
  - Upcoming events calendar (list by date)
  - Past events archive
  - Host/booking CTA
- `About`
  - Author bio
  - Media kit (download)
  - Contact form / email
- `Search Results`
  - Query input + results list (resources, posts, episodes)
- `404`
  - Friendly copy, helpful links
- `Privacy Policy`
- `Accessibility Statement`

## Content Model (high level)
- `Resources`
  - Fields: `title`, `type`, `audience`, `tags`, `download_url`, `description`, `estimated_time`
- `Lessons`
  - Fields: `title`, `chapter_alignment`, `grade_level`, `format`, `download_bundle`
- `Podcast Episodes`
  - Fields: `title`, `episode_number`, `description`, `duration`, `publish_date`, `audio_embed`, `transcript`
- `Events`
  - Fields: `title`, `date`, `location`, `format`, `registration_link`, `recording_link`
- `Substack Articles`
  - Fields: `title`, `excerpt`, `topic`, `published_at`, `canonical_url`

## Navigation Model
- Primary navigation: Home, Book, Educators, Resources, Podcast, Substack, Events, About
- Secondary header utility: Search icon, Newsletter CTA, Language selector (future)
- Footer: Quick links (Book, Educators Hub, Resources), Substack CTA, Podcast platforms, Legal links, Social

## User Flows
### Educator Flow
1. Landing on `Home` from marketing campaign.
2. Scroll to Educators teaser card → click `Explore Educators Hub`.
3. On `Educators Hub`, browse filtered lesson plans.
4. Open a `Lesson Plan` detail → download.
5. Prompt to subscribe to educator updates (Substack tag).

### Reader Flow
1. Discover site via book jacket QR → `Home`.
2. Engage with book hero section → click `Learn About the Book`.
3. On `Book` page, review TOC and sample chapter preview.
4. Click `Buy the Book` → outbound to publisher.
5. Post-purchase CTA to subscribe to Substack (modal/inline).

### Media Flow
1. Media contact receives press release → visits `Home`.
2. Uses global nav to access `About`.
3. Scans author bio, accesses `Media Kit` download.
4. Uses `Contact` form or provided email to request interview.

## Search & Discovery
- Global search indexes Resources, Podcast episodes, Substack posts, Events.
- Contextual related content modules on Resource and Podcast detail pages.
- Recent Substack posts module on Home, Book, Educators pages.

## Accessibility Notes
- Ensure keyboard navigability for filters and accordions.
- Provide transcripts for podcast episodes and alt text for all imagery.
- Maintain minimum contrast (WCAG AA) across palette variants.
