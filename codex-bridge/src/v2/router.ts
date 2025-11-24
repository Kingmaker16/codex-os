/**
 * Codex Bridge v2 - Roundtable Router
 * 
 * HTTP endpoints for multi-LLM roundtable coordination
 */

import type { FastifyInstance } from "fastify";
import type { IModelProvider } from "../providers/types.js";
import { RoundtableOrchestrator } from "./roundtableOrchestrator.js";
import type { RoundtableRequest } from "../types/roundtable.js";

export function registerV2Routes(
  app: FastifyInstance,
  providers: Record<string, IModelProvider>
): void {
  const orchestrator = new RoundtableOrchestrator(providers);

  /**
   * POST /codex/bridge/v2/roundtable
   * 
   * Run a multi-LLM roundtable session
   * 
   * Body: RoundtableRequest
   * Returns: RoundtableResponse
   */
  app.post("/codex/bridge/v2/roundtable", async (req, res) => {
    try {
      const request = req.body as RoundtableRequest;

      // Validate required fields
      if (!request.sessionId || !request.goal || !request.mode) {
        res.status(400);
        return {
          error: "Missing required fields: sessionId, goal, mode"
        };
      }

      // Validate mode
      const validModes = ['plan', 'code', 'debug', 'review'];
      if (!validModes.includes(request.mode)) {
        res.status(400);
        return {
          error: `Invalid mode: ${request.mode}. Must be one of: ${validModes.join(', ')}`
        };
      }

      const response = await orchestrator.runRoundtable(request);
      return response;
    } catch (err) {
      res.status(500);
      return {
        error: (err as Error).message || String(err),
        stack: process.env.NODE_ENV === 'development' ? (err as Error).stack : undefined
      };
    }
  });

  /**
   * GET /codex/bridge/v2/health
   * 
   * Health check for v2 endpoints
   */
  app.get("/codex/bridge/v2/health", async () => ({
    ok: true,
    version: "2.0.0",
    service: "codex-bridge-v2",
    features: [
      "multi-llm-roundtable",
      "collaborative-planning",
      "parallel-analysis"
    ],
    availableProviders: Object.keys(providers)
  }));

  /**
   * GET /codex/bridge/v2/participants
   * 
   * Get available participant configurations
   */
  app.get("/codex/bridge/v2/participants", async () => {
    const available = Object.keys(providers);
    
    return {
      defaultParticipants: {
        planner: { provider: "openai", model: "gpt-4", available: available.includes("openai") },
        researcher: { provider: "gemini", model: "gemini-pro", available: available.includes("gemini") },
        coder: { provider: "anthropic", model: "claude-3-sonnet-20240229", available: available.includes("anthropic") },
        critic: { provider: "grok", model: "grok-beta", available: available.includes("grok") },
        analyst: { provider: "qwen", model: "qwen-max", available: available.includes("qwen") },
        judge: { provider: "anthropic", model: "claude-3-opus-20240229", available: available.includes("anthropic") }
      },
      availableProviders: available,
      notes: "You can override participants in the request body"
    };
  });
}
