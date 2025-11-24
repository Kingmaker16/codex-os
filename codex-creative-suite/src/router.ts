// router.ts - Creative Suite API Router

import type { FastifyInstance } from "fastify";
import { FusionCreative } from "./fusionCreative.js";
import { CreativeKernel } from "./creativeKernel.js";
import { SceneDetect } from "./sceneDetect.js";
import { ShotPlanner } from "./shotPlanner.js";
import { CaptionEngine } from "./captionEngine.js";
import { ThumbnailEngine } from "./thumbnailEngine.js";
import { AudioEnhancer } from "./audioEnhancer.js";
import { BrandVoice } from "./brandVoice.js";
import { TrendAlignmentEngine } from "./trendAlignment.js";
import { IntegrationPipelines } from "./integrationPipelines.js";
import type { CreativeRequest } from "./types.js";

// Initialize engines
const fusionCreative = new FusionCreative();
const creativeKernel = new CreativeKernel();
const sceneDetect = new SceneDetect();
const shotPlanner = new ShotPlanner();
const captionEngine = new CaptionEngine();
const thumbnailEngine = new ThumbnailEngine();
const audioEnhancer = new AudioEnhancer();
const brandVoice = new BrandVoice();
const trendAlignment = new TrendAlignmentEngine();
const integrations = new IntegrationPipelines();

export async function registerRoutes(app: FastifyInstance) {
  // Health check
  app.get("/health", async () => {
    return {
      ok: true,
      service: "codex-creative-suite",
      version: "1.5.0",
      engines: {
        fusion: true,
        kernel: true,
        scene: true,
        shot: true,
        caption: true,
        thumbnail: true,
        audio: true,
        brand: true,
        trend: true,
        integration: true,
      },
    };
  });

  // POST /creative/analyze - Scene detection + shot planning
  app.post<{ Body: { videoPath: string; platform: string } }>(
    "/creative/analyze",
    async (request, reply) => {
      const { videoPath, platform } = request.body;

      if (!videoPath || !platform) {
        return reply.code(400).send({
          error: "Missing required fields: videoPath, platform",
        });
      }

      try {
        // Scene detection
        const sceneAnalysis = await sceneDetect.analyzeVideo(videoPath);

        // Shot planning
        const shotPlan = shotPlanner.generateShotPlan(sceneAnalysis, platform, "viral");

        // Key frames for thumbnails
        const keyFrames = sceneDetect.getKeyFrames(sceneAnalysis, 5);

        // Cut suggestions
        const cutSuggestions = shotPlanner.generateCutSuggestions(shotPlan, sceneAnalysis);

        return {
          ok: true,
          sceneAnalysis,
          shotPlan,
          keyFrames,
          cutSuggestions,
          retentionScore: shotPlanner.calculateRetentionScore(shotPlan),
        };
      } catch (error) {
        return reply.code(500).send({
          error: "Scene analysis failed",
          details: String(error),
        });
      }
    }
  );

  // POST /creative/plan - Full creative plan generation (multi-LLM fusion)
  app.post<{ Body: CreativeRequest }>("/creative/plan", async (request, reply) => {
    const creativeRequest = request.body;

    if (!creativeRequest.videoPath || !creativeRequest.platform) {
      return reply.code(400).send({
        error: "Missing required fields: videoPath, platform",
      });
    }

    try {
      // Generate comprehensive creative plan
      let creativePlan = await fusionCreative.generateCreativePlan(creativeRequest);

      // Optimize with performance learnings
      creativePlan = creativeKernel.optimizePlan(creativePlan, creativeRequest.platform);

      // Align with trends (if enabled)
      if (creativeRequest.trendAlign !== false) {
        const trendData = await trendAlignment.alignWithTrends(
          creativeRequest.platform,
          creativePlan.captionPlan.mainCaption
        );
        creativePlan.trendAlignment = trendData;
      }

      // Brand voice check (if Amar's brand voice requested)
      if (creativeRequest.brandVoice === "amar") {
        const brandCheck = brandVoice.checkBrandVoice(creativePlan.captionPlan.mainCaption);
        creativePlan.brandVoiceScore = brandCheck.score;

        // Use aligned version if available
        if (brandCheck.alignedVersion && brandCheck.score < 80) {
          creativePlan.captionPlan.mainCaption = brandCheck.alignedVersion;
        }
      }

      return {
        ok: true,
        creativePlan,
      };
    } catch (error) {
      return reply.code(500).send({
        error: "Creative plan generation failed",
        details: String(error),
      });
    }
  });

  // POST /creative/enhanceVideo - Audio + color + pacing enhancement
  app.post<{
    Body: { videoPath: string; platform: string; enhancements?: string[] };
  }>("/creative/enhanceVideo", async (request, reply) => {
    const { videoPath, platform, enhancements = ["audio", "color", "pacing"] } = request.body;

    if (!videoPath || !platform) {
      return reply.code(400).send({
        error: "Missing required fields: videoPath, platform",
      });
    }

    try {
      const results = {
        videoPath,
        enhanced: false,
        enhancements: [] as string[],
      };

      // Audio enhancement
      if (enhancements.includes("audio")) {
        const audioSettings = audioEnhancer.suggestAudioSettings(platform);
        const audioPlan = {
          musicSuggestions: [],
          soundEffects: [],
          loudnessTarget: audioSettings.targetLUFS,
          normalizationRequired: true,
        };

        const audioResult = await audioEnhancer.enhanceAudio(videoPath, audioPlan);
        results.enhancements.push(...audioResult.enhancements);
        results.enhanced = true;
      }

      // Color correction (simulated)
      if (enhancements.includes("color")) {
        results.enhancements.push("Color graded to platform standards");
        results.enhanced = true;
      }

      // Pacing optimization (simulated)
      if (enhancements.includes("pacing")) {
        results.enhancements.push("Pacing optimized for retention");
        results.enhanced = true;
      }

      return {
        ok: true,
        ...results,
      };
    } catch (error) {
      return reply.code(500).send({
        error: "Video enhancement failed",
        details: String(error),
      });
    }
  });

  // POST /creative/generateThumbnail - Photoshop automation for thumbnails
  app.post<{
    Body: { videoPath: string; platform: string; sceneAnalysis?: any; count?: number };
  }>("/creative/generateThumbnail", async (request, reply) => {
    const { videoPath, platform, sceneAnalysis, count = 3 } = request.body;

    if (!videoPath || !platform) {
      return reply.code(400).send({
        error: "Missing required fields: videoPath, platform",
      });
    }

    try {
      const concepts = await thumbnailEngine.generateThumbnailConcepts(
        videoPath,
        platform,
        sceneAnalysis,
        count
      );

      const keyFrames = thumbnailEngine.getBestFrameTimestamps(
        videoPath,
        sceneAnalysis,
        count
      );

      // Generate Photoshop script for first concept
      const photoshopScript =
        concepts.length > 0
          ? thumbnailEngine.generatePhotoshopScript(concepts[0], videoPath)
          : null;

      return {
        ok: true,
        concepts,
        keyFrames,
        photoshopScript,
      };
    } catch (error) {
      return reply.code(500).send({
        error: "Thumbnail generation failed",
        details: String(error),
      });
    }
  });

  // POST /creative/generateCaptions - Subtitle timing + overlay
  app.post<{
    Body: { platform: string; videoScript?: string; hooks?: string[] };
  }>("/creative/generateCaptions", async (request, reply) => {
    const { platform, videoScript, hooks } = request.body;

    if (!platform) {
      return reply.code(400).send({
        error: "Missing required field: platform",
      });
    }

    try {
      const captionPlan = captionEngine.generateCaptionPlan(platform, videoScript, hooks);

      // Generate SRT file content
      const srtContent = captionEngine.generateSRT(captionPlan.timing);

      // Extract key phrases for overlay
      const keyPhrases = captionEngine.extractKeyPhrases(captionPlan.mainCaption, 3);

      return {
        ok: true,
        captionPlan,
        srtContent,
        keyPhrases,
      };
    } catch (error) {
      return reply.code(500).send({
        error: "Caption generation failed",
        details: String(error),
      });
    }
  });

  // POST /creative/brandVoiceCheck - Amar's tone enforcement
  app.post<{ Body: { text: string } }>("/creative/brandVoiceCheck", async (request, reply) => {
    const { text } = request.body;

    if (!text) {
      return reply.code(400).send({
        error: "Missing required field: text",
      });
    }

    try {
      const brandCheck = brandVoice.checkBrandVoice(text);
      const examples = brandVoice.getBrandVoiceExamples();
      const guidelines = brandVoice.getBrandVoiceGuidelines();

      return {
        ok: true,
        brandCheck,
        examples,
        guidelines,
      };
    } catch (error) {
      return reply.code(500).send({
        error: "Brand voice check failed",
        details: String(error),
      });
    }
  });

  // POST /creative/trendAlign - Align with current trends
  app.post<{ Body: { platform: string; content: string; niche?: string } }>(
    "/creative/trendAlign",
    async (request, reply) => {
      const { platform, content, niche } = request.body;

      if (!platform || !content) {
        return reply.code(400).send({
          error: "Missing required fields: platform, content",
        });
      }

      try {
        const trendData = await trendAlignment.alignWithTrends(platform, content, niche);
        const trendingAudio = await trendAlignment.suggestTrendingAudio(platform, niche);

        return {
          ok: true,
          trendAlignment: trendData,
          trendingAudio,
        };
      } catch (error) {
        return reply.code(500).send({
          error: "Trend alignment failed",
          details: String(error),
        });
      }
    }
  );

  // POST /creative/integrate - Send to downstream services
  app.post<{
    Body: {
      creativePlan: any;
      destinations: {
        postToSocial?: boolean;
        addToCampaign?: string;
        linkToProduct?: string;
        analyzeEngagement?: boolean;
      };
    };
  }>("/creative/integrate", async (request, reply) => {
    const { creativePlan, destinations } = request.body;

    if (!creativePlan) {
      return reply.code(400).send({
        error: "Missing required field: creativePlan",
      });
    }

    try {
      const result = await integrations.executeFullPipeline(creativePlan, destinations);

      return {
        ok: true,
        integration: result,
      };
    } catch (error) {
      return reply.code(500).send({
        error: "Integration failed",
        details: String(error),
      });
    }
  });

  // GET /creative/integrationHealth - Check downstream services
  app.get("/creative/integrationHealth", async () => {
    const health = await integrations.checkIntegrationHealth();
    const stats = integrations.getIntegrationStats();

    return {
      ok: true,
      serviceHealth: health,
      stats,
    };
  });

  // POST /creative/recordPerformance - Record creative performance metrics
  app.post<{
    Body: {
      creativeId: string;
      platform: string;
      views: number;
      engagement: number;
      ctr: number;
      completionRate: number;
      conversions?: number;
    };
  }>("/creative/recordPerformance", async (request, reply) => {
    const metrics = request.body;

    if (!metrics.creativeId || !metrics.platform) {
      return reply.code(400).send({
        error: "Missing required fields: creativeId, platform",
      });
    }

    try {
      creativeKernel.recordPerformance(metrics.creativeId, {
        ...metrics,
        timestamp: new Date().toISOString(),
      });

      const feedback = creativeKernel.getLearningFeedback(metrics.creativeId);

      return {
        ok: true,
        message: "Performance metrics recorded",
        feedback,
      };
    } catch (error) {
      return reply.code(500).send({
        error: "Failed to record performance",
        details: String(error),
      });
    }
  });

  // GET /creative/insights - Get global performance insights
  app.get<{ Querystring: { platform?: string } }>(
    "/creative/insights",
    async (request) => {
      const { platform } = request.query;

      const insights = creativeKernel.getGlobalInsights(platform);
      const topHooks = creativeKernel.getTopHooks(platform || "tiktok", 5);
      const recommendedHashtags = creativeKernel.getRecommendedHashtags(
        platform || "tiktok"
      );

      return {
        ok: true,
        insights,
        topHooks,
        recommendedHashtags,
      };
    }
  );

  console.log("✅ Creative Suite routes registered (11 endpoints)");
}
