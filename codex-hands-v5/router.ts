// =============================================
// HANDS v5.0 ULTRA — MAIN ROUTER
// =============================================

import { FastifyInstance } from "fastify";
import { ActionNode, ExecutionChain, VideoEditRequest, SocialPostRequest, ProductListingRequest, FulfillmentRequest } from "./src/types.js";

// Core imports
import { actionGraph } from "./src/core/actionGraph.js";
import { executionEngine } from "./src/core/executionEngine.js";
import { errorRecovery } from "./src/core/errorRecovery.js";

// Creative imports
import { adobeEngine } from "./src/creative/adobeEngine.js";
import { videoMacros } from "./src/creative/videoMacros.js";
import { exportWatcher } from "./src/creative/exportWatcher.js";

// Social imports
import { posterEngine } from "./src/social/poster.js";
import { commenterEngine } from "./src/social/commenter.js";
import { macroFlows } from "./src/social/macroFlows.js";

// Store imports
import { listingBuilder } from "./src/store/listingBuilder.js";
import { fulfillmentEngine } from "./src/store/fulfillmentEngine.js";
import { priceTesting } from "./src/store/priceTesting.js";

// Vision & Safety imports
import { visionIntegration } from "./src/vision/inferenceRouter.js";
import { safetyValidator } from "./src/safety/validator.js";
import { riskGuard } from "./src/safety/riskGuard.js";

export async function registerRoutes(app: FastifyInstance) {
  // ===== HEALTH & INFO =====
  app.get("/health", async () => ({
    ok: true,
    service: "codex-hands-v5",
    version: "5.0.0",
    mode: "SEMI_AUTONOMOUS"
  }));

  // ===== CORE ENGINE =====
  app.post("/hands5/execute", async (req) => {
    const node = req.body as ActionNode;
    
    // Safety check
    const guardResult = await riskGuard.guardAction(node);
    if (!guardResult.ok) {
      return guardResult;
    }

    // Execute
    const result = await executionEngine.executeAction(node);
    return { ok: true, result };
  });

  app.post("/hands5/chain", async (req) => {
    const { name, nodes } = req.body as { name: string; nodes: ActionNode[] };
    
    // Create chain
    const chain = actionGraph.createChain(name, nodes);
    
    // Safety check
    const guardResult = await riskGuard.guardChain(chain);
    if (!guardResult.ok) {
      return guardResult;
    }

    // Execute chain
    actionGraph.updateChainStatus(chain.id, "running");
    
    while (!actionGraph.allNodesComplete(chain.id) && !actionGraph.hasFailedNodes(chain.id)) {
      const executableNodes = actionGraph.getExecutableNodes(chain.id);
      
      for (const node of executableNodes) {
        actionGraph.updateNode(chain.id, node.id, { status: "running" });
        
        try {
          const result = await executionEngine.executeAction(node);
          actionGraph.updateNode(chain.id, node.id, { 
            status: "success",
            result
          });
        } catch (error: any) {
          const canRetry = await errorRecovery.handleNodeFailure(chain.id, node, error);
          if (!canRetry) {
            actionGraph.updateNode(chain.id, node.id, { status: "failed" });
          }
        }
      }
    }

    const finalStatus = actionGraph.allNodesComplete(chain.id) ? "completed" : "failed";
    actionGraph.updateChainStatus(chain.id, finalStatus);

    return {
      ok: true,
      chainId: chain.id,
      status: finalStatus,
      chain: actionGraph.getChain(chain.id)
    };
  });

  app.post("/hands5/validate", async (req) => {
    const { actionType, params } = req.body as { actionType: string; params: any };
    const assessment = safetyValidator.validateAction(actionType as any, params);
    return { ok: true, assessment };
  });

  // ===== CREATIVE ENGINE =====
  app.post("/hands5/creative/edit", async (req) => {
    const request = req.body as VideoEditRequest;
    const result = await adobeEngine.editInPremiere(request);
    return result;
  });

  app.post("/hands5/creative/premiere", async (req) => {
    const request = req.body as VideoEditRequest;
    return await adobeEngine.editInPremiere(request);
  });

  app.post("/hands5/creative/capcut", async (req) => {
    const { videoPath, format } = req.body as { videoPath: string; format: "tiktok" | "reels" | "youtube" };
    
    switch (format) {
      case "tiktok":
        return await videoMacros.createTikTokEdit(videoPath);
      case "reels":
        return await videoMacros.createReelsEdit(videoPath);
      case "youtube":
        return await videoMacros.createYouTubeEdit(videoPath);
    }
  });

  app.post("/hands5/creative/export", async (req) => {
    const { jobId, videoPath, format } = req.body as { jobId: string; videoPath: string; format: string };
    exportWatcher.startExport(jobId, videoPath, format);
    return { ok: true, jobId, message: "Export started" };
  });

  app.get("/hands5/creative/export/:jobId", async (req) => {
    const { jobId } = req.params as { jobId: string };
    const job = exportWatcher.getExportStatus(jobId);
    return job ? { ok: true, job } : { ok: false, error: "Job not found" };
  });

  // ===== SOCIAL ENGINE =====
  app.post("/hands5/social/post", async (req) => {
    const request = req.body as SocialPostRequest;
    return await macroFlows.uploadAndVerifyFlow(request);
  });

  app.post("/hands5/social/comment", async (req) => {
    const { macro } = req.body as { macro: any };
    return await commenterEngine.postComment(macro);
  });

  app.post("/hands5/social/engage", async (req) => {
    const { macros, loopCount } = req.body as { macros: any[]; loopCount?: number };
    return await commenterEngine.engagementLoop(macros, loopCount);
  });

  app.post("/hands5/social/macro", async (req) => {
    const { flow, ...params } = req.body as any;
    
    switch (flow) {
      case "multi-platform":
        return await macroFlows.multiPlatformPostFlow(params.baseRequest, params.platforms);
      case "post-and-engage":
        return await macroFlows.postAndEngageFlow(params.postRequest, params.engagementMacros);
      default:
        return { ok: false, error: "Unknown flow" };
    }
  });

  // ===== STORE ENGINE =====
  app.post("/hands5/store/list", async (req) => {
    const request = req.body as ProductListingRequest;
    
    switch (request.platform) {
      case "shopify":
        return await listingBuilder.createShopifyListing(request);
      case "amazon":
        return await listingBuilder.createAmazonListing(request);
      case "etsy":
        return await listingBuilder.createEtsyListing(request);
      default:
        return { ok: false, error: "Unsupported platform" };
    }
  });

  app.post("/hands5/store/fulfill", async (req) => {
    const request = req.body as FulfillmentRequest;
    return await fulfillmentEngine.fulfillOrder(request);
  });

  app.post("/hands5/store/price-test", async (req) => {
    const { productId, basePrice, variants } = req.body as { productId: string; basePrice: number; variants: number[] };
    return await priceTesting.createPriceTest(productId, basePrice, variants);
  });

  app.get("/hands5/store/price-test/:testId", async (req) => {
    const { testId } = req.params as { testId: string };
    return await priceTesting.getTestResults(testId);
  });

  // ===== VISION INTEGRATION =====
  app.post("/hands5/vision/analyze", async () => {
    return await visionIntegration.analyzeScreen();
  });

  app.post("/hands5/vision/suggest", async (req) => {
    return await visionIntegration.suggestActions(req.body);
  });

  app.post("/hands5/vision/align", async (req) => {
    const { actionType, params } = req.body as { actionType: string; params: any };
    return await visionIntegration.alignAction(actionType, params);
  });
}
