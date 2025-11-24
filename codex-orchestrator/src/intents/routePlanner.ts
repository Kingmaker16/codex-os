/**
 * Route Planner - Orchestrator Intelligence v2.0
 * 
 * Decides which services to call for each task type.
 * Future: Use telemetry to make smarter routing decisions.
 */

import type { OrchestratorTask } from "./taskGraph.js";

export interface RouteTarget {
  service: string;
  endpoint: string;
  method: "GET" | "POST";
  port?: number; // Optional for documentation
}

/**
 * Map task types to service endpoints
 */
export function planRoute(task: OrchestratorTask): RouteTarget {
  const type = task.type.toLowerCase();

  // Social media operations
  if (type === "social_post" || type === "post_video") {
    return {
      service: "codex-social",
      endpoint: "http://localhost:4800/social/upload",
      method: "POST",
      port: 4800,
    };
  }

  if (type === "social_plan" || type === "plan_content") {
    return {
      service: "codex-social",
      endpoint: "http://localhost:4800/social/plan",
      method: "POST",
      port: 4800,
    };
  }

  if (type === "social_caption" || type === "generate_caption") {
    return {
      service: "codex-social",
      endpoint: "http://localhost:4800/social/generateCaption",
      method: "POST",
      port: 4800,
    };
  }

  if (type === "social_trends") {
    return {
      service: "codex-social",
      endpoint: "http://localhost:4800/social/trends",
      method: "GET",
      port: 4800,
    };
  }

  // Video generation
  if (type === "generate_video" || type === "create_video") {
    return {
      service: "codex-video",
      endpoint: "http://localhost:5000/video/generate",
      method: "POST",
      port: 5000,
    };
  }

  // Mac optimization
  if (type === "optimize_mac" || type === "system_optimize") {
    return {
      service: "codex-mac-optimizer",
      endpoint: "http://localhost:4700/optimize/run",
      method: "POST",
      port: 4700,
    };
  }

  // Research and knowledge
  if (type === "research" || type === "knowledge_query") {
    return {
      service: "codex-knowledge-v2",
      endpoint: "http://localhost:4500/research/run",
      method: "POST",
      port: 4500,
    };
  }

  // Monetization and analytics
  if (type === "summarize_revenue" || type === "get_revenue") {
    return {
      service: "codex-monetization",
      endpoint: "http://localhost:4850/monetization/summary",
      method: "GET",
      port: 4850,
    };
  }

  if (type === "record_revenue") {
    return {
      service: "codex-monetization",
      endpoint: "http://localhost:4850/monetization/recordRevenue",
      method: "POST",
      port: 4850,
    };
  }

  // Diagnostics
  if (type === "diagnostics" || type === "health_check") {
    return {
      service: "codex-diagnostics",
      endpoint: "http://localhost:4200/orchestrator/diagnostics",
      method: "POST",
      port: 4200,
    };
  }

  // Browser automation
  if (type === "hands_task" || type === "browser_automation") {
    return {
      service: "codex-hands",
      endpoint: "http://localhost:4300/hands/executeTask",
      method: "POST",
      port: 4300,
    };
  }

  // Vision analysis
  if (type === "vision_analyze" || type === "image_analysis") {
    return {
      service: "codex-vision",
      endpoint: "http://localhost:4600/vision/analyze",
      method: "POST",
      port: 4600,
    };
  }

  // Voice operations
  if (type === "voice_tts" || type === "text_to_speech") {
    return {
      service: "codex-voice",
      endpoint: "http://localhost:4750/voice/tts",
      method: "POST",
      port: 4750,
    };
  }

  if (type === "voice_stt" || type === "speech_to_text") {
    return {
      service: "codex-voice",
      endpoint: "http://localhost:4750/voice/stt",
      method: "POST",
      port: 4750,
    };
  }

  // Default fallback (unknown task type)
  // TODO: Use telemetry to discover available services dynamically
  throw new Error(`Unknown task type: ${task.type}. Cannot plan route.`);
}

/**
 * Check if a route is available based on telemetry
 * TODO: Implement telemetry-aware routing
 */
export async function isRouteAvailable(route: RouteTarget): Promise<boolean> {
  // For v2.0, assume all routes are available
  // Future: Query telemetry engine for service health
  return true;
}

/**
 * Get alternative routes if primary fails
 * TODO: Implement fallback routing
 */
export function getAlternativeRoutes(task: OrchestratorTask): RouteTarget[] {
  // For v2.0, no alternatives
  // Future: Provide fallback services (e.g., different AI models)
  return [];
}
