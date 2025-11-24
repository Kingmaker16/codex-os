import { Platform, Content, DistributionSlot } from "../types.js";
import { CONFIG } from "../config.js";
import axios from "axios";

export async function selectOptimalPlatforms(
  content: Content,
  availablePlatforms: Platform[]
): Promise<Platform[]> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.VISIBILITY}/visibility/score`, {
      contentId: content.id,
      platforms: availablePlatforms
    }, { timeout: 10000 });

    const scores = response.data.platformScores || {};
    
    const sorted = availablePlatforms.sort((a, b) => {
      return (scores[b] || 0) - (scores[a] || 0);
    });

    return sorted.slice(0, 3);
  } catch (error) {
    console.error("Failed to select optimal platforms:", error);
    return availablePlatforms.slice(0, 3);
  }
}

export async function scorePlatformForContent(
  content: Content,
  platform: Platform
): Promise<number> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.VISIBILITY}/visibility/platform-score`, {
      contentId: content.id,
      platform
    }, { timeout: 5000 });

    return response.data.score || 0.5;
  } catch (error) {
    console.error(`Failed to score platform ${platform}:`, error);
    return 0.5;
  }
}

export function filterPlatformsByContentType(
  platforms: Platform[],
  contentType: string
): Platform[] {
  return platforms.filter(platform => {
    const config = CONFIG.PLATFORMS[platform];
    return config.contentTypes.includes(contentType as any);
  });
}

export async function routeContentToPlatforms(
  contentId: string,
  targetPlatforms: Platform[]
): Promise<{ platform: Platform; routed: boolean }[]> {
  const results: { platform: Platform; routed: boolean }[] = [];

  for (const platform of targetPlatforms) {
    try {
      const response = await axios.post(`${CONFIG.SERVICES.SOCIAL}/social/route`, {
        contentId,
        platform
      }, { timeout: 5000 });

      results.push({ platform, routed: response.data.success || false });
    } catch (error) {
      console.error(`Failed to route content to ${platform}:`, error);
      results.push({ platform, routed: false });
    }
  }

  return results;
}

export async function getPlatformAvailability(platform: Platform): Promise<boolean> {
  try {
    const response = await axios.get(`${CONFIG.SERVICES.SOCIAL}/social/status/${platform}`, {
      timeout: 3000
    });

    return response.data.available || false;
  } catch (error) {
    console.error(`Failed to check ${platform} availability:`, error);
    return false;
  }
}

export function prioritizePlatformsByEngagement(
  slots: DistributionSlot[]
): DistributionSlot[] {
  const platformPriority: Record<Platform, number> = {
    tiktok: 5,
    youtube: 4,
    instagram: 4,
    twitter: 3,
    linkedin: 2
  };

  return slots.sort((a, b) => {
    const priorityA = platformPriority[a.platform] || 0;
    const priorityB = platformPriority[b.platform] || 0;
    return priorityB - priorityA;
  });
}
