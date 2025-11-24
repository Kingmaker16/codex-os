/**
 * Social Engine v1 - Analytics Engine
 * 
 * Aggregates and analyzes social media metrics
 */

import type { SocialAccount, AnalyticsData } from "./types.js";
import { scrapeDashboard } from "./dashboardScraper.js";
import { logAnalytics } from "./brainLogger.js";

export async function getAnalytics(account: SocialAccount): Promise<AnalyticsData> {
  console.log(`[AnalyticsEngine] Getting analytics for ${account.id}`);

  // Scrape dashboard
  const dashboardData = await scrapeDashboard(account);

  const analytics: AnalyticsData = {
    accountId: account.id,
    platform: account.platform,
    metrics: dashboardData.analytics || {},
    timestamp: new Date().toISOString()
  };

  // Log to Brain
  await logAnalytics(account.id, account.platform, analytics.metrics);

  return analytics;
}

export async function compareAnalytics(
  current: AnalyticsData,
  previous: AnalyticsData
): Promise<any> {
  const changes: Record<string, { previous: number; current: number; change: number; percentChange: number }> = {};

  for (const [key, currentValue] of Object.entries(current.metrics)) {
    const previousValue = previous.metrics[key as keyof typeof previous.metrics];
    if (typeof currentValue === "number" && typeof previousValue === "number") {
      const change = currentValue - previousValue;
      const percentChange = previousValue > 0 ? (change / previousValue) * 100 : 0;
      
      changes[key] = {
        previous: previousValue,
        current: currentValue,
        change,
        percentChange
      };
    }
  }

  return {
    accountId: current.accountId,
    platform: current.platform,
    period: {
      from: previous.timestamp,
      to: current.timestamp
    },
    changes
  };
}

export async function getGrowthInsights(account: SocialAccount): Promise<any> {
  try {
    // Use Knowledge Engine to analyze niche-specific growth strategies
    const response = await fetch("http://localhost:4500/research/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `Best growth strategies for ${account.platform} in ${account.niche || "general"} niche`,
        domain: "social"
      })
    });

    const knowledgeData = await response.json() as any;

    return {
      accountId: account.id,
      niche: account.niche,
      insights: knowledgeData.data?.summary || "No insights available",
      skills: knowledgeData.data?.skills || [],
      timestamp: new Date().toISOString()
    };

  } catch (error: any) {
    console.error("[AnalyticsEngine] Failed to get growth insights:", error.message);
    return {
      accountId: account.id,
      insights: "Unable to fetch insights",
      timestamp: new Date().toISOString()
    };
  }
}
