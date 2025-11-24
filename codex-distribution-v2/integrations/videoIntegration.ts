import { CONFIG } from "../config.js";
import axios from "axios";

export async function processVideo(
  videoId: string,
  platform: string
): Promise<{ processed: boolean; outputUrl?: string }> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.VIDEO}/video/process`, {
      videoId,
      platform
    }, { timeout: CONFIG.TIMEOUTS.REPURPOSE });

    return {
      processed: response.data.success || false,
      outputUrl: response.data.outputUrl
    };
  } catch (error) {
    console.error("Video processing failed:", error);
    return { processed: false };
  }
}

export async function getVideoMetadata(
  videoId: string
): Promise<{ duration: number; format: string; resolution: string }> {
  try {
    const response = await axios.get(`${CONFIG.SERVICES.VIDEO}/video/${videoId}/metadata`, {
      timeout: 5000
    });

    return response.data.metadata || { duration: 0, format: "mp4", resolution: "1080p" };
  } catch (error) {
    console.error("Failed to get video metadata:", error);
    return { duration: 0, format: "mp4", resolution: "1080p" };
  }
}

export async function generateThumbnail(
  videoId: string,
  timestamp: number
): Promise<{ thumbnailUrl?: string }> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.VIDEO}/video/thumbnail`, {
      videoId,
      timestamp
    }, { timeout: 10000 });

    return { thumbnailUrl: response.data.thumbnailUrl };
  } catch (error) {
    console.error("Failed to generate thumbnail:", error);
    return {};
  }
}
