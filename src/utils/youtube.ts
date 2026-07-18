import Parser from "rss-parser";
import cacheData from "../data/youtube-cache.json";

export interface PodcastEpisode {
  videoId: string;
  title: string;
  url: string;
  published: string;
  summary: string;
  thumbnail: string;
}

export const YOUTUBE_PLAYLIST_ID = "PL2QoJOg_E8XBA9C_6uvNcUSOhQ2VEq9pn";
export const YOUTUBE_PLAYLIST_URL =
  `https://www.youtube.com/playlist?list=${YOUTUBE_PLAYLIST_ID}`;

const FEED_URL =
  `https://www.youtube.com/feeds/videos.xml?playlist_id=${YOUTUBE_PLAYLIST_ID}`;

type FeedItem = {
  title?: string;
  isoDate?: string;
  pubDate?: string;
  videoId?: string;
  mediaGroup?: { "media:description"?: string[] };
};

const parser = new Parser<Record<string, unknown>, FeedItem>({
  timeout: 10000,
  customFields: {
    item: [
      ["yt:videoId", "videoId"],
      ["media:group", "mediaGroup"],
    ],
  },
});

const summarize = (description: string): string => {
  const firstParagraph = description.split(/\n\s*\n/)[0] ?? "";
  const text = firstParagraph.replace(/\s+/g, " ").trim();
  return text.length > 280 ? `${text.slice(0, 277).trimEnd()}…` : text;
};

const mapItem = (item: FeedItem): PodcastEpisode | null => {
  const videoId = typeof item.videoId === "string" ? item.videoId : null;
  if (!videoId || !item.title) return null;

  const description = item.mediaGroup?.["media:description"]?.[0];
  const published = item.isoDate ?? item.pubDate ?? new Date().toISOString();

  return {
    videoId,
    title: item.title.trim(),
    url: `https://www.youtube.com/watch?v=${videoId}&list=${YOUTUBE_PLAYLIST_ID}`,
    published: new Date(published).toISOString(),
    summary: summarize(typeof description === "string" ? description : ""),
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  };
};

const cachedFallback = cacheData as PodcastEpisode[];

let cachedEpisodes: PodcastEpisode[] | null = null;

export const getPodcastEpisodes = async (
  limit = 20,
): Promise<PodcastEpisode[]> => {
  if (cachedEpisodes) {
    return cachedEpisodes.slice(0, limit);
  }

  try {
    const feed = await parser.parseURL(FEED_URL);
    const mapped = (feed.items ?? [])
      .map(mapItem)
      .filter((item): item is PodcastEpisode => Boolean(item))
      .sort((a, b) => b.published.localeCompare(a.published));

    if (mapped.length > 0) {
      cachedEpisodes = mapped;
      return mapped.slice(0, limit);
    }
  } catch (error) {
    console.warn(
      "[youtube] Failed to fetch playlist feed, falling back to cache",
      error,
    );
  }

  cachedEpisodes = cachedFallback;
  return cachedFallback.slice(0, limit);
};
