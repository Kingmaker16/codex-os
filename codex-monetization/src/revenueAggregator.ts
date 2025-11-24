// Codex Monetization Engine v1 - Revenue Aggregator

import type { RevenueEntry, RevenueVertical } from "./revenueCollector.js";

export interface AggregatedRevenue {
  period: "daily" | "weekly" | "monthly";
  startDate: Date;
  endDate: Date;
  byVertical: Record<RevenueVertical, number>;
  byPlatform: Record<string, number>;
  total: number;
  transactionCount: number;
  averageTransaction: number;
}

export class RevenueAggregator {
  /**
   * Aggregate revenue by day
   */
  aggregateDaily(entries: RevenueEntry[], daysAgo: number = 0): AggregatedRevenue {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    return this.aggregate(entries, startOfDay, endOfDay, "daily");
  }

  /**
   * Aggregate revenue by week
   */
  aggregateWeekly(entries: RevenueEntry[], weeksAgo: number = 0): AggregatedRevenue {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek - weeksAgo * 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return this.aggregate(entries, startOfWeek, endOfWeek, "weekly");
  }

  /**
   * Aggregate revenue by month
   */
  aggregateMonthly(entries: RevenueEntry[], monthsAgo: number = 0): AggregatedRevenue {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() - monthsAgo;

    const startOfMonth = new Date(year, month, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    return this.aggregate(entries, startOfMonth, endOfMonth, "monthly");
  }

  /**
   * Core aggregation logic
   */
  private aggregate(
    entries: RevenueEntry[],
    startDate: Date,
    endDate: Date,
    period: "daily" | "weekly" | "monthly"
  ): AggregatedRevenue {
    // Filter entries in date range
    const filtered = entries.filter(
      (e) => e.timestamp >= startDate && e.timestamp <= endDate
    );

    // Aggregate by vertical
    const byVertical: Record<RevenueVertical, number> = {
      social: 0,
      ecom: 0,
      trading: 0,
      roulette: 0,
      other: 0,
    };

    // Aggregate by platform
    const byPlatform: Record<string, number> = {};

    let total = 0;

    filtered.forEach((e) => {
      byVertical[e.vertical] += e.amount;
      
      if (!byPlatform[e.platform]) {
        byPlatform[e.platform] = 0;
      }
      byPlatform[e.platform] += e.amount;
      
      total += e.amount;
    });

    const transactionCount = filtered.length;
    const averageTransaction = transactionCount > 0 ? total / transactionCount : 0;

    return {
      period,
      startDate,
      endDate,
      byVertical,
      byPlatform,
      total,
      transactionCount,
      averageTransaction,
    };
  }

  /**
   * Get revenue trend over multiple periods
   */
  getTrend(
    entries: RevenueEntry[],
    period: "daily" | "weekly" | "monthly",
    periods: number = 7
  ): AggregatedRevenue[] {
    const trend: AggregatedRevenue[] = [];

    for (let i = periods - 1; i >= 0; i--) {
      switch (period) {
        case "daily":
          trend.push(this.aggregateDaily(entries, i));
          break;
        case "weekly":
          trend.push(this.aggregateWeekly(entries, i));
          break;
        case "monthly":
          trend.push(this.aggregateMonthly(entries, i));
          break;
      }
    }

    return trend;
  }

  /**
   * Compare two periods
   */
  comparePeriods(current: AggregatedRevenue, previous: AggregatedRevenue): {
    totalChange: number;
    totalChangePercent: number;
    verticalChanges: Record<RevenueVertical, number>;
    transactionCountChange: number;
  } {
    const totalChange = current.total - previous.total;
    const totalChangePercent =
      previous.total > 0 ? (totalChange / previous.total) * 100 : 0;

    const verticalChanges: Record<RevenueVertical, number> = {
      social: current.byVertical.social - previous.byVertical.social,
      ecom: current.byVertical.ecom - previous.byVertical.ecom,
      trading: current.byVertical.trading - previous.byVertical.trading,
      roulette: current.byVertical.roulette - previous.byVertical.roulette,
      other: current.byVertical.other - previous.byVertical.other,
    };

    const transactionCountChange = current.transactionCount - previous.transactionCount;

    return {
      totalChange,
      totalChangePercent,
      verticalChanges,
      transactionCountChange,
    };
  }
}

// Singleton instance
export const revenueAggregator = new RevenueAggregator();
