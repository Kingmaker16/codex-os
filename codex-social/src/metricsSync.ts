/**
 * Social Engine v1.5 - Metrics Sync
 * Sync analytics to Monetization Engine
 */

import { getAllAccounts } from "./accountManager.js";
import { scrapeDashboard } from "./dashboardScraper.js";
import { logToBrain } from "./brainLogger.js";
import fetch from "node-fetch";

const MONETIZATION_ENGINE = "http://localhost:4850";

/**
 * Sync metrics to Monetization Engine
 */
export async function syncMetrics(): Promise<void> {
  try {
    const accounts = getAllAccounts();

    for (const account of accounts) {
      try {
        // Scrape dashboard data
        const dashboardData = await scrapeDashboard(account);

        if (!dashboardData || !dashboardData.analytics) {
          continue;
        }

        // Calculate revenue from views (simplified)
        const rpm = getRPMForPlatform(account.platform);
        const views = dashboardData.analytics.views || 0;
        const revenue = (views / 1000) * rpm;

        if (revenue > 0) {
          // Send to Monetization Engine
          await recordRevenue(account, revenue, views);

          // Log to Brain
          await logToBrain(
            "codex-social-metrics",
            `Synced metrics for ${account.platform} account ${account.id}: ${views} views, $${revenue.toFixed(2)} revenue`
          );
        }
      } catch (err) {
        console.error(`Failed to sync metrics for account ${account.id}:`, err);
      }
    }
  } catch (err) {
    console.error("Metrics sync error:", err);
  }
}

/**
 * Record revenue in Monetization Engine
 */
async function recordRevenue(
  account: any,
  amount: number,
  views: number
): Promise<void> {
  try {
    const response = await fetch(`${MONETIZATION_ENGINE}/monetization/recordRevenue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vertical: "social",
        platform: getPlatformName(account.platform),
        amount,
        currency: "USD",
        contentId: account.id,
        metadata: {
          views,
          accountId: account.id,
          niche: account.niche,
        },
      }),
    });

    if (!response.ok) {
      console.warn(`Failed to record revenue for ${account.id}`);
    }
  } catch (err) {
    console.error("Revenue recording error:", err);
  }
}

/**
 * Get RPM (Revenue Per 1000 views) for platform
 */
function getRPMForPlatform(platform: string): number {
  const rpms: Record<string, number> = {
    tiktok: 0.02, // $0.02 per 1000 views (creator fund)
    youtube: 3.0, // $3 per 1000 views (average for Shorts)
    instagram: 0.01, // $0.01 per 1000 views (varies widely)
  };

  return rpms[platform] || 0.01;
}

/**
 * Get platform display name
 */
function getPlatformName(platform: string): string {
  const names: Record<string, string> = {
    tiktok: "TikTok",
    youtube: "YouTube",
    instagram: "Instagram",
  };

  return names[platform] || platform;
}

/**
 * Record cost (e.g., ad spend, tools)
 */
export async function recordCost(params: {
  category: string;
  description: string;
  amount: number;
  platform?: string;
}): Promise<void> {
  try {
    const response = await fetch(`${MONETIZATION_ENGINE}/monetization/recordCost`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: params.category,
        description: params.description,
        amount: params.amount,
        currency: "USD",
        metadata: {
          platform: params.platform,
          source: "codex-social",
        },
      }),
    });

    if (!response.ok) {
      console.warn("Failed to record cost");
    }
  } catch (err) {
    console.error("Cost recording error:", err);
  }
}
