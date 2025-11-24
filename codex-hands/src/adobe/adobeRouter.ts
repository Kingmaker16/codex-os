/**
 * Hands v4.6 — Adobe Suite Router
 * 
 * Unified API router for Adobe Creative Cloud automation
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import * as premiereActions from "./premiereActions.js";
import * as photoshopActions from "./photoshopActions.js";
import { validateAdobeAction } from "./safety.js";

/**
 * Register Adobe Suite routes
 */
export async function registerAdobeRoutes(app: FastifyInstance) {
  
  // ===== Adobe Suite Control =====

  // POST /hands/adobe/open - Open Adobe app with optional file
  app.post("/hands/adobe/open", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as any;
      const { app, filePath } = body;

      // Validate
      const validation = await validateAdobeAction({
        type: "open",
        app,
        filePath,
      });

      if (!validation.allowed) {
        return reply.code(403).send({
          success: false,
          error: validation.reason || "Action not allowed",
        });
      }

      let result;
      
      if (app === "premiere" || app === "Adobe Premiere Pro") {
        result = await premiereActions.openProject(filePath);
      } else if (app === "photoshop" || app === "Adobe Photoshop") {
        result = await photoshopActions.openDocument(filePath);
      } else {
        return reply.code(400).send({
          success: false,
          error: "Invalid app. Use 'premiere' or 'photoshop'",
        });
      }

      return reply.send({
        success: result.ok,
        app,
        error: result.error,
        executedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  });

  // POST /hands/adobe/premiere/action - Execute Premiere operation
  app.post("/hands/adobe/premiere/action", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as any;
      const { action, params } = body;

      // Validate
      const validation = await validateAdobeAction({
        type: "premiere.action",
        app: "premiere",
        action,
        params,
      });

      if (!validation.allowed) {
        return reply.code(403).send({
          success: false,
          error: validation.reason || "Action not allowed",
        });
      }

      let result: any = { ok: false, error: "Unknown action" };

      // Route to appropriate Premiere action
      switch (action) {
        case "newSequence":
          result = await premiereActions.newSequence(params?.presetName);
          break;
        case "importMedia":
          result = await premiereActions.importMedia(params?.paths || []);
          break;
        case "placeOnTimeline":
          result = await premiereActions.placeOnTimeline(params);
          break;
        case "trimClip":
          result = await premiereActions.trimClip(params?.mode, params?.amount);
          break;
        case "splitClip":
          result = await premiereActions.splitClip(params?.timecode);
          break;
        case "rippleDelete":
          result = await premiereActions.rippleDelete();
          break;
        case "addTransition":
          result = await premiereActions.addTransition(params?.name);
          break;
        case "applyColorPreset":
          result = await premiereActions.applyColorPreset(params?.name);
          break;
        case "detectPanels":
          result = await premiereActions.detectPanels();
          break;
        case "locateTool":
          result = await premiereActions.locateTool(params?.toolName);
          break;
        case "click":
          result = await premiereActions.click(params?.target);
          break;
        case "drag":
          result = await premiereActions.drag(params?.start, params?.end);
          break;
        case "keyboardShortcut":
          result = await premiereActions.keyboardShortcut(params?.combo);
          break;
        default:
          result = { ok: false, error: `Unknown Premiere action: ${action}` };
      }

      return reply.send({
        success: result.ok,
        action,
        data: result,
        executedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  });

  // POST /hands/adobe/photoshop/action - Execute Photoshop operation
  app.post("/hands/adobe/photoshop/action", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as any;
      const { action, params } = body;

      // Validate
      const validation = await validateAdobeAction({
        type: "photoshop.action",
        app: "photoshop",
        action,
        params,
      });

      if (!validation.allowed) {
        return reply.code(403).send({
          success: false,
          error: validation.reason || "Action not allowed",
        });
      }

      let result: any = { ok: false, error: "Unknown action" };

      // Route to appropriate Photoshop action
      switch (action) {
        case "newDocument":
          result = await photoshopActions.newDocument(params);
          break;
        case "importImage":
          result = await photoshopActions.importImage(params?.path);
          break;
        case "removeBackground":
          result = await photoshopActions.removeBackground();
          break;
        case "addText":
          result = await photoshopActions.addText(params);
          break;
        case "applyFilter":
          result = await photoshopActions.applyFilter(params?.name);
          break;
        case "resize":
          result = await photoshopActions.resize(params);
          break;
        case "detectLayers":
          result = await photoshopActions.detectLayers();
          break;
        case "detectTools":
          result = await photoshopActions.detectTools();
          break;
        case "click":
          result = await photoshopActions.click(params?.target);
          break;
        case "drag":
          result = await photoshopActions.drag(params?.start, params?.end);
          break;
        case "keyboardShortcut":
          result = await photoshopActions.keyboardShortcut(params?.combo);
          break;
        default:
          result = { ok: false, error: `Unknown Photoshop action: ${action}` };
      }

      return reply.send({
        success: result.ok,
        action,
        data: result,
        executedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  });

  // POST /hands/adobe/premiere/export - Export Premiere project
  app.post("/hands/adobe/premiere/export", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as any;
      const { preset, outputPath, format } = body;

      // Validate
      const validation = await validateAdobeAction({
        type: "premiere.export",
        app: "premiere",
        filePath: outputPath,
      });

      if (!validation.allowed) {
        return reply.code(403).send({
          success: false,
          error: validation.reason || "Action not allowed",
        });
      }

      const result = await premiereActions.exportProject({
        preset: preset || "High Quality 1080p HD",
        outputPath,
        format,
      });

      return reply.send({
        success: result.ok,
        outputPath: result.outputPath,
        error: result.error,
        executedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  });

  // POST /hands/adobe/photoshop/export - Export Photoshop document
  app.post("/hands/adobe/photoshop/export", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as any;
      const { path, format, quality } = body;

      // Validate
      const validation = await validateAdobeAction({
        type: "photoshop.export",
        app: "photoshop",
        filePath: path,
      });

      if (!validation.allowed) {
        return reply.code(403).send({
          success: false,
          error: validation.reason || "Action not allowed",
        });
      }

      const result = await photoshopActions.exportDocument({
        path,
        format: format || "PNG",
        quality,
      });

      return reply.send({
        success: result.ok,
        outputPath: result.outputPath,
        error: result.error,
        executedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  });

  // POST /hands/adobe/status - Get Adobe app status
  app.post("/hands/adobe/status", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as any;
      const { app } = body;

      // Check if app is running
      const { frontmostApp } = await import("../native/macosActions.js");
      const currentApp = await frontmostApp();

      const isPremiereRunning = currentApp.includes("Premiere");
      const isPhotoshopRunning = currentApp.includes("Photoshop");

      return reply.send({
        success: true,
        premiere: {
          running: isPremiereRunning,
          frontmost: currentApp === "Adobe Premiere Pro",
        },
        photoshop: {
          running: isPhotoshopRunning,
          frontmost: currentApp === "Adobe Photoshop",
        },
        currentApp,
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
