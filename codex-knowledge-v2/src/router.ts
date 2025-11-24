/**
 * Knowledge Engine v2.5 - Fastify Router
 * 
 * API endpoints for research and knowledge operations
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { ResearchRequest } from "./types.js";
import { runResearch } from "./researchController.js";
import { ingestWeb } from "./webIngest.js";
import { ingestYouTube } from "./youtubeIngest.js";
import { ingestPDF } from "./pdfIngest.js";
import { ingestAudio } from "./audioIngest.js";
import { ingestScreenshot } from "./screenshotIngest.js";
import { getAllKernelsSummary } from "./domainKernels.js";

export async function registerRoutes(app: FastifyInstance) {
  
  // Health check
  app.get("/health", async () => ({
    status: "ok",
    engine: "knowledge-v2.5",
    version: "2.5.0",
    mode: "C1-STRICT"
  }));

  // POST /research/run - Full research pipeline
  app.post<{ Body: ResearchRequest }>("/research/run", async (request, reply) => {
    try {
      const result = await runResearch(request.body);
      return { success: true, data: result };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // POST /research/web - Web URL ingestion
  app.post<{ Body: { url: string; domain?: string } }>("/research/web", async (request, reply) => {
    try {
      const { url, domain } = request.body;
      
      const result = await runResearch({
        query: `Research content from ${url}`,
        domain: domain as any,
        sources: [url]
      });

      return { success: true, data: result };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // POST /research/youtube - YouTube video ingestion
  app.post<{ Body: { url: string; domain?: string } }>("/research/youtube", async (request, reply) => {
    try {
      const { url, domain } = request.body;
      
      const result = await runResearch({
        query: `Research content from YouTube video: ${url}`,
        domain: domain as any,
        sources: [url]
      });

      return { success: true, data: result };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // POST /research/pdf - PDF ingestion
  app.post<{ Body: { path: string; domain?: string } }>("/research/pdf", async (request, reply) => {
    try {
      const { path, domain } = request.body;
      
      const result = await runResearch({
        query: `Research content from PDF: ${path}`,
        domain: domain as any,
        sources: [path]
      });

      return { success: true, data: result };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // POST /research/audio - Audio ingestion
  app.post<{ Body: { path: string; domain?: string } }>("/research/audio", async (request, reply) => {
    try {
      const { path, domain } = request.body;
      
      const result = await runResearch({
        query: `Research content from audio: ${path}`,
        domain: domain as any,
        sources: [path]
      });

      return { success: true, data: result };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // POST /research/screenshot - Screenshot ingestion
  app.post<{ Body: { image: string; context?: string; domain?: string } }>("/research/screenshot", async (request, reply) => {
    try {
      const { image, context, domain } = request.body;
      
      const content = await ingestScreenshot(image, context);
      
      const result = await runResearch({
        query: `Research screenshot${context ? ': ' + context : ''}`,
        domain: domain as any,
        sources: ["screenshot"]
      });

      return { success: true, data: result };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // GET /kernels - Get all domain kernels summary
  app.get("/kernels", async () => {
    const summary = getAllKernelsSummary();
    return { success: true, kernels: summary };
  });
}
