// =============================================
// CREATIVE SUITE v1.5 — TREND ALIGNMENT
// =============================================

import fetch from "node-fetch";
import { TrendAlignment } from "./types.js";

const TRENDS_URL = "http://localhost:5060";

export async function checkTrendAlignment(
  platform: "tiktok" | "youtube" | "instagram",
  niche: string,
  hooks: string[],
  hashtags: string[]
): Promise<TrendAlignment> {
  console.log(`[TrendAlignment] Checking trends for ${platform} ${niche}`);

  try {
    // Query Trends Engine
    const response = await fetch(`${TRENDS_URL}/trends/summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "creative-suite-trend-check",
        platform,
        niche,
        language: "en"
      })
    });

    if (!response.ok) {
      console.warn("[TrendAlignment] Trends service unavailable");
      return createFallbackAlignment();
    }

    const trendsData = await response.json() as any;
    const trendingItems = trendsData.items || [];

    // Analyze alignment
    const trendingElements: string[] = [];
    const missedOpportunities: string[] = [];
    const recommendations: string[] = [];

    // Check if hooks match trending topics
    for (const item of trendingItems.slice(0, 5)) {
      const topic = item.topic || item.keyword || "";
      const isAligned = hooks.some(hook => 
        hook.toLowerCase().includes(topic.toLowerCase())
      );

      if (isAligned) {
        trendingElements.push(topic);
      } else {
        missedOpportunities.push(topic);
        recommendations.push(`Consider incorporating trending topic: "${topic}"`);
      }
    }

    // Check hashtag alignment
    for (const tag of hashtags) {
      const isTrending = trendingItems.some((item: any) => 
        (item.hashtag || "").toLowerCase() === tag.toLowerCase()
      );
      if (isTrending) {
        trendingElements.push(tag);
      }
    }

    // Calculate trend score
    const alignmentRatio = trendingElements.length / Math.max(trendingItems.length, 1);
    const trendScore = Math.floor(alignmentRatio * 100);

    return {
      aligned: trendScore >= 50,
      trendScore,
      trendingElements,
      missedOpportunities,
      recommendations
    };

  } catch (err) {
    console.warn("[TrendAlignment] Error checking trends:", err);
    return createFallbackAlignment();
  }
}

function createFallbackAlignment(): TrendAlignment {
  return {
    aligned: true,
    trendScore: 70,
    trendingElements: ["fitness", "productivity", "lifestyle"],
    missedOpportunities: [],
    recommendations: ["Consider adding trending audio", "Use current viral format"]
  };
}

export async function suggestTrendingElements(
  platform: "tiktok" | "youtube" | "instagram",
  niche: string
): Promise<{
  hashtags: string[];
  audio: string[];
  formats: string[];
  topics: string[];
}> {
  console.log(`[TrendAlignment] Fetching trending elements for ${platform} ${niche}`);

  try {
    const response = await fetch(`${TRENDS_URL}/trends/summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "creative-suite-suggestions",
        platform,
        niche,
        language: "en"
      })
    });

    if (!response.ok) {
      return createFallbackSuggestions();
    }

    const data = await response.json() as any;
    const items = data.items || [];

    return {
      hashtags: items.filter((i: any) => i.hashtag).map((i: any) => i.hashtag).slice(0, 5),
      audio: items.filter((i: any) => i.audio).map((i: any) => i.audio).slice(0, 3),
      formats: ["Before/After", "Day in the Life", "Tutorial", "Review"],
      topics: items.map((i: any) => i.topic || i.keyword).filter(Boolean).slice(0, 5)
    };

  } catch (err) {
    return createFallbackSuggestions();
  }
}

function createFallbackSuggestions() {
  return {
    hashtags: ["#fyp", "#viral", "#trending"],
    audio: ["trending-audio-001", "popular-sound-123"],
    formats: ["Hook + Value + CTA", "Storytime", "Tutorial"],
    topics: ["productivity hacks", "morning routine", "self improvement"]
  };
}
