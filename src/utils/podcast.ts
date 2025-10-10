import Parser from "rss-parser";
import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import fallbackEpisodes from "../data/podcast-cache.json";

type RSSEnclosure = {
  url?: string;
};

type RSSEpisode = {
  title?: string;
  link?: string;
  isoDate?: string;
  pubDate?: string;
  contentSnippet?: string;
  "itunes:summary"?: string;
  enclosure?: RSSEnclosure;
  "itunes:duration"?: string;
  "itunes:image"?: { href?: string };
  guid?: string;
};

export interface PodcastEpisode {
  title: string;
  slug: string;
  link: string;
  published: string;
  duration: string;
  summary: string;
  audioUrl: string;
  image?: string;
  moduleSlug?: string;
  tags: string[];
}

const FEED_URL =
  import.meta.env.PODCAST_RSS_URL ??
  "https://ai-innov-podcast.example.com/feed";

const parser = new Parser({
  timeout: 10000,
  customFields: {
    item: [
      ["itunes:duration", "itunes:duration"],
      ["itunes:image", "itunes:image", { keepArray: false }],
      ["itunes:summary", "itunes:summary"],
    ],
  },
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const metadataCache: {
  ready: boolean;
  map: Map<string, CollectionEntry<"podcast">>;
} = {
  ready: false,
  map: new Map(),
};

const ensureMetadata = async () => {
  if (metadataCache.ready) return;
  const entries = await getCollection("podcast");
  entries.forEach((entry) => {
    metadataCache.map.set(entry.slug, entry);
  });
  metadataCache.ready = true;
};

const resolveMetadata = (slug: string, title?: string) => {
  const direct = metadataCache.map.get(slug);
  if (direct) return direct;
  if (!title) return null;
  const normalized = slugify(title);
  for (const entry of metadataCache.map.values()) {
    if (slugify(entry.data.title) === normalized) return entry;
  }
  return null;
};

const mapEpisode = async (item: RSSEpisode): Promise<PodcastEpisode | null> => {
  if (!item.title || !item.link) return null;
  await ensureMetadata();

  const initialSlug =
    item.guid ? slugify(item.guid) : slugify(item.title).replace(/^ep-/, "");
  const metadata = resolveMetadata(initialSlug, item.title);
  const slug = metadata?.slug ?? initialSlug;
  const published =
    item.isoDate ??
    item.pubDate ??
    metadata?.data.published?.toISOString();

  const summary =
    item["itunes:summary"] ??
    item.contentSnippet ??
    metadata?.data.summary ??
    "";

  return {
    title: item.title.trim(),
    slug,
    link: item.link,
    published: published
      ? new Date(published).toISOString()
      : new Date().toISOString(),
    duration: item["itunes:duration"] ?? metadata?.data.duration ?? "",
    summary: summary.trim(),
    audioUrl:
      item.enclosure?.url ??
      metadata?.data.audioUrl ??
      "https://example.com/audio-placeholder.mp3",
    image:
      (item["itunes:image"] as { href?: string } | undefined)?.href ??
      undefined,
    moduleSlug: metadata?.data.module ?? undefined,
    tags: metadata?.data.tags ?? [],
  };
};

let cachedEpisodes: PodcastEpisode[] | null = null;

export const getPodcastEpisodes = async (): Promise<PodcastEpisode[]> => {
  if (cachedEpisodes) return cachedEpisodes;

  const fallback = (fallbackEpisodes as PodcastEpisode[]).map((episode) => ({
    ...episode,
    published: new Date(episode.published).toISOString(),
  }));

  try {
    const feed = await parser.parseURL(FEED_URL);
    const mapped = await Promise.all(
      (feed.items ?? []).map((item) => mapEpisode(item as RSSEpisode)),
    );
    const filtered = mapped.filter(
      (episode): episode is PodcastEpisode => Boolean(episode),
    );
    if (filtered.length > 0) {
      cachedEpisodes = filtered;
      return filtered;
    }
  } catch (error) {
    console.warn(
      "[podcast] Failed to fetch live podcast feed, falling back to cache",
      error,
    );
  }

  cachedEpisodes = fallback;
  return fallback;
};

export const getPodcastEpisode = async (
  slug: string,
): Promise<PodcastEpisode | null> => {
  const episodes = await getPodcastEpisodes();
  return episodes.find((episode) => episode.slug === slug) ?? null;
};
