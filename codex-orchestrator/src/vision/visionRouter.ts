import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { runHybridVision } from "./orchestratorVision.js";

interface VisionSolveCaptchaBody {
  sessionId: string;
  imageBase64: string;
  hint?: string;
  instructions?: string;
}

const VISION_V25_URL = "http://localhost:4600";

export async function visionRouter(app: FastifyInstance) {
  // Vision v2.5: Forward all /vision/* endpoints to codex-vision
  // with Semi-Autonomous flag enforcement
  
  // POST /vision/analyzeScreen
  app.post("/analyzeScreen", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as any;
      const response = await fetch(`${VISION_V25_URL}/vision/analyzeScreen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, semiAutonomous: true })
      });
      
      const data = await response.json();
      return { ...data, semiAutonomous: true };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // POST /vision/suggestActions (Semi-Autonomous Mode)
  app.post("/suggestActions", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as any;
      const response = await fetch(`${VISION_V25_URL}/vision/suggestActions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, semiAutonomous: true })
      });
      
      const data = await response.json();
      
      // ENFORCE: Never dispatch actions to Hands v4 automatically
      if (data.success && data.data?.suggestions) {
        console.log(`[Orchestrator] Vision suggested ${data.data.suggestions.length} actions - approval required`);
      }
      
      return { 
        ...data, 
        semiAutonomous: true,
        warning: "⚠️ Orchestrator: Actions must be explicitly approved before execution"
      };
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // POST /vision/analyzeVideo
  app.post("/analyzeVideo", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const response = await fetch(`${VISION_V25_URL}/vision/analyzeVideo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request.body)
      });
      return await response.json();
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // POST /vision/uiMap
  app.post("/uiMap", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const response = await fetch(`${VISION_V25_URL}/vision/uiMap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request.body)
      });
      return await response.json();
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // POST /vision/chart
  app.post("/chart", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const response = await fetch(`${VISION_V25_URL}/vision/chart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request.body)
      });
      return await response.json();
    } catch (error: any) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // POST /vision/solveCaptcha (legacy)
  app.post("/solveCaptcha", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as VisionSolveCaptchaBody;

    // Validate input
    if (!body || typeof body.sessionId !== "string" || !body.sessionId.trim()) {
      reply.code(400);
      return { ok: false, error: "Missing or invalid sessionId" };
    }

    if (!body.imageBase64 || typeof body.imageBase64 !== "string") {
      reply.code(400);
      return { ok: false, error: "Missing or invalid imageBase64" };
    }

    // Basic base64 validation
    if (!/^[A-Za-z0-9+/=]+$/.test(body.imageBase64)) {
      reply.code(400);
      return { ok: false, error: "Invalid base64 image data" };
    }

    try {
      // Run hybrid vision analysis
      const result = await runHybridVision({
        sessionId: body.sessionId.trim(),
        imageBase64: body.imageBase64,
        hint: body.hint,
        instructions: body.instructions,
      });

      if (!result.ok) {
        reply.code(500);
      }

      return result;
    } catch (err: any) {
      request.log.error({ err }, "Vision solve failed");
      reply.code(500);
      return {
        ok: false,
        error: err?.message || "Vision analysis failed",
      };
    }
  });
}
