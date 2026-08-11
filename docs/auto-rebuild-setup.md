# Auto-Rebuild on New Content

The site fetches Substack essays and YouTube episodes at **build time**. New
content won't appear until the site is rebuilt. This guide covers the two ways
a rebuild gets triggered.

---

## 1. Create a Netlify Build Hook

1. Open **Netlify → Site settings → Build & deploy → Build hooks**.
2. Click **Add build hook**, name it `substack-new-post`, select the
   production branch.
3. Copy the generated URL (looks like
   `https://api.netlify.com/build_hooks/abc123`).

---

## 2. Scheduled rebuild — GitHub Actions

A scheduled workflow runs hourly and POSTs the Netlify build hook.

### Setup

1. Go to **GitHub → repo Settings → Secrets and variables → Actions**.
2. Add a repository secret:
   - Name: `NETLIFY_BUILD_HOOK_URL`
   - Value: the build hook URL from step 1.

The workflow is at `.github/workflows/scheduled-rebuild.yml`.

Two things to know about GitHub's scheduler:

- Scheduled runs are **delayed under load** — typically 5–20 minutes past the
  nominal time, occasionally more. Treat the cadence as approximate.
- GitHub **disables schedules in public repos after 60 days without a commit**.
  If feeds go stale for weeks at a stretch, check whether the schedule was
  auto-disabled in the Actions tab.

---

## 3. Manual trigger — the reliable path

Publishing isn't finished when Substack posts. The episode also has to be added
to the YouTube playlist (`PL2QoJOg_E8XBA9C_6uvNcUSOhQ2VEq9pn`) and be **public** —
unlisted and private videos are omitted from the playlist RSS feed entirely.

So the moment content is actually complete is *after* the playlist add, not at
Substack publish time. Trigger the rebuild yourself then:

```bash
gh workflow run scheduled-rebuild.yml --ref main
```

One caveat: YouTube serves the playlist feed with `Cache-Control: max-age=900`,
so a build starting within ~15 minutes of the playlist edit can still read a
stale copy that omits the new video. If the episode doesn't appear, wait a few
minutes and re-trigger. To check what the feed actually contains right now,
bypass the cache with a throwaway query param:

```bash
curl -s "https://www.youtube.com/feeds/videos.xml?playlist_id=PL2QoJOg_E8XBA9C_6uvNcUSOhQ2VEq9pn&cb=$RANDOM" \
  | grep -E "<yt:videoId>|  <title>"
```

The hourly cron is the safety net for when you forget.

---

## Why there's no instant RSS trigger

An earlier setup used a Zapier/Make RSS watcher to fire the build hook within
minutes of a Substack post. It was removed because it keys on the wrong signal:
the YouTube episode usually isn't in the playlist yet at Substack-publish time,
so the instant rebuild ships a half-complete update and a second rebuild is
needed regardless. The hourly cron plus a manual trigger covers the same ground
with one less external dependency.

---

## How it works end-to-end

```
GitHub cron (hourly) ─────┐
                          ├──► POST build hook ──► Netlify rebuild
Manual gh workflow run ───┘                              │
                                                         ▼
                                    getSubstackPosts() + getPodcastEpisodes()
                                    fetch live RSS → static HTML
```

If a live RSS fetch fails during the build, the site falls back to the cached
snapshots in `src/data/substack-cache.json` and `src/data/youtube-cache.json`.
