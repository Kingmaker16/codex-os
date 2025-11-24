import type { TrendQuery, TrendResponse, TrendItem } from "./types.js";
import { fetchTikTokTrends } from "./platforms/tiktokTrends.js";
import { fetchYouTubeTrends } from "./platforms/youtubeTrends.js";
import { fetchInstagramTrends } from "./platforms/instagramTrends.js";
import { fetchGoogleTrends } from "./platforms/googleTrends.js";

/**
 * Aggregate trends from one or all platforms
 */
export async function getTrends(q: TrendQuery): Promise<TrendResponse> {
  console.log(`[Aggregator] Fetching trends for niche="${q.niche}" platform="${q.platform}"`);
  
  let allItems: TrendItem[] = [];
  
  if (q.platform === "all") {
    // Fetch from all platforms in parallel
    const results = await Promise.allSettled([
      fetchTikTokTrends(q.niche, q.language),
      fetchYouTubeTrends(q.niche, q.language),
      fetchInstagramTrends(q.niche, q.language),
      fetchGoogleTrends(q.niche, q.language)
    ]);
    
    for (const result of results) {
      if (result.status === "fulfilled") {
        allItems = allItems.concat(result.value);
      } else {
        console.warn(`[Aggregator] Platform fetch failed:`, result.reason);
      }
    }
  } else {
    // Fetch from single platform
    switch (q.platform) {
      case "tiktok":
        allItems = await fetchTikTokTrends(q.niche, q.language);
        break;
      case "youtube":
        allItems = await fetchYouTubeTrends(q.niche, q.language);
        break;
      case "instagram":
        allItems = await fetchInstagramTrends(q.niche, q.language);
        break;
      case "google":
        allItems = await fetchGoogleTrends(q.niche, q.language);
        break;
    }
  }
  
  // Sort by confidence (highest first)
  allItems.sort((a, b) => b.confidence - a.confidence);
  
  console.log(`[Aggregator] Found ${allItems.length} trend items`);
  
  return {
    query: q,
    items: allItems,
    generatedAt: new Date().toISOString()
  };
}
