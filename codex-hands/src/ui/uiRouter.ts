/**
 * Hands v4 — Unified UI Automation Router
 * 
 * Provides REST API endpoints for UI automation
 * All endpoints call macosActions and return ActionResult
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import * as macosActions from "../native/macosActions.js";
import * as actionEngine from "./actionEngine.js";
import { validateHandsAction } from "./safetyGuard.js";

interface ClickRequest {
  x: number;
  y: number;
}

interface DragRequest {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

interface TypeRequest {
  text: string;
}

interface KeyRequest {
  key: string;
}

interface MenuRequest {
  app: string;
  menuPath: string[];
}

/**
 * Register all UI automation routes
 */
export async function registerUIRoutes(app: FastifyInstance) {
  // POST /hands/ui/clickXY - Click at coordinates
  app.post("/hands/ui/clickXY", async (request: FastifyRequest<{ Body: ClickRequest }>, reply: FastifyReply) => {
    try {
      const { x, y } = request.body;

      // Validate action
      const validation = await validateHandsAction({
        type: "click",
        coordinates: { x, y },
      });

      if (!validation.allowed) {
        return reply.code(403).send({
          success: false,
          error: validation.reason,
          actionDescription: "Action blocked by safety guard",
        });
      }

      // Execute action
      const result = await actionEngine.executeAction({
        coordinates: { x, y },
      });

      return reply.send(result);
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
        actionDescription: "Click action failed",
      });
    }
  });

  // POST /hands/ui/doubleClick - Double-click at coordinates
  app.post("/hands/ui/doubleClick", async (request: FastifyRequest<{ Body: ClickRequest }>, reply: FastifyReply) => {
    try {
      const { x, y } = request.body;

      const validation = await validateHandsAction({
        type: "doubleClick",
        coordinates: { x, y },
      });

      if (!validation.allowed) {
        return reply.code(403).send({
          success: false,
          error: validation.reason,
          actionDescription: "Action blocked by safety guard",
        });
      }

      const result = await actionEngine.executeDoubleClick({
        coordinates: { x, y },
      });

      return reply.send(result);
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
        actionDescription: "Double-click action failed",
      });
    }
  });

  // POST /hands/ui/rightClick - Right-click at coordinates
  app.post("/hands/ui/rightClick", async (request: FastifyRequest<{ Body: ClickRequest }>, reply: FastifyReply) => {
    try {
      const { x, y } = request.body;

      const validation = await validateHandsAction({
        type: "rightClick",
        coordinates: { x, y },
      });

      if (!validation.allowed) {
        return reply.code(403).send({
          success: false,
          error: validation.reason,
          actionDescription: "Action blocked by safety guard",
        });
      }

      const result = await actionEngine.executeRightClick({
        coordinates: { x, y },
      });

      return reply.send(result);
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
        actionDescription: "Right-click action failed",
      });
    }
  });

  // POST /hands/ui/drag - Drag from one point to another
  app.post("/hands/ui/drag", async (request: FastifyRequest<{ Body: DragRequest }>, reply: FastifyReply) => {
    try {
      const { fromX, fromY, toX, toY } = request.body;

      const validation = await validateHandsAction({
        type: "drag",
        coordinates: { x: fromX, y: fromY },
        targetCoordinates: { x: toX, y: toY },
      });

      if (!validation.allowed) {
        return reply.code(403).send({
          success: false,
          error: validation.reason,
          actionDescription: "Action blocked by safety guard",
        });
      }

      const result = await actionEngine.executeDrag(
        { x: fromX, y: fromY },
        { x: toX, y: toY }
      );

      return reply.send(result);
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
        actionDescription: "Drag action failed",
      });
    }
  });

  // POST /hands/ui/type - Type text
  app.post("/hands/ui/type", async (request: FastifyRequest<{ Body: TypeRequest }>, reply: FastifyReply) => {
    try {
      const { text } = request.body;

      if (!text || text.length === 0) {
        return reply.code(400).send({
          success: false,
          error: "Text is required",
          actionDescription: "No text provided",
        });
      }

      // Get frontmost app for validation
      const frontApp = await macosActions.frontmostApp();

      const validation = await validateHandsAction({
        type: "type",
        appName: frontApp,
        text,
      });

      if (!validation.allowed) {
        return reply.code(403).send({
          success: false,
          error: validation.reason,
          actionDescription: "Action blocked by safety guard",
        });
      }

      await macosActions.typeText(text);

      return reply.send({
        success: true,
        confidence: 1.0,
        actionDescription: `Typed text (${text.length} characters)`,
        executedAt: new Date().toISOString(),
        metadata: {
          appName: frontApp,
          method: "keyboard-input",
        },
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
        actionDescription: "Type action failed",
      });
    }
  });

  // POST /hands/ui/key - Press a key
  app.post("/hands/ui/key", async (request: FastifyRequest<{ Body: KeyRequest }>, reply: FastifyReply) => {
    try {
      const { key } = request.body;

      if (!key) {
        return reply.code(400).send({
          success: false,
          error: "Key is required",
          actionDescription: "No key provided",
        });
      }

      const frontApp = await macosActions.frontmostApp();

      const validation = await validateHandsAction({
        type: "keyPress",
        appName: frontApp,
        key,
      });

      if (!validation.allowed) {
        return reply.code(403).send({
          success: false,
          error: validation.reason,
          actionDescription: "Action blocked by safety guard",
        });
      }

      await macosActions.keyPress(key);

      return reply.send({
        success: true,
        confidence: 1.0,
        actionDescription: `Pressed key: ${key}`,
        executedAt: new Date().toISOString(),
        metadata: {
          appName: frontApp,
          method: "keyboard-input",
        },
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
        actionDescription: "Key press action failed",
      });
    }
  });

  // POST /hands/ui/menu - Select menu item
  app.post("/hands/ui/menu", async (request: FastifyRequest<{ Body: MenuRequest }>, reply: FastifyReply) => {
    try {
      const { app: appName, menuPath } = request.body;

      if (!appName || !menuPath || menuPath.length === 0) {
        return reply.code(400).send({
          success: false,
          error: "App name and menu path are required",
          actionDescription: "Invalid menu request",
        });
      }

      const validation = await validateHandsAction({
        type: "menu",
        appName,
        menuPath,
      });

      if (!validation.allowed) {
        return reply.code(403).send({
          success: false,
          error: validation.reason,
          actionDescription: "Action blocked by safety guard",
        });
      }

      await macosActions.selectMenu(appName, menuPath);

      return reply.send({
        success: true,
        confidence: 1.0,
        actionDescription: `Selected menu: ${menuPath.join(" > ")} in ${appName}`,
        executedAt: new Date().toISOString(),
        metadata: {
          appName,
          menuPath,
          method: "menu-selection",
        },
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
        actionDescription: "Menu selection failed",
      });
    }
  });

  // GET /hands/ui/frontmost - Get frontmost app
  app.get("/hands/ui/frontmost", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const appName = await macosActions.frontmostApp();

      return reply.send({
        success: true,
        appName,
        executedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  });

  // ===== Hands v4.5 — Video Editing Automation =====

  /**
   * Helper: Normalize app names for video endpoints
   * Accepts both short names ("capcut", "finalcut") and full names ("CapCut", "Final Cut Pro")
   */
  function normalizeVideoAppName(app: string): "capcut" | "finalcut" | null {
    const normalized = app.toLowerCase().replace(/\s/g, "");
    if (normalized === "capcut") return "capcut";
    if (normalized === "finalcut" || normalized === "finalcutpro") return "finalcut";
    return null;
  }

  /**
   * Helper: Get full app name for validation
   */
  function getFullAppName(app: "capcut" | "finalcut"): string {
    return app === "capcut" ? "CapCut" : "Final Cut Pro";
  }

  // POST /hands/video/open - Open video editor app
  app.post("/hands/video/open", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as any;
      const normalizedApp = normalizeVideoAppName(body.app);

      if (!normalizedApp) {
        return reply.code(400).send({
          success: false,
          error: "Invalid app. Use 'capcut' or 'finalcut' (or full names)",
        });
      }

      // Validate app
      const validation = await validateHandsAction({
        type: "video.open",
        appName: getFullAppName(normalizedApp),
      });

      if (!validation.allowed) {
        return reply.code(403).send({
          success: false,
          error: validation.reason || "Action not allowed",
        });
      }

      const { openVideoEditor } = await import("../video/videoEditor.js");
      await openVideoEditor(normalizedApp);

      return reply.send({
        success: true,
        app: normalizedApp,
        message: `Opened ${getFullAppName(normalizedApp)}`,
        executedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  });

  // POST /hands/video/edit - Apply video editing operations
  app.post("/hands/video/edit", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const editRequest = request.body as any;
      const normalizedApp = normalizeVideoAppName(editRequest.app);

      if (!normalizedApp) {
        return reply.code(400).send({
          success: false,
          error: "Invalid app. Use 'capcut' or 'finalcut' (or full names)",
        });
      }

      // Validate app
      const validation = await validateHandsAction({
        type: "video.edit",
        appName: getFullAppName(normalizedApp),
      });

      if (!validation.allowed) {
        return reply.code(403).send({
          success: false,
          error: validation.reason || "Action not allowed",
        });
      }

      const { applyVideoEdits } = await import("../video/videoEditor.js");
      const result = await applyVideoEdits({ ...editRequest, app: normalizedApp });

      return reply.send({
        success: result.ok,
        details: result.details,
        executedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  });

  // POST /hands/video/export - Export/render video project
  app.post("/hands/video/export", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const exportRequest = request.body as any;
      const normalizedApp = normalizeVideoAppName(exportRequest.app);

      if (!normalizedApp) {
        return reply.code(400).send({
          success: false,
          error: "Invalid app. Use 'capcut' or 'finalcut' (or full names)",
        });
      }

      const { preset, outputPath, exportDir } = exportRequest;

      // Validate app
      const validation = await validateHandsAction({
        type: "video.export",
        appName: getFullAppName(normalizedApp),
        filePath: outputPath || exportDir,
      });

      if (!validation.allowed) {
        return reply.code(403).send({
          success: false,
          error: validation.reason || "Action not allowed",
        });
      }

      const { exportProject } = await import("../video/videoEditor.js");
      const { waitForExportCompletion } = await import("../video/exportWatcher.js");

      // Start export
      const exportResult = await exportProject(normalizedApp, { preset, outputPath });

      if (!exportResult.ok) {
        return reply.send({
          success: false,
          error: exportResult.error,
        });
      }

      // Wait for export to complete (if exportDir provided)
      if (exportDir) {
        const watchResult = await waitForExportCompletion(exportDir, 300000); // 5 min timeout
        
        return reply.send({
          success: watchResult.ok,
          outputPath: watchResult.filePath,
          message: watchResult.ok ? "Export completed" : "Export timed out",
          executedAt: new Date().toISOString(),
        });
      }

      return reply.send({
        success: true,
        outputPath: exportResult.outputPath,
        message: "Export initiated",
        executedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  });

  // POST /hands/video/captions - Add caption overlays
  app.post("/hands/video/captions", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const captionRequest = request.body as any;
      const normalizedApp = normalizeVideoAppName(captionRequest.app);

      if (!normalizedApp) {
        return reply.code(400).send({
          success: false,
          error: "Invalid app. Use 'capcut' or 'finalcut' (or full names)",
        });
      }

      const { captions } = captionRequest;

      // Validate app
      const validation = await validateHandsAction({
        type: "video.captions",
        appName: getFullAppName(normalizedApp),
      });

      if (!validation.allowed) {
        return reply.code(403).send({
          success: false,
          error: validation.reason || "Action not allowed",
        });
      }

      const { addCaptions } = await import("../video/captionOverlay.js");
      const result = await addCaptions(normalizedApp, captions);

      return reply.send({
        success: result.ok,
        error: result.error,
        message: result.ok ? `Added ${captions.length} captions` : "Caption overlay failed",
        executedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  });
}
