// Content Routing Engine v2 ULTRA - Trend Scorer

import axios from 'axios';
import { CONFIG } from '../config.js';
import type { Platform, Content } from '../types.js';

export async function scoreTrend(content: Content, platform: Platform): Promise<number> {
  try {
    const response = await axios.post(`${CONFIG.SERVICES.TRENDS}/trends/score`, {
      content: content.title + ' ' + (content.description || ''),
      platform,
      language: content.language
    }, { timeout: 3000 });

    const trendScore = response.data.score || 0;
    return Math.max(0, Math.min(1, trendScore)); // Clamp 0-1
  } catch (error) {
    console.warn(`[TrendScorer] Failed to score trend for ${platform}:`, error);
    return 0.5; // Neutral score on failure
  }
}

export async function getTrendingTopics(platform: Platform, language: string): Promise<string[]> {
  try {
    const response = await axios.get(`${CONFIG.SERVICES.TRENDS}/trends/topics`, {
      params: { platform, language, limit: 10 },
      timeout: 3000
    });
    return response.data.topics || [];
  } catch (error) {
    console.warn(`[TrendScorer] Failed to get trending topics:`, error);
    return [];
  }
}

export function calculateTrendAlignment(contentTopics: string[], trendingTopics: string[]): number {
  if (trendingTopics.length === 0) return 0.5;

  const matches = contentTopics.filter(topic => 
    trendingTopics.some(trending => 
      trending.toLowerCase().includes(topic.toLowerCase()) ||
      topic.toLowerCase().includes(trending.toLowerCase())
    )
  );

  return Math.min(1, matches.length / Math.max(contentTopics.length, 1));
}
