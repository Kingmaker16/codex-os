import { Platform, DistributionSlot, TrendData } from "../types.js";
import { CONFIG } from "../config.js";
import axios from "axios";

export async function fetchTrendData(platforms: Platform[]): Promise<TrendData[]> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.TRENDS}/trends/analyze`, {
      platforms,
      timeRange: "24h"
    }, { timeout: 10000 });

    return response.data.trends || [];
  } catch (error) {
    console.error("Failed to fetch trend data:", error);
    return platforms.map(platform => ({
      platform,
      trending: [],
      peakHours: CONFIG.PLATFORMS[platform].peakHours,
      score: 0.5
    }));
  }
}

export async function scoreSlotsWithTrends(
  slots: DistributionSlot[],
  trendData: TrendData[]
): Promise<DistributionSlot[]> {
  return slots.map(slot => {
    const trend = trendData.find(t => t.platform === slot.platform);
    if (!trend) return slot;

    const slotHour = new Date(slot.datetime).getHours();
    const isPeakHour = trend.peakHours.includes(slotHour);
    
    const baseScore = trend.score || 0.5;
    const hourBoost = isPeakHour ? 1.3 : 1.0;
    const trendScore = baseScore * hourBoost;

    return {
      ...slot,
      trendScore: Math.min(trendScore, 1.0)
    };
  });
}

export function prioritizeHighTrendSlots(slots: DistributionSlot[]): DistributionSlot[] {
  return slots.sort((a, b) => {
    const scoreA = a.trendScore || 0;
    const scoreB = b.trendScore || 0;
    return scoreB - scoreA;
  });
}

export async function alignWithTrendingTopics(
  contentId: string,
  platform: Platform,
  trendData: TrendData
): Promise<{ aligned: boolean; topics: string[] }> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.TRENDS}/trends/align`, {
      contentId,
      platform,
      trendingTopics: trendData.trending
    }, { timeout: 10000 });

    return {
      aligned: response.data.aligned || false,
      topics: response.data.matchedTopics || []
    };
  } catch (error) {
    console.error("Failed to align with trends:", error);
    return { aligned: false, topics: [] };
  }
}

export function calculateTrendMultiplier(trendScore: number): number {
  if (trendScore >= 0.8) return 2.0;
  if (trendScore >= 0.6) return 1.5;
  if (trendScore >= 0.4) return 1.2;
  return 1.0;
}
