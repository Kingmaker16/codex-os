// orchestratorVision2.6.ts - Vision Engine v2.6 ULTRA Router

import type { FastifyInstance } from "fastify";

const VISION_26_URL = "http://localhost:4650";
const TIMEOUT = 10000; // 10s timeout
const MAX_RETRIES = 2;

/**
 * Register Vision v2.6 routes with fallback to Vision v2.5
 */
export async function registerVision26Routes(fastify: FastifyInstance) {
  /**
   * Helper: Forward request to Vision v2.6 with retry and fallback
   */
  async function forwardToVision(
    endpoint: string,
    method: "GET" | "POST",
    body?: any
  ): Promise<any> {
    const url = `${VISION_26_URL}${endpoint}`;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Vision v2.6 responded with ${response.status}`);
        }

        return await response.json();
      } catch (error: any) {
        fastify.log.warn(
          { attempt, error: error.message },
          `Vision v2.6 attempt ${attempt} failed`
        );

        if (attempt === MAX_RETRIES) {
          // Final attempt failed - fallback to Vision v2.5
          fastify.log.info("Falling back to Vision v2.5");
          return await fallbackToVision25(endpoint, method, body);
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  /**
   * Fallback to Vision v2.5
   */
  async function fallbackToVision25(
    endpoint: string,
    method: "GET" | "POST",
    body?: any
  ): Promise<any> {
    const v25Url = `http://localhost:4600${endpoint.replace("/vision", "")}`;

    try {
      const response = await fetch(v25Url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`Vision v2.5 also failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        ...data,
        fallback: true,
        version: "v2.5",
      };
    } catch (error: any) {
      fastify.log.error({ error: error.message }, "Vision v2.5 fallback failed");
      throw new Error("Both Vision v2.6 and v2.5 unavailable");
    }
  }

  /**
   * POST /vision2.6/analyzeFrame
   */
  fastify.post("/vision2.6/analyzeFrame", async (request, reply) => {
    try {
      const data = await forwardToVision("/vision/analyzeFrame", "POST", request.body);
      return data;
    } catch (error: any) {
      reply.status(500);
      return {
        ok: false,
        error: "vision_unavailable",
        message: error.message,
      };
    }
  });

  /**
   * POST /vision2.6/analyzeTimeline
   */
  fastify.post("/vision2.6/analyzeTimeline", async (request, reply) => {
    try {
      const data = await forwardToVision("/vision/analyzeTimeline", "POST", request.body);
      return data;
    } catch (error: any) {
      reply.status(500);
      return {
        ok: false,
        error: "vision_unavailable",
        message: error.message,
      };
    }
  });

  /**
   * POST /vision2.6/suggestEdits (MAIN CO-PILOT ENDPOINT)
   */
  fastify.post("/vision2.6/suggestEdits", async (request, reply) => {
    try {
      const data = await forwardToVision("/vision/suggestEdits", "POST", request.body);
      return data;
    } catch (error: any) {
      reply.status(500);
      return {
        ok: false,
        error: "vision_unavailable",
        message: error.message,
      };
    }
  });

  /**
   * POST /vision2.6/mapTimeline
   */
  fastify.post("/vision2.6/mapTimeline", async (request, reply) => {
    try {
      const data = await forwardToVision("/vision/mapTimeline", "POST", request.body);
      return data;
    } catch (error: any) {
      reply.status(500);
      return {
        ok: false,
        error: "vision_unavailable",
        message: error.message,
      };
    }
  });

  /**
   * POST /vision2.6/liveFeedback
   */
  fastify.post("/vision2.6/liveFeedback", async (request, reply) => {
    try {
      const data = await forwardToVision("/vision/liveFeedback", "POST", request.body);
      return data;
    } catch (error: any) {
      reply.status(500);
      return {
        ok: false,
        error: "vision_unavailable",
        message: error.message,
      };
    }
  });

  /**
   * POST /vision2.6/logPerformance
   */
  fastify.post("/vision2.6/logPerformance", async (request, reply) => {
    try {
      const data = await forwardToVision("/vision/logPerformance", "POST", request.body);
      return data;
    } catch (error: any) {
      reply.status(500);
      return {
        ok: false,
        error: "vision_unavailable",
        message: error.message,
      };
    }
  });

  /**
   * GET /vision2.6/insights
   */
  fastify.get("/vision2.6/insights", async (request, reply) => {
    try {
      const data = await forwardToVision("/vision/insights", "GET");
      return data;
    } catch (error: any) {
      reply.status(500);
      return {
        ok: false,
        error: "vision_unavailable",
        message: error.message,
      };
    }
  });

  /**
   * GET /vision2.6/health
   */
  fastify.get("/vision2.6/health", async (request, reply) => {
    try {
      const data = await forwardToVision("/health", "GET");
      return data;
    } catch (error: any) {
      reply.status(500);
      return {
        ok: false,
        error: "vision_unavailable",
        message: error.message,
      };
    }
  });

  fastify.log.info("Vision v2.6 routes registered (8 endpoints with fallback to v2.5)");
}
