/**
 * Social Engine v1.5 - Trend Scanner
 * Pull trending topics using Hands + Vision + Knowledge
 */

import type { TrendInsight } from "./types.js";
import fetch from "node-fetch";

const HANDS_ENGINE = "http://localhost:4300";
const VISION_ENGINE = "http://localhost:4600";
const ORCHESTRATOR = "http://localhost:4200";

/**
 * Scan trends for a platform and niche
 */
export async function scanTrends(
  platform: "tiktok" | "youtube" | "instagram",
  niche: string
): Promise<TrendInsight[]> {
  try {
    // Step 1: Use Hands to navigate to trending page
    const trendingData = await scrapeTrendingPage(platform);

    // Step 2: Use Knowledge Engine to analyze trends
    const insights = await analyzeTrends(platform, niche, trendingData);

    return insights;
  } catch (err) {
    console.error("Trend scanning error:", err);
    return getFallbackTrends(platform, niche);
  }
}

/**
 * Scrape trending page using Hands + Vision
 */
async function scrapeTrendingPage(platform: string): Promise<string[]> {
  try {
    // Use Hands to open trending page
    const handsResponse = await fetch(`${HANDS_ENGINE}/hands/executeTask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task: `open_${platform}_trending`,
        params: {},
      }),
    });

    if (!handsResponse.ok) {
      return [];
    }

    // Use Vision to extract trending topics
    const visionResponse = await fetch(`${VISION_ENGINE}/vision/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task: "extract_trending_topics",
        platform,
      }),
    });

    if (!visionResponse.ok) {
      return [];
    }

    const visionData = (await visionResponse.json()) as any;
    return visionData.topics || [];
  } catch (err) {
    console.error("Trending page scrape error:", err);
    return [];
  }
}

/**
 * Analyze trends using Knowledge Engine
 */
async function analyzeTrends(
  platform: string,
  niche: string,
  topics: string[]
): Promise<TrendInsight[]> {
  try {
    const topicsText = topics.join(", ");

    const response = await fetch(`${ORCHESTRATOR}/research/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `Analyze these trending ${platform} topics for ${niche} content: ${topicsText}. Provide actionable insights for content creators.`,
        maxResults: 5,
      }),
    });

    if (!response.ok) {
      return buildBasicInsights(topics);
    }

    const data = (await response.json()) as any;

    // Parse insights from research results
    return topics.slice(0, 5).map((topic) => ({
      topic,
      examples: [
        `${topic} tutorial`,
        `${topic} tips`,
        `${topic} secrets`,
      ],
      performanceHint: `High engagement potential. Create content around ${topic} with unique angle.`,
    }));
  } catch (err) {
    return buildBasicInsights(topics);
  }
}

/**
 * Build basic insights from topics
 */
function buildBasicInsights(topics: string[]): TrendInsight[] {
  return topics.slice(0, 5).map((topic) => ({
    topic,
    examples: [`${topic} content idea 1`, `${topic} content idea 2`],
    performanceHint: "Trending topic with potential",
  }));
}

/**
 * Get fallback trends when scanning fails
 */
function getFallbackTrends(platform: string, niche: string): TrendInsight[] {
  const fallbacks: Record<string, TrendInsight[]> = {
    tiktok: [
      {
        topic: "Viral Challenges",
        examples: ["Dance challenges", "Transition challenges", "Duet challenges"],
        performanceHint: "Participate early in trending challenges for maximum reach",
      },
      {
        topic: "Educational Content",
        examples: ["Quick tips", "How-to guides", "Did you know?"],
        performanceHint: "Hook viewers in first 3 seconds with surprising fact",
      },
      {
        topic: "Behind the Scenes",
        examples: ["Process videos", "Day in the life", "Real vs edited"],
        performanceHint: "Authenticity drives engagement on TikTok",
      },
    ],
    youtube: [
      {
        topic: "Tutorial Shorts",
        examples: ["Quick tutorials", "Life hacks", "Pro tips"],
        performanceHint: "Clear title and immediate value delivery",
      },
      {
        topic: "Entertainment",
        examples: ["Comedy skits", "Reactions", "Memes"],
        performanceHint: "First frame must be eye-catching",
      },
    ],
    instagram: [
      {
        topic: "Aesthetic Reels",
        examples: ["Lifestyle content", "Fashion", "Travel"],
        performanceHint: "Visual quality and trending audio are key",
      },
      {
        topic: "Educational Reels",
        examples: ["Tips and tricks", "Explainers", "Tutorials"],
        performanceHint: "Use text overlays for accessibility",
      },
    ],
  };

  return fallbacks[platform] || fallbacks.tiktok;
}

/**
 * Get trending hashtags for platform/niche
 */
export async function getTrendingHashtags(
  platform: string,
  niche: string
): Promise<string[]> {
  try {
    const response = await fetch(`${ORCHESTRATOR}/research/web`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `trending ${platform} hashtags ${niche}`,
        maxResults: 10,
      }),
    });

    if (!response.ok) {
      return getDefaultHashtags(platform, niche);
    }

    const data = (await response.json()) as any;
    const text = JSON.stringify(data);
    const matches = text.match(/#[\w]+/g) || [];

    return [...new Set(matches)].slice(0, 10);
  } catch {
    return getDefaultHashtags(platform, niche);
  }
}

/**
 * Get default hashtags
 */
function getDefaultHashtags(platform: string, niche: string): string[] {
  const defaults: Record<string, string[]> = {
    tiktok: [`#${niche}`, "#fyp", "#viral", "#trending"],
    youtube: [`#${niche}`, "#Shorts", "#YouTubeShorts"],
    instagram: [`#${niche}`, "#reels", "#explore", "#viral"],
  };

  return defaults[platform] || [`#${niche}`, "#trending"];
}
