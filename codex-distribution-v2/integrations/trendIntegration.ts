import { Platform, TrendData } from "../types.js";
import { CONFIG } from "../config.js";
import axios from "axios";

export async function getTrendingTopics(
  platform: Platform
): Promise<{ topics: string[]; score: number }> {
  try {
    const response = await axios.get(`${CONFIG.SERVICES.TRENDS}/trends/${platform}`, {
      timeout: 5000
    });

    return {
      topics: response.data.topics || [],
      score: response.data.score || 0.5
    };
  } catch (error) {
    console.error(`Failed to get trending topics for ${platform}:`, error);
    return { topics: [], score: 0.5 };
  }
}

export async function analyzeTrends(
  platforms: Platform[]
): Promise<TrendData[]> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.TRENDS}/trends/analyze`, {
      platforms,
      timeRange: "24h"
    }, { timeout: 10000 });

    return response.data.trends || [];
  } catch (error) {
    console.error("Failed to analyze trends:", error);
    return [];
  }
}

export async function matchContentToTrends(
  contentId: string,
  platform: Platform
): Promise<{ matches: string[]; score: number }> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.TRENDS}/trends/match`, {
      contentId,
      platform
    }, { timeout: 5000 });

    return {
      matches: response.data.matches || [],
      score: response.data.score || 0
    };
  } catch (error) {
    console.error("Failed to match content to trends:", error);
    return { matches: [], score: 0 };
  }
}
