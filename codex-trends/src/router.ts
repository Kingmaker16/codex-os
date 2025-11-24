import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { TrendQuery } from "./types.js";
import { getTrends } from "./aggregator.js";
import { logTrends } from "./brainLogger.js";

export default async function router(app: FastifyInstance) {
  
  // Health check
  app.get("/health", async (req: FastifyRequest, reply: FastifyReply) => {
    return {
      ok: true,
      service: "codex-trends",
      version: "1.0.0",
      description: "Trend Engine - Multi-platform trend scanner"
    };
  });

  // Query trends from platforms
  app.post("/trends/query", async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = req.body as TrendQuery;
      
      // Validate input
      if (!query.sessionId || !query.platform || !query.niche) {
        reply.code(400);
        return {
          ok: false,
          error: "Missing required fields: sessionId, platform, niche"
        };
      }
      
      // Get trends
      const trendResponse = await getTrends(query);
      
      // Log to Brain
      await logTrends(trendResponse);
      
      return {
        ok: true,
        ...trendResponse
      };
    } catch (error: any) {
      reply.code(500);
      return {
        ok: false,
        error: error.message || "Failed to query trends"
      };
    }
  });

  // Get high-level trend summary (simplified for strategy planning)
  app.post("/trends/summary", async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = req.body as TrendQuery;
      
      // Validate input
      if (!query.sessionId || !query.platform || !query.niche) {
        reply.code(400);
        return {
          ok: false,
          error: "Missing required fields: sessionId, platform, niche"
        };
      }
      
      // Get full trends
      const trendResponse = await getTrends(query);
      
      // Generate summary
      const summary = generateSummary(trendResponse);
      
      // Log to Brain
      await logTrends(trendResponse);
      
      return {
        ok: true,
        summary,
        items: trendResponse.items,
        generatedAt: trendResponse.generatedAt
      };
    } catch (error: any) {
      reply.code(500);
      return {
        ok: false,
        error: error.message || "Failed to generate trend summary"
      };
    }
  });
}

/**
 * Generate human-readable summary from trend data
 */
function generateSummary(resp: { query: TrendQuery; items: any[] }): string {
  if (resp.items.length === 0) {
    return `No significant trends found for "${resp.query.niche}" on ${resp.query.platform}.`;
  }
  
  const topTopics = resp.items.slice(0, 3).map(t => t.topic);
  const platforms = [...new Set(resp.items.map(t => t.platform))];
  
  let summary = `${resp.query.niche} niche is ${resp.items.length >= 5 ? "hot" : "moderately active"}`;
  
  if (resp.query.platform === "all") {
    summary += ` across ${platforms.join(", ")}.`;
  } else {
    summary += ` on ${resp.query.platform}.`;
  }
  
  summary += ` Top topics: ${topTopics.join(", ")}.`;
  
  // Add high-confidence insights
  const highConfidence = resp.items.filter(t => t.confidence > 0.8);
  if (highConfidence.length > 0) {
    summary += ` High potential areas: ${highConfidence.map(t => t.topic).slice(0, 2).join(" and ")}.`;
  }
  
  // Recommendation based on platform mix
  if (resp.items.some(t => t.platform === "tiktok" && t.confidence > 0.75)) {
    summary += " Strong opportunity for UGC video ads.";
  }
  
  if (resp.items.some(t => t.platform === "google" && t.topic.includes("equipment"))) {
    summary += " E-commerce demand detected.";
  }
  
  return summary;
}
