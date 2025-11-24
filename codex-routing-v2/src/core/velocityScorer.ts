// Content Routing Engine v2 ULTRA - Velocity Scorer

import axios from 'axios';
import { CONFIG } from '../config.js';
import type { Platform, Content } from '../types.js';

export async function scoreVelocity(content: Content, platform: Platform): Promise<number> {
  try {
    // Get platform velocity profile from Distribution v2
    const response = await axios.get(`${CONFIG.SERVICES.DISTRIBUTION_V2}/distribution/velocity`, {
      params: { platform },
      timeout: 3000
    });

    const velocityProfile = response.data.profile || getDefaultVelocityProfile(platform);
    
    // Score based on current posting velocity and capacity
    const currentLoad = velocityProfile.currentPosts || 0;
    const maxCapacity = velocityProfile.maxPostsPerDay || 5;
    const optimalVelocity = velocityProfile.optimalPostsPerDay || 3;

    // Calculate velocity score (0-1)
    if (currentLoad >= maxCapacity) {
      return 0.2; // Platform saturated
    }

    const loadRatio = currentLoad / optimalVelocity;
    if (loadRatio < 0.5) {
      return 1.0; // Well below optimal, excellent opportunity
    } else if (loadRatio < 0.8) {
      return 0.9; // Good velocity
    } else if (loadRatio < 1.0) {
      return 0.7; // Approaching optimal
    } else {
      return 0.5 - ((loadRatio - 1.0) * 0.3); // Over optimal, decreasing score
    }
  } catch (error) {
    console.warn(`[VelocityScorer] Failed to score velocity for ${platform}:`, error);
    return 0.6; // Neutral score on failure
  }
}

function getDefaultVelocityProfile(platform: Platform) {
  const profiles = {
    tiktok: { maxPostsPerDay: 5, optimalPostsPerDay: 3, minGapHours: 4, currentPosts: 0 },
    youtube: { maxPostsPerDay: 2, optimalPostsPerDay: 1, minGapHours: 12, currentPosts: 0 },
    instagram: { maxPostsPerDay: 4, optimalPostsPerDay: 2, minGapHours: 6, currentPosts: 0 },
    twitter: { maxPostsPerDay: 8, optimalPostsPerDay: 5, minGapHours: 2, currentPosts: 0 },
    linkedin: { maxPostsPerDay: 2, optimalPostsPerDay: 1, minGapHours: 24, currentPosts: 0 }
  };
  return profiles[platform];
}

export function calculateOptimalPostingTime(platform: Platform): string {
  const platformConfig = CONFIG.PLATFORMS[platform];
  const peakHours = platformConfig?.peakHours || [12, 18];
  
  // Get current time
  const now = new Date();
  const currentHour = now.getHours();

  // Find next peak hour
  const nextPeakHour = peakHours.find(hour => hour > currentHour) || peakHours[0];
  
  const targetDate = new Date(now);
  if (nextPeakHour <= currentHour) {
    // Next peak is tomorrow
    targetDate.setDate(targetDate.getDate() + 1);
  }
  targetDate.setHours(nextPeakHour, 0, 0, 0);

  return targetDate.toISOString();
}

export function isPeakHour(platform: Platform, timestamp: Date): boolean {
  const platformConfig = CONFIG.PLATFORMS[platform];
  const peakHours = platformConfig?.peakHours || [];
  return peakHours.includes(timestamp.getHours());
}

export function boostPeakHourScore(baseScore: number, isPeak: boolean): number {
  return isPeak ? Math.min(1, baseScore * 1.2) : baseScore;
}
