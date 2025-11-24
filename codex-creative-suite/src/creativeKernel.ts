// creativeKernel.ts - Performance Learning Engine

import type { PerformanceMetrics, LearningFeedback, CreativePlan } from "./types.js";

export class CreativeKernel {
  private performanceHistory: Map<string, PerformanceMetrics[]> = new Map();
  private learnings: Map<string, LearningFeedback> = new Map();

  /**
   * Record performance metrics for a creative
   */
  recordPerformance(creativeId: string, metrics: PerformanceMetrics): void {
    console.log(`[CreativeKernel] Recording metrics for ${creativeId}`);

    const history = this.performanceHistory.get(creativeId) || [];
    history.push(metrics);
    this.performanceHistory.set(creativeId, history);

    // Analyze and generate learning feedback
    const feedback = this.analyzePerformance(creativeId, metrics);
    this.learnings.set(creativeId, feedback);
  }

  /**
   * Get learning feedback for a creative
   */
  getLearningFeedback(creativeId: string): LearningFeedback | null {
    return this.learnings.get(creativeId) || null;
  }

  /**
   * Get performance insights across all creatives
   */
  getGlobalInsights(platform?: string): string[] {
    const insights: string[] = [];
    const allMetrics: PerformanceMetrics[] = [];

    for (const history of this.performanceHistory.values()) {
      allMetrics.push(
        ...history.filter((m) => !platform || m.platform === platform)
      );
    }

    if (allMetrics.length === 0) {
      return ["Insufficient data for insights"];
    }

    // Calculate averages
    const avgCTR =
      allMetrics.reduce((sum, m) => sum + m.ctr, 0) / allMetrics.length;
    const avgCompletion =
      allMetrics.reduce((sum, m) => sum + m.completionRate, 0) / allMetrics.length;
    const avgEngagement =
      allMetrics.reduce((sum, m) => sum + m.engagement, 0) / allMetrics.length;

    insights.push(`Average CTR: ${(avgCTR * 100).toFixed(2)}%`);
    insights.push(
      `Average Completion Rate: ${(avgCompletion * 100).toFixed(1)}%`
    );
    insights.push(`Average Engagement: ${avgEngagement.toFixed(0)} interactions`);

    // Identify top performers
    const topPerformers = allMetrics
      .sort((a, b) => b.ctr - a.ctr)
      .slice(0, 3);

    if (topPerformers.length > 0) {
      insights.push(
        `Top CTR: ${(topPerformers[0].ctr * 100).toFixed(2)}% (${topPerformers[0].creativeId})`
      );
    }

    return insights;
  }

  /**
   * Optimize creative plan based on historical performance
   */
  optimizePlan(plan: CreativePlan, platform: string): CreativePlan {
    console.log(`[CreativeKernel] Optimizing plan for ${platform}`);

    const insights = this.getGlobalInsights(platform);

    // Apply learned optimizations
    const optimized = { ...plan };

    // Adjust pacing based on completion rates
    const avgCompletion = this.getAverageMetric(platform, "completionRate");
    if (avgCompletion < 0.5) {
      // Low completion rate - optimize for retention
      optimized.pacingPlan.segments = optimized.pacingPlan.segments.map((seg) => {
        if (seg.type === "hook") {
          return { ...seg, intensity: 1.0, cutFrequency: 2.5 }; // More intense hook
        }
        return seg;
      });

      optimized.emotionalBeats.push({
        timestamp: 5.0,
        emotion: "curiosity",
        intensity: 0.95,
        trigger: "Retention optimization",
      });
    }

    // Optimize CTAs based on engagement
    const avgEngagement = this.getAverageMetric(platform, "engagement");
    if (avgEngagement < 100) {
      optimized.ctaSuggestions.unshift(
        "Comment below 👇",
        "Save this for later 🔖",
        "Share with a friend 📤"
      );
    }

    console.log(`[CreativeKernel] Plan optimized with ${insights.length} insights`);
    return optimized;
  }

  /**
   * Analyze performance and generate feedback
   */
  private analyzePerformance(
    creativeId: string,
    metrics: PerformanceMetrics
  ): LearningFeedback {
    const insights: string[] = [];
    const recommendations: string[] = [];

    // CTR analysis
    if (metrics.ctr > 0.1) {
      insights.push("Excellent CTR - thumbnail and hook are highly effective");
    } else if (metrics.ctr < 0.03) {
      insights.push("Low CTR - thumbnail or hook needs improvement");
      recommendations.push("Test more eye-catching thumbnail concepts");
      recommendations.push("Use stronger emotional hooks in first 3 seconds");
    }

    // Completion rate analysis
    if (metrics.completionRate > 0.7) {
      insights.push("Strong completion rate - content maintains attention");
    } else if (metrics.completionRate < 0.4) {
      insights.push("Low completion rate - losing viewers mid-content");
      recommendations.push("Increase pacing and cut frequency");
      recommendations.push("Add emotional beats every 5-10 seconds");
      recommendations.push("Front-load most valuable content");
    }

    // Engagement analysis
    const engagementRate = metrics.engagement / metrics.views;
    if (engagementRate > 0.1) {
      insights.push("High engagement rate - audience is actively responding");
    } else if (engagementRate < 0.02) {
      insights.push("Low engagement - weak call-to-action");
      recommendations.push("Add clearer CTAs throughout content");
      recommendations.push("Ask questions to encourage comments");
      recommendations.push("Create controversy or debate points");
    }

    // Conversion analysis (if available)
    if (metrics.conversions !== undefined) {
      const conversionRate = metrics.conversions / metrics.views;
      if (conversionRate > 0.05) {
        insights.push("Strong conversion rate - effective sales funnel");
      } else if (conversionRate < 0.01) {
        insights.push("Low conversion rate - CTA or offer needs work");
        recommendations.push("Strengthen value proposition");
        recommendations.push("Reduce friction in conversion process");
      }
    }

    // Calculate confidence based on sample size
    const confidence = Math.min(1.0, Math.log10(metrics.views) / 4);

    return {
      creativeId,
      metrics,
      insights,
      recommendations,
      confidence,
    };
  }

  /**
   * Get average metric value across platform
   */
  private getAverageMetric(
    platform: string,
    metricKey: keyof PerformanceMetrics
  ): number {
    const allMetrics: PerformanceMetrics[] = [];

    for (const history of this.performanceHistory.values()) {
      allMetrics.push(...history.filter((m) => m.platform === platform));
    }

    if (allMetrics.length === 0) return 0.5; // Default middle value

    const sum = allMetrics.reduce((s, m) => {
      const value = m[metricKey];
      return s + (typeof value === "number" ? value : 0);
    }, 0);

    return sum / allMetrics.length;
  }

  /**
   * Get top performing hooks for platform
   */
  getTopHooks(platform: string, limit: number = 5): string[] {
    // In production, this would query historical data
    // For now, return curated high-performing hooks
    const topHooks: Record<string, string[]> = {
      tiktok: [
        "Stop scrolling right now",
        "I can't believe this works",
        "POV: You just discovered",
        "This changed my life in",
        "Nobody talks about this",
      ],
      reels: [
        "The secret nobody tells you",
        "This is actually insane",
        "Wait for the end",
        "How is this even possible",
        "You're doing it wrong",
      ],
      youtube: [
        "Everything you know is wrong about",
        "The truth about",
        "I tested this for 30 days",
        "This will save you hours",
        "The ultimate guide to",
      ],
      shorts: [
        "This one trick",
        "Before vs After",
        "Day 1 vs Day 30",
        "Watch this transformation",
        "The results are shocking",
      ],
    };

    return topHooks[platform]?.slice(0, limit) || topHooks["tiktok"].slice(0, limit);
  }

  /**
   * Get recommended hashtags for platform
   */
  getRecommendedHashtags(platform: string, niche?: string): string[] {
    const universal = ["#viral", "#fyp", "#trending", "#explore"];
    const platformSpecific: Record<string, string[]> = {
      tiktok: ["#foryou", "#tiktok", "#foryoupage"],
      reels: ["#reels", "#reelsinstagram", "#instagram"],
      youtube: ["#shorts", "#youtube", "#subscribe"],
    };

    return [...universal, ...(platformSpecific[platform] || [])];
  }

  /**
   * Clear performance history (for testing)
   */
  clearHistory(): void {
    this.performanceHistory.clear();
    this.learnings.clear();
    console.log("[CreativeKernel] Performance history cleared");
  }
}
