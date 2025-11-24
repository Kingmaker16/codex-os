/**
 * Codex Hands v3.5 - Visual UI Automation
 * 
 * Desktop UI control via:
 * - Screen capture (macOS screencapture)
 * - Vision analysis (Orchestrator Vision Solver)
 * - Mouse clicks (cliclick or AppleScript)
 * 
 * Supports: Photoshop, FCP, Finder, Gmail, etc.
 */

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const SCREENSHOT_DIR = "/Users/amar/Codex/.codex-ui-snapshots";

interface UiVisionClick {
  x: number;
  y: number;
  confidence: number;
  source: string;
}

interface UiVisionResult {
  ok: boolean;
  clicks?: UiVisionClick[];
  error?: string;
}

/**
 * Capture full macOS screen using screencapture command
 */
export async function captureScreen(): Promise<Buffer> {
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
  const filename = `screen-${Date.now()}.png`;
  const fullPath = path.join(SCREENSHOT_DIR, filename);

  // Capture full screen (-x = no sound, -t = format)
  await new Promise<void>((resolve, reject) => {
    const proc = spawn("screencapture", ["-x", "-t", "png", fullPath]);
    proc.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`screencapture exited with ${code}`));
    });
    proc.on("error", (err) => reject(err));
  });

  const buf = await fs.readFile(fullPath);
  return buf;
}

/**
 * Click at specific screen coordinates using cliclick
 * Requires: brew install cliclick
 * 
 * Alternative: Use AppleScript if cliclick not available
 */
export async function clickAt(x: number, y: number): Promise<void> {
  return await new Promise<void>((resolve, reject) => {
    const command = process.env.CLICLICK_PATH || "cliclick";
    const args = [`c:${Math.round(x)},${Math.round(y)}`];

    const proc = spawn(command, args);
    
    let stderr = "";
    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        // Fallback to AppleScript if cliclick not available
        if (stderr.includes("command not found") || stderr.includes("ENOENT")) {
          console.log("[UI Vision] cliclick not found, falling back to AppleScript");
          clickAtViaAppleScript(x, y).then(resolve).catch(reject);
        } else {
          reject(new Error(`cliclick exited with ${code}: ${stderr}`));
        }
      }
    });

    proc.on("error", (err) => {
      // Try AppleScript fallback
      console.log("[UI Vision] cliclick error, trying AppleScript fallback");
      clickAtViaAppleScript(x, y).then(resolve).catch(reject);
    });
  });
}

/**
 * AppleScript fallback for clicking
 */
async function clickAtViaAppleScript(x: number, y: number): Promise<void> {
  const script = `
    tell application "System Events"
      set originalPosition to location of mouse
      click at {${Math.round(x)}, ${Math.round(y)}}
    end tell
  `;

  return await new Promise<void>((resolve, reject) => {
    const proc = spawn("osascript", ["-e", script]);
    
    let stderr = "";
    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`AppleScript click failed with ${code}: ${stderr}`));
    });

    proc.on("error", (err) => reject(err));
  });
}

/**
 * Analyze screen using Orchestrator Vision Solver
 * Reuses /vision/solveCaptcha endpoint for general UI analysis
 */
export async function analyzeScreenWithVision(
  sessionId: string,
  hint?: string,
  instructions?: string
): Promise<UiVisionResult> {
  const image = await captureScreen();
  const imageBase64 = image.toString("base64");

  const body = {
    sessionId,
    imageBase64,
    hint: hint ?? "Analyze the UI and identify where to click based on the instructions.",
    instructions: instructions ?? "Return a JSON with clicks specifying x and y coordinates (pixel-based) and confidence."
  };

  const resp = await fetch("http://localhost:4200/vision/solveCaptcha", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const text = await resp.text();
    return { ok: false, error: `Vision solver error: ${resp.status} ${text}` };
  }

  const data = await resp.json() as any;
  if (data.ok && Array.isArray(data.clicks)) {
    return { ok: true, clicks: data.clicks as UiVisionClick[] };
  }

  return { ok: false, error: data.error || "Unknown vision solver error" };
}
