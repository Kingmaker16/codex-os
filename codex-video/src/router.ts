import { fuseVideos, fuseFromTemplate } from "./fusionEngine.js";
import { VIDEO_CONFIG } from "./config.js";
import { getAllTemplates, getDefaultAdTemplate, getTemplateByAngle } from "./templates/ugcTemplates.js";
import type { UGCRequest, VideoAdsRequest } from "./types.js";

export default async function router(app: any) {

  app.get("/health", async () => ({
    ok: true,
    service: "codex-video",
    version: "1.5.0",
    mode: "Video Engine v1.5"
  }));

  app.post("/video/generate", async (req: any, reply: any) => {
    const { script } = req.body;
    const fused = await fuseVideos(script);
    return { ok: true, fused };
  });

  app.post("/video/edit", async (req: any, reply: any) => {
    return { ok: true, note: "Video editing pipeline stubbed" };
  });

  // NEW: UGC video generation with templates
  app.post("/video/ugc", async (req: any, reply: any) => {
    try {
      const body: UGCRequest = req.body;
      
      if (!body.sessionId) {
        reply.code(400);
        return { ok: false, error: "sessionId is required" };
      }

      // Use provided templateId or default to problem-solution
      const templateId = body.templateId || "problem-solution";
      
      // Generate video using template fusion
      const fused = await fuseFromTemplate(templateId, {
        aspectRatio: body.aspectRatio,
        durationSec: body.durationSec,
        productName: body.productName,
        brandTone: body.brandTone
      });

      return {
        ok: true,
        sessionId: body.sessionId,
        templateId,
        fused
      };
    } catch (error: any) {
      reply.code(500);
      return {
        ok: false,
        error: error.message || "Failed to generate UGC video"
      };
    }
  });

  // NEW: Get available templates
  app.get("/video/templates", async (req: any, reply: any) => {
    const templates = getAllTemplates();
    
    // Return minimal template info
    const templateList = templates.map(t => ({
      id: t.id,
      name: t.name,
      type: t.type,
      mood: t.mood,
      shotCount: t.shotList.length
    }));

    return {
      ok: true,
      count: templateList.length,
      templates: templateList
    };
  });

  // NEW: Generate ad videos
  app.post("/video/ads", async (req: any, reply: any) => {
    try {
      const body: VideoAdsRequest = req.body;

      if (!body.sessionId || !body.productName) {
        reply.code(400);
        return { ok: false, error: "sessionId and productName are required" };
      }

      // Select template based on angle
      const template = getTemplateByAngle(body.angle);
      
      // Generate count number of variations (default 1)
      const count = body.count || 1;
      const videos = [];

      for (let i = 0; i < count; i++) {
        const fused = await fuseFromTemplate(template.id, {
          aspectRatio: body.aspectRatio,
          durationSec: 15, // Default for ads
          productName: body.productName
        });
        
        videos.push({
          index: i + 1,
          templateId: template.id,
          templateName: template.name,
          fused
        });
      }

      return {
        ok: true,
        sessionId: body.sessionId,
        productName: body.productName,
        angle: body.angle || "default",
        count: videos.length,
        videos
      };
    } catch (error: any) {
      reply.code(500);
      return {
        ok: false,
        error: error.message || "Failed to generate ad videos"
      };
    }
  });
}
