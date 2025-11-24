import { Platform, Content } from "../types.js";
import { CONFIG } from "../config.js";
import axios from "axios";

export async function scoreContentVisibility(
  contentId: string,
  platforms: Platform[]
): Promise<Record<Platform, number>> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.VISIBILITY}/visibility/score`, {
      contentId,
      platforms
    }, { timeout: 10000 });

    return response.data.scores || {};
  } catch (error) {
    console.error("Failed to score content visibility:", error);
    const defaultScores: any = {};
    platforms.forEach(p => defaultScores[p] = 0.5);
    return defaultScores;
  }
}

export async function predictReach(
  contentId: string,
  platform: Platform
): Promise<{ estimatedReach: number; confidence: number }> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.VISIBILITY}/visibility/predict`, {
      contentId,
      platform
    }, { timeout: 10000 });

    return {
      estimatedReach: response.data.reach || 0,
      confidence: response.data.confidence || 0
    };
  } catch (error) {
    console.error("Failed to predict reach:", error);
    return { estimatedReach: 0, confidence: 0 };
  }
}

export async function getVisibilityInsights(
  contentId: string
): Promise<{ insights: string[]; recommendations: string[] }> {
  try {
    const response = await axios.get(`${CONFIG.SERVICES.VISIBILITY}/visibility/insights/${contentId}`, {
      timeout: 5000
    });

    return {
      insights: response.data.insights || [],
      recommendations: response.data.recommendations || []
    };
  } catch (error) {
    console.error("Failed to get visibility insights:", error);
    return { insights: [], recommendations: [] };
  }
}
