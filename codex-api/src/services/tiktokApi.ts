// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Codex API - TikTok API v2 Upload
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import axios from "axios";
import { PLATFORM_ENDPOINTS } from "../config.js";
import { getValidToken } from "./tokenManager.js";
import { checkRateLimit } from "./rateLimitGuard.js";
import type { UploadRequest, UploadResponse } from "../types.js";

/**
 * Upload video to TikTok using TikTok API v2
 */
export async function uploadToTikTok(
  request: UploadRequest
): Promise<UploadResponse> {
  const { sessionId, accountId, title, description, fileUrl, metadata } = request;
  
  // Check rate limit
  const rateLimit = checkRateLimit("tiktok", accountId);
  if (!rateLimit.allowed) {
    return {
      ok: false,
      sessionId,
      platform: "tiktok",
      status: "failed",
      error: `Rate limit exceeded. Try again after ${new Date(rateLimit.resetAt).toISOString()}`,
    };
  }
  
  // Get valid access token
  const accessToken = await getValidToken("tiktok", accountId || "default");
  if (!accessToken) {
    return {
      ok: false,
      sessionId,
      platform: "tiktok",
      status: "failed",
      error: "No valid access token found. Please authenticate first.",
    };
  }
  
  try {
    // Step 1: Initialize upload
    const initResponse = await axios.post(
      `${PLATFORM_ENDPOINTS.tiktok}/post/publish/video/init/`,
      {
        post_info: {
          title: title || "Uploaded via Codex API",
          description: description || "",
          privacy_level: metadata?.privacyLevel || "SELF_ONLY",
          disable_comment: metadata?.disableComment || false,
          disable_duet: metadata?.disableDuet || false,
          disable_stitch: metadata?.disableStitch || false,
        },
        source_info: {
          source: "FILE_URL",
          video_url: fileUrl,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    const publishId = initResponse.data.data.publish_id;
    
    return {
      ok: true,
      sessionId,
      platform: "tiktok",
      uploadId: publishId,
      status: "pending",
      message: "Video upload initiated. Processing...",
    };
  } catch (error: any) {
    return {
      ok: false,
      sessionId,
      platform: "tiktok",
      status: "failed",
      error: error.response?.data?.error?.message || error.message,
    };
  }
}

/**
 * Get TikTok upload status
 */
export async function getTikTokUploadStatus(
  uploadId: string,
  accountId: string
): Promise<{ status: string; url?: string }> {
  const accessToken = await getValidToken("tiktok", accountId);
  
  if (!accessToken) {
    return { status: "error" };
  }
  
  try {
    const response = await axios.post(
      `${PLATFORM_ENDPOINTS.tiktok}/post/publish/status/fetch/`,
      {
        publish_id: uploadId,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    const status = response.data.data.status;
    const videoUrl = response.data.data.video_url;
    
    return { status, url: videoUrl };
  } catch (error) {
    return { status: "error" };
  }
}
