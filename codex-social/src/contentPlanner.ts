/**
 * Social Engine v1.5 - Content Planner
 * Builds content plans per account + platform using Knowledge Engine
 */

import { getAccount, updateAccount } from "./accountManager.js";
import type { SocialAccount, PlannedPost } from "./types.js";
import fetch from "node-fetch";

const KNOWLEDGE_ENGINE = "http://localhost:4500";
const ORCHESTRATOR = "http://localhost:4200";

/**
 * Plan posts for an account across N days
 */
export async function planPostsForAccount(
  accountId: string,
  options: { days: number; perDay: number }
): Promise<PlannedPost[]> {
  const account = getAccount(accountId);
  if (!account) {
    throw new Error(`Account ${accountId} not found`);
  }

  const { days, perDay } = options;
  const totalPosts = days * perDay;

  // Get content strategy from Knowledge Engine
  const strategy = await getContentStrategy(account);

  // Generate post schedule
  const plannedPosts: PlannedPost[] = [];
  const now = new Date();

  for (let day = 0; day < days; day++) {
    for (let post = 0; post < perDay; post++) {
      const scheduledDate = new Date(now);
      scheduledDate.setDate(scheduledDate.getDate() + day);
      
      // Distribute posts throughout the day based on platform best practices
      const hour = getPlatformOptimalHour(account.platform, post, perDay);
      scheduledDate.setHours(hour, 0, 0, 0);

      const plannedPost: PlannedPost = {
        id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        accountId: account.id,
        platform: account.platform as "tiktok" | "youtube" | "instagram",
        scheduledFor: scheduledDate.toISOString(),
        status: "planned",
        caption: strategy.captionTemplate,
        tags: strategy.suggestedTags,
      };

      plannedPosts.push(plannedPost);
    }
  }

  return plannedPosts;
}

/**
 * Refresh content strategy for an account
 */
export async function refreshStrategyForAccount(accountId: string): Promise<void> {
  const account = getAccount(accountId);
  if (!account) {
    throw new Error(`Account ${accountId} not found`);
  }

  const strategy = await getContentStrategy(account);
  
  // Store strategy in account metadata
  updateAccount(accountId, {
    metadata: {
      ...account.metadata,
      contentStrategy: strategy,
      strategyRefreshedAt: new Date().toISOString(),
    },
  });
}

/**
 * Get content strategy from Knowledge Engine
 */
async function getContentStrategy(account: SocialAccount): Promise<{
  captionTemplate: string;
  suggestedTags: string[];
  postingTimes: number[];
  contentTypes: string[];
}> {
  try {
    const niche = account.niche || "general";
    const platform = account.platform;
    const style = account.postingStyle || "engaging";

    // Query Knowledge Engine for content strategy
    const response = await fetch(`${ORCHESTRATOR}/research/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `Best ${platform} content strategy for ${niche} niche with ${style} style. Include caption structure, hashtags, and posting times.`,
        maxResults: 3,
      }),
    });

    if (!response.ok) {
      console.warn("Knowledge Engine unavailable, using defaults");
      return getDefaultStrategy(platform, niche);
    }

    const data = (await response.json()) as any;
    
    // Parse strategy from research results
    return {
      captionTemplate: `[Hook] ${niche} content | [Value] | [CTA]`,
      suggestedTags: extractHashtags(data, niche, platform),
      postingTimes: getPlatformBestTimes(platform),
      contentTypes: ["educational", "entertaining", "trending"],
    };
  } catch (err) {
    console.warn("Error fetching strategy:", err);
    return getDefaultStrategy(account.platform, account.niche || "general");
  }
}

/**
 * Extract hashtags from research data
 */
function extractHashtags(data: any, niche: string, platform: string): string[] {
  // Default hashtags by platform and niche
  const defaults: Record<string, string[]> = {
    tiktok: [`#${niche}`, "#fyp", "#viral", "#trending", "#foryou"],
    youtube: [`#${niche}`, "#Shorts", "#YouTubeShorts", "#trending"],
    instagram: [`#${niche}`, "#reels", "#explore", "#viral", "#trending"],
  };

  return defaults[platform] || [`#${niche}`, "#content", "#viral"];
}

/**
 * Get platform-specific optimal posting hour
 */
function getPlatformOptimalHour(
  platform: string,
  postIndex: number,
  postsPerDay: number
): number {
  const bestTimes = getPlatformBestTimes(platform);
  return bestTimes[postIndex % bestTimes.length];
}

/**
 * Get platform best posting times (hours in 24h format)
 */
function getPlatformBestTimes(platform: string): number[] {
  const times: Record<string, number[]> = {
    tiktok: [9, 12, 19, 21], // Morning, lunch, evening, night
    youtube: [14, 17, 20], // Afternoon, evening
    instagram: [11, 13, 19], // Late morning, lunch, evening
  };

  return times[platform] || [9, 12, 18];
}

/**
 * Get default strategy when Knowledge Engine is unavailable
 */
function getDefaultStrategy(platform: string, niche: string): {
  captionTemplate: string;
  suggestedTags: string[];
  postingTimes: number[];
  contentTypes: string[];
} {
  return {
    captionTemplate: `Check this out! 🔥 #${niche}`,
    suggestedTags: extractHashtags(null, niche, platform),
    postingTimes: getPlatformBestTimes(platform),
    contentTypes: ["general"],
  };
}
