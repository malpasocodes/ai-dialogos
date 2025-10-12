import Parser from "rss-parser";
import rawFallbackEpisodes from "../data/youtube-playlist-cache.json";

type RawFallbackEpisode = Omit<
  PodcastEpisode,
  "duration" | "audioUrl" | "moduleSlug"
> & {
  duration?: string | null;
  audioUrl?: string | null;
  moduleSlug?: string | null;
};

export interface PodcastEpisode {
  title: string;
  slug: string;
  link: string;
  published: string;
  duration?: string;
  summary: string;
  audioUrl?: string;
  videoUrl: string;
  videoId: string;
  image?: string;
  moduleSlug?: string;
  tags: string[];
}

const PLAYLIST_ID =
  import.meta.env.YOUTUBE_PLAYLIST_ID ??
  "PL2QoJOg_E8XD5V_8JKTj3fw-KKQetn_TK";

const FEED_URL = `https://www.youtube.com/feeds/videos.xml?playlist_id=${PLAYLIST_ID}`;

const fallbackEpisodes: PodcastEpisode[] = (
  rawFallbackEpisodes as RawFallbackEpisode[]
).map((episode) => ({
  ...episode,
  published: new Date(episode.published).toISOString(),
  duration: episode.duration ?? undefined,
  audioUrl: episode.audioUrl ?? undefined,
  moduleSlug: episode.moduleSlug ?? undefined,
}));

const parser = new Parser({
  timeout: 10000,
  customFields: {
    item: [
      ["yt:videoId", "videoId"],
      ["media:group", "media"],
    ],
  },
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

type YouTubeMediaContent = {
  $?: {
    url?: string;
    duration?: string;
  };
};

type YouTubeMediaThumbnail = {
  $?: {
    url?: string;
  };
};

type YouTubeMediaGroup = {
  "media:description"?: string;
  "media:thumbnail"?: YouTubeMediaThumbnail | YouTubeMediaThumbnail[];
  "media:content"?: YouTubeMediaContent | YouTubeMediaContent[];
};

type YouTubeFeedItem = {
  title?: string;
  link?: string;
  isoDate?: string;
  pubDate?: string;
  videoId?: string;
  media?: YouTubeMediaGroup;
};

const toArray = <T>(value?: T | T[]): T[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

const formatDuration = (input?: string) => {
  if (!input) return undefined;
  const seconds = Number.parseInt(input, 10);
  if (Number.isNaN(seconds) || seconds <= 0) return undefined;

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    const hourPart = `${hrs} hr${hrs === 1 ? "" : "s"}`;
    const minutePart = mins > 0 ? ` ${mins} min` : "";
    return `${hourPart}${minutePart}`;
  }

  if (mins > 0) {
    const minutePart = `${mins} min`;
    const secondPart = secs > 0 ? ` ${secs} sec` : "";
    return `${minutePart}${secondPart}`;
  }

  return `${secs} sec`;
};

const mapEpisode = (item: YouTubeFeedItem): PodcastEpisode | null => {
  if (!item.title) return null;

  const videoId = item.videoId ?? "";
  const slug = videoId || slugify(item.title);
  const videoUrl = item.link ?? (videoId ? `https://www.youtube.com/watch?v=${videoId}` : "");

  if (!videoUrl) return null;

  const publishedRaw = item.isoDate ?? item.pubDate ?? new Date().toISOString();
  const published = new Date(publishedRaw).toISOString();

  const media = item.media ?? {};
  const description =
    media["media:description"]?.trim() ??
    "Watch this episode on YouTube.";
  const thumbnail =
    toArray(media["media:thumbnail"])
      .map((entry) => entry.$?.url)
      .find(Boolean) ?? (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : undefined);
  const duration =
    toArray(media["media:content"])
      .map((entry) => entry.$?.duration)
      .map((value) => formatDuration(value))
      .find(Boolean) ?? undefined;

  return {
    title: item.title.trim(),
    slug,
    link: videoUrl,
    published,
    duration,
    summary: description,
    audioUrl: undefined,
    videoUrl,
    videoId,
    image: thumbnail,
    moduleSlug: undefined,
    tags: [],
  };
};

let cachedEpisodes: PodcastEpisode[] | null = null;

export const getPodcastEpisodes = async (): Promise<PodcastEpisode[]> => {
  if (cachedEpisodes) return cachedEpisodes;

  try {
    const feed = await parser.parseURL(FEED_URL);
    const mapped = (feed.items ?? [])
      .map((item) => mapEpisode(item as YouTubeFeedItem))
      .filter((episode): episode is PodcastEpisode => Boolean(episode));

    const sorted = mapped.sort((a, b) => {
      return new Date(b.published).getTime() - new Date(a.published).getTime();
    });

    if (sorted.length > 0) {
      cachedEpisodes = sorted;
      return sorted;
    }
  } catch (error) {
    console.warn(
      "[podcast] Failed to fetch YouTube playlist feed",
      error,
    );
  }

  if (fallbackEpisodes.length > 0) {
    cachedEpisodes = fallbackEpisodes;
    return fallbackEpisodes;
  }

  cachedEpisodes = [];
  return [];
};

export const getPodcastEpisode = async (
  slug: string,
): Promise<PodcastEpisode | null> => {
  const episodes = await getPodcastEpisodes();
  return episodes.find((episode) => episode.slug === slug) ?? null;
};
