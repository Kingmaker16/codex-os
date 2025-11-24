/**
 * Social Engine v1.5 - Upload Pipeline
 * Multi-platform video upload orchestration
 */

import type { UploadRequest, UploadResult } from "./types.js";
import { generateCaption } from "./captionGenerator.js";
import { suggestHashtags } from "./hashtagEngine.js";
import { getAccount } from "./accountManager.js";
import fetch from "node-fetch";
import { existsSync } from "fs";

const HANDS_ENGINE = "http://localhost:4300";
const VISION_ENGINE = "http://localhost:4600";

/**
 * Upload video to multiple platforms
 */
export async function uploadVideoToPlatforms(payload: UploadRequest): Promise<UploadResult[]> {
  const { accountId, videoPath, platforms, title, caption, tags } = payload;

  // Validate video file
  if (!existsSync(videoPath)) {
    return platforms.map((platform) => ({
      platform,
      ok: false,
      error: `Video file not found: ${videoPath}`,
    }));
  }

  // Get account
  const account = getAccount(accountId);
  if (!account) {
    return platforms.map((platform) => ({
      platform,
      ok: false,
      error: `Account ${accountId} not found`,
    }));
  }

  // Generate caption/tags if not provided
  let finalTitle = title;
  let finalCaption = caption;
  let finalTags = tags;

  if (!finalTitle || !finalCaption || !finalTags || finalTags.length === 0) {
    const niche = payload.niche || account.niche || "general";
    const brandTone = payload.brandTone || account.postingStyle || "engaging";

    const generated = await generateCaption({
      platform: platforms[0], // Use first platform for generation
      niche,
      script: payload.script,
      brandTone,
    });

    finalTitle = finalTitle || generated.title;
    finalCaption = finalCaption || generated.caption;
    finalTags = finalTags || generated.tags;
  }

  // Upload to each platform
  const results: UploadResult[] = [];

  for (const platform of platforms) {
    try {
      const result = await uploadToPlatform({
        platform,
        account,
        videoPath,
        title: finalTitle,
        caption: finalCaption,
        tags: finalTags,
      });
      results.push(result);
    } catch (err: any) {
      results.push({
        platform,
        ok: false,
        error: err.message || "Upload failed",
      });
    }
  }

  return results;
}

/**
 * Upload to a single platform
 */
async function uploadToPlatform(params: {
  platform: string;
  account: any;
  videoPath: string;
  title?: string;
  caption?: string;
  tags?: string[];
}): Promise<UploadResult> {
  const { platform, account, videoPath, title, caption, tags } = params;

  // Different strategies per platform
  switch (platform) {
    case "tiktok":
      return uploadToTikTok(account, videoPath, title, caption, tags);
    case "youtube":
      return uploadToYouTube(account, videoPath, title, caption, tags);
    case "instagram":
      return uploadToInstagram(account, videoPath, title, caption, tags);
    default:
      return { platform: platform as any, ok: false, error: "Unsupported platform" };
  }
}

/**
 * Upload to TikTok using Hands automation
 */
async function uploadToTikTok(
  account: any,
  videoPath: string,
  title?: string,
  caption?: string,
  tags?: string[] | string
): Promise<UploadResult> {
  try {
    // Use Hands v4 to automate TikTok upload
    const response = await fetch(`${HANDS_ENGINE}/hands/executeTask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task: "upload_tiktok_video",
        params: {
          accountId: account.id,
          videoPath,
          caption: formatCaption(caption, tags),
        },
      }),
    });

    if (!response.ok) {
      return {
        platform: "tiktok",
        ok: false,
        error: "Hands automation failed",
      };
    }

    const result = (await response.json()) as any;

    return {
      platform: "tiktok",
      ok: result.ok || false,
      message: result.message || "Uploaded to TikTok",
      url: result.url,
    };
  } catch (err: any) {
    return {
      platform: "tiktok",
      ok: false,
      error: err.message,
    };
  }
}

/**
 * Upload to YouTube Shorts using Hands automation
 */
async function uploadToYouTube(
  account: any,
  videoPath: string,
  title?: string,
  caption?: string,
  tags?: string[]
): Promise<UploadResult> {
  try {
    // Use Hands v4 to automate YouTube upload
    const response = await fetch(`${HANDS_ENGINE}/hands/executeTask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task: "upload_youtube_short",
        params: {
          accountId: account.id,
          videoPath,
          title: title || "Video",
          description: formatCaption(caption, tags),
        },
      }),
    });

    if (!response.ok) {
      return {
        platform: "youtube",
        ok: false,
        error: "Hands automation failed",
      };
    }

    const result = (await response.json()) as any;

    return {
      platform: "youtube",
      ok: result.ok || false,
      message: result.message || "Uploaded to YouTube",
      url: result.url,
    };
  } catch (err: any) {
    return {
      platform: "youtube",
      ok: false,
      error: err.message,
    };
  }
}

/**
 * Upload to Instagram Reels using Hands automation
 */
async function uploadToInstagram(
  account: any,
  videoPath: string,
  title?: string,
  caption?: string,
  tags?: string[]
): Promise<UploadResult> {
  try {
    // Use Hands v4 to automate Instagram upload
    const response = await fetch(`${HANDS_ENGINE}/hands/executeTask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task: "upload_instagram_reel",
        params: {
          accountId: account.id,
          videoPath,
          caption: formatCaption(caption, tags),
        },
      }),
    });

    if (!response.ok) {
      return {
        platform: "instagram",
        ok: false,
        error: "Hands automation failed",
      };
    }

    const result = (await response.json()) as any;

    return {
      platform: "instagram",
      ok: result.ok || false,
      message: result.message || "Uploaded to Instagram",
      url: result.url,
    };
  } catch (err: any) {
    return {
      platform: "instagram",
      ok: false,
      error: err.message,
    };
  }
}

/**
 * Format caption with tags
 */
function formatCaption(caption?: string, tags?: string[] | string): string {
  const baseCaption = caption || "";
  
  if (!tags) {
    return baseCaption;
  }

  const tagArray = Array.isArray(tags) ? tags : [tags];
  const tagString = tagArray.join(" ");

  return `${baseCaption}\n\n${tagString}`.trim();
}

/**
 * Verify upload success using Vision
 */
async function verifyUpload(platform: string, accountId: string): Promise<boolean> {
  try {
    const response = await fetch(`${VISION_ENGINE}/vision/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task: `verify_${platform}_upload`,
        accountId,
      }),
    });

    if (!response.ok) {
      return false;
    }

    const result = (await response.json()) as any;
    return result.verified || false;
  } catch {
    return false;
  }
}
