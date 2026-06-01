import Parser from "rss-parser";
import cacheData from "../data/youtube-cache.json";

type RSSItem = {
  title?: string;
  link?: string;
  isoDate?: string;
  pubDate?: string;
  videoId?: string;
};

export interface YoutubeVideo {
  videoId: string;
  title: string;
  url: string;
  published: string;
  thumbnail: string;
}

// AI-Dialogos channel (https://www.youtube.com/@ai-dialogos). Override with an
// env var if the channel ever changes; no API key is needed — this is the
// public Atom feed YouTube exposes for every channel.
const CHANNEL_ID =
  import.meta.env.YOUTUBE_CHANNEL_ID ?? "UCDx9LSSz1jwT4j0rmtXLkjw";

const FEED_URL =
  import.meta.env.YOUTUBE_CHANNEL_RSS_URL ??
  `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

const parser = new Parser<Record<string, unknown>, RSSItem>({
  timeout: 10000,
  customFields: {
    item: [["yt:videoId", "videoId"]],
  },
});

// Shorts/clips share the channel feed but live under /shorts/ and are not full
// episodes — exclude them so they never get matched to a Substack post.
const isShort = (item: RSSItem): boolean =>
  Boolean(item.link && item.link.includes("/shorts/"));

const mapItem = (item: RSSItem): YoutubeVideo | null => {
  if (!item.videoId || !item.title || isShort(item)) return null;

  const published = item.isoDate ?? item.pubDate ?? new Date().toISOString();

  return {
    videoId: item.videoId,
    title: item.title.trim(),
    url: item.link ?? `https://www.youtube.com/watch?v=${item.videoId}`,
    published: new Date(published).toISOString(),
    thumbnail: `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
  };
};

const cachedFallback = cacheData as YoutubeVideo[];

let cachedVideos: YoutubeVideo[] | null = null;

export const getYoutubeVideos = async (): Promise<YoutubeVideo[]> => {
  if (cachedVideos) return cachedVideos;

  try {
    const feed = await parser.parseURL(FEED_URL);
    const mapped = (feed.items ?? [])
      .map(mapItem)
      .filter((item): item is YoutubeVideo => Boolean(item));

    if (mapped.length > 0) {
      cachedVideos = mapped;
      return mapped;
    }
  } catch (error) {
    console.warn(
      "[youtube] Failed to fetch channel feed, falling back to cache",
      error,
    );
  }

  cachedVideos = cachedFallback;
  return cachedFallback;
};

const normalizeTitle = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/**
 * Match a Substack post/episode title to its YouTube upload. Substack and
 * YouTube titles are authored identically per the publishing workflow, so an
 * exact normalized match is the primary path; a contains-match is the fallback
 * for the case where one side truncates or prefixes the title.
 */
export const findVideoForTitle = (
  videos: YoutubeVideo[],
  title: string,
): YoutubeVideo | undefined => {
  const target = normalizeTitle(title);
  if (!target) return undefined;

  const exact = videos.find((v) => normalizeTitle(v.title) === target);
  if (exact) return exact;

  return videos.find((v) => {
    const candidate = normalizeTitle(v.title);
    return candidate.includes(target) || target.includes(candidate);
  });
};
