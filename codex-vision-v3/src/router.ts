import { FastifyInstance } from "fastify";
import { FrameContext } from "./types.js";
import { analyzeFrameToUIState } from "./uiAbstractionLayer.js";
import { reasonOverFrames } from "./multiFrameReasoner.js";
import { suggestEdits } from "./editSuggester.js";
import { fuseVision } from "./fusionVision.js";

export async function visionV3Routes(app: FastifyInstance) {
  app.get("/health", async () => ({
    ok: true,
    service: "codex-vision-v3",
    version: "3.0.0",
    mode: "CO_PILOT"
  }));

  app.post("/vision3/suggest", async (req, reply) => {
    try {
      const body = req.body as { frames: FrameContext[] };
      const frames = body.frames ?? [];

      const uiStates = [];
      for (const frame of frames) {
        uiStates.push(await analyzeFrameToUIState(frame));
      }

      const summary = await reasonOverFrames(frames, uiStates);
      const actions = await suggestEdits(uiStates);
      const fused = await fuseVision(frames, uiStates, actions);

      return {
        ok: true,
        summary,
        suggestion: fused
      };
    } catch (err: any) {
      reply.status(500);
      return { ok: false, error: err.message };
    }
  });
}
