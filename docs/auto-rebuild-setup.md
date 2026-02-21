# Auto-Rebuild on New Substack Posts

The site fetches Substack essays at **build time**. New posts won't appear
until the site is rebuilt. This guide sets up two complementary triggers so
new content goes live automatically.

---

## 1. Create a Netlify Build Hook

1. Open **Netlify → Site settings → Build & deploy → Build hooks**.
2. Click **Add build hook**, name it `substack-new-post`, select the
   production branch.
3. Copy the generated URL (looks like
   `https://api.netlify.com/build_hooks/abc123`).

---

## 2a. Instant trigger — Zapier / Make automation

This fires a rebuild within minutes of a new Substack post.

### Zapier

| Step | App | Action |
|------|-----|--------|
| 1 | **RSS by Zapier** | New Item in Feed — use `https://ai-innov.substack.com/feed` |
| 2 | **Webhooks by Zapier** | POST to your Netlify build hook URL |

### Make (Integromat)

| Module | Config |
|--------|--------|
| **RSS** | Watch feed `https://ai-innov.substack.com/feed`, poll every 15 min |
| **HTTP** | POST to Netlify build hook URL, empty body |

---

## 2b. Daily fallback — GitHub Actions (already configured)

A scheduled workflow runs daily at 06:00 UTC and triggers the same Netlify
build hook. This catches anything the instant trigger misses.

### Setup

1. Go to **GitHub → repo Settings → Secrets and variables → Actions**.
2. Add a repository secret:
   - Name: `NETLIFY_BUILD_HOOK_URL`
   - Value: the build hook URL from step 1.

The workflow is at `.github/workflows/scheduled-rebuild.yml`.

---

## How it works end-to-end

```
Substack publish ──► Zapier detects new RSS item ──► POST build hook
                                                          │
GitHub cron (daily) ──────────────────────────────────────┘
                                                          │
                                                          ▼
                                                   Netlify rebuild
                                                          │
                                                          ▼
                                              getSubstackPosts() fetches
                                              live RSS → static HTML
```

If the live RSS fetch fails during build, the site falls back to the
cached `src/data/substack-cache.json` (currently empty — it will be
populated once real posts exist and a build succeeds).
