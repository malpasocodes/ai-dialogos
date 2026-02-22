import Parser from "rss-parser";
import cacheData from "../data/substack-cache.json";

type RSSItem = {
  title?: string;
  link?: string;
  isoDate?: string;
  pubDate?: string;
  contentSnippet?: string;
  content?: string;
  categories?: string[];
};

export interface SubstackPost {
  title: string;
  link: string;
  published: string;
  summary: string;
  tags: string[];
}

const FEED_URL =
  import.meta.env.SUBSTACK_RSS_URL ?? "https://aidialogos.substack.com/feed";

const parser = new Parser({ timeout: 10000 });

const mapItem = (item: RSSItem): SubstackPost | null => {
  if (!item.title || !item.link) return null;

  const published =
    item.isoDate ?? item.pubDate ?? new Date().toISOString();
  const summary =
    item.contentSnippet ??
    (item.content ? item.content.replace(/<[^>]+>/g, "").slice(0, 220) : "");

  return {
    title: item.title.trim(),
    link: item.link,
    published: new Date(published).toISOString(),
    summary: summary.trim(),
    tags: item.categories?.map((category) => category.trim()).filter(Boolean) ??
      [],
  };
};

const cachedFallback = cacheData as SubstackPost[];

let cachedPosts: SubstackPost[] | null = null;

export const getSubstackPosts = async (
  limit = 20,
): Promise<SubstackPost[]> => {
  if (cachedPosts) {
    return cachedPosts.slice(0, limit);
  }

  const fallback = cachedFallback;

  try {
    const feed = await parser.parseURL(FEED_URL);
    const mapped = (feed.items ?? [])
      .map(mapItem)
      .filter((item): item is SubstackPost => Boolean(item));

    if (mapped.length > 0) {
      cachedPosts = mapped;
      return mapped.slice(0, limit);
    }
  } catch (error) {
    console.warn("[substack] Failed to fetch live feed, falling back to cache", error);
  }

  cachedPosts = fallback;
  return fallback.slice(0, limit);
};
