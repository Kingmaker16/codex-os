// brainLogger.ts - Performance Logger with Learning

import type { PerformanceLog, EditAction } from "./types.js";

export class BrainLogger {
  private performanceLogs: PerformanceLog[] = [];
  private learningInsights = new Map<string, any>();

  /**
   * Log edit performance
   */
  logPerformance(log: PerformanceLog): void {
    console.log(`[BrainLogger] Logging performance for ${log.editId}`);

    this.performanceLogs.push({
      ...log,
      timestamp: new Date().toISOString(),
    });

    // Update learning insights
    this.updateLearningInsights(log);
  }

  /**
   * Get performance insights
   */
  getInsights(platform?: string): any {
    console.log(`[BrainLogger] Generating insights for ${platform || "all platforms"}`);

    const logs = platform
      ? this.performanceLogs.filter((l) => l.platform === platform)
      : this.performanceLogs;

    if (logs.length === 0) {
      return {
        totalEdits: 0,
        avgViews: 0,
        avgEngagement: 0,
        avgCTR: 0,
        avgCompletionRate: 0,
        topActions: [],
        recommendations: ["No performance data yet - log some edits first"],
      };
    }

    const avgViews = logs.reduce((sum, l) => sum + l.metrics.views, 0) / logs.length;
    const avgEngagement =
      logs.reduce((sum, l) => sum + l.metrics.engagement, 0) / logs.length;
    const avgCTR = logs.reduce((sum, l) => sum + l.metrics.ctr, 0) / logs.length;
    const avgCompletionRate =
      logs.reduce((sum, l) => sum + l.metrics.completionRate, 0) / logs.length;

    // Analyze top-performing action types
    const actionPerformance = this.analyzeActionPerformance(logs);
    const topActions = Object.entries(actionPerformance)
      .sort(([, a]: any, [, b]: any) => b.avgEngagement - a.avgEngagement)
      .slice(0, 5)
      .map(([type, stats]: any) => ({
        type,
        count: stats.count,
        avgEngagement: Math.round(stats.avgEngagement * 100) / 100,
      }));

    const recommendations = this.generateRecommendations(logs, actionPerformance);

    return {
      totalEdits: logs.length,
      avgViews: Math.round(avgViews),
      avgEngagement: Math.round(avgEngagement * 100) / 100,
      avgCTR: Math.round(avgCTR * 100) / 100,
      avgCompletionRate: Math.round(avgCompletionRate * 100) / 100,
      topActions,
      recommendations,
      platform: platform || "all",
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Analyze action performance
   */
  private analyzeActionPerformance(
    logs: PerformanceLog[]
  ): Record<string, any> {
    const performance: Record<string, any> = {};

    logs.forEach((log) => {
      log.appliedActions.forEach((action) => {
        if (!performance[action.type]) {
          performance[action.type] = {
            count: 0,
            totalEngagement: 0,
            totalViews: 0,
          };
        }

        performance[action.type].count++;
        performance[action.type].totalEngagement += log.metrics.engagement;
        performance[action.type].totalViews += log.metrics.views;
      });
    });

    // Calculate averages
    Object.keys(performance).forEach((type) => {
      const stats = performance[type];
      stats.avgEngagement = stats.totalEngagement / stats.count;
      stats.avgViews = stats.totalViews / stats.count;
    });

    return performance;
  }

  /**
   * Generate recommendations based on performance
   */
  private generateRecommendations(
    logs: PerformanceLog[],
    actionPerformance: Record<string, any>
  ): string[] {
    const recommendations: string[] = [];

    // Check completion rate
    const avgCompletion =
      logs.reduce((sum, l) => sum + l.metrics.completionRate, 0) / logs.length;

    if (avgCompletion < 0.5) {
      recommendations.push(
        "⚠️ Low completion rate (<50%) - focus on hook strength and pacing"
      );
    }

    // Check CTR
    const avgCTR = logs.reduce((sum, l) => sum + l.metrics.ctr, 0) / logs.length;
    if (avgCTR < 0.05) {
      recommendations.push(
        "📸 Low CTR (<5%) - improve thumbnail quality and text overlays"
      );
    }

    // Recommend top-performing actions
    const topAction = Object.entries(actionPerformance).sort(
      ([, a]: any, [, b]: any) => b.avgEngagement - a.avgEngagement
    )[0];

    if (topAction) {
      recommendations.push(
        `✅ Best performer: "${topAction[0]}" - use more frequently`
      );
    }

    // Check for underused high-impact actions
    const hookActions = logs.filter((l) =>
      l.appliedActions.some(
        (a) => a.type === "text_overlay" && a.timestamp <= 3
      )
    );

    if (hookActions.length < logs.length * 0.5) {
      recommendations.push(
        "🔥 Add text overlays in hook (0-3s) - proven to boost retention"
      );
    }

    if (recommendations.length === 0) {
      recommendations.push("✅ Performance looks good - keep optimizing");
    }

    return recommendations;
  }

  /**
   * Update learning insights
   */
  private updateLearningInsights(log: PerformanceLog): void {
    const key = `${log.platform}_${log.appliedActions.length}_actions`;

    if (!this.learningInsights.has(key)) {
      this.learningInsights.set(key, {
        count: 0,
        totalEngagement: 0,
        totalViews: 0,
      });
    }

    const insight = this.learningInsights.get(key);
    insight.count++;
    insight.totalEngagement += log.metrics.engagement;
    insight.totalViews += log.metrics.views;
  }

  /**
   * Get all performance logs
   */
  getAllLogs(): PerformanceLog[] {
    return [...this.performanceLogs];
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.performanceLogs = [];
    this.learningInsights.clear();
    console.log("[BrainLogger] Cleared all performance logs");
  }
}
