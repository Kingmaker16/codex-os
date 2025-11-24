// Codex Telemetry Engine v1 - Router

import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { metricsCollector } from "./metricsCollector.js";
import { eventLogger } from "./eventLogger.js";
import { trendAnalyzer } from "./trendAnalyzer.js";
import { failurePredictor } from "./failurePredictor.js";

export function registerRoutes(app: FastifyInstance): void {
  /**
   * Health check endpoint
   */
  app.get("/telemetry/health", async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      ok: true,
      service: "codex-telemetry",
      version: "1.0.0",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  });

  /**
   * Get all services status with latency checks
   */
  app.get("/telemetry/services", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Define known services
      const services = [
        { name: "brain", port: 4100 },
        { name: "bridge", port: 4000 },
        { name: "orchestrator", port: 4200 },
        { name: "hands", port: 4300 },
        { name: "vision", port: 4600 },
        { name: "knowledge", port: 4500 },
        { name: "social", port: 4800 },
        { name: "video", port: 4700 },
        { name: "mac-optimizer", port: 4900 },
        { name: "voice", port: 9001 },
      ];

      // Check latency for each service
      const serviceChecks = await Promise.all(
        services.map((s) => metricsCollector.checkServiceLatency(s.name, s.port))
      );

      const healthyCount = serviceChecks.filter((s) => s.status === "healthy").length;
      const downCount = serviceChecks.filter((s) => s.status === "down").length;

      // Log service status event
      await eventLogger.log(
        "info",
        "service",
        "telemetry",
        `Service check: ${healthyCount} healthy, ${downCount} down`,
        { services: serviceChecks }
      );

      return {
        ok: true,
        summary: {
          total: services.length,
          healthy: healthyCount,
          slow: serviceChecks.filter((s) => s.status === "slow").length,
          down: downCount,
        },
        services: serviceChecks,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      reply.status(500);
      return {
        ok: false,
        error: err?.message || "Failed to check services",
      };
    }
  });

  /**
   * Get current system metrics
   */
  app.get("/telemetry/metrics", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const metrics = await metricsCollector.collect();
      const history = metricsCollector.getHistory(100); // Last 100 samples

      // Detect anomalies
      const anomalies = failurePredictor.detectAnomalies(history);
      const events = eventLogger.getRecent(100);
      const warnings = failurePredictor.generateEarlyWarnings(history, events);

      // Log metrics collection
      await eventLogger.log(
        "debug",
        "performance",
        "telemetry",
        "Metrics collected",
        { cpu: metrics.cpu.usage, memory: metrics.memory.usagePercent }
      );

      return {
        ok: true,
        current: metrics,
        summary: {
          samples: history.length,
          anomalies: anomalies.length,
          warnings: warnings.length,
        },
        anomalies,
        warnings,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      reply.status(500);
      return {
        ok: false,
        error: err?.message || "Failed to collect metrics",
      };
    }
  });

  /**
   * Get trend analysis and regression detection
   */
  app.get("/telemetry/trends", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const history = metricsCollector.getHistory();
      const report = trendAnalyzer.generateReport(history);

      // Get event statistics
      const eventStats = {
        total: eventLogger.getTotalCount(),
        byLevel: eventLogger.getCountByLevel(),
        byCategory: eventLogger.getCountByCategory(),
        recent: eventLogger.getRecent(20),
      };

      // Log trend analysis
      await eventLogger.log(
        "info",
        "performance",
        "telemetry",
        "Trend analysis completed",
        {
          cpu: report.cpu.trend,
          memory: report.memory.trend,
          regressions: report.regressions.length,
        }
      );

      return {
        ok: true,
        trends: {
          cpu: report.cpu,
          memory: report.memory,
          disk: report.disk,
        },
        regressions: report.regressions,
        events: eventStats,
        timestamp: report.timestamp.toISOString(),
      };
    } catch (err: any) {
      reply.status(500);
      return {
        ok: false,
        error: err?.message || "Failed to analyze trends",
      };
    }
  });

  /**
   * Query telemetry events
   */
  app.get("/telemetry/events", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as {
        level?: string;
        category?: string;
        source?: string;
        limit?: string;
      };

      const events = eventLogger.query({
        level: query.level as any,
        category: query.category as any,
        source: query.source,
        limit: query.limit ? parseInt(query.limit) : 100,
      });

      return {
        ok: true,
        count: events.length,
        events,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      reply.status(500);
      return {
        ok: false,
        error: err?.message || "Failed to query events",
      };
    }
  });
}
