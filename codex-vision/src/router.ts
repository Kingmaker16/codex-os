/**
 * Vision Engine v2 - Fastify Router
 * 
 * API endpoints for vision operations
 */

import type { FastifyInstance } from "fastify";
import {
  analyzeImage,
  analyzeVideo,
  analyzeScreen,
  mapUI,
  performOCR,
  analyzeFaces,
  detectObjects,
  analyzeChart
} from "./visionController.js";
import { suggestActions } from "./actionSuggestions.js";
import { createARStreamHandler } from "./arStream.js";
import type {
  ImageAnalysisRequest,
  VideoAnalysisRequest,
  ScreenAnalysisRequest,
  UIMapRequest,
  OCRRequest,
  ChartAnalysisRequest
} from "./types.js";

export async function registerRoutes(app: FastifyInstance) {
  
  // Health check
  app.get("/health", async () => ({
    status: "ok",
    engine: "vision-v2.5",
    version: "2.5.0",
    mode: "semi-autonomous"
  }));

  // Image analysis
  app.post<{ Body: ImageAnalysisRequest }>("/vision/analyzeImage", async (request, reply) => {
    try {
      const result = await analyzeImage(request.body);
      return { success: true, data: result };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Video analysis
  app.post<{ Body: VideoAnalysisRequest }>("/vision/analyzeVideo", async (request, reply) => {
    try {
      const result = await analyzeVideo(request.body);
      return { success: true, data: result };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Screen analysis
  app.post<{ Body: ScreenAnalysisRequest }>("/vision/analyzeScreen", async (request, reply) => {
    try {
      const result = await analyzeScreen(request.body);
      return { success: true, data: result };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // UI mapping
  app.post<{ Body: UIMapRequest }>("/vision/uiMap", async (request, reply) => {
    try {
      const result = await mapUI(request.body);
      return { success: true, data: result };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // OCR
  app.post<{ Body: OCRRequest }>("/vision/ocr", async (request, reply) => {
    try {
      const result = await performOCR(request.body);
      return { success: true, data: result };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Face analysis
  app.post<{ Body: { image: string } }>("/vision/face", async (request, reply) => {
    try {
      const result = await analyzeFaces(request.body.image);
      return { success: true, data: result };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Object detection
  app.post<{ Body: { image: string; filter?: string[] } }>("/vision/objects", async (request, reply) => {
    try {
      const result = await detectObjects(request.body.image, request.body.filter);
      return { success: true, data: result };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Chart analysis
  app.post<{ Body: ChartAnalysisRequest }>("/vision/chart", async (request, reply) => {
    try {
      const result = await analyzeChart(request.body);
      return { success: true, data: result };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // Vision v2.5: Action Suggestions (Semi-Autonomous Mode)
  app.post<{ Body: { screenshot: string; uiMap?: any; userIntent: string; profile?: string } }>(
    "/vision/suggestActions",
    async (request, reply) => {
      try {
        const { screenshot, uiMap, userIntent, profile } = request.body;

        // Analyze screen if not provided
        const screenAnalysis = await analyzeScreen({ screenshot, profile });

        // Map UI if not provided
        const uiMapping = uiMap || await mapUI({ screenshot, profile: profile || "general" });

        // Generate action suggestions
        const suggestions = await suggestActions(screenAnalysis, uiMapping, userIntent);

        return {
          success: true,
          data: suggestions,
          semiAutonomous: true,
          warning: "⚠️ All actions require explicit approval before execution"
        };
      } catch (error: any) {
        reply.code(500);
        return { success: false, error: error.message };
      }
    }
  );

  // AR Stream WebSocket endpoint
  app.register(async (fastify) => {
    fastify.get("/vision/arStream", { websocket: true }, createARStreamHandler());
  });
}
