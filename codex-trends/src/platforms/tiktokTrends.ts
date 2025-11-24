import type { TrendItem } from "../types.js";

/**
 * Fetch trending topics from TikTok
 * TODO: Integrate with real TikTok Creative Center API or web scraping
 * - API: https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/en
 * - Requires authentication and rate limiting
 * - Should track: hashtag growth, video views, engagement rates
 */
export async function fetchTikTokTrends(niche: string, language?: string): Promise<TrendItem[]> {
  // Stub data - replace with real API calls
  const nicheKeywords = niche.toLowerCase();
  
  const stubs: TrendItem[] = [];
  
  if (nicheKeywords.includes("fitness") || nicheKeywords.includes("workout")) {
    stubs.push(
      {
        platform: "tiktok",
        topic: "#homeworkout",
        examples: [
          "10-min no-equipment ab workout",
          "POV: you finally stick to your routine",
          "Before and after 30-day challenge"
        ],
        metricSummary: "2.4M views in last 7 days. +180% growth week-over-week.",
        confidence: 0.85
      },
      {
        platform: "tiktok",
        topic: "#fitnesstransformation",
        examples: [
          "My body recomp journey (no gym)",
          "What 90 days of consistency looks like",
          "Realistic fitness expectations"
        ],
        metricSummary: "1.8M views. Steady engagement, high saves.",
        confidence: 0.78
      },
      {
        platform: "tiktok",
        topic: "Audio: 'Workout Mix 2024'",
        examples: [
          "Using this audio for workout motivation",
          "Gym pump-up routine with trending beat",
          "Home workout montage"
        ],
        metricSummary: "850K uses in last 14 days. Viral audio for fitness content.",
        confidence: 0.72
      }
    );
  } else {
    // Generic trend for any other niche
    stubs.push({
      platform: "tiktok",
      topic: `#${niche.replace(/\s+/g, "")}`,
      examples: [
        `${niche} tips and tricks`,
        `POV: you're new to ${niche}`,
        `${niche} transformation`
      ],
      metricSummary: "Moderate engagement. Growing interest in niche.",
      confidence: 0.65
    });
  }
  
  return stubs;
}
