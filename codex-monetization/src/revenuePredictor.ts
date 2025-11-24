// Codex Monetization Engine v1 - Revenue Predictor

import type { RevenueEntry, RevenueVertical } from "./revenueCollector.js";

export interface RevenueForecast {
  period: "daily" | "weekly" | "monthly";
  vertical: RevenueVertical | "all";
  currentRevenue: number;
  projectedRevenue: number;
  growthRate: number; // Percentage
  confidence: number; // 0-1
  baselineRPM?: number; // Revenue per mille (1000 views)
  estimatedLTV?: number; // Lifetime value per customer
  timestamp: Date;
}

export class RevenuePredictor {
  /**
   * Forecast revenue based on historical data
   */
  forecast(
    entries: RevenueEntry[],
    period: "daily" | "weekly" | "monthly",
    vertical?: RevenueVertical
  ): RevenueForecast {
    // Filter by vertical if specified
    const filtered = vertical
      ? entries.filter((e) => e.vertical === vertical)
      : entries;

    if (filtered.length < 7) {
      // Need at least 7 days of data
      return this.emptyForecast(period, vertical || "all");
    }

    // Calculate current revenue (last period)
    const currentRevenue = this.calculatePeriodRevenue(filtered, period, 0);

    // Calculate historical average
    const historicalAverage = this.calculatePeriodRevenue(filtered, period, 1);

    // Calculate growth rate
    const growthRate =
      historicalAverage > 0
        ? ((currentRevenue - historicalAverage) / historicalAverage) * 100
        : 0;

    // Project next period revenue
    const projectedRevenue = currentRevenue * (1 + growthRate / 100);

    // Calculate confidence based on data consistency
    const confidence = this.calculateConfidence(filtered, period);

    return {
      period,
      vertical: vertical || "all",
      currentRevenue,
      projectedRevenue,
      growthRate,
      confidence,
      timestamp: new Date(),
    };
  }

  /**
   * Calculate RPM (Revenue Per Mille)
   */
  calculateRPM(revenue: number, views: number): number {
    if (views === 0) return 0;
    return (revenue / views) * 1000;
  }

  /**
   * Estimate LTV (Lifetime Value)
   */
  estimateLTV(
    averageOrderValue: number,
    purchaseFrequency: number,
    customerLifespan: number
  ): number {
    return averageOrderValue * purchaseFrequency * customerLifespan;
  }

  /**
   * Calculate revenue for a specific period
   */
  private calculatePeriodRevenue(
    entries: RevenueEntry[],
    period: "daily" | "weekly" | "monthly",
    periodsAgo: number
  ): number {
    const now = new Date();
    const periodMs = this.getPeriodMs(period);
    const startTime = now.getTime() - periodMs * (periodsAgo + 1);
    const endTime = now.getTime() - periodMs * periodsAgo;

    return entries
      .filter((e) => {
        const time = e.timestamp.getTime();
        return time >= startTime && time < endTime;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }

  /**
   * Get period in milliseconds
   */
  private getPeriodMs(period: "daily" | "weekly" | "monthly"): number {
    switch (period) {
      case "daily":
        return 24 * 60 * 60 * 1000;
      case "weekly":
        return 7 * 24 * 60 * 60 * 1000;
      case "monthly":
        return 30 * 24 * 60 * 60 * 1000;
    }
  }

  /**
   * Calculate confidence score based on data consistency
   */
  private calculateConfidence(
    entries: RevenueEntry[],
    period: "daily" | "weekly" | "monthly"
  ): number {
    if (entries.length < 14) return 0.3; // Low confidence with < 2 weeks data

    // Calculate variance in daily revenue
    const dailyRevenues: number[] = [];
    const periodMs = 24 * 60 * 60 * 1000; // 1 day

    for (let i = 0; i < 14; i++) {
      const revenue = this.calculatePeriodRevenue(entries, "daily", i);
      dailyRevenues.push(revenue);
    }

    const mean = dailyRevenues.reduce((a, b) => a + b, 0) / dailyRevenues.length;
    const variance =
      dailyRevenues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      dailyRevenues.length;
    const stdDev = Math.sqrt(variance);

    // Lower variance = higher confidence
    const coefficientOfVariation = mean > 0 ? stdDev / mean : 1;
    const confidence = Math.max(0.1, Math.min(1.0, 1 - coefficientOfVariation));

    return Math.round(confidence * 100) / 100;
  }

  /**
   * Empty forecast when insufficient data
   */
  private emptyForecast(
    period: "daily" | "weekly" | "monthly",
    vertical: RevenueVertical | "all"
  ): RevenueForecast {
    return {
      period,
      vertical,
      currentRevenue: 0,
      projectedRevenue: 0,
      growthRate: 0,
      confidence: 0,
      timestamp: new Date(),
    };
  }

  /**
   * Generate forecast for all verticals
   */
  forecastAll(
    entries: RevenueEntry[],
    period: "daily" | "weekly" | "monthly"
  ): Record<RevenueVertical | "all", RevenueForecast> {
    return {
      all: this.forecast(entries, period),
      social: this.forecast(entries, period, "social"),
      ecom: this.forecast(entries, period, "ecom"),
      trading: this.forecast(entries, period, "trading"),
      roulette: this.forecast(entries, period, "roulette"),
      other: this.forecast(entries, period, "other"),
    };
  }
}

// Singleton instance
export const revenuePredictor = new RevenuePredictor();
