// Codex Monetization Engine v1 - Router

import type { FastifyInstance } from "fastify";
import { revenueCollector } from "./revenueCollector.js";
import { revenuePredictor } from "./revenuePredictor.js";
import { revenueMapper } from "./revenueMapper.js";
import { revenueAggregator } from "./revenueAggregator.js";
import { costTracker } from "./costTracker.js";
import { riskModel } from "./riskModel.js";

export async function registerRoutes(fastify: FastifyInstance) {
  /**
   * GET /monetization/health
   * Health check endpoint
   */
  fastify.get("/monetization/health", async () => {
    return {
      service: "codex-monetization",
      version: "1.0.0",
      status: "healthy",
      timestamp: new Date().toISOString(),
      stats: {
        revenueEntries: revenueCollector.count(),
        costEntries: costTracker.count(),
        mappings: revenueMapper.getSummary().totalMappings,
      },
    };
  });

  /**
   * GET /monetization/summary
   * Overall revenue + cost summary
   */
  fastify.get("/monetization/summary", async () => {
    const totalRevenue = revenueCollector.getTotalRevenue();
    const totalCosts = costTracker.getTotalCosts();
    const monthlyRecurringCosts = costTracker.calculateMonthlyRecurringCosts();
    const profit = totalRevenue - totalCosts;
    const revenueByVertical = revenueCollector.getSummaryByVertical();
    const costsByCategory = costTracker.getSummaryByCategory();
    const mapperSummary = revenueMapper.getSummary();

    return {
      revenue: {
        total: totalRevenue,
        byVertical: revenueByVertical,
        transactionCount: revenueCollector.count(),
      },
      costs: {
        total: totalCosts,
        byCategory: costsByCategory,
        monthlyRecurring: monthlyRecurringCosts,
      },
      profit: {
        total: profit,
        margin: totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0,
      },
      content: {
        totalMappings: mapperSummary.totalMappings,
        averageRPM: mapperSummary.averageRPM,
        actionBreakdown: mapperSummary.actionBreakdown,
      },
      timestamp: new Date().toISOString(),
    };
  });

  /**
   * GET /monetization/byDomain
   * Revenue breakdown by vertical with aggregation
   */
  fastify.get("/monetization/byDomain", async (request) => {
    const query = request.query as { period?: "daily" | "weekly" | "monthly" };
    const period = query.period || "daily";

    const entries = revenueCollector.getAll();
    const aggregated = 
      period === "daily" 
        ? revenueAggregator.aggregateDaily(entries)
        : period === "weekly"
        ? revenueAggregator.aggregateWeekly(entries)
        : revenueAggregator.aggregateMonthly(entries);

    const revenueByVertical = revenueCollector.getSummaryByVertical();
    const revenueByPlatform = revenueCollector.getSummaryByPlatform();

    return {
      period,
      aggregated,
      byVertical: revenueByVertical,
      byPlatform: revenueByPlatform,
      timestamp: new Date().toISOString(),
    };
  });

  /**
   * GET /monetization/forecast
   * Revenue forecasts (daily/weekly/monthly)
   */
  fastify.get("/monetization/forecast", async (request) => {
    const query = request.query as { period?: "daily" | "weekly" | "monthly"; vertical?: string };
    const period = query.period || "daily";
    const vertical = query.vertical;

    const entries = revenueCollector.getAll();

    if (entries.length < 7) {
      return {
        error: "Insufficient data",
        message: "Need at least 7 days of data for forecasting",
        currentDataPoints: entries.length,
      };
    }

    const forecasts = vertical
      ? { [vertical]: revenuePredictor.forecast(entries, period, vertical as any) }
      : revenuePredictor.forecastAll(entries, period);

    return {
      period,
      forecasts,
      dataPoints: entries.length,
      timestamp: new Date().toISOString(),
    };
  });

  /**
   * POST /monetization/recordRevenue
   * Add revenue entry
   */
  fastify.post("/monetization/recordRevenue", async (request) => {
    const body = request.body as {
      vertical: string;
      platform: string;
      amount: number;
      currency?: string;
      contentId?: string;
      campaignId?: string;
      metadata?: Record<string, any>;
    };

    if (!body.vertical || !body.platform || typeof body.amount !== "number") {
      return {
        success: false,
        error: "Missing required fields: vertical, platform, amount",
      };
    }

    const entry = revenueCollector.record({
      vertical: body.vertical as any,
      platform: body.platform,
      amount: body.amount,
      currency: body.currency || "USD",
      contentId: body.contentId,
      campaignId: body.campaignId,
      metadata: body.metadata,
    });

    return {
      success: true,
      entry: {
        id: entry.id,
        timestamp: entry.timestamp,
        vertical: entry.vertical,
        platform: entry.platform,
        amount: entry.amount,
      },
    };
  });

  /**
   * POST /monetization/recordCost
   * Add cost entry
   */
  fastify.post("/monetization/recordCost", async (request) => {
    const body = request.body as {
      category: string;
      description: string;
      amount: number;
      currency?: string;
      vendor?: string;
      recurring?: boolean;
      billingCycle?: string;
      metadata?: Record<string, any>;
    };

    if (!body.category || !body.description || typeof body.amount !== "number") {
      return {
        success: false,
        error: "Missing required fields: category, description, amount",
      };
    }

    const entry = costTracker.record({
      category: body.category as any,
      description: body.description,
      amount: body.amount,
      currency: body.currency || "USD",
      vendor: body.vendor,
      recurring: body.recurring || false,
      billingCycle: body.billingCycle as any,
      metadata: body.metadata,
    });

    return {
      success: true,
      entry: {
        id: entry.id,
        timestamp: entry.timestamp,
        category: entry.category,
        description: entry.description,
        amount: entry.amount,
      },
    };
  });

  /**
   * GET /monetization/risks
   * Get risk assessments
   */
  fastify.get("/monetization/risks", async () => {
    const criticalRisks = riskModel.getCriticalRisks();
    const recentAssessments = riskModel.getRecentAssessments(20);

    return {
      critical: criticalRisks,
      recent: recentAssessments,
      timestamp: new Date().toISOString(),
    };
  });

  /**
   * GET /monetization/content
   * Get content performance and recommendations
   */
  fastify.get("/monetization/content", async (request) => {
    const query = request.query as { action?: string };
    const action = query.action;

    if (action) {
      const mappings = revenueMapper.getMappingsByAction(action as any);
      return {
        action,
        content: mappings,
        count: mappings.length,
        timestamp: new Date().toISOString(),
      };
    }

    const topPerformers = revenueMapper.getTopPerformers(20);
    const contentToScale = revenueMapper.getContentToScale();
    const summary = revenueMapper.getSummary();

    return {
      topPerformers,
      contentToScale,
      summary,
      timestamp: new Date().toISOString(),
    };
  });
}
