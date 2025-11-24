/**
 * Knowledge Engine v2 - Fastify Router
 * 
 * API endpoints for research operations
 */

import type { FastifyInstance } from "fastify";
import { runResearch } from "./researchController.js";
import type { ResearchRequest } from "./types.js";

export async function registerRoutes(app: FastifyInstance) {
  
  // Health check
  app.get("/health", async (request, reply) => {
    return { status: "healthy", service: "codex-knowledge", version: "2.0.0" };
  });

  // Main research endpoint
  app.post<{ Body: ResearchRequest }>("/research/run", async (request, reply) => {
    try {
      const result = await runResearch(request.body);
      return { success: true, data: result };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Convenience endpoints for specific sources
  
  app.post<{ Body: { url: string; query: string; depth?: string } }>(
    "/research/web",
    async (request, reply) => {
      try {
        const { url, query, depth } = request.body;
        const result = await runResearch({
          query,
          source: url,
          depth: depth as any
        });
        return { success: true, data: result };
      } catch (error: any) {
        reply.code(500);
        return { success: false, error: error.message };
      }
    }
  );

  app.post<{ Body: { url: string; query: string; depth?: string } }>(
    "/research/youtube",
    async (request, reply) => {
      try {
        const { url, query, depth } = request.body;
        const result = await runResearch({
          query,
          source: url,
          depth: depth as any
        });
        return { success: true, data: result };
      } catch (error: any) {
        reply.code(500);
        return { success: false, error: error.message };
      }
    }
  );

  app.post<{ Body: { filePath: string; query: string; depth?: string } }>(
    "/research/pdf",
    async (request, reply) => {
      try {
        const { filePath, query, depth } = request.body;
        const result = await runResearch({
          query,
          source: filePath,
          depth: depth as any
        });
        return { success: true, data: result };
      } catch (error: any) {
        reply.code(500);
        return { success: false, error: error.message };
      }
    }
  );

  app.post<{ Body: { filePath: string; query: string; depth?: string } }>(
    "/research/screenshot",
    async (request, reply) => {
      try {
        const { filePath, query, depth } = request.body;
        const result = await runResearch({
          query,
          source: filePath,
          depth: depth as any
        });
        return { success: true, data: result };
      } catch (error: any) {
        reply.code(500);
        return { success: false, error: error.message };
      }
    }
  );

  app.post<{ Body: { filePath: string; query: string; depth?: string } }>(
    "/research/audio",
    async (request, reply) => {
      try {
        const { filePath, query, depth } = request.body;
        const result = await runResearch({
          query,
          source: filePath,
          depth: depth as any
        });
        return { success: true, data: result };
      } catch (error: any) {
        reply.code(500);
        return { success: false, error: error.message };
      }
    }
  );
}
