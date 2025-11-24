import { Platform, PublishRequest, PublishResult } from "../types.js";
import { CONFIG } from "../config.js";
import axios from "axios";

export async function publishToSocial(request: PublishRequest): Promise<PublishResult> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.SOCIAL}/social/publish`, {
      contentId: request.contentId,
      platform: request.platform,
      accountId: request.accountId,
      simulate: request.simulate || false
    }, { timeout: CONFIG.TIMEOUTS.PUBLISH });

    return {
      slotId: request.slotId,
      success: response.data.success || false,
      publishedUrl: response.data.url,
      timestamp: new Date().toISOString(),
      metrics: response.data.metrics
    };
  } catch (error: any) {
    return {
      slotId: request.slotId,
      success: false,
      error: error.message || "Publish failed",
      timestamp: new Date().toISOString()
    };
  }
}

export async function getSocialMetrics(
  platform: Platform,
  contentId: string
): Promise<{ views: number; likes: number; shares: number }> {
  try {
    const response = await axios.get(`${CONFIG.SERVICES.SOCIAL}/social/metrics`, {
      params: { platform, contentId },
      timeout: 5000
    });

    return response.data.metrics || { views: 0, likes: 0, shares: 0 };
  } catch (error) {
    console.error("Failed to get social metrics:", error);
    return { views: 0, likes: 0, shares: 0 };
  }
}

export async function validateSocialConnection(
  platform: Platform,
  accountId: string
): Promise<{ connected: boolean; reason?: string }> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.SOCIAL}/social/validate`, {
      platform,
      accountId
    }, { timeout: 5000 });

    return {
      connected: response.data.connected || false,
      reason: response.data.reason
    };
  } catch (error) {
    console.error("Failed to validate social connection:", error);
    return { connected: false, reason: "Validation failed" };
  }
}
