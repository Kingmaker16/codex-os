import Fastify from "fastify";
import path from "node:path";
import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import { getPage, validateUrl, humanDelay } from "./webSession.js";
import { solveCaptcha } from "./captchaSolver.js";
import { injectRecaptchaToken } from "./webCaptcha.js";
import { capturePageScreenshot, sendScreenshotToCodex } from "./webVision.js";
import { detectCaptchaHybrid } from "./captchaDetector.js";
import { captureScreen, analyzeScreenWithVision, clickAt } from "./uiVision.js";
// Hands v4: UI Automation Engine
import { registerUIRoutes } from "./ui/uiRouter.js";
// Hands v4.6: Adobe Suite Automation
import { registerAdobeRoutes } from "./adobe/adobeRouter.js";

const app = Fastify({ logger: true });

const SAFE_ROOT = "/Users/amar/Codex";
const WHITELISTED_PROJECTS = ["codex-orchestrator", "codex-desktop", "codex-bridge", "codex-brain", "codex-hands"];
const WHITELISTED_SCRIPTS = ["build", "dev", "start"];

// Hands v2: Allowed macOS applications
const ALLOWED_APPS = [
  "Google Chrome",
  "Safari",
  "Photos",
  "Preview",
  "Visual Studio Code",
  "Spotify",
  "Finder",
  "Adobe Photoshop 2024",
  "Final Cut Pro",
] as const;

type AllowedAppName = (typeof ALLOWED_APPS)[number];

/**
 * Validate that an app name is in the allowed list.
 */
function validateAppName(name: string): AllowedAppName {
  if (!ALLOWED_APPS.includes(name as AllowedAppName)) {
    throw new Error(`App not allowed: ${name}`);
  }
  return name as AllowedAppName;
}

/**
 * Resolve a relative path to an absolute path within SAFE_ROOT.
 * Throws if the resolved path escapes SAFE_ROOT.
 */
function resolveSafePath(relPath: string): string {
  const full = path.resolve(SAFE_ROOT, relPath);
  if (!full.startsWith(SAFE_ROOT)) {
    throw new Error("Path escapes SAFE_ROOT");
  }
  return full;
}

// CORS support for Codex UI integration
app.addHook("onRequest", async (request, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  reply.header("Access-Control-Allow-Headers", "Content-Type");
  if (request.method === "OPTIONS") {
    reply.status(204).send();
  }
});

app.get("/health", async () => ({
  ok: true,
  service: "codex-hands",
  version: "4.6.0",
  features: ["ui-automation", "video-editing", "caption-overlay", "export-monitoring", "web-automation", "adobe-suite"],
}));
app.get("/hands/health", async () => ({
  ok: true,
  service: "codex-hands",
  version: "4.6.0",
  features: ["ui-automation", "video-editing", "caption-overlay", "export-monitoring", "web-automation", "adobe-suite"],
}));

// POST /hands/createFile
app.post("/hands/createFile", async (req, reply) => {
  try {
    const body = req.body as any;

    if (!body || typeof body.path !== "string" || !body.path.trim()) {
      reply.status(400);
      return { ok: false, error: "path is required" };
    }

    if (typeof body.content !== "string") {
      reply.status(400);
      return { ok: false, error: "content must be a string" };
    }

    const relPath = body.path.trim();
    const fullPath = resolveSafePath(relPath);

    // Ensure parent directory exists
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(fullPath, body.content, "utf8");

    return {
      ok: true,
      fullPath,
    };
  } catch (err: any) {
    req.log.error({ err }, "createFile failed");
    reply.status(500);
    return { ok: false, error: err.message || "Internal error" };
  }
});

// POST /hands/editFile
app.post("/hands/editFile", async (req, reply) => {
  try {
    const body = req.body as any;

    if (!body || typeof body.path !== "string" || !body.path.trim()) {
      reply.status(400);
      return { ok: false, error: "path is required" };
    }

    if (typeof body.content !== "string") {
      reply.status(400);
      return { ok: false, error: "content must be a string" };
    }

    const relPath = body.path.trim();
    const fullPath = resolveSafePath(relPath);
    const mode = body.mode === "append" ? "append" : "overwrite";

    // Ensure parent directory exists
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });

    if (mode === "append") {
      // Append content with newline
      await fs.appendFile(fullPath, body.content + "\n", "utf8");
    } else {
      // Overwrite file
      await fs.writeFile(fullPath, body.content, "utf8");
    }

    return {
      ok: true,
      fullPath,
      mode,
    };
  } catch (err: any) {
    req.log.error({ err }, "editFile failed");
    reply.status(500);
    return { ok: false, error: err.message || "Internal error" };
  }
});

// POST /hands/runScript
app.post("/hands/runScript", async (req, reply) => {
  try {
    const body = req.body as any;

    if (!body || typeof body.project !== "string" || !body.project.trim()) {
      reply.status(400);
      return { ok: false, error: "project is required" };
    }

    if (typeof body.script !== "string" || !body.script.trim()) {
      reply.status(400);
      return { ok: false, error: "script is required" };
    }

    const project = body.project.trim();
    const script = body.script.trim();

    // Whitelist validation
    if (!WHITELISTED_PROJECTS.includes(project)) {
      reply.status(400);
      return { ok: false, error: "Not allowed", details: `Project '${project}' not whitelisted` };
    }

    if (!WHITELISTED_SCRIPTS.includes(script)) {
      reply.status(400);
      return { ok: false, error: "Not allowed", details: `Script '${script}' not whitelisted` };
    }

    const projectPath = path.join(SAFE_ROOT, project);

    // Verify project directory exists
    try {
      await fs.access(projectPath);
    } catch {
      reply.status(404);
      return { ok: false, error: "Project not found", details: `Path ${projectPath} does not exist` };
    }

    // Run npm script
    const child = spawn("npm", ["run", script], {
      cwd: projectPath,
      shell: true,
      stdio: "pipe",
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    // Wait for process to complete
    const exitCode = await new Promise<number>((resolve) => {
      child.on("close", (code) => resolve(code ?? 1));
    });

    // Trim output to prevent massive responses
    const MAX_OUTPUT = 5000;
    if (stdout.length > MAX_OUTPUT) {
      stdout = stdout.slice(0, MAX_OUTPUT) + "\n... (truncated)";
    }
    if (stderr.length > MAX_OUTPUT) {
      stderr = stderr.slice(0, MAX_OUTPUT) + "\n... (truncated)";
    }

    return {
      ok: true,
      project,
      script,
      exitCode,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
    };
  } catch (err: any) {
    req.log.error({ err }, "runScript failed");
    reply.status(500);
    return { ok: false, error: err.message || "Internal error" };
  }
});

// ============================================
// HANDS V2 - App Launch & File/Folder Operations
// ============================================

// POST /hands/openApp
app.post("/hands/openApp", async (req, reply) => {
  try {
    const body = req.body as {
      appName: string;
      args?: string[];
    };

    if (!body || typeof body.appName !== "string" || !body.appName.trim()) {
      reply.status(400);
      return { ok: false, error: "Missing or invalid appName" };
    }

    let app: AllowedAppName;
    try {
      app = validateAppName(body.appName.trim());
    } catch (err: any) {
      reply.status(400);
      return { ok: false, error: err?.message ?? "App not allowed" };
    }

    // Use macOS "open" command
    const args = ["-a", app];
    if (Array.isArray(body.args) && body.args.length > 0) {
      args.push("--", ...body.args);
    }

    return await new Promise((resolve) => {
      const child = spawn("open", args, { stdio: "ignore" });
      child.on("exit", (code) => {
        if (code === 0) {
          resolve({ ok: true, appName: app });
        } else {
          resolve({ ok: false, appName: app, exitCode: code });
        }
      });
      child.on("error", (err) => {
        resolve({ ok: false, appName: app, error: String(err) });
      });
    });
  } catch (err: any) {
    req.log.error({ err }, "openApp failed");
    reply.status(500);
    return { ok: false, error: err.message || "Internal error" };
  }
});

// POST /hands/openFile
app.post("/hands/openFile", async (req, reply) => {
  try {
    const body = req.body as { path: string };

    if (!body || typeof body.path !== "string" || !body.path.trim()) {
      reply.status(400);
      return { ok: false, error: "path is required" };
    }

    const fullPath = resolveSafePath(body.path.trim());

    // Verify file exists
    try {
      await fs.access(fullPath);
    } catch {
      reply.status(404);
      return { ok: false, error: "File not found", fullPath };
    }

    // Open the file with default application
    return await new Promise((resolve) => {
      const child = spawn("open", [fullPath], { stdio: "ignore" });
      child.on("exit", (code) => {
        if (code === 0) {
          resolve({ ok: true, fullPath });
        } else {
          resolve({ ok: false, fullPath, exitCode: code });
        }
      });
      child.on("error", (err) => {
        resolve({ ok: false, fullPath, error: String(err) });
      });
    });
  } catch (err: any) {
    req.log.error({ err }, "openFile failed");
    reply.status(500);
    return { ok: false, error: err.message || "Internal error" };
  }
});

// POST /hands/openFolder
app.post("/hands/openFolder", async (req, reply) => {
  try {
    const body = req.body as { path: string };

    if (!body || typeof body.path !== "string" || !body.path.trim()) {
      reply.status(400);
      return { ok: false, error: "path is required" };
    }

    const fullPath = resolveSafePath(body.path.trim());

    // Verify directory exists
    try {
      const stats = await fs.stat(fullPath);
      if (!stats.isDirectory()) {
        reply.status(400);
        return { ok: false, error: "Path is not a directory", fullPath };
      }
    } catch {
      reply.status(404);
      return { ok: false, error: "Directory not found", fullPath };
    }

    // Open the folder in Finder
    return await new Promise((resolve) => {
      const child = spawn("open", [fullPath], { stdio: "ignore" });
      child.on("exit", (code) => {
        if (code === 0) {
          resolve({ ok: true, fullPath });
        } else {
          resolve({ ok: false, fullPath, exitCode: code });
        }
      });
      child.on("error", (err) => {
        resolve({ ok: false, fullPath, error: String(err) });
      });
    });
  } catch (err: any) {
    req.log.error({ err }, "openFolder failed");
    reply.status(500);
    return { ok: false, error: err.message || "Internal error" };
  }
});

// POST /hands/listDir
app.post("/hands/listDir", async (req, reply) => {
  try {
    const body = req.body as { path: string };

    if (!body || typeof body.path !== "string" || !body.path.trim()) {
      reply.status(400);
      return { ok: false, error: "path is required" };
    }

    const fullPath = resolveSafePath(body.path.trim());

    // Verify directory exists
    try {
      const stats = await fs.stat(fullPath);
      if (!stats.isDirectory()) {
        reply.status(400);
        return { ok: false, error: "Path is not a directory", fullPath };
      }
    } catch {
      reply.status(404);
      return { ok: false, error: "Directory not found", fullPath };
    }

    // Read directory entries
    const dirents = await fs.readdir(fullPath, { withFileTypes: true });
    const entries = dirents.map((dirent) => ({
      name: dirent.name,
      type: dirent.isDirectory() ? "dir" : "file",
    }));

    return {
      ok: true,
      fullPath,
      entries,
    };
  } catch (err: any) {
    req.log.error({ err }, "listDir failed");
    reply.status(500);
    return { ok: false, error: err.message || "Internal error" };
  }
});

// ============================================
// HANDS V3 - Web Automation with Playwright
// ============================================

// POST /hands/web/open
app.post("/hands/web/open", async (req, reply) => {
  try {
    const body = req.body as {
      sessionId: string;
      url: string;
    };

    if (!body || typeof body.sessionId !== "string" || !body.sessionId.trim()) {
      reply.status(400);
      return { ok: false, error: "Missing or invalid sessionId" };
    }
    if (!body.url || typeof body.url !== "string") {
      reply.status(400);
      return { ok: false, error: "Missing or invalid url" };
    }

    const parsed = validateUrl(body.url);
    const page = await getPage(body.sessionId.trim());
    await page.goto(parsed.toString(), { waitUntil: "domcontentloaded" });
    
    // Human-like behavior after page load
    await page.waitForTimeout(1000);
    await page.mouse.move(100, 100);
    await humanDelay(400);
    
    return { ok: true, sessionId: body.sessionId.trim(), url: parsed.toString() };
  } catch (err: any) {
    req.log.error({ err }, "web/open failed");
    reply.status(500);
    return { ok: false, error: err?.message ?? "Failed to open URL" };
  }
});

// POST /hands/web/click
app.post("/hands/web/click", async (req, reply) => {
  try {
    const body = req.body as {
      sessionId: string;
      selector: string;
    };

    if (!body || typeof body.sessionId !== "string" || !body.sessionId.trim()) {
      reply.status(400);
      return { ok: false, error: "Missing or invalid sessionId" };
    }
    if (!body.selector || typeof body.selector !== "string") {
      reply.status(400);
      return { ok: false, error: "Missing or invalid selector" };
    }

    const page = await getPage(body.sessionId.trim());
    await humanDelay(300);
    await page.click(body.selector);
    return { ok: true, sessionId: body.sessionId.trim(), selector: body.selector };
  } catch (err: any) {
    req.log.error({ err }, "web/click failed");
    reply.status(500);
    return { ok: false, error: err?.message ?? "Failed to click selector" };
  }
});

// POST /hands/web/type
app.post("/hands/web/type", async (req, reply) => {
  try {
    const body = req.body as {
      sessionId: string;
      selector: string;
      text: string;
      clearFirst?: boolean;
    };

    if (!body || typeof body.sessionId !== "string" || !body.sessionId.trim()) {
      reply.status(400);
      return { ok: false, error: "Missing or invalid sessionId" };
    }
    if (!body.selector || typeof body.selector !== "string") {
      reply.status(400);
      return { ok: false, error: "Missing or invalid selector" };
    }
    if (body.text === undefined || typeof body.text !== "string") {
      reply.status(400);
      return { ok: false, error: "Missing or invalid text" };
    }

    const page = await getPage(body.sessionId.trim());
    if (body.clearFirst) {
      await page.fill(body.selector, "");
    }
    await humanDelay(350);
    await page.type(body.selector, body.text);
    return {
      ok: true,
      sessionId: body.sessionId.trim(),
      selector: body.selector,
      text: body.text
    };
  } catch (err: any) {
    req.log.error({ err }, "web/type failed");
    reply.status(500);
    return { ok: false, error: err?.message ?? "Failed to type into selector" };
  }
});

// POST /hands/web/scroll
app.post("/hands/web/scroll", async (req, reply) => {
  try {
    const body = req.body as {
      sessionId: string;
      x?: number;
      y?: number;
    };

    if (!body || typeof body.sessionId !== "string" || !body.sessionId.trim()) {
      reply.status(400);
      return { ok: false, error: "Missing or invalid sessionId" };
    }

    const x = typeof body.x === "number" ? body.x : 0;
    const y = typeof body.y === "number" ? body.y : 500;

    const page = await getPage(body.sessionId.trim());
    await page.mouse.wheel(x, y);
    return {
      ok: true,
      sessionId: body.sessionId.trim(),
      deltaX: x,
      deltaY: y
    };
  } catch (err: any) {
    req.log.error({ err }, "web/scroll failed");
    reply.status(500);
    return { ok: false, error: err?.message ?? "Failed to scroll" };
  }
});

// ============================================
// HANDS V3.2 - CAPTCHA Token Solver
// ============================================

// POST /hands/web/solveCaptcha
app.post("/hands/web/solveCaptcha", async (req, reply) => {
  try {
    const body = req.body as {
      sessionId: string;
      siteKey: string;
      url: string;
      type?: "recaptcha_v2" | "recaptcha_v3" | "hcaptcha" | "turnstile";
    };

    if (!body || !body.sessionId || typeof body.sessionId !== "string") {
      reply.status(400);
      return { ok: false, error: "Missing or invalid sessionId" };
    }
    if (!body.siteKey || typeof body.siteKey !== "string") {
      reply.status(400);
      return { ok: false, error: "Missing or invalid siteKey" };
    }
    if (!body.url || typeof body.url !== "string") {
      reply.status(400);
      return { ok: false, error: "Missing or invalid url" };
    }

    // Domain whitelist check
    try {
      validateUrl(body.url);
    } catch (err: any) {
      reply.status(400);
      return { ok: false, error: err?.message ?? "Domain not allowed" };
    }

    const result = await solveCaptcha({
      siteKey: body.siteKey,
      url: body.url,
      type: body.type,
    });

    if (!result.ok) {
      reply.status(500);
    }

    return result;
  } catch (err: any) {
    req.log.error({ err }, "web/solveCaptcha failed");
    reply.status(500);
    return { ok: false, error: err?.message ?? "Failed to solve captcha" };
  }
});

// POST /hands/web/injectCaptchaToken
app.post("/hands/web/injectCaptchaToken", async (req, reply) => {
  try {
    const body = req.body as {
      sessionId: string;
      token: string;
      siteKey: string;
    };

    if (!body || !body.sessionId || typeof body.sessionId !== "string") {
      reply.status(400);
      return { ok: false, error: "Missing or invalid sessionId" };
    }
    if (!body.token || typeof body.token !== "string") {
      reply.status(400);
      return { ok: false, error: "Missing or invalid token" };
    }
    if (!body.siteKey || typeof body.siteKey !== "string") {
      reply.status(400);
      return { ok: false, error: "Missing or invalid siteKey" };
    }

    const page = await getPage(body.sessionId.trim());
    await injectRecaptchaToken(page, body.token, body.siteKey);

    return {
      ok: true,
      sessionId: body.sessionId.trim(),
      message: "Token injected successfully",
    };
  } catch (err: any) {
    req.log.error({ err }, "web/injectCaptchaToken failed");
    reply.status(500);
    return {
      ok: false,
      error: err?.message ?? "Failed to inject captcha token",
    };
  }
});

// ============================================
// HANDS V3.3 - Vision-Based CAPTCHA Solving
// ============================================

// POST /hands/web/solveCaptchaVision
app.post("/hands/web/solveCaptchaVision", async (req, reply) => {
  try {
    const body = req.body as {
      sessionId: string;
      hint?: string;
      instructions?: string;
    };

    if (!body || typeof body.sessionId !== "string" || !body.sessionId.trim()) {
      reply.status(400);
      return { ok: false, error: "Missing or invalid sessionId" };
    }

    const page = await getPage(body.sessionId.trim());
    const screenshot = await capturePageScreenshot(page);
    const result = await sendScreenshotToCodex(
      {
        sessionId: body.sessionId.trim(),
        hint: body.hint,
        instructions: body.instructions,
      },
      screenshot
    );

    if (!result.ok) {
      reply.status(500);
      return { ok: false, error: result.error ?? "Vision solve failed" };
    }

    // Execute clicks returned by vision solver
    if (Array.isArray(result.clicks)) {
      for (const click of result.clicks) {
        if (click.selector) {
          await page.click(click.selector);
        } else if (typeof click.x === "number" && typeof click.y === "number") {
          await page.mouse.click(click.x, click.y);
        }
      }
    }

    return {
      ok: true,
      sessionId: body.sessionId.trim(),
      clicks: result.clicks ?? [],
    };
  } catch (err: any) {
    req.log.error({ err }, "web/solveCaptchaVision failed");
    reply.status(500);
    return { ok: false, error: err?.message ?? "Vision-based solve failed" };
  }
});

// HANDS V3.4 - Auto CAPTCHA Detection
// ====================================

// POST /hands/web/detectCaptcha
app.post("/hands/web/detectCaptcha", async (request, reply) => {
  const body = request.body as {
    sessionId: string;
  };

  if (!body || typeof body.sessionId !== "string" || !body.sessionId.trim()) {
    reply.code(400);
    return { ok: false, error: "Missing or invalid sessionId" };
  }

  try {
    const result = await detectCaptchaHybrid(body.sessionId);
    return {
      ok: true,
      sessionId: body.sessionId.trim(),
      present: result.present,
      type: result.type,
      source: result.source,
      details: result.details || null,
      siteKey: result.siteKey || null
    };
  } catch (err: any) {
    reply.code(500);
    return {
      ok: false,
      error: err?.message ?? "Failed to detect CAPTCHA"
    };
  }
});

// POST /hands/web/solveCaptchaAuto
app.post("/hands/web/solveCaptchaAuto", async (request, reply) => {
  const body = request.body as {
    sessionId: string;
    url?: string;       // needed if token-based solving
    typeHint?: string;
  };

  if (!body || typeof body.sessionId !== "string" || !body.sessionId.trim()) {
    reply.code(400);
    return { ok: false, error: "Missing or invalid sessionId" };
  }

  const sid = body.sessionId.trim();

  try {
    const detection = await detectCaptchaHybrid(sid);
    if (!detection.present || detection.type === "none") {
      return {
        ok: true,
        sessionId: sid,
        present: false,
        type: "none",
        message: "No CAPTCHA detected."
      };
    }

    // For now, simple logic:
    // - If detection.siteKey and url exist: token solver
    // - Else: vision solver
    let solveResult: any = null;

    if (detection.siteKey && body.url) {
      // Token-based solve
      const resp = await fetch("http://localhost:4300/hands/web/solveCaptcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sid,
          siteKey: detection.siteKey,
          url: body.url,
          type: detection.type
        })
      });
      solveResult = await resp.json();
    } else {
      // Vision-based solve
      const resp = await fetch("http://localhost:4300/hands/web/solveCaptchaVision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sid,
          hint: `CAPTCHA type: ${detection.type}. Solve as appropriate.`,
          instructions: "Solve the visual challenge and click all required elements."
        })
      });
      solveResult = await resp.json();
    }

    return {
      ok: true,
      sessionId: sid,
      present: true,
      type: detection.type,
      detection,
      solve: solveResult
    };
  } catch (err: any) {
    reply.code(500);
    return {
      ok: false,
      error: err?.message ?? "Auto solve failed"
    };
  }
});

// HANDS V3.5 - Visual UI Automation
// ==================================

// POST /hands/ui/snapshot
app.post("/hands/ui/snapshot", async (request, reply) => {
  const body = request.body as { sessionId: string };

  if (!body || typeof body.sessionId !== "string" || !body.sessionId.trim()) {
    reply.code(400);
    return { ok: false, error: "Missing or invalid sessionId" };
  }

  try {
    const buf = await captureScreen();
    const imageBase64 = buf.toString("base64");
    return {
      ok: true,
      sessionId: body.sessionId.trim(),
      imageBase64
    };
  } catch (err: any) {
    reply.code(500);
    return { ok: false, error: err?.message ?? "Failed to capture screen" };
  }
});

// POST /hands/ui/clickVisual
app.post("/hands/ui/clickVisual", async (request, reply) => {
  const body = request.body as {
    sessionId: string;
    hint?: string;
    instructions?: string;
    maxClicks?: number;
  };

  if (!body || typeof body.sessionId !== "string" || !body.sessionId.trim()) {
    reply.code(400);
    return { ok: false, error: "Missing or invalid sessionId" };
  }

  const sid = body.sessionId.trim();
  const maxClicks = typeof body.maxClicks === "number" ? body.maxClicks : 3;

  try {
    const result = await analyzeScreenWithVision(sid, body.hint, body.instructions);
    if (!result.ok || !result.clicks || result.clicks.length === 0) {
      return {
        ok: false,
        sessionId: sid,
        error: result.error || "No clicks returned from vision solver"
      };
    }

    const chosen = result.clicks.slice(0, maxClicks);
    for (const click of chosen) {
      if (typeof click.x === "number" && typeof click.y === "number") {
        await clickAt(click.x, click.y);
      }
    }

    return {
      ok: true,
      sessionId: sid,
      clicks: chosen
    };
  } catch (err: any) {
    reply.code(500);
    return { ok: false, error: err?.message ?? "Visual click failed" };
  }
});

async function main() {
  try {
    // Hands v4: Register UI automation routes
    await registerUIRoutes(app);
    
    // Hands v4.6: Register Adobe Suite routes
    await registerAdobeRoutes(app);
    
    const port = Number(process.env.PORT ?? 4300);
    await app.listen({ port, host: "0.0.0.0" });
    console.log(`codex-hands listening on :${port}`);
    console.log("✅ Hands v4.6 — Adobe Suite Mode Active");
    console.log("   - macOS Automation Layer (native actions)");
    console.log("   - Visual Action Engine (coordinate + semantic)");
    console.log("   - UI Automation Router (8 endpoints)");
    console.log("   - Adobe Suite Router (6 endpoints: Premiere + Photoshop)");
    console.log("   - App Profiles (8 apps: FCP, CapCut, Premiere, Photoshop, Chrome, Finder, Logic, Photoshop)");
    console.log("   - Safety Guard (app whitelist + path validation + Adobe-specific rules)");
  } catch (err) {
    console.error("codex-hands startup error:", err instanceof Error ? err.message : JSON.stringify(err));
    process.exit(1);
  }
}

main();
