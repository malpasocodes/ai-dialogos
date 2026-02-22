import Parser from "rss-parser";
import cacheData from "../data/podcast-cache.json";

type RSSItem = {
  title?: string;
  link?: string;
  isoDate?: string;
  pubDate?: string;
  contentSnippet?: string;
  content?: string;
  enclosure?: { url?: string; type?: string };
  itunes?: { duration?: string; image?: string; summary?: string };
};

export interface PodcastEpisode {
  title: string;
  link: string;
  published: string;
  summary: string;
  duration?: string;
  audioUrl?: string;
  image?: string;
}

const FEED_URL =
  import.meta.env.PODCAST_RSS_URL ??
  "https://aidialogos.substack.com/feed/podcast";

const parser = new Parser<Record<string, unknown>, RSSItem>({
  timeout: 10000,
  customFields: {
    item: [["itunes:duration", "itunes.duration"]],
  },
});

const formatDuration = (raw?: string): string | undefined => {
  if (!raw) return undefined;

  // Already formatted like "1:02:30" or "45:12"
  if (raw.includes(":")) return raw;

  const seconds = Number.parseInt(raw, 10);
  if (Number.isNaN(seconds) || seconds <= 0) return undefined;

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) return `${hrs} hr${hrs > 1 ? "s" : ""} ${mins} min`;
  if (mins > 0) return `${mins} min${secs > 0 ? ` ${secs} sec` : ""}`;
  return `${secs} sec`;
};

const mapItem = (item: RSSItem): PodcastEpisode | null => {
  if (!item.title || !item.link) return null;

  const published =
    item.isoDate ?? item.pubDate ?? new Date().toISOString();

  const summary =
    item.itunes?.summary ??
    item.contentSnippet ??
    (item.content ? item.content.replace(/<[^>]+>/g, "").slice(0, 300) : "");

  return {
    title: item.title.trim(),
    link: item.link,
    published: new Date(published).toISOString(),
    summary: summary.trim(),
    duration: formatDuration(item.itunes?.duration),
    audioUrl: item.enclosure?.url,
    image: item.itunes?.image,
  };
};

const cachedFallback = cacheData as PodcastEpisode[];

let cachedEpisodes: PodcastEpisode[] | null = null;

export const getPodcastEpisodes = async (
  limit = 50,
): Promise<PodcastEpisode[]> => {
  if (cachedEpisodes) return cachedEpisodes.slice(0, limit);

  try {
    const feed = await parser.parseURL(FEED_URL);
    const mapped = (feed.items ?? [])
      .map(mapItem)
      .filter((item): item is PodcastEpisode => Boolean(item));

    const sorted = mapped.sort(
      (a, b) =>
        new Date(b.published).getTime() - new Date(a.published).getTime(),
    );

    if (sorted.length > 0) {
      cachedEpisodes = sorted;
      return sorted.slice(0, limit);
    }
  } catch (error) {
    console.warn(
      "[podcast] Failed to fetch Substack podcast feed, falling back to cache",
      error,
    );
  }

  cachedEpisodes = cachedFallback;
  return cachedFallback.slice(0, limit);
};
