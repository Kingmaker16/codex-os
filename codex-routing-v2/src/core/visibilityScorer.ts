// Content Routing Engine v2 ULTRA - Visibility Scorer

import axios from 'axios';
import { CONFIG } from '../config.js';
import type { Platform, Content } from '../types.js';

export async function scoreVisibility(content: Content, platform: Platform): Promise<number> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.VISIBILITY}/visibility/predict`, {
      contentId: content.id,
      platform,
      contentType: content.type,
      language: content.language,
      metadata: content.metadata
    }, { timeout: 3000 });

    const visibilityScore = response.data.score || response.data.predictedReach || 0;
    return Math.max(0, Math.min(1, visibilityScore));
  } catch (error) {
    console.warn(`[VisibilityScorer] Failed to score visibility for ${platform}:`, error);
    return 0.5; // Neutral score on failure
  }
}

export async function getPlatformReach(platform: Platform, accountId?: string): Promise<number> {
  try {
    const response = await axios.get(`${CONFIG.SERVICES.VISIBILITY}/visibility/reach`, {
      params: { platform, accountId },
      timeout: 3000
    });
    return response.data.reach || 0;
  } catch (error) {
    console.warn(`[VisibilityScorer] Failed to get platform reach:`, error);
    return 0;
  }
}

export function calculateVisibilityPotential(
  baseScore: number,
  platformReach: number,
  contentQuality: number = 0.7
): number {
  // Weighted combination of base visibility score, reach, and quality
  const weights = { base: 0.5, reach: 0.3, quality: 0.2 };
  const normalizedReach = Math.min(1, platformReach / 100000); // Normalize to 0-1
  
  return (
    baseScore * weights.base +
    normalizedReach * weights.reach +
    contentQuality * weights.quality
  );
}
