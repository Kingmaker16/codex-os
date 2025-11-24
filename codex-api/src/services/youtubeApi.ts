// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Codex API - YouTube Studio Upload (OAuth 2.0)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import axios from "axios";
import { PLATFORM_ENDPOINTS } from "../config.js";
import { getValidToken } from "./tokenManager.js";
import { checkRateLimit } from "./rateLimitGuard.js";
import type { UploadRequest, UploadResponse } from "../types.js";

/**
 * Upload video to YouTube using YouTube Data API v3
 */
export async function uploadToYouTube(
  request: UploadRequest
): Promise<UploadResponse> {
  const { sessionId, accountId, title, description, tags, metadata } = request;
  
  // Check rate limit
  const rateLimit = checkRateLimit("youtube", accountId);
  if (!rateLimit.allowed) {
    return {
      ok: false,
      sessionId,
      platform: "youtube",
      status: "failed",
      error: `Rate limit exceeded. Try again after ${new Date(rateLimit.resetAt).toISOString()}`,
    };
  }
  
  // Get valid access token
  const accessToken = await getValidToken("youtube", accountId || "default");
  if (!accessToken) {
    return {
      ok: false,
      sessionId,
      platform: "youtube",
      status: "failed",
      error: "No valid access token found. Please authenticate first.",
    };
  }
  
  try {
    // Upload video metadata
    const response = await axios.post(
      `${PLATFORM_ENDPOINTS.youtube}/videos?part=snippet,status`,
      {
        snippet: {
          title: title || "Uploaded via Codex API",
          description: description || "",
          tags: tags || [],
          categoryId: metadata?.categoryId || "22", // People & Blogs
        },
        status: {
          privacyStatus: metadata?.privacyStatus || "private",
          selfDeclaredMadeForKids: metadata?.madeForKids || false,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    const videoId = response.data.id;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    return {
      ok: true,
      sessionId,
      platform: "youtube",
      uploadId: videoId,
      url: videoUrl,
      status: "success",
      message: "Video uploaded successfully to YouTube",
    };
  } catch (error: any) {
    return {
      ok: false,
      sessionId,
      platform: "youtube",
      status: "failed",
      error: error.response?.data?.error?.message || error.message,
    };
  }
}

/**
 * Get YouTube video details
 */
export async function getYouTubeVideoDetails(
  videoId: string,
  accountId: string
): Promise<any> {
  const accessToken = await getValidToken("youtube", accountId);
  
  if (!accessToken) {
    return null;
  }
  
  try {
    const response = await axios.get(
      `${PLATFORM_ENDPOINTS.youtube}/videos?part=snippet,status,statistics&id=${videoId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    return response.data.items[0];
  } catch (error) {
    return null;
  }
}
