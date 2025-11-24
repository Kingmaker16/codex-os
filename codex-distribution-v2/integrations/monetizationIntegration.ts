import { Platform } from "../types.js";
import { CONFIG } from "../config.js";
import axios from "axios";

export async function estimateRevenue(
  contentId: string,
  platform: Platform,
  estimatedViews: number
): Promise<{ revenue: number; cpm: number }> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.OPS}/ops/revenue-estimate`, {
      contentId,
      platform,
      estimatedViews
    }, { timeout: 5000 });

    return {
      revenue: response.data.revenue || 0,
      cpm: response.data.cpm || 0
    };
  } catch (error) {
    console.error("Failed to estimate revenue:", error);
    return { revenue: 0, cpm: 0 };
  }
}

export async function trackMonetization(
  slotId: string,
  platform: Platform,
  actualViews: number
): Promise<void> {
  try {
    await axios.post(`${CONFIG.SERVICES.OPS}/ops/track-monetization`, {
      slotId,
      platform,
      actualViews,
      timestamp: new Date().toISOString()
    }, { timeout: 3000 });
  } catch (error) {
    console.error("Failed to track monetization:", error);
  }
}
