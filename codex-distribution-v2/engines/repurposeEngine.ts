import { Platform, Content, RepurposeRequest } from "../types.js";
import { CONFIG } from "../config.js";
import axios from "axios";

export async function repurposeContent(request: RepurposeRequest): Promise<Record<Platform, string>> {
  const results: Record<Platform, string> = {} as Record<Platform, string>;

  for (const targetPlatform of request.targetPlatforms) {
    try {
      const repurposedId = await repurposeForPlatform(
        request.contentId,
        request.sourcePlatform,
        targetPlatform,
        request.language
      );
      results[targetPlatform] = repurposedId;
    } catch (error) {
      console.error(`Failed to repurpose for ${targetPlatform}:`, error);
      results[targetPlatform] = `${request.contentId}-${targetPlatform}-failed`;
    }
  }

  return results;
}

async function repurposeForPlatform(
  contentId: string,
  sourcePlatform: Platform,
  targetPlatform: Platform,
  language?: string
): Promise<string> {
  if (sourcePlatform === targetPlatform) {
    return contentId;
  }

  try {
    const response = await axios.post(`${CONFIG.SERVICES.CREATIVE_SUITE}/repurpose`, {
      contentId,
      sourcePlatform,
      targetPlatform,
      language
    }, { timeout: CONFIG.TIMEOUTS.REPURPOSE });

    return response.data.repurposedContentId || `${contentId}-${targetPlatform}`;
  } catch (error) {
    console.error(`Repurpose API failed for ${contentId}:`, error);
    return `${contentId}-${targetPlatform}-stub`;
  }
}

export async function optimizeForPlatform(
  contentId: string,
  platform: Platform
): Promise<{ optimized: boolean; newContentId?: string }> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.VIDEO}/video/optimize`, {
      contentId,
      platform,
      optimizations: getPlatformOptimizations(platform)
    }, { timeout: CONFIG.TIMEOUTS.REPURPOSE });

    return {
      optimized: response.data.success || false,
      newContentId: response.data.optimizedContentId
    };
  } catch (error) {
    console.error(`Failed to optimize content for ${platform}:`, error);
    return { optimized: false };
  }
}

function getPlatformOptimizations(platform: Platform): Record<string, any> {
  const optimizations: Record<Platform, Record<string, any>> = {
    tiktok: { aspectRatio: "9:16", maxDuration: 60, format: "mp4" },
    youtube: { aspectRatio: "16:9", maxDuration: 600, format: "mp4", quality: "1080p" },
    instagram: { aspectRatio: "9:16", maxDuration: 90, format: "mp4" },
    twitter: { aspectRatio: "16:9", maxDuration: 140, format: "mp4" },
    linkedin: { aspectRatio: "16:9", maxDuration: 600, format: "mp4" }
  };

  return optimizations[platform] || {};
}

export async function generateVariants(
  contentId: string,
  variantCount: number
): Promise<string[]> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.CREATIVE_SUITE}/variants`, {
      contentId,
      count: variantCount
    }, { timeout: CONFIG.TIMEOUTS.REPURPOSE });

    return response.data.variantIds || [];
  } catch (error) {
    console.error(`Failed to generate variants for ${contentId}:`, error);
    return [];
  }
}
