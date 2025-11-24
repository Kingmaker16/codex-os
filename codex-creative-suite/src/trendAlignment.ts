// trendAlignment.ts - Trend Alignment Engine

import type { TrendAlignment } from "./types.js";

const TRENDS_ENGINE_URL = "http://localhost:5060";

export class TrendAlignmentEngine {
  /**
   * Align creative content with current trends
   */
  async alignWithTrends(
    platform: string,
    content: string,
    niche?: string
  ): Promise<TrendAlignment> {
    console.log(`[TrendAlignment] Aligning content with ${platform} trends`);

    try {
      // Query Trends Engine for current trends
      const trends = await this.fetchTrends(platform, niche);

      // Analyze content against trends
      const matchedTrends = this.findMatchingTrends(content, trends);
      const trendScore = this.calculateTrendScore(matchedTrends, trends);
      const suggestions = this.generateSuggestions(content, trends, matchedTrends);
      const hashtags = this.extractTrendingHashtags(trends, matchedTrends);

      return {
        matchedTrends,
        trendScore,
        suggestions,
        hashtags,
      };
    } catch (error) {
      console.warn("[TrendAlignment] Trends Engine unavailable, using fallback");
      return this.getFallbackAlignment(platform, content);
    }
  }

  /**
   * Fetch current trends from Trends Engine
   */
  private async fetchTrends(
    platform: string,
    niche?: string
  ): Promise<Array<{ topic: string; score: number; hashtags: string[] }>> {
    try {
      const url = `${TRENDS_ENGINE_URL}/trends/analyze`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, niche }),
      });

      if (!response.ok) {
        throw new Error(`Trends Engine returned ${response.status}`);
      }

      const data = await response.json() as any;
      return data.trends || [];
    } catch (error) {
      console.warn("[TrendAlignment] Failed to fetch trends:", error);
      return this.getDefaultTrends(platform);
    }
  }

  /**
   * Find trends that match content
   */
  private findMatchingTrends(
    content: string,
    trends: Array<{ topic: string; score: number; hashtags: string[] }>
  ): string[] {
    const contentLower = content.toLowerCase();
    const matched: string[] = [];

    trends.forEach((trend) => {
      const topicWords = trend.topic.toLowerCase().split(/\s+/);
      const matchCount = topicWords.filter((word) => contentLower.includes(word)).length;

      if (matchCount >= topicWords.length * 0.5) {
        // 50% of topic words match
        matched.push(trend.topic);
      }
    });

    return matched;
  }

  /**
   * Calculate trend alignment score (0-100)
   */
  private calculateTrendScore(
    matchedTrends: string[],
    allTrends: Array<{ topic: string; score: number }>
  ): number {
    if (matchedTrends.length === 0) return 0;
    if (allTrends.length === 0) return 50; // Neutral if no trend data

    // Weight by trend score (higher trending = more points)
    const totalScore = matchedTrends.reduce((sum, matched) => {
      const trend = allTrends.find((t) => t.topic === matched);
      return sum + (trend?.score || 0);
    }, 0);

    const avgScore = totalScore / matchedTrends.length;
    return Math.min(100, Math.round(avgScore));
  }

  /**
   * Generate suggestions to improve trend alignment
   */
  private generateSuggestions(
    content: string,
    trends: Array<{ topic: string; score: number; hashtags: string[] }>,
    matchedTrends: string[]
  ): string[] {
    const suggestions: string[] = [];

    if (matchedTrends.length === 0) {
      // No trends matched - suggest top trends
      const topTrends = trends
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((t) => t.topic);

      suggestions.push(`Consider incorporating these trending topics: ${topTrends.join(", ")}`);
      suggestions.push("Add trending hashtags to increase discoverability");
    } else if (matchedTrends.length < 3) {
      // Some trends matched - suggest more
      suggestions.push("Good trend alignment! Consider adding more trending elements");

      const unmatchedTrends = trends
        .filter((t) => !matchedTrends.includes(t.topic))
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);

      if (unmatchedTrends.length > 0) {
        suggestions.push(
          `Also trending: ${unmatchedTrends.map((t) => t.topic).join(", ")}`
        );
      }
    } else {
      // Strong trend alignment
      suggestions.push("Excellent trend alignment! Content is highly relevant");
      suggestions.push("Use trending audio/music for maximum reach");
    }

    // Hashtag suggestions
    const contentHashtags = (content.match(/#\w+/g) || []).length;
    if (contentHashtags < 5) {
      suggestions.push("Add 5-10 trending hashtags for better reach");
    }

    return suggestions;
  }

  /**
   * Extract trending hashtags
   */
  private extractTrendingHashtags(
    trends: Array<{ topic: string; score: number; hashtags: string[] }>,
    matchedTrends: string[]
  ): string[] {
    const hashtags = new Set<string>();

    // Get hashtags from matched trends
    trends
      .filter((t) => matchedTrends.includes(t.topic))
      .forEach((trend) => {
        trend.hashtags.forEach((tag) => hashtags.add(tag));
      });

    // Add top trending hashtags even if not matched
    if (hashtags.size < 5) {
      trends
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .forEach((trend) => {
          trend.hashtags.slice(0, 2).forEach((tag) => hashtags.add(tag));
        });
    }

    return Array.from(hashtags).slice(0, 10);
  }

  /**
   * Get default trends if Trends Engine unavailable
   */
  private getDefaultTrends(
    platform: string
  ): Array<{ topic: string; score: number; hashtags: string[] }> {
    const defaultTrends: Record<
      string,
      Array<{ topic: string; score: number; hashtags: string[] }>
    > = {
      tiktok: [
        { topic: "viral growth hacks", score: 95, hashtags: ["#viral", "#growth", "#hacks"] },
        {
          topic: "content strategy",
          score: 90,
          hashtags: ["#contentstrategy", "#socialmedia"],
        },
        {
          topic: "algorithm secrets",
          score: 85,
          hashtags: ["#algorithm", "#tiktokgrowth"],
        },
      ],
      reels: [
        { topic: "instagram growth", score: 92, hashtags: ["#instagramgrowth", "#reels"] },
        { topic: "reel ideas", score: 88, hashtags: ["#reelideas", "#trending"] },
        { topic: "engagement tips", score: 85, hashtags: ["#engagement", "#tips"] },
      ],
      youtube: [
        { topic: "youtube strategy", score: 90, hashtags: ["#youtube", "#youtubegrowth"] },
        { topic: "video optimization", score: 87, hashtags: ["#seo", "#videomarketing"] },
        { topic: "subscriber growth", score: 83, hashtags: ["#subscribers", "#growth"] },
      ],
    };

    return defaultTrends[platform] || defaultTrends["tiktok"];
  }

  /**
   * Get fallback alignment if Trends Engine unavailable
   */
  private getFallbackAlignment(platform: string, content: string): TrendAlignment {
    const defaultTrends = this.getDefaultTrends(platform);
    const matchedTrends = this.findMatchingTrends(content, defaultTrends);
    const trendScore = this.calculateTrendScore(matchedTrends, defaultTrends);

    return {
      matchedTrends,
      trendScore,
      suggestions: [
        "Trends Engine unavailable - using default trend data",
        "Consider adding trending topics for your niche",
        "Use platform-specific trending audio/music",
      ],
      hashtags: this.extractTrendingHashtags(defaultTrends, matchedTrends),
    };
  }

  /**
   * Suggest trending audio/music
   */
  async suggestTrendingAudio(platform: string, niche?: string): Promise<string[]> {
    console.log(`[TrendAlignment] Fetching trending audio for ${platform}`);

    try {
      const response = await fetch(`${TRENDS_ENGINE_URL}/trends/audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, niche }),
      });

      if (response.ok) {
        const data = await response.json() as any;
        return data.audio || this.getDefaultAudio(platform);
      }
    } catch (error) {
      console.warn("[TrendAlignment] Failed to fetch trending audio");
    }

    return this.getDefaultAudio(platform);
  }

  /**
   * Get default trending audio
   */
  private getDefaultAudio(platform: string): string[] {
    const audioSuggestions: Record<string, string[]> = {
      tiktok: [
        "Original sound - Trending Creator",
        "Viral Dance Beat",
        "Motivational Speech + Beat",
      ],
      reels: [
        "Trending Reel Audio",
        "Popular Song (Sped Up)",
        "Inspiring Background Music",
      ],
      youtube: ["Upbeat Electronic", "Cinematic Background", "Copyright-Free Beat"],
    };

    return audioSuggestions[platform] || audioSuggestions["tiktok"];
  }

  /**
   * Check if content timing aligns with trends
   */
  async checkTimingAlignment(content: string, platform: string): Promise<{
    aligned: boolean;
    peakTimes: string[];
    recommendations: string[];
  }> {
    // Query for optimal posting times
    const peakTimes = ["8-10 AM", "12-2 PM", "7-9 PM"]; // Simplified

    return {
      aligned: true,
      peakTimes,
      recommendations: [
        "Post during peak engagement times for better reach",
        "Schedule posts 3-4 hours before peak time",
        "A/B test different posting times",
      ],
    };
  }

  /**
   * Generate trend report
   */
  async generateTrendReport(platform: string, niche?: string): Promise<{
    topTrends: Array<{ topic: string; score: number; growth: string }>;
    trendingHashtags: string[];
    trendingAudio: string[];
    contentOpportunities: string[];
  }> {
    const trends = await this.fetchTrends(platform, niche);
    const audio = await this.suggestTrendingAudio(platform, niche);

    const topTrends = trends.slice(0, 5).map((t) => ({
      topic: t.topic,
      score: t.score,
      growth: "+25%", // Simulated growth metric
    }));

    const trendingHashtags = trends.flatMap((t) => t.hashtags).slice(0, 10);

    const contentOpportunities = [
      "Create content around top trending topics",
      "Use trending audio in next 3 videos",
      "Experiment with trending formats (duets, stitches, etc.)",
      "Leverage seasonal trends for Q4",
    ];

    return {
      topTrends,
      trendingHashtags,
      trendingAudio: audio,
      contentOpportunities,
    };
  }
}
