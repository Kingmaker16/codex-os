// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Codex API - Instagram/Meta Graph Upload (Business Account)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import axios from "axios";
import { PLATFORM_ENDPOINTS } from "../config.js";
import { getValidToken } from "./tokenManager.js";
import { checkRateLimit } from "./rateLimitGuard.js";
import type { UploadRequest, UploadResponse } from "../types.js";

/**
 * Upload media to Instagram using Meta Graph API
 */
export async function uploadToInstagram(
  request: UploadRequest
): Promise<UploadResponse> {
  const { sessionId, accountId, contentType, title, fileUrl, metadata } = request;
  
  // Check rate limit
  const rateLimit = checkRateLimit("instagram", accountId);
  if (!rateLimit.allowed) {
    return {
      ok: false,
      sessionId,
      platform: "instagram",
      status: "failed",
      error: `Rate limit exceeded. Try again after ${new Date(rateLimit.resetAt).toISOString()}`,
    };
  }
  
  // Get valid access token
  const accessToken = await getValidToken("instagram", accountId || "default");
  if (!accessToken) {
    return {
      ok: false,
      sessionId,
      platform: "instagram",
      status: "failed",
      error: "No valid access token found. Please authenticate first.",
    };
  }
  
  const igUserId = metadata?.igUserId || accountId;
  
  try {
    // Step 1: Create media container
    const mediaType = contentType === "video" ? "VIDEO" : "IMAGE";
    const containerResponse = await axios.post(
      `${PLATFORM_ENDPOINTS.instagram}/${igUserId}/media`,
      {
        [mediaType === "VIDEO" ? "video_url" : "image_url"]: fileUrl,
        caption: title || "",
        access_token: accessToken,
      }
    );
    
    const containerId = containerResponse.data.id;
    
    // Step 2: Publish media container
    const publishResponse = await axios.post(
      `${PLATFORM_ENDPOINTS.instagram}/${igUserId}/media_publish`,
      {
        creation_id: containerId,
        access_token: accessToken,
      }
    );
    
    const mediaId = publishResponse.data.id;
    
    return {
      ok: true,
      sessionId,
      platform: "instagram",
      uploadId: mediaId,
      url: `https://www.instagram.com/p/${mediaId}`,
      status: "success",
      message: "Media uploaded successfully to Instagram",
    };
  } catch (error: any) {
    return {
      ok: false,
      sessionId,
      platform: "instagram",
      status: "failed",
      error: error.response?.data?.error?.message || error.message,
    };
  }
}

/**
 * Get Instagram media insights
 */
export async function getInstagramMediaInsights(
  mediaId: string,
  accountId: string
): Promise<any> {
  const accessToken = await getValidToken("instagram", accountId);
  
  if (!accessToken) {
    return null;
  }
  
  try {
    const response = await axios.get(
      `${PLATFORM_ENDPOINTS.instagram}/${mediaId}/insights`,
      {
        params: {
          metric: "engagement,impressions,reach,saved",
          access_token: accessToken,
        },
      }
    );
    
    return response.data;
  } catch (error) {
    return null;
  }
}
