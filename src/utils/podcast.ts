import Parser from "rss-parser";
import cacheData from "../data/podcast-cache.json";
import { findVideoForTitle, getYoutubeVideos } from "./youtube";

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
  slug: string;
  link: string;
  published: string;
  summary: string;
  duration?: string;
  audioUrl?: string;
  image?: string;
  videoUrl?: string;
  videoId?: string;
}

// Substack does not expose a separate /feed/podcast endpoint for this
// publication — the main feed already carries each post's audio enclosure, so
// it is the single source of truth. Episodes are the items that have an
// <enclosure> (audio); plain text essays are filtered out below.
const FEED_URL =
  import.meta.env.PODCAST_RSS_URL ?? "https://aidialogos.substack.com/feed";

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

  const slug = item.title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return {
    title: item.title.trim(),
    slug,
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

// The Substack feed carries audio but not the YouTube video id. Match each
// episode to its YouTube upload by title so the episode page can embed the
// real player. A failed YouTube fetch leaves episodes audio-only — never fatal.
const attachVideos = async (
  episodes: PodcastEpisode[],
): Promise<PodcastEpisode[]> => {
  const videos = await getYoutubeVideos();
  if (videos.length === 0) return episodes;

  return episodes.map((episode) => {
    const video = findVideoForTitle(videos, episode.title);
    if (!video) return episode;

    return {
      ...episode,
      videoId: video.videoId,
      videoUrl: video.url,
      image: episode.image ?? video.thumbnail,
    };
  });
};

export const getPodcastEpisodes = async (
  limit = 50,
): Promise<PodcastEpisode[]> => {
  if (cachedEpisodes) return cachedEpisodes.slice(0, limit);

  try {
    const feed = await parser.parseURL(FEED_URL);
    const mapped = (feed.items ?? [])
      .map(mapItem)
      .filter((item): item is PodcastEpisode => Boolean(item))
      // Only posts with audio are episodes; skip any plain text essays.
      .filter((episode) => Boolean(episode.audioUrl));

    const withVideo = await attachVideos(mapped);

    const sorted = withVideo.sort(
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

export const getPodcastEpisode = async (
  slug: string,
): Promise<PodcastEpisode | undefined> => {
  const episodes = await getPodcastEpisodes();
  return episodes.find((ep) => ep.slug === slug);
};
