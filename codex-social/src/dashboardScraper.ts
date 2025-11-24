/**
 * Social Engine v1 - Dashboard Scraper
 * 
 * Scrapes social media dashboards for analytics using Vision Engine
 */

import type { SocialAccount, DashboardData } from "./types.js";
import { CONFIG } from "./config.js";

export async function scrapeDashboard(account: SocialAccount): Promise<DashboardData> {
  try {
    console.log(`[DashboardScraper] Scraping dashboard for ${account.id}`);

    // Open dashboard
    const dashboardUrl = getDashboardUrl(account);
    await fetch(`${CONFIG.handsUrl}/ui/openUrl`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: dashboardUrl })
    });

    // Wait for page load
    await sleep(2000);

    // Take screenshot and analyze with Vision
    const visionResult = await fetch(`${CONFIG.visionUrl}/vision/analyzeScreen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        context: `Dashboard analytics for ${account.platform}`,
        detectUI: true
      })
    });

    const visionData = await visionResult.json() as any;

    // Extract metrics from vision analysis
    const metrics = extractMetricsFromVision(visionData.analysis || "");

    const dashboardData: DashboardData = {
      accountId: account.id,
      platform: account.platform,
      isLoggedIn: !visionData.analysis?.includes("login"),
      username: account.username,
      analytics: metrics,
      timestamp: new Date().toISOString()
    };

    console.log(`[DashboardScraper] Scraped metrics:`, metrics);
    return dashboardData;

  } catch (error: any) {
    console.error(`[DashboardScraper] Error:`, error.message);
    return {
      accountId: account.id,
      platform: account.platform,
      isLoggedIn: false,
      timestamp: new Date().toISOString()
    };
  }
}

function getDashboardUrl(account: SocialAccount): string {
  const platformConfig = CONFIG.platforms[account.platform];
  return platformConfig.dashboardUrl
    .replace("{username}", account.username || "")
    .replace("{channelId}", account.metadata?.channelId || "");
}

function extractMetricsFromVision(analysis: string): Record<string, number> {
  const metrics: Record<string, number> = {};

  // Extract numbers from text using common patterns
  const patterns = {
    followers: /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:followers|subscribers)/i,
    views: /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:views|impressions)/i,
    likes: /(\d+(?:,\d+)*(?:\.\d+)?)\s*likes/i,
    comments: /(\d+(?:,\d+)*(?:\.\d+)?)\s*comments/i,
    shares: /(\d+(?:,\d+)*(?:\.\d+)?)\s*shares/i
  };

  for (const [key, pattern] of Object.entries(patterns)) {
    const match = analysis.match(pattern);
    if (match) {
      const value = parseFloat(match[1].replace(/,/g, ""));
      metrics[key] = value;
    }
  }

  return metrics;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function detectDashboardElements(account: SocialAccount): Promise<any> {
  try {
    // Use Vision UI mapping to detect clickable elements
    const visionResult = await fetch(`${CONFIG.visionUrl}/vision/mapUI`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        context: `Dashboard UI for ${account.platform}`
      })
    });

    return await visionResult.json();
  } catch (error: any) {
    console.error(`[DashboardScraper] Element detection failed:`, error.message);
    return { elements: [] };
  }
}
