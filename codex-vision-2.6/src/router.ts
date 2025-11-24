// router.ts - Vision Engine v2.6 ULTRA Routes

import type { FastifyInstance } from "fastify";
import { SceneAnalyzer } from "./sceneAnalyzer.js";
import { EditSuggester } from "./editSuggester.js";
import { TimelineMapper } from "./timelineMapper.js";
import { ARFeedbackEngine } from "./arFeedback.js";
import { BrainLogger } from "./brainLogger.js";
import type { VisionRequest, PerformanceLog } from "./types.js";

const sceneAnalyzer = new SceneAnalyzer();
const editSuggester = new EditSuggester();
const timelineMapper = new TimelineMapper();
const arFeedback = new ARFeedbackEngine();
const brainLogger = new BrainLogger();

export async function registerVisionRoutes(fastify: FastifyInstance) {
  /**
   * Health check
   */
  fastify.get("/health", async (request, reply) => {
    return {
      ok: true,
      service: "codex-vision-2.6",
      version: "2.6.0",
      mode: "co-pilot",
      engines: {
        sceneAnalyzer: true,
        fusionVision: true,
        editSuggester: true,
        timelineMapper: true,
        arFeedback: true,
        brainLogger: true,
      },
      integrations: {
        bridge: "http://localhost:4000",
        hands: "http://localhost:4350",
        creativeSuite: "http://localhost:5250",
        campaign: "http://localhost:5120",
        social: "http://localhost:4350",
      },
    };
  });

  /**
   * Analyze single frame
   */
  fastify.post<{ Body: VisionRequest }>(
    "/vision/analyzeFrame",
    async (request, reply) => {
      const { frameData, frameNumber = 0, timestamp = 0 } = request.body;

      if (!frameData) {
        return reply.code(400).send({
          ok: false,
          error: "frameData required (base64 encoded)",
        });
      }

      try {
        const analysis = await sceneAnalyzer.analyzeFrame(
          frameData,
          frameNumber,
          timestamp
        );

        return {
          ok: true,
          frameAnalysis: analysis,
        };
      } catch (error: any) {
        return reply.code(500).send({
          ok: false,
          error: error.message,
        });
      }
    }
  );

  /**
   * Analyze entire timeline
   */
  fastify.post<{ Body: VisionRequest }>(
    "/vision/analyzeTimeline",
    async (request, reply) => {
      const { videoPath, platform } = request.body;

      if (!videoPath || !platform) {
        return reply.code(400).send({
          ok: false,
          error: "videoPath and platform required",
        });
      }

      try {
        const analysis = await sceneAnalyzer.analyzeTimeline(videoPath, platform);

        return {
          ok: true,
          timelineAnalysis: analysis,
        };
      } catch (error: any) {
        return reply.code(500).send({
          ok: false,
          error: error.message,
        });
      }
    }
  );

  /**
   * Suggest edits (MAIN CO-PILOT ENDPOINT)
   */
  fastify.post<{ Body: VisionRequest }>(
    "/vision/suggestEdits",
    async (request, reply) => {
      const { videoPath, platform } = request.body;

      if (!videoPath || !platform) {
        return reply.code(400).send({
          ok: false,
          error: "videoPath and platform required",
        });
      }

      try {
        // Step 1: Analyze timeline
        const timelineAnalysis = await sceneAnalyzer.analyzeTimeline(
          videoPath,
          platform
        );

        // Step 2: Generate edit suggestions using multi-LLM fusion
        const editSuggestion = await editSuggester.suggestEdits(
          timelineAnalysis,
          platform
        );

        return {
          ok: true,
          editSuggestion,
          message: "Edit suggestions prepared. Review and approve before applying.",
        };
      } catch (error: any) {
        return reply.code(500).send({
          ok: false,
          error: error.message,
        });
      }
    }
  );

  /**
   * Map timeline for video editor
   */
  fastify.post<{
    Body: { videoPath: string; actions: any[]; editor: string };
  }>("/vision/mapTimeline", async (request, reply) => {
    const { videoPath, actions, editor } = request.body;

    if (!videoPath || !actions || !editor) {
      return reply.code(400).send({
        ok: false,
        error: "videoPath, actions, and editor required",
      });
    }

    const validEditors = ["premiere", "finalcut", "capcut"];
    if (!validEditors.includes(editor)) {
      return reply.code(400).send({
        ok: false,
        error: `editor must be one of: ${validEditors.join(", ")}`,
      });
    }

    try {
      const timeline = timelineMapper.mapToTimeline(
        videoPath,
        actions,
        editor as any
      );

      return {
        ok: true,
        timeline,
      };
    } catch (error: any) {
      return reply.code(500).send({
        ok: false,
        error: error.message,
      });
    }
  });

  /**
   * Live AR feedback
   */
  fastify.post<{
    Body: {
      sessionId: string;
      action: string;
      frameNumber?: number;
      frameAnalysis?: any;
      videoPath?: string;
    };
  }>("/vision/liveFeedback", async (request, reply) => {
    const { sessionId, action, frameNumber, frameAnalysis, videoPath } =
      request.body;

    if (!sessionId || !action) {
      return reply.code(400).send({
        ok: false,
        error: "sessionId and action required",
      });
    }

    try {
      if (action === "start") {
        if (!videoPath) {
          return reply.code(400).send({
            ok: false,
            error: "videoPath required to start session",
          });
        }
        arFeedback.startSession(sessionId, videoPath);
        return {
          ok: true,
          message: `AR feedback session ${sessionId} started`,
        };
      } else if (action === "feedback") {
        if (frameNumber === undefined || !frameAnalysis) {
          return reply.code(400).send({
            ok: false,
            error: "frameNumber and frameAnalysis required for feedback",
          });
        }
        const feedback = await arFeedback.generateLiveFeedback(
          sessionId,
          frameNumber,
          frameAnalysis
        );
        return {
          ok: true,
          feedback,
        };
      } else if (action === "stop") {
        arFeedback.stopSession(sessionId);
        return {
          ok: true,
          message: `AR feedback session ${sessionId} stopped`,
        };
      } else {
        return reply.code(400).send({
          ok: false,
          error: "action must be: start, feedback, or stop",
        });
      }
    } catch (error: any) {
      return reply.code(500).send({
        ok: false,
        error: error.message,
      });
    }
  });

  /**
   * Log performance
   */
  fastify.post<{ Body: PerformanceLog }>(
    "/vision/logPerformance",
    async (request, reply) => {
      const log = request.body;

      if (!log.editId || !log.videoPath || !log.platform) {
        return reply.code(400).send({
          ok: false,
          error: "editId, videoPath, and platform required",
        });
      }

      try {
        brainLogger.logPerformance(log);

        return {
          ok: true,
          message: "Performance logged successfully",
        };
      } catch (error: any) {
        return reply.code(500).send({
          ok: false,
          error: error.message,
        });
      }
    }
  );

  /**
   * Get insights
   */
  fastify.get<{ Querystring: { platform?: string } }>(
    "/vision/insights",
    async (request, reply) => {
      const { platform } = request.query;

      try {
        const insights = brainLogger.getInsights(platform);

        return {
          ok: true,
          insights,
        };
      } catch (error: any) {
        return reply.code(500).send({
          ok: false,
          error: error.message,
        });
      }
    }
  );

  console.log("✅ Vision v2.6 routes registered (7 endpoints)");
}
